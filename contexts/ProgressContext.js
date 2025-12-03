'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ProgressContext = createContext()

export function ProgressProvider({ children }) {
  const { user, getUserData, updateUserData, isAuthenticated } = useAuth()
  const [progress, setProgress] = useState({})

  // Загружаем прогресс при входе
  useEffect(() => {
    if (isAuthenticated) {
      const userData = getUserData()
      if (userData?.progress) {
        setProgress(userData.progress)
      }
    } else {
      setProgress({})
    }
  }, [isAuthenticated, user])

  // Отметить урок/подурок как пройденный
  const markAsCompleted = (courseId, lessonId, sublessonId = null) => {
    if (!isAuthenticated) return false

    const key = sublessonId 
      ? `${courseId}:${lessonId}:${sublessonId}`
      : `${courseId}:${lessonId}`

    const newProgress = {
      ...progress,
      [key]: {
        completedAt: new Date().toISOString(),
        lessonId,
        sublessonId,
        courseId
      }
    }

    setProgress(newProgress)
    updateUserData({ progress: newProgress })
    return true
  }

  // Проверить, пройден ли урок/подурок
  const isCompleted = (courseId, lessonId, sublessonId = null) => {
    const key = sublessonId 
      ? `${courseId}:${lessonId}:${sublessonId}`
      : `${courseId}:${lessonId}`
    return !!progress[key]
  }

  // Проверить, пройден ли урок полностью (включая все подуроки, тесты и задачи)
  const isLessonFullyCompleted = (courseId, lesson) => {
    const hasSublessons = lesson.sublessons?.length > 0
    const hasQuizzes = lesson.quizzes?.length > 0
    const hasTasks = lesson.tasks?.length > 0

    // Если есть подуроки - все должны быть пройдены
    if (hasSublessons) {
      const allSublessonsCompleted = lesson.sublessons.every(
        sub => isCompleted(courseId, lesson.id, sub.id)
      )
      if (!allSublessonsCompleted) return false
      
      // Если только подуроки (без тестов/задач в уроке) - достаточно пройти все подуроки
      if (!hasQuizzes && !hasTasks) {
        return true
      }
    }

    // Если нет ничего (простой урок) - требуется отметка пользователя
    if (!hasSublessons && !hasQuizzes && !hasTasks) {
      return isCompleted(courseId, lesson.id)
    }

    // Если есть тесты - проверяем их прохождение
    if (hasQuizzes) {
      const quizzesKey = `${courseId}:${lesson.id}:quizzes`
      if (!progress[quizzesKey]) return false
    }

    // Если есть задачи - проверяем их прохождение
    if (hasTasks) {
      const tasksKey = `${courseId}:${lesson.id}:tasks`
      if (!progress[tasksKey]) return false
    }

    // Урок с тестами/задачами считается пройденным если все тесты/задачи выполнены
    return true
  }

  // Отметить тесты как пройденные
  const markQuizzesCompleted = (courseId, lessonId) => {
    if (!isAuthenticated) return false

    const key = `${courseId}:${lessonId}:quizzes`
    const newProgress = {
      ...progress,
      [key]: { completedAt: new Date().toISOString() }
    }
    setProgress(newProgress)
    updateUserData({ progress: newProgress })
    return true
  }

  // Отметить задачи как пройденные
  const markTasksCompleted = (courseId, lessonId) => {
    if (!isAuthenticated) return false

    const key = `${courseId}:${lessonId}:tasks`
    const newProgress = {
      ...progress,
      [key]: { completedAt: new Date().toISOString() }
    }
    setProgress(newProgress)
    updateUserData({ progress: newProgress })
    return true
  }

  // Сбросить прогресс урока/подурока
  const resetProgress = (courseId, lessonId, sublessonId = null) => {
    if (!isAuthenticated) return false

    const newProgress = { ...progress }
    
    if (sublessonId) {
      // Сбрасываем только подурок
      delete newProgress[`${courseId}:${lessonId}:${sublessonId}`]
      delete newProgress[`${courseId}:${lessonId}:${sublessonId}:quizzes`]
      delete newProgress[`${courseId}:${lessonId}:${sublessonId}:tasks`]
    } else {
      // Сбрасываем урок и ВСЕ связанные ключи (включая подуроки)
      // Удаляем все ключи, начинающиеся с courseId:lessonId
      const prefix = `${courseId}:${lessonId}`
      Object.keys(newProgress).forEach(key => {
        if (key === prefix || key.startsWith(`${prefix}:`)) {
          delete newProgress[key]
        }
      })
    }

    setProgress(newProgress)
    updateUserData({ progress: newProgress })
    return true
  }

  // Получить детальную статистику прогресса курса
  const getCourseStats = (courseData) => {
    if (!courseData) return { percentage: 0, completed: 0, total: 0, quizzes: 0, tasks: 0 }
    
    let totalItems = 0
    let completedItems = 0
    let totalQuizzes = 0
    let completedQuizzes = 0
    let totalTasks = 0
    let completedTasks = 0

    courseData.modules?.forEach(module => {
      module.lessons?.forEach(lesson => {
        // Считаем уроки
        totalItems++
        if (isLessonFullyCompleted(courseData.id, lesson)) {
          completedItems++
        }

        // Считаем подуроки
        if (lesson.sublessons?.length > 0) {
          lesson.sublessons.forEach(sub => {
            totalItems++
            if (isCompleted(courseData.id, lesson.id, sub.id)) {
              completedItems++
            }
            // Тесты и задачи в подуроках
            if (sub.quizzes?.length > 0) {
              totalQuizzes += sub.quizzes.length
              if (progress[`${courseData.id}:${lesson.id}:${sub.id}:quizzes`]) {
                completedQuizzes += sub.quizzes.length
              }
            }
            if (sub.tasks?.length > 0) {
              totalTasks += sub.tasks.length
              if (progress[`${courseData.id}:${lesson.id}:${sub.id}:tasks`]) {
                completedTasks += sub.tasks.length
              }
            }
          })
        }

        // Тесты и задачи в основных уроках
        if (lesson.quizzes?.length > 0) {
          totalQuizzes += lesson.quizzes.length
          if (progress[`${courseData.id}:${lesson.id}:quizzes`]) {
            completedQuizzes += lesson.quizzes.length
          }
        }
        if (lesson.tasks?.length > 0) {
          totalTasks += lesson.tasks.length
          if (progress[`${courseData.id}:${lesson.id}:tasks`]) {
            completedTasks += lesson.tasks.length
          }
        }
      })
    })

    return {
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      completed: completedItems,
      total: totalItems,
      quizzes: {
        completed: completedQuizzes,
        total: totalQuizzes
      },
      tasks: {
        completed: completedTasks,
        total: totalTasks
      }
    }
  }

  // Получить статистику прогресса (старая функция для совместимости)
  const getStats = (courseId) => {
    const courseProgress = Object.entries(progress).filter(
      ([key]) => key.startsWith(courseId)
    )
    return {
      completedCount: courseProgress.length,
      lastActivity: courseProgress.length > 0 
        ? Math.max(...courseProgress.map(([, v]) => new Date(v.completedAt)))
        : null
    }
  }

  // Отметить упражнение как решённое
  const markExerciseCompleted = (exerciseId) => {
    if (!isAuthenticated) return false
    
    const key = `exercise:${exerciseId}`
    const newProgress = {
      ...progress,
      [key]: { completedAt: new Date().toISOString() }
    }
    setProgress(newProgress)
    updateUserData({ progress: newProgress })
    return true
  }

  // Проверить, решено ли упражнение
  const isExerciseCompleted = (exerciseId) => {
    return !!progress[`exercise:${exerciseId}`]
  }

  // Получить статистику по упражнениям
  const getExerciseStats = (exercises) => {
    if (!exercises || !Array.isArray(exercises)) return { completed: 0, total: 0 }
    
    const completed = exercises.filter(e => isExerciseCompleted(e.id)).length
    return {
      completed,
      total: exercises.length,
      percentage: exercises.length > 0 ? Math.round((completed / exercises.length) * 100) : 0
    }
  }

  // Получить статистику по упражнениям конкретного курса
  const getCourseExerciseStats = (exercises, courseId) => {
    if (!exercises || !Array.isArray(exercises)) return { completed: 0, total: 0 }
    
    const courseExercises = exercises.filter(e => e.courseId === courseId)
    const completed = courseExercises.filter(e => isExerciseCompleted(e.id)).length
    return {
      completed,
      total: courseExercises.length,
      percentage: courseExercises.length > 0 ? Math.round((completed / courseExercises.length) * 100) : 0
    }
  }

  return (
    <ProgressContext.Provider value={{
      progress,
      markAsCompleted,
      isCompleted,
      isLessonFullyCompleted,
      markQuizzesCompleted,
      markTasksCompleted,
      resetProgress,
      getStats,
      getCourseStats,
      markExerciseCompleted,
      isExerciseCompleted,
      getExerciseStats,
      getCourseExerciseStats
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}
