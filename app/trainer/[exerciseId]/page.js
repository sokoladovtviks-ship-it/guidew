'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  RotateCcw, 
  Lightbulb, 
  Check, 
  X, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react'
import PythonTerminal from '@/components/PythonTerminal'
import { useProgress } from '@/contexts/ProgressContext'
import { useAuth } from '@/contexts/AuthContext'

export default function ExercisePage() {
  const params = useParams()
  const router = useRouter()
  const [exercise, setExercise] = useState(null)
  const [allExercises, setAllExercises] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const { markExerciseCompleted, isExerciseCompleted } = useProgress()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
  }, [params.exerciseId])

  const fetchData = async () => {
    try {
      const [exerciseRes, allRes] = await Promise.all([
        fetch(`/api/exercises/${params.exerciseId}`),
        fetch('/api/exercises')
      ])
      
      if (exerciseRes.ok) {
        const ex = await exerciseRes.json()
        setExercise(ex)
      }
      
      if (allRes.ok) {
        setAllExercises(await allRes.json())
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const resetAnswer = () => {
    setUserAnswer('')
    setResult(null)
  }

  const checkAnswer = () => {
    const answer = userAnswer.trim().toLowerCase()
    
    // Получаем правильные ответы
    const correctAnswers = exercise?.answers 
      ? exercise.answers.map(a => a.trim().toLowerCase())
      : exercise?.answer 
        ? [exercise.answer.trim().toLowerCase()]
        : []
    
    // Проверяем совпадение
    const isCorrect = correctAnswers.some(correct => answer === correct)
    
    if (isCorrect) {
      setResult({ success: true, message: 'Отлично! Правильный ответ!' })
      // Отмечаем задачу как решённую
      if (isAuthenticated) {
        markExerciseCompleted(exercise.id)
      }
    } else {
      setResult({ success: false, message: 'Неверно, попробуй ещё раз.' })
    }
  }

  // Найти следующее упражнение
  const getNextExercise = () => {
    const currentIndex = allExercises.findIndex(e => e.id === params.exerciseId)
    return currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Задание не найдено</div>
      </div>
    )
  }

  const nextExercise = getNextExercise()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Шапка */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/trainer" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-white font-medium">{exercise.title}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              exercise.level === 1 ? 'bg-green-900 text-green-300' :
              exercise.level === 2 ? 'bg-yellow-900 text-yellow-300' :
              'bg-red-900 text-red-300'
            }`}>
              Уровень {exercise.level}
            </span>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Левая панель - описание */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-white mb-4">{exercise.title}</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{exercise.description}</p>

          {/* Подсказка */}
          {exercise.hint && (
            <div className="mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
              </button>
              {showHint && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
                  {exercise.hint}
                </div>
              )}
            </div>
          )}

          {/* Python терминал для экспериментов */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Попробуй здесь:</h3>
            <PythonTerminal />
          </div>
        </div>

        {/* Правая панель - ввод ответа */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Введите ответ</h3>
            
            {/* Поле ввода */}
            <div className="mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !result?.success && checkAnswer()}
                placeholder="Ваш ответ..."
                disabled={result?.success}
                className="w-full px-6 py-4 text-xl bg-gray-800 text-white border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Результат */}
            {result && (
              <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                result.success 
                  ? 'bg-green-900/50 border border-green-700' 
                  : 'bg-red-900/50 border border-red-700'
              }`}>
                {result.success ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-400" />
                )}
                <span className={result.success ? 'text-green-300' : 'text-red-300'}>
                  {result.message}
                </span>
              </div>
            )}

            {/* Решение после правильного ответа */}
            {result?.success && exercise.solution && (
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-xl">
                <div className="text-blue-300 text-sm font-medium mb-2">Решение:</div>
                <p className="text-blue-200 whitespace-pre-wrap">{exercise.solution}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex items-center gap-3">
              {result?.success ? (
                nextExercise ? (
                  <Link
                    href={`/trainer/${nextExercise.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                  >
                    Следующее задание
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/trainer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                  >
                    Все задания выполнены!
                  </Link>
                )
              ) : (
                <>
                  <button
                    onClick={checkAnswer}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Проверить
                  </button>
                  {result && (
                    <button
                      onClick={resetAnswer}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
