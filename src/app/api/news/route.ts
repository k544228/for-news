import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 示例新聞數據
    const newsData = {
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

    const result = {
      ...newsData,
      lastUpdated: new Date().toISOString(),
      source: 'demo',
      note: '當前顯示為示例新聞內容 - 功能正常運作中'
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('新聞API錯誤:', error);
    return NextResponse.json(
      { error: '無法獲取新聞', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}