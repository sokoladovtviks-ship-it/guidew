import { NextResponse } from 'next/server'

// GET - получить данные
export async function GET() {
  try {
    const data = { title: "О проекте", content: "Система изучения программирования" }
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET about error:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

// PUT - обновить данные
export async function PUT(request) {
  try {
    const newData = await request.json()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT about error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
