'use client'

import Link from 'next/link'
import { BookOpen, Home, Info, Menu, X, Dumbbell, Settings, User, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">
              Мои<span className="text-blue-600">Заметки</span>
            </span>
          </Link>

          {/* Навигация для десктопа */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Главная
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Курс
            </Link>
            <Link
              href="/trainer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Тренажёр
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Info className="w-4 h-4" />
              Обо мне
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Админ
            </Link>
            
            {/* Профиль */}
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isAuthenticated 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <User className="w-4 h-4" />
                  {user?.username}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Войти
                </>
              )}
            </Link>
          </div>

          {/* Мобильное меню кнопка */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Мобильное меню */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Home className="w-4 h-4" />
              Главная
            </Link>
            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <BookOpen className="w-4 h-4" />
              Курс
            </Link>
            <Link
              href="/trainer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Dumbbell className="w-4 h-4" />
              Тренажёр
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Info className="w-4 h-4" />
              Обо мне
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            >
              <Settings className="w-4 h-4" />
              Админ
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                isAuthenticated 
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <User className="w-4 h-4" />
                  {user?.username}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Войти
                </>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
