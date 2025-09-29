#!/usr/bin/env node

/**
 * FOR-NEWS 定時任務調度器
 *
 * 功能：
 * 1. 每天早上 8:00 和晚上 8:00 自動更新新聞
 * 2. 監控系統狀態
 * 3. 記錄調度日誌
 */

const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class NewsScheduler {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'data', 'scheduler.log');
    this.isRunning = false;
    this.lastUpdate = null;
    this.updateCount = 0;
  }

  // 啟動調度器
  start() {
    console.log('🕐 FOR-NEWS 定時調度器啟動');

    // 每天早上 8:00 更新
    cron.schedule('0 8 * * *', () => {
      this.scheduleUpdate('morning');
    }, {
      timezone: "Asia/Taipei"
    });

    // 每天晚上 8:00 更新
    cron.schedule('0 20 * * *', () => {
      this.scheduleUpdate('evening');
    }, {
      timezone: "Asia/Taipei"
    });

    // 每小時檢查系統狀態
    cron.schedule('0 * * * *', () => {
      this.healthCheck();
    });

    // 每天午夜清理日誌
    cron.schedule('0 0 * * *', () => {
      this.cleanupLogs();
    });

    this.log('調度器已啟動，設定每天早晚 8:00 自動更新新聞');

    // 立即執行一次健康檢查
    this.healthCheck();

    console.log('✅ 調度器運行中...');
    console.log('📅 下次更新時間：每天 08:00 和 20:00');
  }

  // 調度新聞更新
  async scheduleUpdate(period) {
    if (this.isRunning) {
      this.log(`⚠️ 更新已在進行中，跳過 ${period} 更新`);
      return;
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      this.log(`🔄 開始 ${period} 新聞更新...`);

      // 執行更新腳本
      await this.runUpdateScript();

      const duration = new Date() - startTime;
      this.lastUpdate = startTime;
      this.updateCount++;

      this.log(`✅ ${period} 新聞更新完成 (耗時: ${duration}ms)`);

      // 記錄成功到 MCP
      await this.recordUpdateResult('success', period, duration);

    } catch (error) {
      const duration = new Date() - startTime;
      this.log(`❌ ${period} 新聞更新失敗: ${error.message}`);

      // 記錄失敗到 MCP
      await this.recordUpdateResult('failed', period, duration, error);

      // 發送通知（如果有配置）
      await this.sendNotification('更新失敗', error.message);

    } finally {
      this.isRunning = false;
    }
  }

  // 執行更新腳本
  runUpdateScript() {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'update-news.js');

      exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        if (stderr) {
          console.warn('Update script stderr:', stderr);
        }

        console.log('Update script output:', stdout);
        resolve(stdout);
      });
    });
  }

  // 健康檢查
  async healthCheck() {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        isRunning: this.isRunning,
        lastUpdate: this.lastUpdate,
        updateCount: this.updateCount,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        diskSpace: await this.checkDiskSpace()
      };

      // 檢查新聞檔案是否存在且最新
      const newsFile = path.join(__dirname, '..', 'data', 'news.json');
      try {
        const stats = await fs.stat(newsFile);
        status.newsFileAge = Date.now() - stats.mtime.getTime();
        status.newsFileSize = stats.size;
      } catch (error) {
        status.newsFileStatus = 'missing';
      }

      this.log(`💚 健康檢查完成: ${JSON.stringify(status, null, 2)}`);

      // 如果新聞檔案超過24小時未更新，記錄警告
      if (status.newsFileAge > 24 * 60 * 60 * 1000) {
        this.log('⚠️ 警告：新聞檔案超過24小時未更新');
      }

    } catch (error) {
      this.log(`❌ 健康檢查失敗: ${error.message}`);
    }
  }

  // 檢查磁碟空間
  async checkDiskSpace() {
    return new Promise((resolve) => {
      exec('df -h .', (error, stdout, stderr) => {
        if (error) {
          resolve('unknown');
          return;
        }
        resolve(stdout.split('\n')[1]); // 第二行包含資料
      });
    });
  }

  // 記錄更新結果到 MCP
  async recordUpdateResult(status, period, duration, error = null) {
    try {
      // 這裡應該調用 MCP 系統記錄
      const record = {
        timestamp: new Date().toISOString(),
        type: 'scheduled_update',
        status,
        period,
        duration,
        error: error ? error.message : null
      };

      // 儲存到本地記錄（作為備份）
      const recordsFile = path.join(__dirname, '..', 'data', 'scheduler-records.json');
      let records = [];

      try {
        const data = await fs.readFile(recordsFile, 'utf8');
        records = JSON.parse(data);
      } catch (err) {
        // 檔案不存在
      }

      records.push(record);

      // 只保留最近50筆記錄
      if (records.length > 50) {
        records = records.slice(-50);
      }

      await fs.writeFile(recordsFile, JSON.stringify(records, null, 2));

    } catch (err) {
      this.log(`⚠️ 無法記錄更新結果: ${err.message}`);
    }
  }

  // 發送通知
  async sendNotification(title, message) {
    // 這裡可以整合各種通知服務
    // 例如：Email, Slack, Discord, 等等
    this.log(`📢 通知: ${title} - ${message}`);
  }

  // 清理舊日誌
  async cleanupLogs() {
    try {
      const stats = await fs.stat(this.logFile);
      const fileSizeInMB = stats.size / (1024 * 1024);

      // 如果日誌檔案超過 10MB，進行清理
      if (fileSizeInMB > 10) {
        const data = await fs.readFile(this.logFile, 'utf8');
        const lines = data.split('\n');

        // 保留最近 1000 行
        const recentLines = lines.slice(-1000);
        await fs.writeFile(this.logFile, recentLines.join('\n'));

        this.log(`🧹 日誌清理完成，從 ${lines.length} 行減少到 ${recentLines.length} 行`);
      }

    } catch (error) {
      this.log(`⚠️ 日誌清理失敗: ${error.message}`);
    }
  }

  // 記錄日誌
  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    console.log(message);

    try {
      // 確保資料目錄存在
      const dataDir = path.dirname(this.logFile);
      await fs.mkdir(dataDir, { recursive: true });

      await fs.appendFile(this.logFile, logMessage);
    } catch (error) {
      console.error('無法寫入日誌:', error);
    }
  }

  // 取得狀態資訊
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      updateCount: this.updateCount,
      uptime: process.uptime()
    };
  }

  // 手動觸發更新
  async manualUpdate() {
    if (this.isRunning) {
      throw new Error('更新已在進行中');
    }

    return this.scheduleUpdate('manual');
  }

  // 停止調度器
  stop() {
    this.log('🛑 調度器停止');
    process.exit(0);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const scheduler = new NewsScheduler();

  // 處理程序終止信號
  process.on('SIGINT', () => {
    console.log('\n👋 收到終止信號，正在安全關閉...');
    scheduler.stop();
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 收到終止信號，正在安全關閉...');
    scheduler.stop();
  });

  // 處理未捕獲的異常
  process.on('uncaughtException', (error) => {
    console.error('❌ 未捕獲的異常:', error);
    scheduler.log(`❌ 未捕獲的異常: ${error.message}`);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未處理的 Promise 拒絕:', reason);
    scheduler.log(`❌ 未處理的 Promise 拒絕: ${reason}`);
  });

  // 啟動調度器
  scheduler.start();

  // 提供 HTTP 端點查看狀態（可選）
  const http = require('http');
  const server = http.createServer((req, res) => {
    if (req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(scheduler.getStatus()));
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else if (req.url === '/update' && req.method === 'POST') {
      scheduler.manualUpdate()
        .then(() => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Update triggered');
        })
        .catch(error => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(error.message);
        });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`🌐 狀態服務器運行在 http://localhost:${port}`);
    scheduler.log(`狀態服務器啟動在端口 ${port}`);
  });
}

module.exports = NewsScheduler;