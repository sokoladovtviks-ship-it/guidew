import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Проверяем тип файла
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: MP4, WebM, OGG, MOV' 
      }, { status: 400 })
    }
    
    // Проверяем размер (макс 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 100MB' 
      }, { status: 400 })
    }
    
    // Создаем уникальное имя файла
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${originalName}`
    
    // Сохраняем файл
    const uploadsDir = path.join(process.cwd(), 'public', 'videos')
    await mkdir(uploadsDir, { recursive: true })
    
    const filePath = path.join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Возвращаем URL для доступа к файлу
    const fileUrl = `/videos/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload video' 
    }, { status: 500 })
  }
}

