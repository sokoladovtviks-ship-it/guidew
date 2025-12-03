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

// POST - создать новый урок
export async function POST(request, { params }) {
  try {
    const { courseId, moduleId } = await params
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
    
    const newLesson = {
      id: body.id || `lesson-${Date.now()}`,
      title: body.title,
      content: body.content,
      sublessons: []
    }
    
    module.lessons.push(newLesson)
    saveData(data)
    
    return NextResponse.json(newLesson, { status: 201 })
  } catch (error) {
    console.error('POST lesson error:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
