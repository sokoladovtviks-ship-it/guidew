import { NextResponse } from 'next/server'
import { getCourses, saveCourses } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// Fallback на JSON если база недоступна
function getDataFromFile() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'courses.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { courses: [] }
  }
}

function saveDataToFile(data) {
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

// GET - получить все курсы
export async function GET() {
  try {
    const courses = await getCourses()
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error loading courses:', error)
    // Fallback на JSON
    const data = getDataFromFile()
    return NextResponse.json(data.courses || [])
  }
}

// POST - создать новый курс
export async function POST(request) {
  try {
    const body = await request.json()
    const courses = await getCourses()
    
    const newCourse = {
      id: body.id || `course-${Date.now()}`,
      title: body.title,
      description: body.description,
      modules: []
    }
    
    courses.push(newCourse)
    await saveCourses(courses)
    
    // Также сохраняем в JSON для резервной копии
    const data = getDataFromFile()
    data.courses = courses
    saveDataToFile(data)
    
    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
