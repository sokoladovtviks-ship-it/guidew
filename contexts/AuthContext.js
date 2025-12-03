'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохранённую сессию при загрузке
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Получить всех пользователей из localStorage
  const getUsers = () => {
    try {
      const users = localStorage.getItem('users')
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }

  // Сохранить пользователей
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users))
  }

  // Регистрация
  const register = async (username, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Пользователь зарегистрирован:', data.user)
        return { success: true, user: data.user }
      } else {
        console.log('❌ Ошибка регистрации:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      return { success: false, error: 'Ошибка сети' }
    }
  }

  // Вход
  const login = async (username, password, rememberMe = true) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Пользователь вошел:', data.user)
        
        const userSession = { id: data.user.id, username: data.user.username }
        setUser(userSession)
        
        // Сохраняем сессию
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userSession))
        } else {
          sessionStorage.setItem('user', JSON.stringify(userSession))
        }

        // Синхронизируем пользователя в localStorage для прогресса
        const users = getUsers()
        if (!users.find(u => u.id === data.user.id)) {
          users.push({ id: data.user.id, username: data.user.username, progress: {} })
          saveUsers(users)
        }

        return { success: true }
      } else {
        console.log('❌ Ошибка входа:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      return { success: false, error: 'Ошибка сети' }
    }
  }

  // Выход
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
  }

  // Получить полные данные пользователя (включая прогресс)
  const getUserData = () => {
    if (!user) return null
    const users = getUsers()
    return users.find(u => u.id === user.id)
  }

  // Обновить данные пользователя
  const updateUserData = (updates) => {
    if (!user) return false
    const users = getUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index === -1) return false
    
    users[index] = { ...users[index], ...updates }
    saveUsers(users)
    return true
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      getUserData,
      updateUserData,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
