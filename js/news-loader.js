// 動態新聞載入器

class NewsLoader {
  constructor() {
    this.currentNews = null;
    this.mcpClient = window.MCPClient;
    this.isLoading = false;
  }

  // 初始化載入
  async init() {
    try {
      console.log('🚀 NewsLoader initializing...');
      await this.loadNews();
      this.setupEventListeners();
      this.startPeriodicCheck();
      console.log('✅ NewsLoader initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize NewsLoader:', error);
      this.showErrorMessage('初始化失敗，請重新整理頁面');
    }
  }

  // 載入新聞數據
  async loadNews() {
    if (this.isLoading) {
      console.log('⏳ News loading already in progress...');
      return;
    }

    this.isLoading = true;
    this.showLoadingIndicator(true);

    try {
      console.log('📰 Loading news data...');

      // 儲存當前新聞用於比較
      const oldNews = this.currentNews;

      let newsData;

      // 檢測是否為 file:// 協議
      if (location.protocol === 'file:') {
        console.log('🗂️ File protocol detected, using sample data');
        newsData = this.getSampleNewsData();
      } else {
        // 從 data/news.json 載入新聞
        const response = await fetch('./data/news.json', {
          cache: 'no-cache', // 確保獲取最新數據
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        newsData = await response.json();
      }

      // 驗證數據格式
      this.validateNewsData(newsData);

      // 更新當前新聞
      this.currentNews = newsData;

      // 渲染新聞到頁面
      this.renderNews(newsData);

      // 更新最後更新時間顯示
      this.updateTimestamp(newsData.lastUpdated);

      // 記錄到 MCP 記憶系統
      if (oldNews && this.mcpClient) {
        try {
          const recordId = await this.mcpClient.recordNewsUpdate(oldNews, newsData, 'auto');
          console.log('📝 News update recorded to MCP:', recordId);
        } catch (error) {
          console.warn('⚠️ Failed to record to MCP:', error);
        }
      }

      console.log('✅ News loaded successfully');

    } catch (error) {
      console.error('❌ Failed to load news:', error);
      this.showErrorMessage(`載入新聞失敗: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.showLoadingIndicator(false);
    }
  }

  // 渲染新聞到頁面
  renderNews(newsData) {
    const categories = ['world', 'tech', 'environment'];

    categories.forEach(category => {
      const sectionElement = document.querySelector(`[data-category="${category}"]`);
      if (!sectionElement) {
        console.warn(`⚠️ Section element not found for category: ${category}`);
        return;
      }

      const newsItems = newsData[category] || [];
      const contentDiv = sectionElement.querySelector('.news-content');

      if (newsItems.length === 0) {
        contentDiv.innerHTML = `
          <div class="text-center text-gray-500 py-8">
            <p>暫無${window.NewsTypes?.NEWS_CATEGORIES[category]?.title || '新聞'}</p>
            <p class="text-sm mt-2">新聞將會每天早晚8點更新</p>
          </div>
        `;
      } else {
        contentDiv.innerHTML = newsItems.map(item => this.renderNewsItem(item)).join('');
      }
    });

    // 更新總新聞數量顯示
    this.updateNewsCount(newsData);
  }

  // 渲染單個新聞項目
  renderNewsItem(news) {
    const formattedDate = window.NewsTypes?.formatDate(news.publishedAt) || '未知時間';

    return `
      <article class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500 mb-4" onclick="showNewsDetail('${news.id}')">
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${news.title}</h3>
        <p class="text-gray-700 text-sm mb-3 line-clamp-3">${news.content}</p>
        <div class="flex justify-between items-center text-xs text-gray-500">
          <span class="bg-gray-100 px-2 py-1 rounded">${news.source}</span>
          <span>${formattedDate}</span>
        </div>
        ${news.analysis ? `
          <div class="mt-3 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
            <p class="text-sm text-yellow-800">
              <span class="font-medium">幽默解讀：</span>
              ${news.analysis.humorousInterpretation}
            </p>
          </div>
        ` : ''}
      </article>
    `;
  }

  // 更新時間戳顯示
  updateTimestamp(timestamp) {
    const timestampElement = document.querySelector('.update-info');
    if (timestampElement) {
      const formattedTime = window.NewsTypes?.formatDate(timestamp) || '未知時間';
      timestampElement.innerHTML = `
        <span class="status-indicator"></span>
        最後更新：${formattedTime}
      `;
    }
  }

  // 更新新聞數量顯示
  updateNewsCount(newsData) {
    const totalCount = (newsData.world?.length || 0) +
                      (newsData.tech?.length || 0) +
                      (newsData.environment?.length || 0);

    // 更新頁面標題
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      titleElement.textContent = `FOR-NEWS 🗞️ (${totalCount})`;
    }
  }

  // 顯示載入指示器
  showLoadingIndicator(show) {
    const indicator = document.querySelector('.status-indicator');
    if (indicator) {
      if (show) {
        indicator.style.animation = 'pulse 1s infinite';
        indicator.style.backgroundColor = '#f59e0b'; // 橙色表示載入中
      } else {
        indicator.style.animation = 'pulse 2s infinite';
        indicator.style.backgroundColor = '#10b981'; // 綠色表示完成
      }
    }

    // 更新載入狀態文字
    const statusText = document.querySelector('.update-info');
    if (statusText && show) {
      statusText.innerHTML = `
        <span class="status-indicator"></span>
        正在載入最新新聞...
      `;
    }
  }

  // 顯示錯誤訊息
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">❌</span>
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    document.body.appendChild(errorDiv);

    // 3秒後自動移除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }

  // 驗證新聞數據格式
  validateNewsData(newsData) {
    if (!newsData || typeof newsData !== 'object') {
      throw new Error('無效的新聞數據格式');
    }

    const requiredFields = ['world', 'tech', 'environment'];
    for (const field of requiredFields) {
      if (!Array.isArray(newsData[field])) {
        throw new Error(`缺少必要欄位: ${field}`);
      }
    }

    // 驗證每個新聞項目
    const allNews = [...(newsData.world || []), ...(newsData.tech || []), ...(newsData.environment || [])];
    allNews.forEach(item => {
      if (window.NewsTypes?.validateNewsItem) {
        window.NewsTypes.validateNewsItem(item);
      }
    });
  }

  // 設置事件監聽器
  setupEventListeners() {
    // 手動重新整理按鈕
    const refreshButton = document.querySelector('[onclick="window.location.reload()"]');
    if (refreshButton) {
      refreshButton.onclick = (e) => {
        e.preventDefault();
        this.loadNews();
      };
    }

    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.loadNews();
      }
    });

    // 頁面可見性變更時重新載入
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.loadNews();
      }
    });
  }

  // 定期檢查更新
  startPeriodicCheck() {
    // 每5分鐘檢查一次
    setInterval(() => {
      if (!document.hidden) {
        console.log('🔄 Periodic news check...');
        this.loadNews();
      }
    }, 5 * 60 * 1000);
  }

  // 獲取歷史記錄
  async getUpdateHistory(limit = 10) {
    if (this.mcpClient) {
      try {
        return await this.mcpClient.getRecentUpdates(limit);
      } catch (error) {
        console.error('Failed to get update history:', error);
      }
    }
    return [];
  }

  // 獲取統計數據
  async getStatistics() {
    if (this.mcpClient) {
      try {
        return await this.mcpClient.getUpdateSummary(7);
      } catch (error) {
        console.error('Failed to get statistics:', error);
      }
    }
    return null;
  }
}

// 顯示新聞詳情
function showNewsDetail(newsId) {
  if (!window.newsLoader || !window.newsLoader.currentNews) {
    alert('新聞數據尚未載入');
    return;
  }

  const allNews = [
    ...(window.newsLoader.currentNews.world || []),
    ...(window.newsLoader.currentNews.tech || []),
    ...(window.newsLoader.currentNews.environment || [])
  ];

  const news = allNews.find(item => item.id === newsId);
  if (!news) {
    alert('找不到對應的新聞');
    return;
  }

  // 建立詳情彈窗
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl max-h-full overflow-y-auto p-6">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-xl font-bold text-gray-900 pr-4">${news.title}</h2>
        <button class="text-gray-400 hover:text-gray-600 text-2xl" onclick="this.closest('.fixed').remove()">×</button>
      </div>

      <div class="text-sm text-gray-500 mb-4 flex justify-between">
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${news.source}</span>
        <span>${window.NewsTypes?.formatDate(news.publishedAt) || '未知時間'}</span>
      </div>

      <div class="prose max-w-none mb-6">
        <p class="text-gray-800 leading-relaxed">${news.content}</p>
      </div>

      ${news.analysis ? `
        <div class="border-t pt-4">
          <h3 class="font-semibold text-gray-900 mb-3">深度分析</h3>

          <div class="space-y-3">
            <div>
              <h4 class="font-medium text-gray-700">受影響人群：</h4>
              <p class="text-gray-600 text-sm">${news.analysis.affectedGroups.join('、')}</p>
            </div>

            <div>
              <h4 class="font-medium text-gray-700">影響前狀況：</h4>
              <p class="text-gray-600 text-sm">${news.analysis.beforeImpact}</p>
            </div>

            <div>
              <h4 class="font-medium text-gray-700">影響後狀況：</h4>
              <p class="text-gray-600 text-sm">${news.analysis.afterImpact}</p>
            </div>

            <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <h4 class="font-medium text-yellow-800">幽默解讀：</h4>
              <p class="text-yellow-700 text-sm mt-1">${news.analysis.humorousInterpretation}</p>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(modal);

  // 點擊背景關閉彈窗
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// 為 NewsLoader 類添加示例數據方法
NewsLoader.prototype.getSampleNewsData = function() {
  const now = new Date().toISOString();

  return {
    world: [
      {
        id: `world-demo-${Date.now()}-1`,
        title: "全球氣候峰會達成新協議",
        content: "各國領導人在最新的氣候峰會上達成新的減排協議，承諾在2030年前將碳排放量減少50%。這項協議被認為是氣候行動的重要里程碑。",
        category: "world",
        source: "BBC",
        publishedAt: now,
        analysis: {
          affectedGroups: ["政策制定者", "環保組織", "一般民眾", "工業界"],
          beforeImpact: "各國對氣候變遷的應對措施分歧較大，缺乏統一的行動計畫",
          afterImpact: "預期將推動全球綠色能源轉型，但實施效果仍需時間驗證",
          humorousInterpretation: "終於有人做了我們早就該做的事情，只是晚了大概20年而已 🌍"
        }
      },
      {
        id: `world-demo-${Date.now()}-2`,
        title: "國際貿易新協定簽署",
        content: "多個國家簽署新的貿易協定，旨在促進跨境商務往來並減少貿易壁壘。專家認為這將有助於全球經濟復甦。",
        category: "world",
        source: "CNN",
        publishedAt: now,
        analysis: {
          affectedGroups: ["進出口商", "消費者", "政府", "物流業"],
          beforeImpact: "國際貿易受到各種關稅和限制影響，成本居高不下",
          afterImpact: "預期商品價格下降，國際合作加強，但調整期可能帶來短期衝擊",
          humorousInterpretation: "大家終於發現一起賺錢比互相設障礙要好玩多了 💰"
        }
      }
    ],
    tech: [
      {
        id: `tech-demo-${Date.now()}-1`,
        title: "AI技術在醫療診斷的新突破",
        content: "最新的人工智慧診斷系統能夠在30秒內分析醫學影像，準確率達到95%。這項技術將大幅提升醫療效率。",
        category: "tech",
        source: "Tech Crunch",
        publishedAt: now,
        analysis: {
          affectedGroups: ["醫生", "病患", "醫療機構", "保險公司"],
          beforeImpact: "醫療診斷需要專業醫師長時間分析，容易出現人為誤判",
          afterImpact: "診斷速度大幅提升，醫療資源配置更有效率，但需要關注技術依賴風險",
          humorousInterpretation: "AI醫生24小時不休息，終於不用擔心醫生心情不好影響診斷了 🤖"
        }
      },
      {
        id: `tech-demo-${Date.now()}-2`,
        title: "量子計算機商用化進程加速",
        content: "科技巨頭宣布推出首款商用量子計算服務，為複雜計算問題提供前所未有的處理能力。",
        category: "tech",
        source: "Wired",
        publishedAt: now,
        analysis: {
          affectedGroups: ["科研機構", "金融業", "科技公司", "網路安全"],
          beforeImpact: "複雜計算需要大量時間和資源，限制了科學研究進展",
          afterImpact: "計算能力飛躍提升，但也帶來資訊安全和技術門檻挑戰",
          humorousInterpretation: "終於有電腦可以算出我這個月花了多少錢買咖啡了 ☕"
        }
      }
    ],
    environment: [
      {
        id: `environment-demo-${Date.now()}-1`,
        title: "海洋塑膠清理計畫獲重大進展",
        content: "海洋清理組織成功測試新型海洋垃圾收集系統，能夠有效清理海洋中的塑膠污染物。",
        category: "environment",
        source: "National Geographic",
        publishedAt: now,
        analysis: {
          affectedGroups: ["海洋生物", "漁業", "環保組織", "沿海居民"],
          beforeImpact: "海洋塑膠污染日益嚴重，威脅海洋生態系統健康",
          afterImpact: "海洋環境逐步改善，但需要持續投入和全球合作",
          humorousInterpretation: "海洋終於要擺脫變成巨大垃圾桶的命運了 🌊"
        }
      },
      {
        id: `environment-demo-${Date.now()}-3`,
        title: "可再生能源成本創新低",
        content: "最新報告顯示，太陽能和風能發電成本已降至史上最低點，使得綠色能源更具競爭力。",
        category: "environment",
        source: "Reuters",
        publishedAt: now,
        analysis: {
          affectedGroups: ["能源公司", "消費者", "投資者", "傳統能源業"],
          beforeImpact: "可再生能源成本較高，限制了普及推廣",
          afterImpact: "綠色能源普及加速，但傳統能源產業面臨轉型壓力",
          humorousInterpretation: "太陽和風終於決定免費幫人類發電，真是太貼心了 ⚡"
        }
      }
    ],
    lastUpdated: now,
    metadata: {
      totalNews: 6,
      updateSource: "demo",
      version: `demo-${new Date().toISOString().split('T')[0]}`
    }
  };
};

// 初始化全域變數
window.newsLoader = new NewsLoader();
window.showNewsDetail = showNewsDetail;