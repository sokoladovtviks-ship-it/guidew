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

// GET - получить курс по ID
export async function GET(request, { params }) {
  try {
    const { courseId } = await params
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load course' }, { status: 500 })
  }
}

// PUT - обновить курс
export async function PUT(request, { params }) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const data = getData()
    const courseIndex = data.courses.findIndex(c => c.id === courseId)
    
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    data.courses[courseIndex] = {
      ...data.courses[courseIndex],
      ...body
    }
    
    saveData(data)
    
    return NextResponse.json(data.courses[courseIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE - удалить курс
export async function DELETE(request, { params }) {
  try {
    const { courseId } = await params
    const data = getData()
    const index = data.courses.findIndex(c => c.id === courseId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    data.courses.splice(index, 1)
    saveData(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
