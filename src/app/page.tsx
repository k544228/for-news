'use client';

import { useState, useEffect } from 'react';

// RSS新聞項目類型
interface RSSNewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

// 擷取的文章內容類型
interface ExtractedArticle {
  title: string;
  content: string;
  textContent: string;
  author?: string;
  publishDate?: string;
  url: string;
}

export default function HomePage() {
  const [rssNews, setRssNews] = useState<RSSNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [extractedArticle, setExtractedArticle] = useState<ExtractedArticle | null>(null);
  const [extracting, setExtracting] = useState(false);

  // 載入RSS新聞
  const loadRSSNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rss-feeds');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRssNews(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入RSS新聞時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 擷取文章內容
  const extractContent = async () => {
    if (!inputUrl.trim()) {
      alert('請輸入有效的新聞網址');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setExtractedArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '擷取內容時發生錯誤');
    } finally {
      setExtracting(false);
    }
  };

  // 頁面載入時自動抓取RSS
  useEffect(() => {
    loadRSSNews();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          FOR-NEWS 📰
        </h1>
        <p style={{ color: '#dbeafe', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
          半自動化新聞聚合與內容擷取系統
        </p>
        <p style={{ color: '#bfdbfe', fontSize: '0.9rem' }}>
          RSS源展示 → 使用者篩選 → 內容擷取 → 優化處理
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* 階段一：RSS新聞源展示 */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📡</span>
                階段一：BBC新聞源展示
              </h2>
              <p style={{ color: '#fecaca', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                瀏覽BBC各頻道RSS標題，點擊開啟原網站，判斷是否符合需求
              </p>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={loadRSSNews}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {loading ? '🔄 載入中...' : '📡 重新載入BBC新聞'}
                </button>
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ color: '#dc2626' }}>❌ {error}</p>
                </div>
              )}

              {rssNews.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {rssNews.slice(0, 10).map((news, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                      onClick={() => window.open(news.link, '_blank')}
                    >
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#1f2937'
                      }}>
                        {news.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        <span>📰 {news.source}</span>
                        <span>{new Date(news.pubDate).toLocaleDateString('zh-TW')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <p>暫無BBC新聞，請點擊「重新載入BBC新聞」</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* 階段二：內容擷取系統 */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔍</span>
                階段二：內容擷取系統
              </h2>
              <p style={{ color: '#a7f3d0', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                輸入新聞網址，使用Mercury技術擷取完整文章內容
              </p>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  新聞網址：
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="請貼上新聞文章的完整網址..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    onClick={extractContent}
                    disabled={extracting || !inputUrl.trim()}
                    style={{
                      backgroundColor: extracting || !inputUrl.trim() ? '#9ca3af' : '#059669',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.9rem',
                      cursor: extracting || !inputUrl.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {extracting ? '🔄 擷取中...' : '🔍 擷取內容'}
                  </button>
                </div>
              </div>

              {extractedArticle && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginTop: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#166534'
                  }}>
                    ✅ 內容擷取成功
                  </h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#166534' }}>標題：</strong>
                    <p style={{ marginTop: '0.25rem', color: '#374151' }}>{extractedArticle.title}</p>
                  </div>

                  {extractedArticle.author && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#166534' }}>作者：</strong>
                      <span style={{ color: '#374151' }}>{extractedArticle.author}</span>
                    </div>
                  )}

                  {extractedArticle.publishDate && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#166534' }}>發布日期：</strong>
                      <span style={{ color: '#374151' }}>
                        {new Date(extractedArticle.publishDate).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#166534' }}>文字內容預覽：</strong>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      color: '#374151'
                    }}>
                      {extractedArticle.textContent || '無法擷取文字內容'}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    <strong>原始網址：</strong>
                    <a
                      href={extractedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', textDecoration: 'underline' }}
                    >
                      {extractedArticle.url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 使用說明 */}
        <section style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>ℹ️</span>
            使用說明
          </h3>
          <ol style={{ color: '#92400e', lineHeight: '1.6' }}>
            <li><strong>階段一</strong>：瀏覽BBC新聞標題，包含頭條、世界、英國、商業、科技新聞</li>
            <li><strong>階段二</strong>：點擊感興趣的標題開啟BBC原網站閱讀完整內容</li>
            <li><strong>階段三</strong>：如文章符合需求，複製網址到輸入框並點擊「擷取內容」</li>
            <li><strong>結果</strong>：系統使用Mercury技術自動擷取文章完整內容</li>
            <li><strong>優勢</strong>：專注BBC新聞源，穩定性高，內容品質優良</li>
          </ol>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        textAlign: 'center',
        padding: '2rem 1rem',
        marginTop: '3rem'
      }}>
        <p style={{ fontSize: '0.9rem' }}>
          FOR-NEWS © 2025 - 半自動化新聞聚合系統 🔍
        </p>
      </footer>
    </div>
  );
}