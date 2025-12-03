'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useProgress } from '@/contexts/ProgressContext'
import { useAuth } from '@/contexts/AuthContext'

export default function CoursePage() {
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isLessonFullyCompleted, isCompleted } = useProgress()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.courseId}`)
      if (res.ok) {
        setCourse(await res.json())
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

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Курс не найден</div>
        </div>
      </div>
    )
  }

  // Собираем все уроки в один плоский список для непрерывной линии
  const allLessons = []
  course.modules?.forEach(module => {
    module.lessons?.forEach(lesson => {
      allLessons.push({ ...lesson, moduleId: module.id, moduleTitle: module.title, moduleNumber: module.number })
    })
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Шапка курса */}
      <header className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            {course.description}
          </p>
        </div>
      </header>

      {/* Контент с модулями */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {course.modules?.map((module, moduleIndex) => (
            <div key={module.id} className="flex gap-8">
              {/* Левая часть - информация о модуле */}
              <div className="w-1/3 flex-shrink-0">
                <p className="text-sm text-gray-400 mb-1">Модуль {module.number}</p>
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  {module.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {module.description}
                </p>
              </div>

              {/* Правая часть - уроки модуля */}
              <div className="flex-1">
                {module.lessons?.map((lesson, lessonIndex, lessonsArray) => {
                  const lessonCompleted = isAuthenticated && isLessonFullyCompleted(course.id, lesson)
                  const isLastLessonInModule = lessonIndex === lessonsArray.length - 1
                  
                  return (
                    <div key={lesson.id} className="relative">
                      {/* Вертикальная линия от этого урока к следующему */}
                      {!isLastLessonInModule && (
                        <div 
                          className={`absolute left-3 w-0.5 transition-colors duration-300 ${
                            lessonCompleted ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                          style={{ 
                            transform: 'translateX(-50%)',
                            top: '12px',
                            bottom: '-12px'
                          }}
                        />
                      )}

                      {/* Основной урок */}
                      <Link
                        href={`/course/${course.id}/${module.id}/${lesson.id}`}
                        className="group flex items-center gap-4 py-3 relative"
                      >
                        {/* Точка на линии */}
                        <div className="relative z-10 w-6 h-6 flex items-center justify-center">
                          {lessonCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300 group-hover:bg-blue-500 group-hover:scale-125 transition-all" />
                          )}
                        </div>
                        
                        {/* Название урока */}
                        <span className={`transition-colors ${
                          lessonCompleted 
                            ? 'text-green-600 font-medium' 
                            : 'text-gray-700 group-hover:text-blue-600'
                        }`}>
                          {lesson.title}
                        </span>
                      </Link>

                      {/* Подуроки с отступом */}
                      {lesson.sublessons?.map((sublesson) => {
                        const sublessonCompleted = isAuthenticated && isCompleted(course.id, lesson.id, sublesson.id)
                        
                        return (
                          <Link
                            key={sublesson.id}
                            href={`/course/${course.id}/${module.id}/${lesson.id}/${sublesson.id}`}
                            className="group flex items-center gap-4 py-3 relative ml-8"
                          >
                            {/* Горизонтальная линия к подуроку */}
                            <div className={`absolute left-[-20px] top-1/2 w-5 h-0.5 transition-colors ${
                              sublessonCompleted ? 'bg-green-400' : 'bg-gray-200'
                            }`} />
                            
                            {/* Точка подурока */}
                            <div className="relative z-10 w-5 h-5 flex items-center justify-center">
                              {sublessonCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-blue-500 group-hover:scale-125 transition-all" />
                              )}
                            </div>
                            
                            {/* Название подурока */}
                            <span className={`text-sm transition-colors ${
                              sublessonCompleted 
                                ? 'text-green-600 font-medium' 
                                : 'text-gray-600 group-hover:text-blue-600'
                            }`}>
                              {sublesson.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
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
