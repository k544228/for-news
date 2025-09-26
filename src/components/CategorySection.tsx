import { NewsItem } from '@/lib/types'
import NewsCard from './NewsCard'

interface CategorySectionProps {
  title: string
  icon: string
  news: NewsItem[]
  bgColor: string
}

export default function CategorySection({ title, icon, news, bgColor }: CategorySectionProps) {
  return (
    <section className="mb-8">
      <div className={`${bgColor} text-white p-4 rounded-t-lg`}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
      </div>
      <div className="bg-gray-50 p-4 rounded-b-lg space-y-4">
        {news.length > 0 ? (
          news.map(item => (
            <NewsCard key={item.id} news={item} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>暫無{title}新聞</p>
            <p className="text-sm mt-2">新聞將會每天早晚8點更新</p>
          </div>
        )}
      </div>
    </section>
  )
}