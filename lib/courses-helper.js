import { getCourses, saveCourses } from './db'
import fs from 'fs'
import path from 'path'

// Fallback на JSON если база недоступна
export function getDataFromFile() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'courses.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { courses: [] }
  }
}

export function saveDataToFile(data) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'courses.json')
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Save error:', error)
  }
}

// Получить все курсы (с fallback)
export async function getAllCourses() {
  try {
    return await getCourses()
  } catch (error) {
    console.error('Error loading courses from DB:', error)
    const data = getDataFromFile()
    return data.courses || []
  }
}

// Сохранить все курсы (с резервной копией в JSON)
export async function saveAllCourses(courses) {
  try {
    await saveCourses(courses)
    // Также сохраняем в JSON для резервной копии
    const data = getDataFromFile()
    data.courses = courses
    saveDataToFile(data)
  } catch (error) {
    console.error('Error saving courses to DB:', error)
    // Fallback на JSON
    const data = getDataFromFile()
    data.courses = courses
    saveDataToFile(data)
    throw error
  }
}

