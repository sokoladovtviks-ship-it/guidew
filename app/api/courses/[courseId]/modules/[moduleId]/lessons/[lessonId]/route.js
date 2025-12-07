import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// GET - получить урок
export async function GET(request, { params }) {
  try {
    const { courseId, moduleId, lessonId } = await params
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules?.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    const lesson = module.lessons?.find(l => l.id === lessonId)
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
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules?.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    if (!module.lessons) {
      module.lessons = []
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId)
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    module.lessons[lessonIndex] = { ...module.lessons[lessonIndex], ...body }
    await saveAllCourses(courses)
    
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
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const module = course.modules?.find(m => m.id === moduleId)
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    if (!module.lessons) {
      module.lessons = []
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId)
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    module.lessons.splice(lessonIndex, 1)
    await saveAllCourses(courses)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE lesson error:', error)
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}
