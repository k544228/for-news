import Link from 'next/link'
import { NewsItem } from '@/lib/types'

interface NewsCardProps {
  news: NewsItem
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link href={`/news/${news.id}`}>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{news.source}</span>
          <span>{new Date(news.publishedAt).toLocaleDateString('zh-TW')}</span>
        </div>
      </div>
    </Link>
  )
}