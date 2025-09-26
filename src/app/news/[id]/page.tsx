import Link from 'next/link'
import { NewsData, NewsItem } from '@/lib/types'
import newsData from '@/data/news.json'

interface NewsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params
  const data: NewsData = newsData as NewsData

  // 從所有分類中找到對應的新聞
  const allNews = [...data.world, ...data.tech, ...data.environment]
  const news = allNews.find(item => item.id === id)

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-700 mb-4">404</h1>
          <p className="text-gray-600 mb-6">找不到此新聞</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  const categoryMap = {
    world: { title: '世界新聞', icon: '📰', color: 'bg-red-600' },
    tech: { title: '科技新聞', icon: '💻', color: 'bg-green-600' },
    environment: { title: '環境新聞', icon: '🌱', color: 'bg-blue-600' }
  }

  const categoryInfo = categoryMap[news.category]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 導航 */}
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← 返回首頁
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 新聞標題區 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className={`${categoryInfo.color} text-white p-6`}>
            <div className="flex items-center gap-2 mb-2 text-white/80">
              <span>{categoryInfo.icon}</span>
              <span className="text-sm">{categoryInfo.title}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {news.title}
            </h1>
            <div className="flex gap-4 text-sm mt-4 text-white/90">
              <span>來源：{news.source}</span>
              <span>發布：{new Date(news.publishedAt).toLocaleString('zh-TW')}</span>
            </div>
          </div>
        </div>

        {/* 新聞內容 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📰 新聞內容
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {news.content ? (
              <p className="whitespace-pre-wrap">{news.content}</p>
            ) : (
              <p className="text-gray-500 italic">新聞內容將在數據更新後顯示</p>
            )}
          </div>
        </div>

        {/* 分析區塊 */}
        {news.analysis ? (
          <div className="space-y-6">
            {/* 受影響人群 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                👥 受影響人群
              </h2>
              <div className="flex flex-wrap gap-2">
                {news.analysis.affectedGroups.map((group, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* 影響前後對比 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                ⚖️ 影響前後對比
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-red-400 pl-4">
                  <h3 className="font-semibold text-red-600 mb-2">影響前</h3>
                  <p className="text-gray-700">{news.analysis.beforeImpact}</p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-semibold text-green-600 mb-2">影響後</h3>
                  <p className="text-gray-700">{news.analysis.afterImpact}</p>
                </div>
              </div>
            </div>

            {/* 幽默解讀 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                😄 幽默解讀
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p>{news.analysis.humorousInterpretation}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-500 italic">
              AI 分析功能將在數據更新後提供
            </p>
            <p className="text-sm text-gray-400 mt-2">
              包含受影響人群分析、影響前後對比及幽默解讀
            </p>
          </div>
        )}
      </main>
    </div>
  )
}