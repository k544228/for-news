import { NextResponse } from 'next/server';
const Parser = require('rss-parser');

// RSS新聞來源配置 - 專注於BBC以減少錯誤
const RSS_SOURCES = [
  {
    name: 'BBC News - Top Stories',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    enabled: true
  },
  {
    name: 'BBC News - World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    enabled: true
  },
  {
    name: 'BBC News - UK',
    url: 'https://feeds.bbci.co.uk/news/uk/rss.xml',
    enabled: true
  },
  {
    name: 'BBC News - Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    enabled: true
  },
  {
    name: 'BBC News - Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    enabled: true
  }
];

export async function GET() {
  try {
    console.log('開始抓取RSS新聞...');

    const parser = new Parser({
      timeout: 10000, // 10秒超時
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const allArticles: any[] = [];

    // 並行抓取所有RSS源
    const promises = RSS_SOURCES
      .filter(source => source.enabled)
      .map(async (source) => {
        try {
          console.log(`抓取 ${source.name}: ${source.url}`);

          const feed = await parser.parseURL(source.url);

          // 處理每個新聞項目 - 每個RSS源取3篇以避免過多
          const articles = feed.items.slice(0, 3).map((item: any) => ({
            title: item.title || '無標題',
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            source: source.name,
            description: item.contentSnippet || item.content || '',
            category: item.categories ? item.categories[0] : '一般',
          }));

          console.log(`✅ ${source.name} 成功抓取 ${articles.length} 篇新聞`);
          return articles;

        } catch (error) {
          console.error(`❌ ${source.name} 抓取失敗:`, error);
          return []; // 返回空陣列而不是拋出錯誤
        }
      });

    // 等待所有Promise完成
    const results = await Promise.all(promises);

    // 合併所有結果
    results.forEach(articles => {
      allArticles.push(...articles);
    });

    // 按發布時間排序（最新的在前）
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB.getTime() - dateA.getTime();
    });

    // 限制返回最多15篇新聞（5個BBC源 x 3篇）
    const limitedArticles = allArticles.slice(0, 15);

    console.log(`RSS抓取完成，共獲得 ${limitedArticles.length} 篇新聞`);

    return NextResponse.json({
      success: true,
      count: limitedArticles.length,
      articles: limitedArticles,
      sources: RSS_SOURCES.filter(s => s.enabled).map(s => s.name),
      lastUpdated: new Date().toISOString(),
      note: '專注於BBC新聞源，包含頭條、世界、英國、商業、科技新聞'
    });

  } catch (error) {
    console.error('RSS抓取錯誤:', error);

    // 返回備用新聞（避免完全失敗）
    const fallbackArticles = [
      {
        title: 'BBC新聞載入中 - 系統正在連接BBC新聞源',
        link: 'https://www.bbc.com/news',
        pubDate: new Date().toISOString(),
        source: 'BBC News',
        description: '正在嘗試從BBC多個頻道抓取最新新聞：頭條、世界、英國、商業、科技...',
        category: '系統'
      }
    ];

    return NextResponse.json({
      success: false,
      count: fallbackArticles.length,
      articles: fallbackArticles,
      error: error instanceof Error ? error.message : '未知錯誤',
      note: 'BBC新聞源連接失敗，顯示備用內容'
    });
  }
}