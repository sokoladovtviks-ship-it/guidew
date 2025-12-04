'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Check, X, Image, Upload } from 'lucide-react'

export default function EditSublessonPage() {
  const params = useParams()
  const router = useRouter()
  const [sublesson, setSublesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (params) {
      fetchData()
    }
  }, [params])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (auth) {
      const authTime = parseInt(auth)
      const now = Date.now()
      const sessionDuration = 24 * 60 * 60 * 1000
      
      if (now - authTime >= sessionDuration) {
        localStorage.removeItem('adminAuth')
        window.location.href = '/admin/login'
      }
    } else {
      window.location.href = '/admin/login'
    }
  }

  const fetchData = async () => {
    try {
      const courseRes = await fetch(`/api/courses/${params.courseId}`)
      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData)
        
        // Найти подурок
        const module = courseData.modules?.find(m => m.id === params.moduleId)
        const lesson = module?.lessons?.find(l => l.id === params.lessonId)
        const sublessonData = lesson?.sublessons?.find(s => s.id === params.sublessonId)
        
        if (sublessonData) {
          setSublesson({
            ...sublessonData,
            quizzes: sublessonData.quizzes || [],
            tasks: sublessonData.tasks || []
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${params.courseId}/modules/${params.moduleId}/lessons/${params.lessonId}/sublessons/${params.sublessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sublesson)
      })
      
      if (res.ok) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
    setSaving(false)
  }

  // Вставить текст в позицию курсора
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const content = sublesson.content || ''
    const newContent = content.substring(0, start) + text + content.substring(end)
    setSublesson(prev => ({ ...prev, content: newContent }))
    
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

  // Добавить тест
  const addQuiz = () => {
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      question: 'Новый вопрос?',
      code: '',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correctIndex: 0,
      explanation: 'Объяснение правильного ответа'
    }
    setSublesson(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, newQuiz]
    }))
  }

  // Добавить задачу
  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'Новая задача',
      description: 'Описание задачи',
      initialCode: '# Твой код\n',
      solution: ''
    }
    setSublesson(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (!sublesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Подурок не найден</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
              Назад к админке
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Редактирование подурока</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Основная информация */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Основная информация</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
              <input
                type="text"
                value={sublesson.title}
                onChange={(e) => setSublesson(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Контент (HTML)</label>
              
              {/* Панель инструментов */}
              <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg border">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white text-gray-700 rounded hover:bg-gray-50 border border-gray-300 disabled:opacity-50"
                  title="Загрузить изображение или GIF"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {uploading ? 'Загрузка...' : 'Изображение'}
                  </span>
                </button>
                
                <span className="hidden sm:block text-xs text-gray-500 ml-auto">
                  💡 Ctrl+V для вставки / поддержка GIF
                </span>
              </div>
              
              <textarea
                ref={textareaRef}
                value={sublesson.content}
                onChange={(e) => setSublesson(prev => ({ ...prev, content: e.target.value }))}
                onPaste={handlePaste}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="<h2>Заголовок</h2><p>Текст подурока...</p>"
              />
            </div>
          </div>
        </div>

        {/* Тесты */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📝 Тесты</h2>
            <button
              onClick={addQuiz}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Добавить тест
            </button>
          </div>

          {sublesson.quizzes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Тестов пока нет</p>
          ) : (
            <div className="space-y-4">
              {sublesson.quizzes.map((quiz, idx) => (
                <div key={quiz.id} className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-purple-700">Тест {idx + 1}</span>
                    <button
                      onClick={() => {
                        setSublesson(prev => ({
                          ...prev,
                          quizzes: prev.quizzes.filter((_, i) => i !== idx)
                        }))
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={quiz.question}
                      onChange={(e) => {
                        const updated = [...sublesson.quizzes]
                        updated[idx] = { ...quiz, question: e.target.value }
                        setSublesson(prev => ({ ...prev, quizzes: updated }))
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Вопрос"
                    />

                    <input
                      type="text"
                      value={quiz.code || ''}
                      onChange={(e) => {
                        const updated = [...sublesson.quizzes]
                        updated[idx] = { ...quiz, code: e.target.value }
                        setSublesson(prev => ({ ...prev, quizzes: updated }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="Код (опционально)"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {quiz.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={quiz.correctIndex === optIdx}
                            onChange={() => {
                              const updated = [...sublesson.quizzes]
                              updated[idx] = { ...quiz, correctIndex: optIdx }
                              setSublesson(prev => ({ ...prev, quizzes: updated }))
                            }}
                            className="text-purple-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...sublesson.quizzes]
                              const newOpts = [...quiz.options]
                              newOpts[optIdx] = e.target.value
                              updated[idx] = { ...quiz, options: newOpts }
                              setSublesson(prev => ({ ...prev, quizzes: updated }))
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={quiz.explanation || ''}
                      onChange={(e) => {
                        const updated = [...sublesson.quizzes]
                        updated[idx] = { ...quiz, explanation: e.target.value }
                        setSublesson(prev => ({ ...prev, quizzes: updated }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Объяснение правильного ответа"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Задачи */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">💻 Задачи</h2>
            <button
              onClick={addTask}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Добавить задачу
            </button>
          </div>

          {sublesson.tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Задач пока нет</p>
          ) : (
            <div className="space-y-4">
              {sublesson.tasks.map((task, idx) => (
                <div key={task.id} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => {
                        const updated = [...sublesson.tasks]
                        updated[idx] = { ...task, title: e.target.value }
                        setSublesson(prev => ({ ...prev, tasks: updated }))
                      }}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded font-medium mr-3"
                      placeholder="Название задачи"
                    />
                    <button
                      onClick={() => {
                        setSublesson(prev => ({
                          ...prev,
                          tasks: prev.tasks.filter((_, i) => i !== idx)
                        }))
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => {
                        const updated = [...sublesson.tasks]
                        updated[idx] = { ...task, description: e.target.value }
                        setSublesson(prev => ({ ...prev, tasks: updated }))
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Описание задачи"
                    />

                    <textarea
                      value={task.initialCode || ''}
                      onChange={(e) => {
                        const updated = [...sublesson.tasks]
                        updated[idx] = { ...task, initialCode: e.target.value }
                        setSublesson(prev => ({ ...prev, tasks: updated }))
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="Начальный код"
                    />

                    <textarea
                      value={task.solution || ''}
                      onChange={(e) => {
                        const updated = [...sublesson.tasks]
                        updated[idx] = { ...task, solution: e.target.value }
                        setSublesson(prev => ({ ...prev, tasks: updated }))
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="Решение"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
