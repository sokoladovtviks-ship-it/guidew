'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function GuidePage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        setCourses(await res.json())
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Мои курсы
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выбери курс для изучения. Каждый курс разбит на модули и уроки 
            с подробными объяснениями и примерами.
          </p>
        </div>

        {/* Список курсов */}
        <div className="space-y-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{course.modules?.length || 0} модулей</span>
                    <span>•</span>
                    <span>
                      {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} уроков
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Курсов пока нет</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Создать в админке
            </Link>
          </div>
        )}
      </main>

      {/* Футер */}
      <footer className="py-8 px-4 border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Мои заметки по программированию</p>
        </div>
      </footer>
    </div>
  )
}
