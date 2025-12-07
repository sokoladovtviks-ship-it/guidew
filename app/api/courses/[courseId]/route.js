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
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Save error:', error)
  }
}

// GET - получить курс по ID
export async function GET(request, { params }) {
  try {
    const { courseId } = await params
    const courses = await getCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error loading course:', error)
    // Fallback на JSON
    const data = getDataFromFile()
    const course = data.courses.find(c => c.id === courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json(course)
  }
}

// PUT - обновить курс
export async function PUT(request, { params }) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const courses = await getCourses()
    const courseIndex = courses.findIndex(c => c.id === courseId)
    
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    courses[courseIndex] = {
      ...courses[courseIndex],
      ...body
    }
    
    await saveCourses(courses)
    
    // Также сохраняем в JSON для резервной копии
    const data = getDataFromFile()
    data.courses = courses
    saveDataToFile(data)
    
    return NextResponse.json(courses[courseIndex])
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE - удалить курс
export async function DELETE(request, { params }) {
  try {
    const { courseId } = await params
    const courses = await getCourses()
    const index = courses.findIndex(c => c.id === courseId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    courses.splice(index, 1)
    await saveCourses(courses)
    
    // Также сохраняем в JSON для резервной копии
    const data = getDataFromFile()
    data.courses = courses
    saveDataToFile(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
