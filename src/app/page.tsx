export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-4xl font-bold">FOR-NEWS 🗞️</h1>
        <p className="text-blue-100 mt-2">國際新聞幽默解讀平台</p>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 更新時間顯示 */}
        <div className="text-center mb-8 text-gray-600">
          <p className="text-sm">
            等待首次更新 - 每天早晚8點自動更新
          </p>
        </div>

        {/* 新聞分類區塊 */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 世界新聞 */}
          <section className="mb-8">
            <div className="bg-red-600 text-white p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📰</span>
                世界新聞
              </h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-4">
              <div className="text-center text-gray-500 py-8">
                <p>暫無世界新聞</p>
                <p className="text-sm mt-2">新聞將會每天早晚8點更新</p>
              </div>
            </div>
          </section>

          {/* 科技新聞 */}
          <section className="mb-8">
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>💻</span>
                科技新聞
              </h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-4">
              <div className="text-center text-gray-500 py-8">
                <p>暫無科技新聞</p>
                <p className="text-sm mt-2">新聞將會每天早晚8點更新</p>
              </div>
            </div>
          </section>

          {/* 環境新聞 */}
          <section className="mb-8">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🌱</span>
                環境新聞
              </h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-4">
              <div className="text-center text-gray-500 py-8">
                <p>暫無環境新聞</p>
                <p className="text-sm mt-2">新聞將會每天早晚8點更新</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p className="text-sm">
          FOR-NEWS © 2025 - 用幽默的方式理解世界 🌍
        </p>
      </footer>
    </div>
  )
}
