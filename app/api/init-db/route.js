import { NextResponse } from 'next/server'
import { initDatabase, getCourses, saveCourses, getExercises, saveExercises, getUsers, addUser } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// Инициализация базы данных и миграция данных из JSON
export async function GET() {
  try {
    // Инициализируем таблицы
    await initDatabase()

    // Проверяем есть ли уже данные
    const existingCourses = await getCourses()
    
    if (existingCourses.length === 0) {
      // Мигрируем данные из JSON файлов
      const dataDir = path.join(process.cwd(), 'data')
      
      // Курсы
      try {
        const coursesPath = path.join(dataDir, 'courses.json')
        if (fs.existsSync(coursesPath)) {
          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'))
          if (coursesData.courses && coursesData.courses.length > 0) {
            await saveCourses(coursesData.courses)
            console.log('✅ Courses migrated:', coursesData.courses.length)
          }
        }
      } catch (e) {
        console.log('No courses to migrate')
      }

      // Упражнения
      try {
        const exercisesPath = path.join(dataDir, 'exercises.json')
        if (fs.existsSync(exercisesPath)) {
          const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'))
          if (exercisesData.exercises && exercisesData.exercises.length > 0) {
            await saveExercises(exercisesData.exercises)
            console.log('✅ Exercises migrated:', exercisesData.exercises.length)
          }
        }
      } catch (e) {
        console.log('No exercises to migrate')
      }

      // Пользователи
      try {
        const usersPath = path.join(dataDir, 'users.json')
        if (fs.existsSync(usersPath)) {
          const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
          const existingUsers = await getUsers()
          if (existingUsers.length === 0 && usersData.length > 0) {
            for (const user of usersData) {
              await addUser(user.username, user.password)
            }
            console.log('✅ Users migrated:', usersData.length)
          }
        }
      } catch (e) {
        console.log('No users to migrate')
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized and data migrated!' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database already has data',
      coursesCount: existingCourses.length
    })

  } catch (error) {
    console.error('Init DB error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
