import { NextResponse } from 'next/server'
import { getCourses, saveCourses } from '@/lib/mongodb'

export async function PUT(request, { params }) {
  try {
    const { courseId, moduleId, lessonId, sublessonId } = await params
    const updates = await request.json()
    
    const courses = await getCourses()
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
    
    const sublessonIndex = lesson.sublessons?.findIndex(s => s.id === sublessonId)
    if (sublessonIndex === -1) {
      return NextResponse.json({ error: 'Sublesson not found' }, { status: 404 })
    }
    
    // Обновляем подурок
    lesson.sublessons[sublessonIndex] = {
      ...lesson.sublessons[sublessonIndex],
      ...updates
    }
    
    await saveCourses(courses)
    return NextResponse.json(lesson.sublessons[sublessonIndex])
  } catch (error) {
    console.error('Error updating sublesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
