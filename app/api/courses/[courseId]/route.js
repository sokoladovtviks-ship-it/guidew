import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// GET - получить курс по ID
export async function GET(request, { params }) {
  try {
    const { courseId } = await params
    const courses = await getAllCourses()
    const course = courses.find(c => c.id === courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error loading course:', error)
    return NextResponse.json({ error: 'Failed to load course' }, { status: 500 })
  }
}

// PUT - обновить курс
export async function PUT(request, { params }) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const courses = await getAllCourses()
    const courseIndex = courses.findIndex(c => c.id === courseId)
    
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    courses[courseIndex] = {
      ...courses[courseIndex],
      ...body
    }
    
    await saveAllCourses(courses)
    
    return NextResponse.json(courses[courseIndex])
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE - удалить курс
export async function DELETE(request, { params }) {
  try {
    const { courseId } = await params
    const courses = await getAllCourses()
    const index = courses.findIndex(c => c.id === courseId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    courses.splice(index, 1)
    await saveAllCourses(courses)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
