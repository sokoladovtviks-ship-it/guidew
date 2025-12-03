'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Trophy, BookOpen, Calendar, Eye, EyeOff, Dumbbell, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useProgress } from '@/contexts/ProgressContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, login, register, logout, isAuthenticated, loading, getUserData } = useAuth()
  const { progress, getCourseStats, getExerciseStats, getCourseExerciseStats, isExerciseCompleted } = useProgress()
  const [courseData, setCourseData] = useState(null)
  const [exercises, setExercises] = useState([])
  const [courses, setCourses] = useState([])
  
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [settingsSuccess, setSettingsSuccess] = useState('')

  // Загружаем данные для статистики
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated])

  const fetchAllData = async () => {
    try {
      const [courseRes, exercisesRes, coursesRes] = await Promise.all([
        fetch('/api/courses/python-basics'),
        fetch('/api/exercises'),
        fetch('/api/courses')
      ])
      if (courseRes.ok) setCourseData(await courseRes.json())
      if (exercisesRes.ok) setExercises(await exercisesRes.json())
      if (coursesRes.ok) setCourses(await coursesRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Заполни все поля')
      return
    }

    if (password.length < 4) {
      setError('Пароль должен быть минимум 4 символа')
      return
    }

    let result
    if (isLoginMode) {
      result = await login(username, password, rememberMe)
    } else {
      if (username.length < 3) {
        setError('Имя пользователя минимум 3 символа')
        return
      }
      result = await register(username, password)
      
      // После успешной регистрации - автоматически входим
      if (result.success) {
        result = await login(username, password, rememberMe)
      }
    }

    if (!result.success) {
      setError(result.error)
    } else {
      setUsername('')
      setPassword('')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Смена имени пользователя
  const handleUsernameChange = () => {
    setSettingsError('')
    setSettingsSuccess('')
    
    if (!newUsername.trim()) {
      setSettingsError('Введи новое имя')
      return
    }
    
    if (newUsername.length < 3) {
      setSettingsError('Имя должно быть минимум 3 символа')
      return
    }
    
    // Проверяем уникальность
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.id !== user.id && u.username.toLowerCase() === newUsername.toLowerCase())) {
      setSettingsError('Пользователь с таким именем уже существует')
      return
    }
    
    // Обновляем данные
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].username = newUsername
      localStorage.setItem('users', JSON.stringify(users))
      
      // Обновляем сессию
      const updatedUser = { ...user, username: newUsername }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setSettingsSuccess('Имя пользователя изменено!')
      setNewUsername('')
      
      // Перезагружаем страницу для обновления данных
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  // Смена пароля
  const handlePasswordChange = () => {
    setSettingsError('')
    setSettingsSuccess('')
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSettingsError('Заполни все поля')
      return
    }
    
    if (newPassword.length < 4) {
      setSettingsError('Новый пароль должен быть минимум 4 символа')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setSettingsError('Пароли не совпадают')
      return
    }
    
    // Проверяем текущий пароль
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const currentUser = users.find(u => u.id === user.id)
    
    if (!currentUser || currentUser.password !== currentPassword) {
      setSettingsError('Неверный текущий пароль')
      return
    }
    
    // Обновляем пароль
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].password = newPassword
      localStorage.setItem('users', JSON.stringify(users))
      
      setSettingsSuccess('Пароль изменён!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  // Если пользователь авторизован - показываем профиль
  if (isAuthenticated) {
    const userData = getUserData()
    const completedCount = Object.keys(progress).length

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-2xl mx-auto px-4 py-12">
          {/* Карточка профиля */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Шапка профиля */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                  <p className="text-white/80 text-sm">
                    С {new Date(userData?.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Прогресс курса Python</h2>
              
              {courseData && (() => {
                const stats = getCourseStats(courseData)
                return (
                  <>
                    {/* Прогресс бар */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Общий прогресс</span>
                        <span className="text-sm font-bold text-blue-600">{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${stats.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.completed} из {stats.total} уроков пройдено
                      </p>
                    </div>

                    {/* Детальная статистика */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-bold">📝</span>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">
                              {stats.quizzes.completed}/{stats.quizzes.total}
                            </p>
                            <p className="text-sm text-gray-600">Тестов пройдено</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">💻</span>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-600">
                              {stats.tasks.completed}/{stats.tasks.total}
                            </p>
                            <p className="text-sm text-gray-600">Задач решено</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            <p className="text-sm text-gray-600">Уроков пройдено</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                            <p className="text-sm text-gray-600">Всего уроков</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

              {/* Статистика тренажёра */}
              {exercises.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Тренажёр</h2>
                  </div>
                  
                  {/* Общий прогресс */}
                  {(() => {
                    const stats = getExerciseStats(exercises)
                    return (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Всего решено задач</span>
                          <span className="text-sm font-bold text-indigo-600">{stats.completed} / {stats.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Статистика по курсам */}
                  <div className="space-y-3">
                    {courses.filter(c => exercises.some(e => e.courseId === c.id)).map(course => {
                      const stats = getCourseExerciseStats(exercises, course.id)
                      const courseExercises = exercises.filter(e => e.courseId === course.id)
                      
                      return (
                        <div key={course.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">{course.title}</span>
                            <span className="text-sm font-bold text-gray-600">{stats.completed} / {stats.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                          {/* По уровням */}
                          <div className="flex gap-4 text-xs text-gray-500">
                            {[1, 2, 3].map(level => {
                              const levelExercises = courseExercises.filter(e => e.level === level)
                              const completed = levelExercises.filter(e => isExerciseCompleted(e.id)).length
                              if (levelExercises.length === 0) return null
                              return (
                                <div key={level} className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    level === 1 ? 'bg-green-500' : level === 2 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  <span>{completed}/{levelExercises.length}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5" />
                  Настройки аккаунта
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>

          {/* Настройки аккаунта */}
          {showSettings && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Настройки аккаунта</h2>
              
              {/* Смена имени */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Изменить имя пользователя</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={`Текущее: ${user.username}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleUsernameChange}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Изменить
                  </button>
                </div>
              </div>

              {/* Смена пароля */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Изменить пароль</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Текущий пароль"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Новый пароль"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Подтверди новый пароль"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Изменить пароль
                  </button>
                </div>
              </div>

              {/* Сообщения */}
              {settingsError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {settingsError}
                </div>
              )}
              
              {settingsSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {settingsSuccess}
                </div>
              )}

              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Закрыть настройки
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Форма входа/регистрации
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isLoginMode 
                ? 'Войди, чтобы сохранять прогресс' 
                : 'Создай аккаунт для отслеживания прогресса'}
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Введи имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Введи пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLoginMode && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Запомнить меня</span>
              </label>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Переключатель режима */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode)
                setError('')
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isLoginMode 
                ? 'Нет аккаунта? Зарегистрируйся' 
                : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
