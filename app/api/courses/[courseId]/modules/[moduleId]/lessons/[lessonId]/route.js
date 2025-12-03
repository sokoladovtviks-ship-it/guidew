import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'courses.json')

function getData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { courses: [] }
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Save error:', error)
  }
}

// GET - получить урок
export async function GET(request, { params }) {
  try {
    const { courseId, moduleId, lessonId } = await params
    const data = getData()
    const courses = data.courses
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    const lesson = module.lessons.find(l => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    return NextResponse.json({ lesson, module, course })
  } catch (error) {
    console.error('GET lesson error:', error)
    return NextResponse.json({ error: 'Failed to load lesson' }, { status: 500 })
  }
}

// PUT - обновить урок
export async function PUT(request, { params }) {
  try {
    const { courseId, moduleId, lessonId } = await params
    const body = await request.json()
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId)
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    module.lessons[lessonIndex] = { ...module.lessons[lessonIndex], ...body }
    saveData(data)
    
    return NextResponse.json(module.lessons[lessonIndex])
  } catch (error) {
    console.error('PUT lesson error:', error)
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}

// DELETE - удалить урок
export async function DELETE(request, { params }) {
  try {
    const { courseId, moduleId, lessonId } = await params
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId)
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    module.lessons.splice(lessonIndex, 1)
    saveData(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE lesson error:', error)
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}
