import { NextResponse } from 'next/server'
import { getAllCourses, saveAllCourses } from '@/lib/courses-helper'

// GET - получить все курсы
export async function GET() {
  try {
    const courses = await getAllCourses()
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error loading courses:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST - создать новый курс
export async function POST(request) {
  try {
    const body = await request.json()
    const courses = await getAllCourses()
    
    const newCourse = {
      id: body.id || `course-${Date.now()}`,
      title: body.title,
      description: body.description,
      modules: []
    }
    
    courses.push(newCourse)
    await saveAllCourses(courses)
    
    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
