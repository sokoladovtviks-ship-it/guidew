import { NextResponse } from 'next/server'
import { findUserByCredentials, getUsers } from '@/lib/users'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    
    console.log('Login attempt:', { username, password })
    console.log('All users:', getUsers())

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    // Ищем пользователя
    const user = findUserByCredentials(username, password)
    console.log('Found user:', user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Ошибка входа:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
