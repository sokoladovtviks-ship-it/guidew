import { NextResponse } from 'next/server'
import { findUserByUsername, addUser } from '@/lib/users'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 400 }
      )
    }

    // Создаем пользователя в PostgreSQL
    const newUser = await addUser(username, password)
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    })

  } catch (error) {
    console.error('Ошибка регистрации:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
