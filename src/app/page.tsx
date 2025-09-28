'use client';

export default function HomePage() {
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

          {/* 手動刷新按鈕 */}
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginRight: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              🔄 手動刷新頁面
            </button>

            <button
              onClick={() => {
                const now = new Date().toLocaleString('zh-TW');
                alert(`頁面刷新時間：${now}\n\n編輯者提示：\n- 手動刷新可重新載入最新內容\n- 每天早晚8點系統自動更新新聞\n- 如需編輯功能請聯繫管理員`);
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
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              ℹ️ 編輯者資訊
            </button>
          </div>
        </div>

        {/* 新聞分類區塊 */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* 世界新聞 */}
          <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📰</span>
                世界新聞
              </h3>
            </div>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無世界新聞</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>新聞將會每天早晚8點更新</p>
            </div>
          </section>

          {/* 科技新聞 */}
          <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💻</span>
                科技新聞
              </h3>
            </div>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無科技新聞</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>新聞將會每天早晚8點更新</p>
            </div>
          </section>

          {/* 環境新聞 */}
          <section style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌱</span>
                環境新聞
              </h3>
            </div>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>暫無環境新聞</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>新聞將會每天早晚8點更新</p>
            </div>
          </section>
        </div>
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
