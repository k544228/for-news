import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 生成新的示例新聞
    const currentTime = new Date();
    const timeStamp = currentTime.getTime();

    const freshNews = {
      world: [
        {
          id: `world-${timeStamp}-1`,
          title: `最新：國際經濟論壇預測2025年全球經濟新趨勢`,
          content: `世界經濟論壇發布最新報告，預測人工智慧和綠色能源將成為推動全球經濟增長的主要動力...`,
          category: 'world' as const,
          source: 'BBC' as const,
          publishedAt: new Date(timeStamp - 1800000).toISOString(),
          analysis: {
            affectedGroups: ['全球投資者', '科技公司', '能源企業', '政府決策者'],
            beforeImpact: '傳統產業面臨轉型壓力，新興技術需要更多投資',
            afterImpact: 'AI和綠能產業快速發展，創造新的就業機會',
            humorousInterpretation: '經濟學家：「預測經濟就像預測天氣，但至少AI比我們準確多了！📈🤖」'
          }
        },
        {
          id: `world-${timeStamp}-2`,
          title: `突發：聯合國宣布新的全球健康倡議計劃`,
          content: `聯合國世界衛生組織今日宣布一項全球性健康計劃，旨在提升發展中國家的醫療資源...`,
          category: 'world' as const,
          source: 'CNN' as const,
          publishedAt: new Date(timeStamp - 3600000).toISOString(),
          analysis: {
            affectedGroups: ['發展中國家民眾', '醫療工作者', '國際援助組織', '製藥公司'],
            beforeImpact: '醫療資源分配不均，部分地區缺乏基本醫療服務',
            afterImpact: '全球醫療水平提升，減少健康不平等現象',
            humorousInterpretation: '醫生：「終於不用只靠聽診器走天下了，現在有高科技設備支援！👩‍⚕️🔬」'
          }
        }
      ],
      tech: [
        {
          id: `tech-${timeStamp}-1`,
          title: `Meta發布新一代VR頭盔，支援腦波控制功能`,
          content: `Meta公司宣布其最新的VR設備將支援腦波控制技術，用戶可以通過思考來操控虛擬環境...`,
          category: 'tech' as const,
          source: 'TechCrunch' as const,
          publishedAt: new Date(timeStamp - 5400000).toISOString(),
          analysis: {
            affectedGroups: ['遊戲玩家', 'VR開發者', '科技愛好者', '醫療復健患者'],
            beforeImpact: 'VR控制需要手部操作，對部分用戶不夠直觀',
            afterImpact: '腦波控制讓VR體驗更自然，擴展應用範圍',
            humorousInterpretation: 'VR用戶：「現在我真的可以用『意念』玩遊戲了，但要小心不要想太多廢話！🧠🥽」'
          }
        },
        {
          id: `tech-${timeStamp}-2`,
          title: `開源AI模型突破：新模型在程式碼生成上超越GPT-4`,
          content: `一個新的開源AI模型在程式碼生成基準測試中表現出色，準確率比現有模型提升30%...`,
          category: 'tech' as const,
          source: 'GitHub Blog' as const,
          publishedAt: new Date(timeStamp - 7200000).toISOString(),
          analysis: {
            affectedGroups: ['開源社群', '程式開發者', 'AI研究者', '科技新創'],
            beforeImpact: '商業AI模型主導市場，開源選項有限',
            afterImpact: '開源AI生態更繁榮，降低技術使用門檻',
            humorousInterpretation: '開源開發者：「終於不用羨慕那些付費AI了，我們也有厲害的免費選手！🆓💪」'
          }
        }
      ],
      economy: [
        {
          id: `economy-${timeStamp}-1`,
          title: `股市大漲：全球科技股創新高，AI概念股領漲`,
          content: `受人工智慧技術突破影響，全球主要股市科技股大幅上漲，投資者對AI產業前景樂觀...`,
          category: 'economy' as const,
          source: 'BBC' as const,
          publishedAt: new Date(timeStamp - 9000000).toISOString(),
          analysis: {
            affectedGroups: ['股票投資者', '科技公司', '基金經理', '退休基金'],
            beforeImpact: '科技股估值偏高，投資者態度謹慎',
            afterImpact: 'AI熱潮推動股價上升，投資信心增強',
            humorousInterpretation: '股票：「終於輪到我們AI概念股出頭了！漲停板都不夠表達我的興奮 📈🚀」'
          }
        },
        {
          id: `economy-${timeStamp}-2`,
          title: `物價調查：消費品價格普遍回落，通膨壓力緩解`,
          content: `最新調查顯示，食品、能源等主要消費品價格出現回落趨勢，消費者購買力有所提升...`,
          category: 'economy' as const,
          source: 'CNN' as const,
          publishedAt: new Date(timeStamp - 10800000).toISOString(),
          analysis: {
            affectedGroups: ['消費者', '零售業者', '央行政策制定者', '企業經營者'],
            beforeImpact: '高通膨導致消費者負擔加重，消費意願下降',
            afterImpact: '物價回穩刺激消費，經濟活動逐漸復甦',
            humorousInterpretation: '錢包：「太好了！終於不用每次購物都被掏空了，可以鬆一口氣 💰😌」'
          }
        }
      ]
    };

    const result = {
      ...freshNews,
      lastUpdated: currentTime.toISOString(),
      source: 'fresh',
      note: `最新生成時間：${currentTime.toLocaleString('zh-TW')} - 新聞內容已更新`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('新聞刷新錯誤:', error);
    return NextResponse.json(
      { error: '無法刷新新聞', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}