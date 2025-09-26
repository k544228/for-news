// 新聞項目類型定義
export interface NewsItem {
  id: string
  title: string           // 新聞標題
  content: string         // 完整新聞內容（純文字）
  category: 'world' | 'tech' | 'environment'
  source: 'BBC' | 'CNN' | 'AP' | 'AlJazeera'
  publishedAt: string     // 發布時間
  analysis?: {
    affectedGroups: string[]      // 受影響人群
    beforeImpact: string          // 影響前狀況
    afterImpact: string           // 影響後狀況
    humorousInterpretation: string // 幽默解讀
  }
}

// 新聞數據結構
export interface NewsData {
  world: NewsItem[]       // 世界新聞 3條
  tech: NewsItem[]        // 科技新聞 3條
  environment: NewsItem[] // 環境新聞 3條
  lastUpdated: string     // 最後更新時間
}

// RSS 來源配置
export interface RSSSource {
  name: string
  url: string
  category: 'world' | 'tech' | 'environment'
}