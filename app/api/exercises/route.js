import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'exercises.json')

function getExercises() {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading exercises:', error)
  }
  return []
}

function saveExercises(exercises) {
  try {
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dataPath, JSON.stringify(exercises, null, 2))
  } catch (error) {
    console.error('Error saving exercises:', error)
  }
}

// GET - получить все упражнения
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const courseId = searchParams.get('courseId')
    
    let exercises = getExercises()
    
    if (level) {
      exercises = exercises.filter(e => e.level === parseInt(level))
    }
    
    if (courseId) {
      exercises = exercises.filter(e => e.courseId === courseId)
    }
    
    return NextResponse.json(exercises)
  } catch (error) {
    console.error('GET exercises error:', error)
    return NextResponse.json({ error: 'Failed to load exercises' }, { status: 500 })
  }
}

// POST - создать новое упражнение
export async function POST(request) {
  try {
    const body = await request.json()
    const exercises = getExercises()
    
    const newExercise = {
      id: `exercise-${Date.now()}`,
      title: body.title,
      description: body.description,
      code: body.code || '',
      solution: body.solution || '',
      difficulty: body.difficulty || 'easy'
    }
    
    exercises.push(newExercise)
    saveExercises(exercises)
    
    return NextResponse.json(newExercise, { status: 201 })
  } catch (error) {
    console.error('POST exercise error:', error)
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
  }
}
