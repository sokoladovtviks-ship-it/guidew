import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// POST - создать новый урок
export async function POST(request, { params }) {
  try {
    const { courseId, moduleId } = await params
    const body = await request.json()
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    if (!course.modules) {
      course.modules = []
    }
    
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    if (!module.lessons) {
      module.lessons = []
    }
    
    const newLesson = {
      id: body.id || `lesson-${Date.now()}`,
      title: body.title,
      content: body.content,
      sublessons: []
    }
    
    module.lessons.push(newLesson)
    await saveAllCourses(courses)
    
    return NextResponse.json(newLesson, { status: 201 })
  } catch (error) {
    console.error('POST lesson error:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
