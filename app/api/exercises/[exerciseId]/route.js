import { NextResponse } from 'next/server'
import { getExercises, saveExercises } from '@/lib/mongodb'

// GET - получить упражнение
export async function GET(request, { params }) {
  try {
    const { exerciseId } = await params
    const exercises = await getExercises()
    const exercise = exercises.find(e => e.id === exerciseId)
    
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }
    
    return NextResponse.json(exercise)
  } catch (error) {
    console.error('GET exercise error:', error)
    return NextResponse.json({ error: 'Failed to load exercise' }, { status: 500 })
  }
}

// PUT - обновить упражнение
export async function PUT(request, { params }) {
  try {
    const { exerciseId } = await params
    const body = await request.json()
    const exercises = await getExercises()
    const index = exercises.findIndex(e => e.id === exerciseId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }
    
    exercises[index] = { ...exercises[index], ...body }
    await saveExercises(exercises)
    
    return NextResponse.json(exercises[index])
  } catch (error) {
    console.error('PUT exercise error:', error)
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 })
  }
}

// DELETE - удалить упражнение
export async function DELETE(request, { params }) {
  try {
    const { exerciseId } = await params
    const exercises = await getExercises()
    const index = exercises.findIndex(e => e.id === exerciseId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }
    
    exercises.splice(index, 1)
    await saveExercises(exercises)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE exercise error:', error)
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 })
  }
}
