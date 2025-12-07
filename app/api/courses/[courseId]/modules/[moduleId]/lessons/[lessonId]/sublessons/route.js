import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// GET - получить все подуроки урока
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
    
    return NextResponse.json(lesson.sublessons || [])
  } catch (error) {
    console.error('Error getting sublessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать новый подурок
export async function POST(request, { params }) {
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
    
    const lesson = module.lessons?.find(l => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    if (!lesson.sublessons) {
      lesson.sublessons = []
    }
    
    const newSublesson = {
      id: body.id || `sublesson-${Date.now()}`,
      title: body.title,
      content: body.content,
      quizzes: body.quizzes || [],
      tasks: body.tasks || []
    }
    
    lesson.sublessons.push(newSublesson)
    await saveAllCourses(courses)
    
    return NextResponse.json(newSublesson, { status: 201 })
  } catch (error) {
    console.error('Error creating sublesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить подурок
export async function DELETE(request, { params }) {
  try {
    const { courseId, moduleId, lessonId } = await params
    const url = new URL(request.url)
    const sublessonId = url.searchParams.get('sublessonId')
    
    if (!sublessonId) {
      return NextResponse.json({ error: 'Sublesson ID required' }, { status: 400 })
    }
    
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
    if (!lesson || !lesson.sublessons) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    
    const sublessonIndex = lesson.sublessons.findIndex(s => s.id === sublessonId)
    if (sublessonIndex === -1) {
      return NextResponse.json({ error: 'Sublesson not found' }, { status: 404 })
    }
    
    lesson.sublessons.splice(sublessonIndex, 1)
    await saveAllCourses(courses)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sublesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
