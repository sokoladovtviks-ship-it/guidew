'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
  Save,
  X,
  Home,
  Dumbbell,
  LogOut,
  User,
  Image,
  Video,
  Upload,
  Clipboard
} from 'lucide-react'

export default function AdminPage() {
  const [courses, setCourses] = useState([])
  const [exercises, setExercises] = useState([])
  const [expandedCourses, setExpandedCourses] = useState({})
  const [expandedModules, setExpandedModules] = useState({})
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [aboutData, setAboutData] = useState(null)
  const [aboutSaving, setAboutSaving] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (auth) {
      // Проверяем что сессия не старше 24 часов
      const authTime = parseInt(auth)
      const now = Date.now()
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 часа
      
      if (now - authTime < sessionDuration) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminAuth')
        window.location.href = '/admin/login'
      }
    } else {
      window.location.href = '/admin/login'
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [coursesRes, exercisesRes, aboutRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/exercises'),
        fetch('/api/about')
      ])
      setCourses(await coursesRes.json())
      setExercises(await exercisesRes.json())
      setAboutData(await aboutRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const saveAboutData = async () => {
    setAboutSaving(true)
    try {
      await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData)
      })
      alert('Сохранено!')
    } catch (error) {
      alert('Ошибка сохранения')
    }
    setAboutSaving(false)
  }

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  // CRUD операции для курсов
  const createCourse = async () => {
    const newCourse = {
      title: 'Новый курс',
      description: 'Описание курса'
    }
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    })
    if (res.ok) fetchData()
  }

  const updateCourse = async (courseId, data) => {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchData()
      setEditingItem(null)
    }
  }

  const deleteCourse = async (courseId) => {
    if (!confirm('Удалить курс?')) return
    const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  // CRUD для модулей
  const createModule = async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Новый модуль', description: '' })
    })
    if (res.ok) fetchData()
  }

  const updateModule = async (courseId, moduleId, data) => {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchData()
      setEditingItem(null)
    }
  }

  const deleteModule = async (courseId, moduleId) => {
    if (!confirm('Удалить модуль?')) return
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        console.error('Delete module error:', error)
        alert('Ошибка удаления: ' + (error.error || 'Неизвестная ошибка'))
      }
    } catch (err) {
      console.error('Delete module exception:', err)
      alert('Ошибка: ' + err.message)
    }
  }

  // CRUD для уроков
  const createLesson = async (courseId, moduleId) => {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Новый урок', content: '' })
    })
    if (res.ok) fetchData()
  }

  const updateLesson = async (courseId, moduleId, lessonId, data) => {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchData()
      setEditingItem(null)
    }
  }

  const deleteLesson = async (courseId, moduleId, lessonId) => {
    if (!confirm('Удалить урок?')) return
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  // CRUD для подуроков
  const createSublesson = async (courseId, moduleId, lessonId) => {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/sublessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: 'Новый подурок', 
        content: '',
        quizzes: [],
        tasks: []
      })
    })
    if (res.ok) fetchData()
  }

  const updateSublesson = async (courseId, moduleId, lessonId, sublessonId, data) => {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/sublessons/${sublessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchData()
      setEditingItem(null)
    }
  }

  const deleteSublesson = async (courseId, moduleId, lessonId, sublessonId) => {
    if (!confirm('Удалить подурок?')) return
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/sublessons?sublessonId=${sublessonId}`, { 
      method: 'DELETE' 
    })
    if (res.ok) fetchData()
  }

  // CRUD для упражнений
  const createExercise = async () => {
    // Создаём задание и сразу открываем редактирование
    const newExercise = {
      id: `ex-${Date.now()}`,
      title: 'Новое задание',
      description: 'Описание задания',
      courseId: courses[0]?.id || '',
      level: 1,
      answer: '',
      hint: ''
    }
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise)
    })
    if (res.ok) {
      fetchData()
      // Открываем модалку редактирования нового задания
      setEditingItem({ type: 'exercise', data: newExercise, courses })
    }
  }

  const updateExercise = async (exerciseId, data) => {
    const res = await fetch(`/api/exercises/${exerciseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchData()
      setEditingItem(null)
    }
  }

  const deleteExercise = async (exerciseId) => {
    if (!confirm('Удалить задание?')) return
    const res = await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth')
                window.location.href = '/admin/login'
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Home className="w-4 h-4" />
              На сайт
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Табы */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Курсы
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'exercises' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Тренажёр
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'about' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            Обо мне
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {/* Кнопка создания курса */}
            <button
              onClick={createCourse}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Создать курс
            </button>

            {/* Список курсов */}
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Заголовок курса */}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    {expandedCourses[course.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">{course.title}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'course', data: course })}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Модули курса */}
                {expandedCourses[course.id] && (
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => createModule(course.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 mb-4"
                    >
                      <Plus className="w-3 h-3" />
                      Добавить модуль
                    </button>

                    <div className="space-y-3 ml-4">
                      {course.modules?.map(module => (
                        <div key={module.id} className="border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between p-3 bg-gray-50">
                            <button
                              onClick={() => toggleModule(module.id)}
                              className="flex items-center gap-2 flex-1"
                            >
                              {expandedModules[module.id] ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <Layers className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-500">Модуль {module.number}</span>
                              <span className="font-medium text-gray-700">{module.title}</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingItem({ type: 'module', courseId: course.id, data: module })}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteModule(course.id, module.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Уроки модуля */}
                          {expandedModules[module.id] && (
                            <div className="p-3 border-t border-gray-200">
                              <button
                                onClick={() => createLesson(course.id, module.id)}
                                className="flex items-center gap-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 mb-3"
                              >
                                <Plus className="w-3 h-3" />
                                Добавить урок
                              </button>

                              <div className="space-y-2 ml-4">
                                {module.lessons?.map(lesson => (
                                  <div key={lesson.id} className="p-2 bg-white border border-gray-100 rounded">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-700">{lesson.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => createSublesson(course.id, module.id, lesson.id)}
                                          className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                                          title="Добавить подурок"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingItem({ 
                                            type: 'lesson', 
                                            courseId: course.id, 
                                            moduleId: module.id, 
                                            data: lesson 
                                          })}
                                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                          title="Редактировать урок"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteLesson(course.id, module.id, lesson.id)}
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                          title="Удалить урок"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Статистика урока */}
                                    <div className="flex gap-3 mt-1 ml-6 text-xs text-gray-500">
                                      {lesson.sublessons?.length > 0 && (
                                        <span>📑 {lesson.sublessons.length} подуроков</span>
                                      )}
                                      {lesson.quizzes?.length > 0 && (
                                        <span>📝 {lesson.quizzes.length} тестов</span>
                                      )}
                                      {lesson.tasks?.length > 0 && (
                                        <span>💻 {lesson.tasks.length} задач</span>
                                      )}
                                    </div>
                                    
                                    {/* Подуроки */}
                                    {lesson.sublessons?.length > 0 && (
                                      <div className="mt-2 ml-6 space-y-1">
                                        {lesson.sublessons.map(sublesson => (
                                          <div key={sublesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                            <span className="text-gray-600">📄 {sublesson.title}</span>
                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setEditingItem({
                                                  type: 'sublesson',
                                                  courseId: course.id,
                                                  moduleId: module.id,
                                                  lessonId: lesson.id,
                                                  data: sublesson
                                                })}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="Редактировать подурок"
                                              >
                                                ✏️
                                              </button>
                                              <Link
                                                href={`/admin/sublesson/${course.id}/${module.id}/${lesson.id}/${sublesson.id}`}
                                                className="text-green-500 hover:text-green-700"
                                                title="Редактировать тесты/задачи"
                                              >
                                                🧪
                                              </Link>
                                              <button
                                                type="button"
                                                onClick={() => deleteSublesson(course.id, module.id, lesson.id, sublesson.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Удалить подурок"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <button
              onClick={createExercise}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Создать задание
            </button>

            {/* Группировка по курсам */}
            {courses.map(course => {
              const courseExercises = exercises.filter(e => e.courseId === course.id)
              if (courseExercises.length === 0) return null
              
              return (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {course.title}
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map(level => {
                      const levelExercises = courseExercises.filter(e => e.level === level)
                      if (levelExercises.length === 0) return null
                      
                      return (
                        <div key={level}>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                              level === 1 ? 'bg-green-500' : level === 2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {level}
                            </span>
                            Уровень {level}
                          </h4>
                          <div className="space-y-2 ml-7">
                            {levelExercises.map(exercise => (
                              <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">{exercise.title}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingItem({ type: 'exercise', data: exercise, courses })}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteExercise(exercise.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Задачи без курса */}
            {exercises.filter(e => !e.courseId).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-500 mb-4">Без курса</h3>
                <div className="space-y-2">
                  {exercises.filter(e => !e.courseId).map(exercise => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{exercise.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'exercise', data: exercise, courses })}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExercise(exercise.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Обо мне */}
        {activeTab === 'about' && aboutData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid gap-6">
              {/* Основная информация */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя / Приветствие</label>
                  <input
                    type="text"
                    value={aboutData.name || ''}
                    onChange={(e) => setAboutData({ ...aboutData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Аватар (эмодзи)</label>
                  <input
                    type="text"
                    value={aboutData.avatar || ''}
                    onChange={(e) => setAboutData({ ...aboutData, avatar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                <input
                  type="text"
                  value={aboutData.subtitle || ''}
                  onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Почему создал */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок секции "Почему"</label>
                <input
                  type="text"
                  value={aboutData.whyTitle || ''}
                  onChange={(e) => setAboutData({ ...aboutData, whyTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текст "Почему"</label>
                <textarea
                  value={aboutData.whyText || ''}
                  onChange={(e) => setAboutData({ ...aboutData, whyText: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Что делаю */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Что делаю (по строкам)</label>
                <textarea
                  value={(aboutData.whatIDo || []).join('\n')}
                  onChange={(e) => setAboutData({ ...aboutData, whatIDo: e.target.value.split('\n') })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Каждый пункт с новой строки"
                />
              </div>

              {/* Навыки */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Навыки</label>
                  <button
                    onClick={() => setAboutData({
                      ...aboutData,
                      skills: [...(aboutData.skills || []), { icon: '📚', title: 'Новый навык', description: 'Описание' }]
                    })}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    + Добавить
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {aboutData.skills?.map((skill, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skill.icon}
                          onChange={(e) => {
                            const updated = [...aboutData.skills]
                            updated[i] = { ...skill, icon: e.target.value }
                            setAboutData({ ...aboutData, skills: updated })
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          placeholder="🎯"
                        />
                        <input
                          type="text"
                          value={skill.title}
                          onChange={(e) => {
                            const updated = [...aboutData.skills]
                            updated[i] = { ...skill, title: e.target.value }
                            setAboutData({ ...aboutData, skills: updated })
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          placeholder="Название"
                        />
                        <button
                          onClick={() => setAboutData({
                            ...aboutData,
                            skills: aboutData.skills.filter((_, idx) => idx !== i)
                          })}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={skill.description}
                        onChange={(e) => {
                          const updated = [...aboutData.skills]
                          updated[i] = { ...skill, description: e.target.value }
                          setAboutData({ ...aboutData, skills: updated })
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Описание"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Контакты */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={aboutData.contacts?.github || ''}
                    onChange={(e) => setAboutData({ 
                      ...aboutData, 
                      contacts: { ...aboutData.contacts, github: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={aboutData.contacts?.email || ''}
                    onChange={(e) => setAboutData({ 
                      ...aboutData, 
                      contacts: { ...aboutData.contacts, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок CTA</label>
                  <input
                    type="text"
                    value={aboutData.ctaTitle || ''}
                    onChange={(e) => setAboutData({ ...aboutData, ctaTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Текст CTA</label>
                  <input
                    type="text"
                    value={aboutData.ctaText || ''}
                    onChange={(e) => setAboutData({ ...aboutData, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Кнопка сохранения */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={saveAboutData}
                  disabled={aboutSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {aboutSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(data) => {
            if (editingItem.type === 'course') {
              updateCourse(editingItem.data.id, data)
            } else if (editingItem.type === 'module') {
              updateModule(editingItem.courseId, editingItem.data.id, data)
            } else if (editingItem.type === 'lesson') {
              updateLesson(editingItem.courseId, editingItem.moduleId, editingItem.data.id, data)
            } else if (editingItem.type === 'sublesson') {
              updateSublesson(editingItem.courseId, editingItem.moduleId, editingItem.lessonId, editingItem.data.id, data)
            } else if (editingItem.type === 'exercise') {
              updateExercise(editingItem.data.id, data)
            }
          }}
        />
      )}
    </div>
  )
}

// Модальное окно редактирования
function EditModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState(item.data)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showImageUrlModal, setShowImageUrlModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  // Вставить текст в позицию курсора
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const content = formData.content || ''
    const newContent = content.substring(0, start) + text + content.substring(end)
    setFormData({ ...formData, content: newContent })
    
    // Восстановить позицию курсора
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  // Обработчик вставки (Ctrl+V)
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await uploadAndInsertImage(file)
        }
        return
      }
    }
  }

  // Загрузка изображения и вставка
  const uploadAndInsertImage = async (file) => {
    setUploading(true)
    try {
      // Конвертируем в base64 для простоты (можно заменить на загрузку на сервер)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        const isGif = file.type === 'image/gif'
        
        // Для GIF добавляем специальные атрибуты для сохранения анимации
        const imgTag = isGif 
          ? `<img src="${base64}" alt="GIF анимация" class="max-w-full h-auto rounded-lg my-4 gif-animation" style="image-rendering: auto;" loading="lazy" />`
          : `<img src="${base64}" alt="Изображение" class="max-w-full h-auto rounded-lg my-4" loading="lazy" />`
        
        insertAtCursor(imgTag)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки изображения')
      setUploading(false)
    }
  }

  // Обработчик выбора файла
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAndInsertImage(file)
    }
    e.target.value = '' // Сброс для повторного выбора
  }

  // Вставить видео по URL
  const insertVideo = () => {
    if (!videoUrl.trim()) return
    
    let embedUrl = videoUrl.trim()
    
    // YouTube
    if (embedUrl.includes('youtube.com/watch')) {
      const videoId = new URL(embedUrl).searchParams.get('v')
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    }
    // Rutube
    else if (embedUrl.includes('rutube.ru/video/')) {
      const videoId = embedUrl.match(/video\/([a-f0-9]+)/)?.[1]
      if (videoId) {
        embedUrl = `https://rutube.ru/play/embed/${videoId}`
      }
    }
    // VK Video
    else if (embedUrl.includes('vk.com/video')) {
      // VK требует особой обработки
      embedUrl = embedUrl.replace('vk.com/video', 'vk.com/video_ext.php?oid=').replace('_', '&id=')
    }
    
    const videoTag = `
<div class="video-container my-4">
  <iframe 
    src="${embedUrl}" 
    class="w-full aspect-video rounded-lg"
    frameborder="0" 
    allowfullscreen
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  ></iframe>
</div>`
    
    insertAtCursor(videoTag)
    setVideoUrl('')
    setShowVideoModal(false)
  }

  // Вставить изображение по URL
  const insertImageUrl = () => {
    if (!imageUrl.trim()) return
    const imgTag = `<img src="${imageUrl.trim()}" alt="Изображение" class="max-w-full h-auto rounded-lg my-4" />`
    insertAtCursor(imgTag)
    setImageUrl('')
    setShowImageUrlModal(false)
  }

  // Вставить из буфера (для мобильных)
  const pasteFromClipboard = async () => {
    try {
      // Используем Clipboard API
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], 'pasted-image.png', { type })
            await uploadAndInsertImage(file)
            return
          }
        }
      }
      alert('В буфере нет изображения')
    } catch (error) {
      // Fallback: запросить разрешение или показать инструкцию
      if (error.name === 'NotAllowedError') {
        alert('Разрешите доступ к буферу обмена в настройках браузера')
      } else {
        alert('Не удалось получить изображение из буфера. Попробуйте загрузить файл.')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Редактирование {
              item.type === 'course' ? 'курса' : 
              item.type === 'module' ? 'модуля' : 
              item.type === 'lesson' ? 'урока' : 
              item.type === 'sublesson' ? 'подурока' : 'задания'
            }
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {(item.type === 'course' || item.type === 'module' || item.type === 'exercise') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {(item.type === 'lesson' || item.type === 'sublesson') && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Контент (HTML)
                  </label>
                  {uploading && (
                    <span className="text-xs text-blue-600 animate-pulse">Загрузка...</span>
                  )}
                </div>
                
                {/* Медиа-тулбар */}
                <div className="flex flex-wrap items-center gap-1 mb-2 p-2 bg-gray-100 rounded-lg">
                  {/* Загрузить изображение */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white text-gray-700 rounded hover:bg-gray-50 border border-gray-300"
                    title="Загрузить изображение/GIF"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Файл</span>
                  </button>
                  
                  {/* Вставить из буфера (для мобильных) */}
                  <button
                    type="button"
                    onClick={pasteFromClipboard}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white text-gray-700 rounded hover:bg-gray-50 border border-gray-300"
                    title="Вставить из буфера обмена"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Вставить</span>
                  </button>
                  
                  {/* Изображение по URL */}
                  <button
                    type="button"
                    onClick={() => setShowImageUrlModal(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white text-gray-700 rounded hover:bg-gray-50 border border-gray-300"
                    title="Вставить изображение по ссылке"
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Картинка</span>
                  </button>
                  
                  {/* Видео */}
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white text-gray-700 rounded hover:bg-gray-50 border border-gray-300"
                    title="Вставить видео (YouTube, RuTube, VK)"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Видео</span>
                  </button>
                  
                  <span className="hidden sm:block text-xs text-gray-500 ml-auto">
                    💡 Ctrl+V / кнопка "Вставить"
                  </span>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  onPaste={handlePaste}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="<h2>Заголовок</h2><p>Текст урока...</p>"
                />
              </div>

              {/* Модальное окно для видео */}
              {showVideoModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                  <div className="bg-white rounded-xl p-4 w-full max-w-md mx-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Вставить видео</h3>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... или rutube.ru/video/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <p className="text-xs text-gray-500 mb-3">
                      Поддерживается: YouTube, RuTube, VK Video
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowVideoModal(false); setVideoUrl('') }}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={insertVideo}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Вставить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Модальное окно для URL изображения */}
              {showImageUrlModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                  <div className="bg-white rounded-xl p-4 w-full max-w-md mx-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Вставить изображение по URL</h3>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg или .gif"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <p className="text-xs text-gray-500 mb-3">
                      Поддерживаются: JPG, PNG, GIF, WebP
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowImageUrlModal(false); setImageUrl('') }}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={insertImageUrl}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Вставить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Тесты */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">📝 Тесты</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newQuiz = {
                        id: `quiz-${Date.now()}`,
                        question: 'Вопрос?',
                        code: '',
                        options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
                        correctIndex: 0,
                        explanation: 'Объяснение правильного ответа'
                      }
                      setFormData({ 
                        ...formData, 
                        quizzes: [...(formData.quizzes || []), newQuiz]
                      })
                    }}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    + Добавить тест
                  </button>
                </div>
                {formData.quizzes?.map((quiz, idx) => (
                  <div key={quiz.id} className="mb-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-purple-700">Тест {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            quizzes: formData.quizzes.filter((_, i) => i !== idx)
                          })
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={quiz.question}
                      onChange={(e) => {
                        const updated = [...formData.quizzes]
                        updated[idx] = { ...quiz, question: e.target.value }
                        setFormData({ ...formData, quizzes: updated })
                      }}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      placeholder="Вопрос"
                    />
                    <input
                      type="text"
                      value={quiz.code || ''}
                      onChange={(e) => {
                        const updated = [...formData.quizzes]
                        updated[idx] = { ...quiz, code: e.target.value }
                        setFormData({ ...formData, quizzes: updated })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 font-mono"
                      placeholder="Код (опционально)"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {quiz.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-1">
                          <input
                            type="radio"
                            checked={quiz.correctIndex === optIdx}
                            onChange={() => {
                              const updated = [...formData.quizzes]
                              updated[idx] = { ...quiz, correctIndex: optIdx }
                              setFormData({ ...formData, quizzes: updated })
                            }}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...formData.quizzes]
                              const newOpts = [...quiz.options]
                              newOpts[optIdx] = e.target.value
                              updated[idx] = { ...quiz, options: newOpts }
                              setFormData({ ...formData, quizzes: updated })
                            }}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={quiz.explanation || ''}
                      onChange={(e) => {
                        const updated = [...formData.quizzes]
                        updated[idx] = { ...quiz, explanation: e.target.value }
                        setFormData({ ...formData, quizzes: updated })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="Объяснение правильного ответа"
                    />
                  </div>
                ))}
              </div>

              {/* Задачи */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">💻 Задачи (с ответом)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newTask = {
                        id: `task-${Date.now()}`,
                        title: 'Новая задача',
                        description: 'Описание задачи',
                        answer: ''
                      }
                      setFormData({ 
                        ...formData, 
                        tasks: [...(formData.tasks || []), newTask]
                      })
                    }}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    + Добавить задачу
                  </button>
                </div>
                {formData.tasks?.map((task, idx) => (
                  <div key={task.id} className="mb-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => {
                          const updated = [...formData.tasks]
                          updated[idx] = { ...task, title: e.target.value }
                          setFormData({ ...formData, tasks: updated })
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded mr-2"
                        placeholder="Название задачи"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tasks: formData.tasks.filter((_, i) => i !== idx)
                          })
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => {
                        const updated = [...formData.tasks]
                        updated[idx] = { ...task, description: e.target.value }
                        setFormData({ ...formData, tasks: updated })
                      }}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      placeholder="Описание задачи (вопрос)"
                    />
                    <input
                      type="text"
                      value={task.answer || ''}
                      onChange={(e) => {
                        const updated = [...formData.tasks]
                        updated[idx] = { ...task, answer: e.target.value }
                        setFormData({ ...formData, tasks: updated })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      placeholder="Правильный ответ"
                    />
                    <input
                      type="text"
                      value={(task.answers || []).join(', ')}
                      onChange={(e) => {
                        const updated = [...formData.tasks]
                        const answers = e.target.value.split(',').map(a => a.trim()).filter(a => a)
                        updated[idx] = { ...task, answers: answers.length > 0 ? answers : undefined }
                        setFormData({ ...formData, tasks: updated })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-500"
                      placeholder="Альтернативные ответы (через запятую)"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {item.type === 'exercise' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Курс</label>
                <select
                  value={formData.courseId || ''}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выбери курс...</option>
                  {item.courses?.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уровень</label>
                <select
                  value={formData.level || 1}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 - Легкий</option>
                  <option value={2}>2 - Средний</option>
                  <option value={3}>3 - Сложный</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Правильный ответ</label>
                <input
                  type="text"
                  value={formData.answer || ''}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Введите правильный ответ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Альтернативные ответы (через запятую)</label>
                <input
                  type="text"
                  value={(formData.answers || []).join(', ')}
                  onChange={(e) => {
                    const answers = e.target.value.split(',').map(a => a.trim()).filter(a => a)
                    setFormData({ ...formData, answers: answers.length > 0 ? answers : undefined })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  placeholder="Необязательно"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Решение (объяснение)</label>
                <textarea
                  value={formData.solution || ''}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Объяснение как решить задачу"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подсказка</label>
                <input
                  type="text"
                  value={formData.hint || ''}
                  onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Необязательно"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
