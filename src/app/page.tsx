import Header from '@/components/Header'
import CategorySection from '@/components/CategorySection'
import { NewsData } from '@/lib/types'
import newsData from '@/data/news.json'

export default function Home() {
  const data: NewsData = newsData as NewsData

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* 更新時間顯示 */}
        <div className="text-center mb-8 text-gray-600">
          <p className="text-sm">
            {data.lastUpdated ?
              `最後更新：${new Date(data.lastUpdated).toLocaleString('zh-TW')}` :
              '等待首次更新 - 每天早晚8點自動更新'
            }
          </p>
        </div>

        {/* 新聞分類區塊 */}
        <div className="max-w-4xl mx-auto space-y-6">
          <CategorySection
            title="世界新聞"
            icon="📰"
            news={data.world}
            bgColor="bg-red-600"
          />

          <CategorySection
            title="科技新聞"
            icon="💻"
            news={data.tech}
            bgColor="bg-green-600"
          />

          <CategorySection
            title="環境新聞"
            icon="🌱"
            news={data.environment}
            bgColor="bg-blue-600"
          />
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
