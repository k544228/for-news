// MCP 記憶功能客戶端 (瀏覽器版本)

class MCPMemoryClient {
  constructor() {
    this.isAvailable = false;
    this.apiEndpoint = '/api/mcp'; // 假設有後端API端點
    this.fallbackStorage = new LocalStorageMemory();
    this.init();
  }

  async init() {
    try {
      // 檢查是否有 MCP 服務可用
      const response = await fetch('/api/health');
      this.isAvailable = response.ok;
    } catch (error) {
      console.warn('MCP service not available, using local storage fallback');
      this.isAvailable = false;
    }
  }

  // 記錄新聞更新
  async recordNewsUpdate(currentNews, newNews, source = 'manual') {
    const changes = this.compareNewsData(currentNews, newNews);

    if (!this.hasChanges(changes)) {
      return 'no-changes';
    }

    const record = {
      version: this.generateVersion(),
      summary: this.generateSummary(changes),
      source,
      changes,
      metadata: {
        totalNews: this.getTotalNewsCount(newNews),
        categoryCounts: {
          world: newNews.world?.length || 0,
          tech: newNews.tech?.length || 0,
          environment: newNews.environment?.length || 0
        }
      }
    };

    if (this.isAvailable) {
      try {
        const response = await fetch('/api/mcp/add-news-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ News update recorded to MCP:', result);
          return result.id;
        }
      } catch (error) {
        console.error('Failed to record to MCP, using fallback:', error);
      }
    }

    // 使用本地存儲作為後備方案
    return this.fallbackStorage.addRecord(record);
  }

  // 獲取歷史更新記錄
  async getRecentUpdates(limit = 10) {
    if (this.isAvailable) {
      try {
        const response = await fetch(`/api/mcp/recent-updates?limit=${limit}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch from MCP, using fallback:', error);
      }
    }

    return this.fallbackStorage.getRecentRecords(limit);
  }

  // 獲取更新統計
  async getUpdateSummary(days = 7) {
    if (this.isAvailable) {
      try {
        const response = await fetch(`/api/mcp/update-summary?days=${days}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch summary from MCP, using fallback:', error);
      }
    }

    return this.fallbackStorage.getSummary(days);
  }

  // 添加開發日誌
  async addDevelopmentLog(log) {
    const fullLog = {
      ...log,
      impact: log.impact || 'low',
      relatedFiles: log.relatedFiles || [],
      tags: log.tags || []
    };

    if (this.isAvailable) {
      try {
        const response = await fetch('/api/mcp/add-dev-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullLog)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Development log recorded:', result);
          return result.id;
        }
      } catch (error) {
        console.error('Failed to record dev log to MCP, using fallback:', error);
      }
    }

    return this.fallbackStorage.addDevLog(fullLog);
  }

  // 比較新聞數據
  compareNewsData(oldData, newData) {
    const changes = {
      added: [],
      updated: [],
      removed: []
    };

    const categories = ['world', 'tech', 'environment'];

    categories.forEach(category => {
      const oldNews = oldData[category] || [];
      const newNews = newData[category] || [];

      const oldNewsMap = new Map(oldNews.map(item => [item.id, item]));
      const newNewsMap = new Map(newNews.map(item => [item.id, item]));

      // 新增的新聞
      newNews.forEach(item => {
        if (!oldNewsMap.has(item.id)) {
          changes.added.push(item);
        } else {
          // 檢查更新
          const oldItem = oldNewsMap.get(item.id);
          if (JSON.stringify(oldItem) !== JSON.stringify(item)) {
            changes.updated.push(item);
          }
        }
      });

      // 刪除的新聞
      oldNews.forEach(item => {
        if (!newNewsMap.has(item.id)) {
          changes.removed.push(item.id);
        }
      });
    });

    return changes;
  }

  hasChanges(changes) {
    return changes.added.length > 0 || changes.updated.length > 0 || changes.removed.length > 0;
  }

  generateVersion() {
    const now = new Date();
    return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  generateSummary(changes) {
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

  getTotalNewsCount(newsData) {
    return (newsData.world?.length || 0) +
           (newsData.tech?.length || 0) +
           (newsData.environment?.length || 0);
  }
}

// 本地存儲後備方案
class LocalStorageMemory {
  constructor() {
    this.recordsKey = 'for-news-records';
    this.devLogsKey = 'for-news-dev-logs';
  }

  addRecord(record) {
    const records = this.getRecords();
    const newRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    records.push(newRecord);

    // 只保留最近100筆記錄
    if (records.length > 100) {
      records.splice(0, records.length - 100);
    }

    localStorage.setItem(this.recordsKey, JSON.stringify(records));
    return newRecord.id;
  }

  getRecords() {
    try {
      const data = localStorage.getItem(this.recordsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse records from localStorage:', error);
      return [];
    }
  }

  getRecentRecords(limit = 10) {
    const records = this.getRecords();
    return records.slice(-limit).reverse();
  }

  getSummary(days = 7) {
    const records = this.getRecords();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentRecords = records.filter(record =>
      new Date(record.timestamp) >= cutoffDate
    );

    return {
      totalUpdates: recentRecords.length,
      totalNewsAdded: recentRecords.reduce((sum, r) => sum + r.changes.added.length, 0),
      totalNewsUpdated: recentRecords.reduce((sum, r) => sum + r.changes.updated.length, 0),
      totalNewsRemoved: recentRecords.reduce((sum, r) => sum + r.changes.removed.length, 0),
      timeRange: {
        start: cutoffDate.toISOString(),
        end: new Date().toISOString()
      }
    };
  }

  addDevLog(log) {
    const logs = this.getDevLogs();
    const newLog = {
      ...log,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    logs.push(newLog);

    // 只保留最近200筆日誌
    if (logs.length > 200) {
      logs.splice(0, logs.length - 200);
    }

    localStorage.setItem(this.devLogsKey, JSON.stringify(logs));
    return newLog.id;
  }

  getDevLogs() {
    try {
      const data = localStorage.getItem(this.devLogsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse dev logs from localStorage:', error);
      return [];
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// 創建全域實例
const mcpClient = new MCPMemoryClient();

// 導出到全域
if (typeof window !== 'undefined') {
  window.MCPClient = mcpClient;
  window.MCPMemoryClient = MCPMemoryClient;
  window.LocalStorageMemory = LocalStorageMemory;
}