#!/usr/bin/env node

/**
 * FOR-NEWS 自動新聞更新腳本
 *
 * 功能：
 * 1. 從多個 RSS 來源獲取最新新聞
 * 2. 使用 AI 分析生成幽默解讀
 * 3. 更新 news.json 檔案
 * 4. 記錄更新到 MCP 記憶系統
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// 配置
const CONFIG = {
  dataDir: path.join(__dirname, '..', 'data'),
  newsFile: path.join(__dirname, '..', 'data', 'news.json'),
  maxNewsPerCategory: 3,
  rssSources: [
    {
      name: 'BBC World',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
      category: 'world'
    },
    // 注意：實際的 RSS 解析需要更複雜的實現
    // 這裡提供基本框架
  ]
};

class NewsUpdater {
  constructor() {
    this.currentNews = null;
    this.newNews = null;
  }

  // 主要執行函數
  async run() {
    try {
      console.log('🚀 開始新聞更新程序...');

      // 載入當前新聞
      await this.loadCurrentNews();

      // 獲取新新聞
      await this.fetchLatestNews();

      // 生成 AI 分析
      await this.generateAnalysis();

      // 儲存更新的新聞
      await this.saveNews();

      // 記錄到 MCP
      await this.recordToMCP();

      console.log('✅ 新聞更新完成！');

    } catch (error) {
      console.error('❌ 新聞更新失敗:', error);
      await this.logError(error);
      process.exit(1);
    }
  }

  // 載入當前新聞
  async loadCurrentNews() {
    try {
      const data = await fs.readFile(CONFIG.newsFile, 'utf8');
      this.currentNews = JSON.parse(data);
      console.log('📰 已載入當前新聞數據');
    } catch (error) {
      console.log('📝 建立新的新聞檔案');
      this.currentNews = {
        world: [],
        tech: [],
        environment: [],
        lastUpdated: '',
        metadata: { totalNews: 0, updateSource: 'auto', version: '1.0.0' }
      };
    }
  }

  // 獲取最新新聞
  async fetchLatestNews() {
    console.log('🔍 正在獲取最新新聞...');

    // 這裡是示例實現，實際需要真實的 RSS 解析
    this.newNews = {
      world: await this.generateSampleNews('world'),
      tech: await this.generateSampleNews('tech'),
      environment: await this.generateSampleNews('environment'),
      lastUpdated: new Date().toISOString(),
      metadata: {
        totalNews: 0,
        updateSource: 'auto',
        version: this.generateVersion()
      }
    };

    // 計算總新聞數
    this.newNews.metadata.totalNews =
      this.newNews.world.length +
      this.newNews.tech.length +
      this.newNews.environment.length;

    console.log(`✅ 獲取了 ${this.newNews.metadata.totalNews} 篇新聞`);
  }

  // 生成示例新聞（實際應該從 RSS 獲取）
  async generateSampleNews(category) {
    const sampleNews = {
      world: [
        {
          title: '全球氣候峰會達成新協議',
          content: '各國領導人在最新的氣候峰會上達成新的減排協議...',
          source: 'BBC'
        }
      ],
      tech: [
        {
          title: 'AI 技術在醫療領域的新突破',
          content: '研究人員開發出新的 AI 診斷系統...',
          source: 'CNN'
        }
      ],
      environment: [
        {
          title: '海洋清理計畫取得重大進展',
          content: '最新的海洋塑膠清理技術展現顯著成果...',
          source: 'AP'
        }
      ]
    };

    const templates = sampleNews[category] || [];

    return templates.map(template => ({
      id: this.generateNewsId(category),
      title: template.title,
      content: template.content,
      category: category,
      source: template.source,
      publishedAt: new Date().toISOString(),
      analysis: null // 稍後生成
    }));
  }

  // 生成 AI 分析（簡化版本）
  async generateAnalysis() {
    console.log('🤖 正在生成 AI 分析...');

    const categories = ['world', 'tech', 'environment'];

    for (const category of categories) {
      for (const news of this.newNews[category]) {
        if (!news.analysis) {
          news.analysis = await this.createAnalysis(news);
        }
      }
    }

    console.log('✅ AI 分析完成');
  }

  // 創建分析（示例實現）
  async createAnalysis(news) {
    // 這裡應該調用真實的 AI API
    // 目前使用預設的模板分析

    const humorousTemplates = [
      `看來${news.category === 'world' ? '世界' : news.category === 'tech' ? '科技界' : '大自然'}又在搞事情了！🌍`,
      `這消息讓人既興奮又緊張，就像第一次約會一樣 😅`,
      `終於有人做了我們早就該做的事情 👏`,
      `這證明了人類的創意永遠超出想像 🚀`
    ];

    return {
      affectedGroups: ['一般民眾', '相關產業', '政策制定者'],
      beforeImpact: '情況尚未明朗，各方持觀望態度',
      afterImpact: '預期將帶來正面影響，但仍需時間觀察',
      humorousInterpretation: humorousTemplates[Math.floor(Math.random() * humorousTemplates.length)]
    };
  }

  // 儲存新聞
  async saveNews() {
    console.log('💾 正在儲存新聞...');

    // 確保資料目錄存在
    await fs.mkdir(CONFIG.dataDir, { recursive: true });

    // 儲存新聞檔案
    await fs.writeFile(
      CONFIG.newsFile,
      JSON.stringify(this.newNews, null, 2),
      'utf8'
    );

    console.log('✅ 新聞已儲存');
  }

  // 記錄到 MCP 系統
  async recordToMCP() {
    console.log('📝 正在記錄到 MCP 系統...');

    try {
      const updateRecord = {
        timestamp: new Date().toISOString(),
        version: this.newNews.metadata.version,
        summary: this.generateUpdateSummary(),
        source: 'auto',
        changes: this.calculateChanges(),
        metadata: this.newNews.metadata
      };

      // 1. 儲存到本地記錄
      const recordsFile = path.join(CONFIG.dataDir, 'update-records.json');
      let records = [];

      try {
        const data = await fs.readFile(recordsFile, 'utf8');
        records = JSON.parse(data);
      } catch (error) {
        // 檔案不存在，建立新的記錄陣列
      }

      records.push(updateRecord);

      // 只保留最近100筆記錄
      if (records.length > 100) {
        records = records.slice(-100);
      }

      await fs.writeFile(recordsFile, JSON.stringify(records, null, 2));

      // 2. 儲存到 MCP 系統
      await this.saveToMCPSystem(updateRecord);

      console.log('✅ 已記錄到 MCP 系統');

    } catch (error) {
      console.warn('⚠️ MCP 記錄失敗:', error.message);
    }
  }

  // 儲存到真正的 MCP 系統
  async saveToMCPSystem(updateRecord) {
    const mcpDir = path.join(__dirname, '..', '..', 'MCP', 'data');

    // 確保 MCP 目錄存在
    try {
      await fs.access(mcpDir);
    } catch (error) {
      console.warn('⚠️ MCP 目錄不存在，跳過 MCP 記錄');
      return;
    }

    // 儲存新聞歷史
    const newsHistoryFile = path.join(mcpDir, 'news-history.json');
    let newsHistory = [];

    try {
      const data = await fs.readFile(newsHistoryFile, 'utf8');
      newsHistory = JSON.parse(data);
    } catch (error) {
      // 檔案不存在或損壞，建立新陣列
    }

    // 新增這次的更新記錄
    const historyEntry = {
      id: `news-update-${Date.now()}`,
      timestamp: updateRecord.timestamp,
      type: 'news_update',
      summary: updateRecord.summary,
      details: {
        version: updateRecord.version,
        changes: updateRecord.changes,
        metadata: updateRecord.metadata
      }
    };

    newsHistory.push(historyEntry);

    // 只保留最近50筆記錄
    if (newsHistory.length > 50) {
      newsHistory = newsHistory.slice(-50);
    }

    await fs.writeFile(newsHistoryFile, JSON.stringify(newsHistory, null, 2));

    // 更新統計數據
    await this.updateMCPStatistics(updateRecord.changes);
  }

  // 更新 MCP 統計數據
  async updateMCPStatistics(changes) {
    const mcpDir = path.join(__dirname, '..', '..', 'MCP', 'data');
    const statsFile = path.join(mcpDir, 'statistics.json');

    let stats = {
      totalUpdates: 0,
      totalNewsAdded: 0,
      totalNewsUpdated: 0,
      lastUpdateTime: null
    };

    try {
      const data = await fs.readFile(statsFile, 'utf8');
      stats = JSON.parse(data);
    } catch (error) {
      // 檔案不存在，使用預設值
    }

    // 更新統計
    stats.totalUpdates = (stats.totalUpdates || 0) + 1;
    stats.totalNewsAdded = (stats.totalNewsAdded || 0) + changes.added.length;
    stats.totalNewsUpdated = (stats.totalNewsUpdated || 0) + changes.updated.length;
    stats.lastUpdateTime = new Date().toISOString();

    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
  }

  // 計算變更
  calculateChanges() {
    const changes = {
      added: [],
      updated: [],
      removed: []
    };

    const categories = ['world', 'tech', 'environment'];

    categories.forEach(category => {
      const oldNews = this.currentNews[category] || [];
      const newNews = this.newNews[category] || [];

      const oldIds = new Set(oldNews.map(item => item.id));
      const newIds = new Set(newNews.map(item => item.id));

      // 新增的新聞
      newNews.forEach(item => {
        if (!oldIds.has(item.id)) {
          changes.added.push(item);
        }
      });

      // 刪除的新聞
      oldNews.forEach(item => {
        if (!newIds.has(item.id)) {
          changes.removed.push(item.id);
        }
      });
    });

    return changes;
  }

  // 生成更新摘要
  generateUpdateSummary() {
    const changes = this.calculateChanges();
    const parts = [];

    if (changes.added.length > 0) {
      parts.push(`新增 ${changes.added.length} 篇新聞`);
    }

    if (changes.updated.length > 0) {
      parts.push(`更新 ${changes.updated.length} 篇新聞`);
    }

    if (changes.removed.length > 0) {
      parts.push(`移除 ${changes.removed.length} 篇新聞`);
    }

    return parts.join('，') || '無變更';
  }

  // 生成版本號
  generateVersion() {
    const now = new Date();
    return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // 生成新聞ID
  generateNewsId(category) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 5);
    return `${category}-${timestamp}-${random}`;
  }

  // 記錄錯誤
  async logError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: error.message,
      stack: error.stack
    };

    const errorFile = path.join(CONFIG.dataDir, 'error.log');
    const errorLine = JSON.stringify(errorLog) + '\n';

    try {
      await fs.appendFile(errorFile, errorLine);
    } catch (err) {
      console.error('無法寫入錯誤日誌:', err);
    }
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const updater = new NewsUpdater();
  updater.run();
}

module.exports = NewsUpdater;