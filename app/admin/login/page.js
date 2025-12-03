'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)

  const ADMIN_PASSWORD = 'Wiks6500'
  const BLOCK_DURATION = 24 * 60 * 60 * 1000 // 24 часа в миллисекундах

  useEffect(() => {
    checkBlockStatus()
  }, [])

  useEffect(() => {
    let interval
    if (isBlocked && blockTimeLeft > 0) {
      interval = setInterval(() => {
        setBlockTimeLeft(prev => {
          if (prev <= 1000) {
            setIsBlocked(false)
            localStorage.removeItem('adminBlocked')
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isBlocked, blockTimeLeft])

  const checkBlockStatus = () => {
    const blocked = localStorage.getItem('adminBlocked')
    if (blocked) {
      const blockTime = parseInt(blocked)
      const now = Date.now()
      const timeLeft = blockTime - now

      if (timeLeft > 0) {
        setIsBlocked(true)
        setBlockTimeLeft(timeLeft)
      } else {
        localStorage.removeItem('adminBlocked')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (isBlocked) {
      setError('Доступ заблокирован на 24 часа')
      return
    }

    if (password === ADMIN_PASSWORD) {
      // Успешный вход
      localStorage.setItem('adminAuth', Date.now().toString())
      router.push('/admin')
    } else {
      // Неверный пароль - блокируем на 24 часа
      const blockUntil = Date.now() + BLOCK_DURATION
      localStorage.setItem('adminBlocked', blockUntil.toString())
      setIsBlocked(true)
      setBlockTimeLeft(BLOCK_DURATION)
      setError('Неверный пароль! Доступ заблокирован на 24 часа.')
      setPassword('')
    }
  }

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}ч ${minutes}м ${seconds}с`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Админ-панель</h1>
          <p className="text-gray-500 mt-2">Введите пароль для доступа</p>
        </div>

        {/* Предупреждение о блокировке */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Доступ заблокирован</p>
                <p className="text-xs text-red-600 mt-1">
                  Осталось: {formatTime(blockTimeLeft)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль администратора
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isBlocked}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isBlocked || !password.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBlocked ? 'Заблокировано' : 'Войти в админку'}
          </button>
        </form>

        {/* Информация */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Внимание!</p>
              <p className="text-xs text-yellow-700 mt-1">
                У вас есть только одна попытка ввода пароля. При неверном пароле доступ будет заблокирован на 24 часа.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
