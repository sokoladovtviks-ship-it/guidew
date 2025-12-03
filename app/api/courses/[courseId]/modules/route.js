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

// POST - создать новый модуль
export async function POST(request, { params }) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const newModule = {
      id: body.id || `module-${Date.now()}`,
      number: course.modules.length,
      title: body.title,
      description: body.description,
      lessons: []
    }
    
    course.modules.push(newModule)
    saveData(data)
    
    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error('POST module error:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
