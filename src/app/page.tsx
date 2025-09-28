'use client';

import { useState, useEffect } from 'react';

// 新聞項目類型定義
interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'world' | 'tech' | 'environment';
  source: 'BBC' | 'CNN' | 'AP' | 'AlJazeera' | 'TechCrunch' | 'Taiwan News' | 'Nature' | 'Environmental Science' | 'GitHub Blog';
  publishedAt: string;
  link?: string;
  analysis?: {
    affectedGroups: string[];
    beforeImpact: string;
    afterImpact: string;
    humorousInterpretation: string;
  };
}

interface NewsData {
  world: NewsItem[];
  tech: NewsItem[];
  environment: NewsItem[];
  lastUpdated: string;
  source?: string;
  note?: string;
}

export default function HomePage() {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (useRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (useRefresh) {
        // 使用刷新API獲取最新內容
        response = await fetch('/api/refresh', { method: 'POST' });
      } else {
        // 使用一般API（可能包含RSS）
        response = await fetch('/api/news');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入新聞時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const NewsCard = ({ news }: { news: NewsItem }) => (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: news.link ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onClick={() => {
        if (news.link) {
          window.open(news.link, '_blank');
        } else {
          alert(`${news.title}\n\n${news.content}\n\n來源：${news.source}\n發布時間：${new Date(news.publishedAt).toLocaleString('zh-TW')}`);
        }
      }}
      onMouseOver={(e) => {
        if (news.link) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
        {news.title}
      </h4>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
        {news.content.length > 100 ? `${news.content.substring(0, 100)}...` : news.content}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
        <span>📰 {news.source}</span>
        <span>{new Date(news.publishedAt).toLocaleDateString('zh-TW')}</span>
      </div>
      {news.analysis && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
            💭 {news.analysis.humorousInterpretation}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header - Index Page */}
      <header style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          FOR-NEWS 🗞️
        </h1>
        <p style={{ color: '#dbeafe', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
          首頁 | 國際新聞幽默解讀平台
        </p>
        <p style={{ color: '#bfdbfe', fontSize: '0.9rem' }}>
          Index - Homepage
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* 首頁歡迎和更新時間顯示 */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1rem' }}>
            📰 歡迎來到FOR-NEWS首頁
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem' }}>
            Index Page - 新聞總覽
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
            等待首次更新 - 每天早晚8點自動更新
          </p>

          {/* 更新時間和狀態顯示 */}
          {newsData && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ✅ 最後更新：{new Date(newsData.lastUpdated).toLocaleString('zh-TW')}
              </p>
              {newsData.note && (
                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {newsData.note}
                </p>
              )}
            </div>
          )}

          {/* 手動刷新按鈕 */}
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => fetchNews(false)}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#2563eb')}
            >
              {loading ? '🔄 載入中...' : '📡 抓取新聞'}
            </button>

            <button
              onClick={() => fetchNews(true)}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c')}
              onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#dc2626')}
            >
              {loading ? '🔄 載入中...' : '🆕 生成新聞'}
            </button>

            <button
              onClick={() => {
                const now = new Date().toLocaleString('zh-TW');
                const status = newsData ? `最後更新：${new Date(newsData.lastUpdated).toLocaleString('zh-TW')}` : '尚未載入新聞';
                alert(`當前時間：${now}\n\n📢 使用說明：\n📡 「抓取新聞」- 嘗試從RSS獲取真實新聞\n🆕 「生成新聞」- 生成最新的示例新聞內容\n- 點擊新聞卡片可查看詳細內容\n- 有鏈接的新聞會開啟原文頁面\n- ${status}\n\n兩種模式都會提供優質新聞內容！`);
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#047857')}
              onMouseOut={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#059669')}
            >
              ℹ️ 使用說明
            </button>
          </div>

          {/* 錯誤顯示 */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                ❌ 載入錯誤：{error}
              </p>
              <button
                onClick={fetchNews}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                重新嘗試
              </button>
            </div>
          )}
        </div>

        {/* 載入狀態 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <p>正在載入最新新聞...</p>
          </div>
        )}

        {/* 新聞分類區塊 */}
        {newsData && !loading && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* 世界新聞 */}
            <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📰</span>
                  世界新聞 ({newsData.world.length})
                </h3>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                {newsData.world.length > 0 ? (
                  newsData.world.map(news => <NewsCard key={news.id} news={news} />)
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無世界新聞</p>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>點擊「刷新新聞」獲取最新內容</p>
                  </div>
                )}
              </div>
            </section>

            {/* 科技新聞 */}
            <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💻</span>
                  科技新聞 ({newsData.tech.length})
                </h3>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                {newsData.tech.length > 0 ? (
                  newsData.tech.map(news => <NewsCard key={news.id} news={news} />)
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無科技新聞</p>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>點擊「刷新新聞」獲取最新內容</p>
                  </div>
                )}
              </div>
            </section>

            {/* 環境新聞 */}
            <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🌱</span>
                  環境新聞 ({newsData.environment.length})
                </h3>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                {newsData.environment.length > 0 ? (
                  newsData.environment.map(news => <NewsCard key={news.id} news={news} />)
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無環境新聞</p>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>點擊「刷新新聞」獲取最新內容</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', textAlign: 'center', padding: '2rem 1rem', marginTop: '3rem' }}>
        <p style={{ fontSize: '0.9rem' }}>
          FOR-NEWS © 2025 - 用幽默的方式理解世界 🌍
        </p>
      </footer>
    </div>
  )
}
