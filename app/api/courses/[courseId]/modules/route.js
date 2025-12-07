import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// POST - создать новый модуль
export async function POST(request, { params }) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    if (!course.modules) {
      course.modules = []
    }
    
    const newModule = {
      id: body.id || `module-${Date.now()}`,
      number: course.modules.length,
      title: body.title,
      description: body.description,
      lessons: []
    }
    
    course.modules.push(newModule)
    await saveAllCourses(courses)
    
    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error('POST module error:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
