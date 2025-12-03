import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TopicCard({ title, description, href, icon: Icon, index }) {
  return (
    <Link href={href} className="block">
      <div
        className="topic-card bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 cursor-pointer"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start gap-4">
          {/* Иконка */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
            {Icon && <Icon className="w-6 h-6 text-blue-600" />}
          </div>
          
          {/* Контент */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
            )}
          </div>

          {/* Стрелка */}
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  )
}
