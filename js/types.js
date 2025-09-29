// FOR-NEWS 型別定義 (JavaScript版本)

/**
 * 新聞項目型別
 * @typedef {Object} NewsItem
 * @property {string} id - 新聞唯一識別碼
 * @property {string} title - 新聞標題
 * @property {string} content - 新聞內容
 * @property {'world'|'tech'|'environment'} category - 新聞分類
 * @property {'BBC'|'CNN'|'AP'|'AlJazeera'} source - 新聞來源
 * @property {string} publishedAt - 發布時間 (ISO字串)
 * @property {NewsAnalysis} [analysis] - 新聞分析（可選）
 */

/**
 * 新聞分析型別
 * @typedef {Object} NewsAnalysis
 * @property {string[]} affectedGroups - 受影響人群
 * @property {string} beforeImpact - 影響前狀況
 * @property {string} afterImpact - 影響後狀況
 * @property {string} humorousInterpretation - 幽默解讀
 */

/**
 * 新聞資料結構
 * @typedef {Object} NewsData
 * @property {NewsItem[]} world - 世界新聞陣列
 * @property {NewsItem[]} tech - 科技新聞陣列
 * @property {NewsItem[]} environment - 環境新聞陣列
 * @property {string} lastUpdated - 最後更新時間
 * @property {NewsMetadata} [metadata] - 元資料（可選）
 */

/**
 * 新聞元資料
 * @typedef {Object} NewsMetadata
 * @property {number} totalNews - 總新聞數量
 * @property {'auto'|'manual'} updateSource - 更新來源
 * @property {string} version - 版本號
 */

/**
 * RSS 來源配置
 * @typedef {Object} RSSSource
 * @property {string} name - 來源名稱
 * @property {string} url - RSS網址
 * @property {'world'|'tech'|'environment'} category - 分類
 */

// 新聞分類對應的顯示設定
const NEWS_CATEGORIES = {
  world: {
    title: '世界新聞',
    icon: '📰',
    color: 'red',
    bgClass: 'bg-red-600'
  },
  tech: {
    title: '科技新聞',
    icon: '💻',
    color: 'green',
    bgClass: 'bg-green-600'
  },
  environment: {
    title: '環境新聞',
    icon: '🌱',
    color: 'blue',
    bgClass: 'bg-blue-600'
  }
};

// RSS 來源配置
const RSS_SOURCES = [
  {
    name: 'BBC World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world'
  },
  {
    name: 'CNN Technology',
    url: 'http://rss.cnn.com/rss/edition_technology.rss',
    category: 'tech'
  },
  {
    name: 'AP Environmental',
    url: 'https://apnews.com/apf-science',
    category: 'environment'
  }
];

// 工具函數：驗證新聞項目格式
function validateNewsItem(item) {
  const requiredFields = ['id', 'title', 'content', 'category', 'source', 'publishedAt'];

  for (const field of requiredFields) {
    if (!item.hasOwnProperty(field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const validCategories = ['world', 'tech', 'environment'];
  if (!validCategories.includes(item.category)) {
    throw new Error(`Invalid category: ${item.category}`);
  }

  const validSources = ['BBC', 'CNN', 'AP', 'AlJazeera'];
  if (!validSources.includes(item.source)) {
    throw new Error(`Invalid source: ${item.source}`);
  }

  return true;
}

// 工具函數：格式化日期顯示
function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '無效日期';
  }
}

// 工具函數：生成新聞ID
function generateNewsId(category) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 5);
  return `${category}-${timestamp}-${random}`;
}

// 導出到全域（瀏覽器環境）
if (typeof window !== 'undefined') {
  window.NewsTypes = {
    NEWS_CATEGORIES,
    RSS_SOURCES,
    validateNewsItem,
    formatDate,
    generateNewsId
  };
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NEWS_CATEGORIES,
    RSS_SOURCES,
    validateNewsItem,
    formatDate,
    generateNewsId
  };
}