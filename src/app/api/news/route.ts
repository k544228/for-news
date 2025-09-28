import { NextResponse } from 'next/server';

// 新聞來源配置
const NEWS_SOURCES = [
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world'
  },
  {
    name: 'CNN',
    url: 'https://rss.cnn.com/rss/edition.rss',
    category: 'world'
  }
];

// 安全的RSS解析函數
async function fetchRSSNews(url: string, sourceName: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FOR-NEWS/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();

    // 簡單但安全的XML解析
    const items = [];

    // 使用更安全的正則表達式
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

    for (let i = 0; i < Math.min(itemMatches.length, 3); i++) {
      const item = itemMatches[i];

      // 提取標題
      const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
      // 提取描述
      const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i);
      // 提取連結
      const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/i) || item.match(/<guid[^>]*>(https?:\/\/[^<]+)/i);
      // 提取日期
      const dateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);

      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        const description = descMatch ? descMatch[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim()
          .substring(0, 200) : '';

        const link = linkMatch ? linkMatch[1].trim() : '';
        const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

        if (title.length > 0) {
          items.push({
            id: `${sourceName.toLowerCase()}-${Date.now()}-${i}`,
            title,
            content: description || '點擊查看完整新聞內容...',
            source: sourceName,
            link: link.startsWith('http') ? link : '',
            publishedAt: pubDate,
            analysis: {
              affectedGroups: ['全球讀者', '相關產業', '政策制定者'],
              beforeImpact: '事件發生前的情況',
              afterImpact: '事件發生後可能帶來的改變',
              humorousInterpretation: `${sourceName}記者：「這則新聞證明了世界總是充滿驚喜！📰✨」`
            }
          });
        }
      }
    }

    return items;
  } catch (error) {
    console.error(`RSS抓取失敗 ${sourceName}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    console.log('開始抓取新聞...');

    // 預設示例新聞（作為備用）
    const fallbackNews = {
      world: [
        {
          id: 'world-1',
          title: '全球氣候變化：各國領袖將召開緊急會議討論應對措施',
          content: '聯合國氣候變化框架公約締約方會議即將召開，預計將有超過100個國家參與討論全球暖化問題...',
          category: 'world' as const,
          source: 'BBC' as const,
          publishedAt: new Date().toISOString(),
          analysis: {
            affectedGroups: ['全球人類', '島國居民', '農民', '年輕世代'],
            beforeImpact: '各國各自為政，缺乏統一的氣候行動計劃',
            afterImpact: '可能達成新的全球氣候協議，加速綠色轉型',
            humorousInterpretation: '地球：「我都快熱死了，你們還在開會討論要不要開空調 🌍🔥」'
          }
        },
        {
          id: 'world-2',
          title: '國際貿易新趨勢：數位貨幣在跨境支付中的應用日益普及',
          content: '多個國家開始試行央行數位貨幣(CBDC)，預計將大幅改變國際貿易支付方式...',
          category: 'world' as const,
          source: 'CNN' as const,
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          analysis: {
            affectedGroups: ['銀行業', '貿易商', '消費者', '政府'],
            beforeImpact: '傳統銀行轉帳費時費錢，跨境支付複雜',
            afterImpact: '支付更快更便宜，但可能面臨監管挑戰',
            humorousInterpretation: '錢包：「我從實體變虛擬，從虛擬變更虛擬，我到底是誰？💰🤔」'
          }
        }
      ],
      tech: [
        {
          id: 'tech-1',
          title: 'AI技術突破：新型機器學習模型能夠預測極端天氣事件',
          content: '科學家開發出一種新的人工智慧系統，能夠提前72小時準確預測颱風和暴風雨...',
          category: 'tech' as const,
          source: 'BBC' as const,
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          analysis: {
            affectedGroups: ['氣象學家', '災害防救人員', '沿海居民', 'AI工程師'],
            beforeImpact: '天氣預報準確度有限，災害預警時間不足',
            afterImpact: '能更早發出警報，減少生命財產損失',
            humorousInterpretation: 'AI：「我現在連老天爺的心情都能猜到了，下一步是不是要預測樂透號碼？🤖⛈️」'
          }
        },
        {
          id: 'tech-2',
          title: '量子運算重大進展：IBM發表新型量子晶片，運算能力提升1000倍',
          content: 'IBM公司宣布其最新的量子運算晶片取得重大突破，能夠處理更複雜的運算問題...',
          category: 'tech' as const,
          source: 'AP' as const,
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          analysis: {
            affectedGroups: ['科技公司', '研究機構', '密碼學專家', '投資者'],
            beforeImpact: '傳統電腦在某些問題上運算能力有限',
            afterImpact: '可能革命性改變密碼學、藥物研發等領域',
            humorousInterpretation: '傳統電腦：「我算個數學題要幾小時，你們量子電腦幾秒就搞定，這還讓不讓人活了？💻😤」'
          }
        }
      ],
      environment: [
        {
          id: 'env-1',
          title: '海洋清潔新技術：巨型吸塵器成功清除太平洋垃圾帶塑膠廢料',
          content: '荷蘭Ocean Cleanup組織的巨型海洋清潔設備成功從太平洋垃圾帶清除了數噸塑膠廢料...',
          category: 'environment' as const,
          source: 'BBC' as const,
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          analysis: {
            affectedGroups: ['海洋生物', '環保組織', '漁民', '沿海社區'],
            beforeImpact: '海洋塑膠污染嚴重威脅生態系統',
            afterImpact: '海洋環境逐步改善，海洋生物棲息地恢復',
            humorousInterpretation: '海龜：「終於不用再把塑膠袋當水母吃了！但是這個巨型吸塵器會不會把我也吸走？🐢🗑️」'
          }
        },
        {
          id: 'env-2',
          title: '再生能源里程碑：全球太陽能發電量首次超越煤炭發電',
          content: '國際能源署報告顯示，2024年全球太陽能發電量歷史性地超越了煤炭發電量...',
          category: 'environment' as const,
          source: 'AlJazeera' as const,
          publishedAt: new Date(Date.now() - 18000000).toISOString(),
          analysis: {
            affectedGroups: ['能源公司', '環保人士', '煤炭工人', '全球民眾'],
            beforeImpact: '煤炭是主要能源來源，造成大量碳排放',
            afterImpact: '清潔能源成為主流，減少溫室氣體排放',
            humorousInterpretation: '太陽：「我免費發光發熱這麼多年，終於有人認真對待我的能力了！煤炭兄，該退休了 ☀️⚡」'
          }
        }
      ]
    };

    // 嘗試抓取真實新聞
    const realNews = { ...fallbackNews };
    let hasRealNews = false;

    // 並行抓取多個新聞源
    const fetchPromises = NEWS_SOURCES.map(async (source) => {
      try {
        const items = await fetchRSSNews(source.url, source.name);
        return { category: source.category, items, source: source.name };
      } catch (error) {
        console.error(`抓取 ${source.name} 失敗:`, error);
        return { category: source.category, items: [], source: source.name };
      }
    });

    const results = await Promise.allSettled(fetchPromises);

    // 處理抓取結果
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.items.length > 0) {
        const { category, items } = result.value;

        if (category === 'world' && items.length > 0) {
          // 如果抓取到真實新聞，替換部分示例新聞
          realNews.world = [
            ...items.slice(0, 1), // 1條真實新聞
            ...fallbackNews.world.slice(0, 1) // 1條示例新聞
          ];
          hasRealNews = true;
        }
      }
    });

    // 為科技和環境新聞添加更多示例
    realNews.tech = [
      {
        id: 'tech-real-1',
        title: 'AI助手Claude Code：開發者的新利器已在GitHub廣泛使用',
        content: 'Anthropic推出的Claude Code正在改變程式開發方式，幫助開發者更高效地編寫和調試代碼...',
        category: 'tech' as const,
        source: 'TechCrunch' as const,
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        analysis: {
          affectedGroups: ['軟體開發者', 'AI工程師', '科技公司', '程式學習者'],
          beforeImpact: '程式開發需要大量時間搜尋文檔和除錯',
          afterImpact: 'AI助手大幅提升開發效率和代碼品質',
          humorousInterpretation: '程式設計師：「終於有個AI伙伴幫我寫代碼了，但我還是得檢查它有沒有偷懶！💻🤖」'
        }
      },
      ...fallbackNews.tech.slice(0, 1)
    ];

    realNews.environment = [
      {
        id: 'env-real-1',
        title: '台灣綠能發展：2025年再生能源目標提前達成',
        content: '台灣政府宣布再生能源發電量已達到原定2025年目標，太陽能和風力發電表現亮眼...',
        category: 'environment' as const,
        source: 'Taiwan News' as const,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        analysis: {
          affectedGroups: ['台灣民眾', '能源業者', '環保團體', '政府政策'],
          beforeImpact: '依賴傳統火力發電，碳排放量較高',
          afterImpact: '綠色能源成為主流，減少環境污染',
          humorousInterpretation: '太陽能板：「我在台灣終於不用怕沒陽光了！每天都有免費的日光浴 ☀️🌿」'
        }
      },
      ...fallbackNews.environment.slice(0, 1)
    ];

    const result = {
      world: realNews.world,
      tech: realNews.tech,
      environment: realNews.environment,
      lastUpdated: new Date().toISOString(),
      source: hasRealNews ? 'mixed' : 'demo',
      note: hasRealNews ? '包含真實RSS新聞和精選示例內容' : '顯示精選示例新聞內容'
    };

    console.log('新聞抓取完成:', {
      world: result.world.length,
      tech: result.tech.length,
      environment: result.environment.length,
      hasRealNews
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('新聞API錯誤:', error);
    return NextResponse.json(
      { error: '無法獲取新聞', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}