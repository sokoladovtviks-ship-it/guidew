'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Trophy, Star, Zap, BookOpen, CheckCircle, ChevronDown, ArrowLeft } from 'lucide-react'
import { useProgress } from '@/contexts/ProgressContext'
import { useAuth } from '@/contexts/AuthContext'

export default function TrainerPage() {
  const [courses, setCourses] = useState([])
  const [exercises, setExercises] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [expandedLevels, setExpandedLevels] = useState({ 1: true, 2: true, 3: true })
  const [loading, setLoading] = useState(true)
  const { isExerciseCompleted, getCourseExerciseStats, getExerciseStats } = useProgress()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, exercisesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/exercises')
      ])
      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (exercisesRes.ok) setExercises(await exercisesRes.json())
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const levels = [
    { level: 1, title: 'Лёгкий', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { level: 2, title: 'Средний', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { level: 3, title: 'Сложный', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' }
  ]

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }))
  }

  // Получить курсы с задачами
  const coursesWithExercises = courses.filter(course => 
    exercises.some(e => e.courseId === course.id)
  )

  // Задачи без курса
  const exercisesWithoutCourse = exercises.filter(e => !e.courseId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Общая статистика
  const totalStats = getExerciseStats(exercises)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-amber-500">
            <span className="text-2xl">📚</span>
            ACADEMY
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guide" className="text-gray-600 hover:text-gray-900">Курс</Link>
            <span className="text-blue-600 font-medium">Тренажёр</span>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Если выбран курс - показываем задачи */}
        {selectedCourse ? (
          <>
            {/* Кнопка назад */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к курсам
            </button>

            {/* Заголовок курса */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedCourse === 'none' ? 'Разные задачи' : courses.find(c => c.id === selectedCourse)?.title}
                  </h1>
                  <p className="text-gray-500 mt-1">Задачи для практики</p>
                </div>
                {isAuthenticated && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCourse === 'none' 
                        ? getExerciseStats(exercisesWithoutCourse).completed
                        : getCourseExerciseStats(exercises, selectedCourse).completed} / {selectedCourse === 'none' 
                        ? exercisesWithoutCourse.length
                        : getCourseExerciseStats(exercises, selectedCourse).total}
                    </div>
                    <div className="text-sm text-gray-500">задач решено</div>
                  </div>
                )}
              </div>
              {isAuthenticated && (
                <div className="mt-4 bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedCourse === 'none' 
                      ? getExerciseStats(exercisesWithoutCourse).percentage
                      : getCourseExerciseStats(exercises, selectedCourse).percentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Задачи по уровням */}
            {levels.map(({ level, title, color, bgColor, textColor }) => {
              const levelExercises = selectedCourse === 'none'
                ? exercisesWithoutCourse.filter(e => e.level === level)
                : exercises.filter(e => e.courseId === selectedCourse && e.level === level)
              if (levelExercises.length === 0) return null
              
              const completedCount = levelExercises.filter(e => isExerciseCompleted(e.id)).length

              return (
                <div key={level} className="mb-6">
                  <button
                    onClick={() => toggleLevel(level)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl ${bgColor} mb-2`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className={`font-semibold ${textColor}`}>{title}</span>
                      <span className="text-sm text-gray-500">
                        {levelExercises.length} {levelExercises.length === 1 ? 'задача' : 'задач'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAuthenticated && (
                        <span className="text-sm font-medium text-gray-600">
                          {completedCount} / {levelExercises.length}
                        </span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedLevels[level] ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expandedLevels[level] && (
                    <div className="space-y-2">
                      {levelExercises.map((exercise, index) => {
                        const completed = isExerciseCompleted(exercise.id)
                        return (
                          <Link
                            key={exercise.id}
                            href={`/trainer/${exercise.id}`}
                            className={`block bg-white rounded-xl border p-4 hover:border-blue-300 hover:shadow-md transition-all group ${
                              completed ? 'border-green-200' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                                  completed 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                                }`}>
                                  {completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                </div>
                                <div>
                                  <h3 className={`font-medium ${completed ? 'text-green-700' : 'text-gray-800'} group-hover:text-blue-600`}>
                                    {exercise.title}
                                  </h3>
                                  {exercise.description && (
                                    <p className="text-sm text-gray-500 mt-0.5">{exercise.description}</p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ) : (
          <>
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Тренажёр</h1>
              <p className="text-gray-600">Выбери курс и практикуйся решая задачи</p>
              {isAuthenticated && exercises.length > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    Всего решено: {totalStats.completed} / {totalStats.total} задач
                  </span>
                </div>
              )}
            </div>

            {/* Список курсов */}
            <div className="grid gap-4">
              {coursesWithExercises.map(course => {
                const stats = getCourseExerciseStats(exercises, course.id)
                const courseExercises = exercises.filter(e => e.courseId === course.id)
                
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            {course.title}
                          </h2>
                          <p className="text-gray-500 mt-1">
                            {courseExercises.length} {courseExercises.length === 1 ? 'задача' : 'задач'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isAuthenticated && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-700">
                              {stats.completed} / {stats.total}
                            </div>
                            <div className="text-sm text-gray-500">решено</div>
                          </div>
                        )}
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </div>
                    {isAuthenticated && stats.total > 0 && (
                      <div className="mt-4 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    )}
                    {/* Показать количество по уровням */}
                    <div className="flex gap-4 mt-4">
                      {levels.map(({ level, title, color }) => {
                        const count = courseExercises.filter(e => e.level === level).length
                        if (count === 0) return null
                        return (
                          <div key={level} className="flex items-center gap-2 text-sm text-gray-500">
                            <div className={`w-2 h-2 rounded-full ${color}`} />
                            {title}: {count}
                          </div>
                        )
                      })}
                    </div>
                  </button>
                )
              })}

              {/* Задачи без курса */}
              {exercisesWithoutCourse.length > 0 && (
                <button
                  onClick={() => setSelectedCourse('none')}
                  className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-400 rounded-xl flex items-center justify-center">
                        <Star className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                          Разные задачи
                        </h2>
                        <p className="text-gray-500 mt-1">
                          {exercisesWithoutCourse.length} {exercisesWithoutCourse.length === 1 ? 'задача' : 'задач'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              )}
            </div>

            {exercises.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Задачи пока не добавлены
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
