// FOR-NEWS 與 MCP Memory 服務整合模組

interface MCPTool {
  name: string;
  arguments: any;
}

interface MCPResponse {
  success: boolean;
  content?: any;
  error?: string;
}

export class MCPMemoryIntegration {
  private isAvailable: boolean = false;

  constructor() {
    this.checkMCPAvailability();
  }

  // 檢查 MCP 服務是否可用
  private async checkMCPAvailability(): Promise<boolean> {
    try {
      // 這裡應該檢查 MCP 服務是否運行
      // 在實際環境中，這會是一個 MCP 客戶端連接檢查
      this.isAvailable = true; // 暫時設為 true，實際使用時需要真實檢查
      return this.isAvailable;
    } catch (error) {
      console.warn('MCP Memory service not available:', error);
      this.isAvailable = false;
      return false;
    }
  }

  // 記錄新聞更新到 MCP
  async recordNewsUpdate(
    currentNews: any,
    newNews: any,
    source: 'auto' | 'manual' = 'auto'
  ): Promise<string | null> {
    if (!this.isAvailable) {
      console.warn('MCP service not available, skipping news update record');
      return null;
    }

    try {
      const changes = this.compareNewsData(currentNews, newNews);

      if (!this.hasChanges(changes)) {
        return 'no-changes';
      }

      // 調用 MCP 工具（這裡需要實際的 MCP 客戶端實現）
      const response = await this.callMCPTool('add_news_update', {
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
      });

      return response.success ? 'recorded' : null;
    } catch (error) {
      console.error('Failed to record news update to MCP:', error);
      return null;
    }
  }

  // 獲取歷史背景信息
  async getHistoricalContext(days: number = 7): Promise<any> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await this.callMCPTool('get_update_summary', { days });
      return response.success ? response.content : null;
    } catch (error) {
      console.error('Failed to get historical context from MCP:', error);
      return null;
    }
  }

  // 獲取最近更新記錄
  async getRecentUpdates(limit: number = 10): Promise<any[]> {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const response = await this.callMCPTool('get_recent_updates', { limit });
      return response.success ? response.content : [];
    } catch (error) {
      console.error('Failed to get recent updates from MCP:', error);
      return [];
    }
  }

  // 查詢特定條件的新聞歷史
  async queryNewsHistory(filters: {
    dateRange?: { start: string; end: string };
    keywords?: string[];
    category?: 'world' | 'tech' | 'environment';
    limit?: number;
  }): Promise<any[]> {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const response = await this.callMCPTool('query_news_history', filters);
      return response.success ? response.content : [];
    } catch (error) {
      console.error('Failed to query news history from MCP:', error);
      return [];
    }
  }

  // 添加開發日誌
  async addDevelopmentLog(log: {
    type: 'feature' | 'bug' | 'improvement' | 'config' | 'deployment';
    title: string;
    description: string;
    author?: string;
    relatedFiles?: string[];
    impact?: 'low' | 'medium' | 'high';
    tags?: string[];
  }): Promise<string | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await this.callMCPTool('add_dev_log', {
        ...log,
        impact: log.impact || 'low',
        relatedFiles: log.relatedFiles || [],
        tags: log.tags || []
      });

      return response.success ? 'logged' : null;
    } catch (error) {
      console.error('Failed to add development log to MCP:', error);
      return null;
    }
  }

  // 獲取系統統計
  async getSystemStatistics(): Promise<any> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await this.callMCPTool('get_statistics', {});
      return response.success ? response.content : null;
    } catch (error) {
      console.error('Failed to get system statistics from MCP:', error);
      return null;
    }
  }

  // 私有方法：調用 MCP 工具
  private async callMCPTool(toolName: string, args: any): Promise<MCPResponse> {
    // 這裡是 MCP 客戶端調用的模擬
    // 在實際環境中，這應該是真實的 MCP 客戶端調用

    try {
      // 模擬 MCP 調用
      console.log(`Calling MCP tool: ${toolName}`, args);

      // 實際實現時，這裡會是：
      // const result = await mcpClient.callTool(toolName, args);

      return {
        success: true,
        content: `Mock response for ${toolName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 私有方法：比較新聞數據
  private compareNewsData(oldData: any, newData: any) {
    const changes = {
      added: [] as any[],
      updated: [] as any[],
      removed: [] as string[]
    };

    const categories = ['world', 'tech', 'environment'] as const;

    categories.forEach(category => {
      const oldNews = oldData[category] || [];
      const newNews = newData[category] || [];

      const oldNewsMap = new Map(oldNews.map((item: any) => [item.id, item]));
      const newNewsMap = new Map(newNews.map((item: any) => [item.id, item]));

      // 新增的新聞
      newNews.forEach((item: any) => {
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
      oldNews.forEach((item: any) => {
        if (!newNewsMap.has(item.id)) {
          changes.removed.push(item.id);
        }
      });
    });

    return changes;
  }

  // 私有方法：檢查是否有變更
  private hasChanges(changes: any): boolean {
    return changes.added.length > 0 || changes.updated.length > 0 || changes.removed.length > 0;
  }

  // 私有方法：生成版本號
  private generateVersion(): string {
    const now = new Date();
    return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // 私有方法：生成摘要
  private generateSummary(changes: any): string {
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

  // 私有方法：計算總新聞數
  private getTotalNewsCount(newsData: any): number {
    return (newsData.world?.length || 0) +
           (newsData.tech?.length || 0) +
           (newsData.environment?.length || 0);
  }

  // 靜態方法：創建全域實例
  private static instance: MCPMemoryIntegration | null = null;

  static getInstance(): MCPMemoryIntegration {
    if (!this.instance) {
      this.instance = new MCPMemoryIntegration();
    }
    return this.instance;
  }
}

// 導出便捷函數
export const mcpMemory = MCPMemoryIntegration.getInstance();

// 便捷函數
export async function recordNewsUpdate(currentNews: any, newNews: any, source: 'auto' | 'manual' = 'auto') {
  return mcpMemory.recordNewsUpdate(currentNews, newNews, source);
}

export async function getHistoricalContext(days: number = 7) {
  return mcpMemory.getHistoricalContext(days);
}

export async function getRecentUpdates(limit: number = 10) {
  return mcpMemory.getRecentUpdates(limit);
}

export async function addDevelopmentLog(log: {
  type: 'feature' | 'bug' | 'improvement' | 'config' | 'deployment';
  title: string;
  description: string;
  author?: string;
  relatedFiles?: string[];
  impact?: 'low' | 'medium' | 'high';
  tags?: string[];
}) {
  return mcpMemory.addDevelopmentLog(log);
}