import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// PUT - обновить модуль
export async function PUT(request, { params }) {
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
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId)
    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    
    course.modules[moduleIndex] = { ...course.modules[moduleIndex], ...body }
    await saveAllCourses(courses)
    
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
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    if (!course.modules) {
      course.modules = []
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
    
    await saveAllCourses(courses)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE module error:', error)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
