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

// PUT - обновить модуль
export async function PUT(request, { params }) {
  try {
    const { courseId, moduleId } = await params
    const body = await request.json()
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId)
    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    course.modules[moduleIndex] = { ...course.modules[moduleIndex], ...body }
    saveData(data)
    
    return NextResponse.json(course.modules[moduleIndex])
  } catch (error) {
    console.error('PUT module error:', error)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

// DELETE - удалить модуль
export async function DELETE(request, { params }) {
  try {
    const { courseId, moduleId } = await params
    const data = getData()
    const course = data.courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId)
    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    course.modules.splice(moduleIndex, 1)
    
    // Перенумеровать модули после удаления
    course.modules.forEach((mod, idx) => {
      mod.number = idx
    })
    
    saveData(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE module error:', error)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
