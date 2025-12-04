'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, ArrowRight, Check, X, Play, RotateCcw, Eye, CheckCircle } from 'lucide-react'
import { useProgress } from '@/contexts/ProgressContext'
import { useAuth } from '@/contexts/AuthContext'
import PythonTerminal from '@/components/PythonTerminal'

export default function LessonPage() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResults, setQuizResults] = useState({})
  const [taskAnswers, setTaskAnswers] = useState({})
  const [taskResults, setTaskResults] = useState({})
  const [showSolutions, setShowSolutions] = useState({})
  const { markAsCompleted, isCompleted, isLessonFullyCompleted, markQuizzesCompleted, markTasksCompleted, resetProgress } = useProgress()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
  }, [params])

  // Инициализировать код задачи при загрузке данных
  useEffect(() => {
    if (data?.lesson?.tasks) {
      const initialCodes = {}
      data.lesson.tasks.forEach(task => {
        if (taskCodes[task.id] === undefined) {
          initialCodes[task.id] = task.initialCode || ''
        }
      })
      if (Object.keys(initialCodes).length > 0) {
        setTaskCodes(prev => ({ ...prev, ...initialCodes }))
      }
    }
  }, [data])

  // Функция для обработки контента - конвертирует Tenor embed в iframe
  const processContent = (content) => {
    if (!content) return ''
    
    let processed = content
    
    // Конвертируем Tenor embed div в iframe
    const tenorRegex = /<div[^>]*class="tenor-gif-embed"[^>]*data-postid="(\d+)"[^>]*>[\s\S]*?<\/div>\s*(<script[^>]*tenor\.com[^>]*><\/script>)?/gi
    processed = processed.replace(tenorRegex, (match, postId) => {
      return `<div class="tenor-container" style="max-width: 100%; margin: 1rem 0;">
        <iframe src="https://tenor.com/embed/${postId}" 
          width="100%" 
          height="400" 
          frameborder="0" 
          allowfullscreen="true"
          style="border-radius: 12px; max-width: 480px;">
        </iframe>
      </div>`
    })
    
    // Удаляем отдельные скрипты Tenor
    processed = processed.replace(/<script[^>]*tenor\.com[^>]*>[\s\S]*?<\/script>/gi, '')
    
    return processed
  }

  const fetchData = async () => {
    try {
      const [lessonRes, courseRes] = await Promise.all([
        fetch(`/api/courses/${params.courseId}/modules/${params.moduleId}/lessons/${params.lessonId}`),
        fetch(`/api/courses/${params.courseId}`)
      ])
      
      if (lessonRes.ok && courseRes.ok) {
        setData(await lessonRes.json())
        setCourse(await courseRes.json())
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  // Найти предыдущий и следующий уроки
  const getNavigation = () => {
    if (!course || !data) return { prev: null, next: null }

    const allLessons = []
    course.modules?.forEach(module => {
      module.lessons?.forEach(lesson => {
        allLessons.push({ ...lesson, moduleId: module.id })
      })
    })

    const currentIndex = allLessons.findIndex(l => l.id === params.lessonId)
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (!data || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Урок не найден</div>
      </div>
    )
  }

  const { lesson, module } = data
  const { prev, next } = getNavigation()
  const currentModule = course.modules?.find(m => m.id === params.moduleId)

  // Проверка теста
  const checkQuiz = (quizId, correctIndex) => {
    const answer = quizAnswers[quizId]
    if (answer === undefined) return
    const isCorrectAnswer = answer === correctIndex
    setQuizResults(prev => {
      const newResults = { ...prev, [quizId]: isCorrectAnswer }
      
      // Проверяем все ли тесты пройдены
      if (isAuthenticated && lesson?.quizzes) {
        const allQuizzesPassed = lesson.quizzes.every(q => 
          q.id === quizId ? isCorrectAnswer : newResults[q.id] === true
        )
        if (allQuizzesPassed) {
          markQuizzesCompleted(params.courseId, params.lessonId)
        }
      }
      
      return newResults
    })
  }

  // Проверка задачи - сравниваем ответ пользователя с правильным
  const checkTask = (taskId, task) => {
    const userAnswer = (taskAnswers[taskId] || '').trim().toLowerCase()
    
    // Получаем правильные ответы (может быть один или несколько)
    const correctAnswers = task.answers 
      ? task.answers.map(a => a.trim().toLowerCase())
      : task.answer 
        ? [task.answer.trim().toLowerCase()]
        : []
    
    // Проверяем совпадение с любым из правильных ответов
    const isCorrect = correctAnswers.some(answer => userAnswer === answer)
    
    setTaskResults(prev => {
      const newResults = { ...prev, [taskId]: isCorrect }
      
      // Проверяем все ли задачи решены
      if (isAuthenticated && isCorrect && lesson?.tasks) {
        const allTasksSolved = lesson.tasks.every(t => 
          t.id === taskId ? isCorrect : newResults[t.id] === true
        )
        if (allTasksSolved) {
          markTasksCompleted(params.courseId, params.lessonId)
        }
      }
      
      return newResults
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-amber-500">
            <span className="text-2xl">📚</span>
            ACADEMY
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/course/${course.id}`} className="text-gray-600 hover:text-gray-900">
              Курс
            </Link>
            <Link href="/trainer" className="text-gray-600 hover:text-gray-900">
              Тренажёр
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* Боковая навигация */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 min-h-[calc(100vh-57px)] hidden md:block">
          <div className="sticky top-[57px] overflow-y-auto max-h-[calc(100vh-57px)] p-4">
            {/* Хлебные крошки */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
              <Link href={`/course/${course.id}`} className="hover:text-blue-600">Курс</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Модуль {currentModule?.number}</span>
            </div>

            <h3 className="font-semibold text-gray-800 mb-4">{currentModule?.title}</h3>

            {/* Список уроков модуля */}
            <nav className="space-y-1">
              {currentModule?.lessons?.map(l => {
                const lessonCompleted = isAuthenticated && isLessonFullyCompleted(course.id, l)
                return (
                  <Link
                    key={l.id}
                    href={`/course/${course.id}/${currentModule.id}/${l.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      l.id === lesson.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : lessonCompleted
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      lessonCompleted 
                        ? 'bg-green-500' 
                        : l.id === lesson.id 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                    }`} />
                    {l.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          {/* Заголовок урока */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{lesson.title}</h1>

          {/* Контент урока */}
          <article 
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: processContent(lesson.content) }}
          />

          {/* Тесты - Проверка понимания */}
          {lesson.quizzes?.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Проверка понимания</h2>
              <p className="text-gray-600 mb-8">Давайте проверим, насколько хорошо вы усвоили тему:</p>
              
              {lesson.quizzes.map((quiz, index) => (
                <div key={quiz.id} className="mb-8 bg-gray-50 rounded-xl p-6">
                  <p className="font-medium text-gray-800 mb-4 whitespace-pre-line">{quiz.question}</p>
                  
                  {/* Код если есть */}
                  {quiz.code && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm">
                      <div className="text-gray-400 text-xs mb-2">Python 3</div>
                      <pre className="text-gray-100 whitespace-pre-wrap">{quiz.code}</pre>
                    </div>
                  )}

                  {/* Варианты ответов */}
                  <div className="space-y-2 mb-4">
                    {quiz.options.map((option, optIndex) => {
                      const isSelected = quizAnswers[quiz.id] === optIndex
                      const isChecked = quizResults[quiz.id] !== undefined
                      const isCorrect = optIndex === quiz.correctIndex
                      
                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked && isCorrect
                              ? 'bg-green-50 border-green-300'
                              : isChecked && isSelected && !isCorrect
                              ? 'bg-red-50 border-red-300'
                              : isSelected
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={quiz.id}
                            checked={isSelected}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [quiz.id]: optIndex }))}
                            disabled={isChecked}
                            className="w-4 h-4"
                          />
                          <span className={isChecked && isCorrect ? 'text-green-700' : ''}>{option}</span>
                          {isChecked && isCorrect && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                          {isChecked && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600 ml-auto" />}
                        </label>
                      )
                    })}
                  </div>

                  {/* Результат */}
                  {quizResults[quiz.id] !== undefined && (
                    <div className={`p-3 rounded-lg ${quizResults[quiz.id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {quizResults[quiz.id] ? quiz.explanation : 'Неверно. Попробуй ещё раз!'}
                    </div>
                  )}

                  {quizResults[quiz.id] === undefined && (
                    <button
                      onClick={() => checkQuiz(quiz.id, quiz.correctIndex)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Проверить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Задачи для самопроверки */}
          {lesson.tasks?.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Задания для самопроверки</h2>
                <span className="text-sm text-gray-500">0 / {lesson.tasks.length}</span>
              </div>

              {lesson.tasks.map((task, index) => (
                <div key={task.id} className="mb-6 p-5 border border-gray-200 rounded-xl bg-white">
                  {/* Заголовок и описание */}
                  <h3 className="font-semibold text-gray-800 mb-2">{index + 1}. {task.title}</h3>
                  <p className="text-gray-600 mb-4">{task.description}</p>

                  {/* Python терминал для экспериментов */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Попробуй здесь:</p>
                    <PythonTerminal initialCode={task.initialCode || ''} />
                  </div>

                  {/* Поле для ввода ответа */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={taskAnswers[task.id] || ''}
                      onChange={(e) => setTaskAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && checkTask(task.id, task)}
                      placeholder="Введите ответ..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={taskResults[task.id] === true}
                    />
                    <button
                      onClick={() => checkTask(task.id, task)}
                      disabled={taskResults[task.id] === true}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Проверить
                    </button>
                  </div>

                  {/* Результат */}
                  {taskResults[task.id] !== undefined && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${taskResults[task.id] ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {taskResults[task.id] ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">Правильно!</span>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <X className="w-5 h-5 text-red-600" />
                            <span className="text-red-700">Неверно, попробуй ещё раз</span>
                          </div>
                          <button
                            onClick={() => {
                              setTaskAnswers(prev => ({ ...prev, [task.id]: '' }))
                              setTaskResults(prev => ({ ...prev, [task.id]: undefined }))
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Попробовать снова
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Кнопка "Урок пройден" для простых уроков без тестов */}
          {isAuthenticated && !lesson.quizzes?.length && !lesson.tasks?.length && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              {isCompleted(params.courseId, params.lessonId) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Урок пройден!</span>
                  </div>
                  <button
                    onClick={() => {
                      resetProgress(params.courseId, params.lessonId)
                      // Сбрасываем состояние тестов и задач
                      setQuizAnswers({})
                      setQuizResults({})
                      setTaskAnswers({})
                      setTaskResults({})
                      // Принудительно обновляем страницу для синхронизации состояния
                      setTimeout(() => window.location.reload(), 100)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Пройти заново
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => markAsCompleted(params.courseId, params.lessonId)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                >
                  <Check className="w-5 h-5" />
                  Отметить урок как пройденный
                </button>
              )}
            </div>
          )}

          {/* Статус урока для уроков с тестами/задачами */}
          {isAuthenticated && (lesson.quizzes?.length > 0 || lesson.tasks?.length > 0) && (
            <div className="mt-8">
              {isLessonFullyCompleted(params.courseId, lesson) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Урок полностью пройден!</span>
                  </div>
                  <button
                    onClick={() => {
                      resetProgress(params.courseId, params.lessonId)
                      // Сбрасываем состояние тестов и задач
                      setQuizAnswers({})
                      setQuizResults({})
                      setTaskAnswers({})
                      setTaskResults({})
                      // Принудительно обновляем страницу для синхронизации состояния
                      setTimeout(() => window.location.reload(), 100)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Пройти заново
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700">
                  <span>Пройди все тесты и задачи, чтобы завершить урок</span>
                </div>
              )}
            </div>
          )}

          {/* Навигация между уроками */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200">
            {prev ? (
              <Link
                href={`/course/${course.id}/${prev.moduleId}/${prev.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{prev.title}</span>
              </Link>
            ) : <div />}
            
            {next ? (
              <Link
                href={`/course/${course.id}/${next.moduleId}/${next.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>{next.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/course/${course.id}`}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <span>Вернуться к курсу</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
