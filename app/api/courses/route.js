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
    const data = getData()
    return NextResponse.json(data.courses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 })
  }
}

// POST - создать новый курс
export async function POST(request) {
  try {
    const body = await request.json()
    const data = getData()
    
    const newCourse = {
      id: body.id || `course-${Date.now()}`,
      title: body.title,
      description: body.description,
      modules: []
    }
    
    data.courses.push(newCourse)
    saveData(data)
    
    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
