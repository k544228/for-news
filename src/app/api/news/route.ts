import { NextResponse } from 'next/server';

// RSS 新聞來源配置
const RSS_SOURCES = [
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world' as const,
  },
  {
    name: 'CNN',
    url: 'https://rss.cnn.com/rss/edition.rss',
    category: 'world' as const,
  },
  {
    name: 'BBC Tech',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'tech' as const,
  },
  {
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'environment' as const,
  },
];

// 簡單的RSS解析函數
async function parseRSS(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FOR-NEWS/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xml = await response.text();

    // 簡單的XML解析 - 提取標題和連結
    const items: any[] = [];
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
    const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/s;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/s;
    const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/s;
    const dateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/s;

    let match;
    let count = 0;
    while ((match = itemRegex.exec(xml)) !== null && count < 3) {
      const itemContent = match[1];

      const titleMatch = titleRegex.exec(itemContent);
      const linkMatch = linkRegex.exec(itemContent);
      const descMatch = descRegex.exec(itemContent);
      const dateMatch = dateRegex.exec(itemContent);

      if (titleMatch && linkMatch) {
        const title = (titleMatch[1] || titleMatch[2] || '').trim();
        const link = (linkMatch[1] || '').trim();
        const description = (descMatch ? (descMatch[1] || descMatch[2] || '') : '').trim();
        const pubDate = (dateMatch ? dateMatch[1] : '').trim();

        if (title && link) {
          items.push({
            id: `${Date.now()}-${count}`,
            title: title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            content: description.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '').substring(0, 200),
            link: link,
            publishedAt: pubDate || new Date().toISOString(),
          });
          count++;
        }
      }
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    console.log('開始抓取新聞...');

    // 為每個類別創建示例新聞（如果RSS失敗）
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

    // 嘗試從RSS抓取真實新聞
    const newsData = { ...fallbackNews };
    let hasRealNews = false;

    for (const source of RSS_SOURCES) {
      try {
        const items = await parseRSS(source.url);
        if (items.length > 0) {
          // 將RSS新聞轉換為我們的格式
          const formattedNews = items.map((item, index) => ({
            id: `${source.category}-rss-${index}`,
            title: item.title,
            content: item.content || '點擊查看完整新聞內容...',
            category: source.category,
            source: source.name as 'BBC' | 'CNN' | 'AP' | 'AlJazeera',
            publishedAt: item.publishedAt,
            link: item.link,
            analysis: {
              affectedGroups: ['新聞讀者', '相關產業', '社會大眾'],
              beforeImpact: '事件發生前的狀況',
              afterImpact: '事件發生後的影響',
              humorousInterpretation: `這則新聞讓人想到：「新聞就像天氣預報，永遠有意想不到的轉折！📰😄」`
            }
          }));

          // 替換對應類別的示例新聞
          if (source.category === 'world') {
            newsData.world = formattedNews.slice(0, 2);
          } else if (source.category === 'tech') {
            newsData.tech = formattedNews.slice(0, 2);
          } else if (source.category === 'environment') {
            newsData.environment = formattedNews.slice(0, 2);
          }
          hasRealNews = true;
        }
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
      }
    }

    const result = {
      ...newsData,
      lastUpdated: new Date().toISOString(),
      source: hasRealNews ? 'mixed' : 'demo',
      note: hasRealNews ? '包含真實RSS新聞和示例內容' : '當前顯示為示例新聞內容'
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