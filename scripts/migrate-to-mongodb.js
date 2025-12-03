// Скрипт миграции данных из JSON файлов в MongoDB
// Запуск: node scripts/migrate-to-mongodb.js

const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('❌ MONGODB_URI не найден в .env.local')
  process.exit(1)
}

async function migrate() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✅ Подключено к MongoDB')
    
    const db = client.db('python_course')
    
    // Миграция курсов
    const coursesPath = path.join(process.cwd(), 'data', 'courses.json')
    if (fs.existsSync(coursesPath)) {
      const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'))
      await db.collection('courses').updateOne(
        { _id: 'main' },
        { $set: { courses: coursesData.courses || [] } },
        { upsert: true }
      )
      console.log('✅ Курсы мигрированы:', (coursesData.courses || []).length, 'курсов')
      
      // Также мигрируем exercises если они в том же файле
      if (coursesData.exercises) {
        await db.collection('exercises').updateOne(
          { _id: 'main' },
          { $set: { exercises: coursesData.exercises } },
          { upsert: true }
        )
        console.log('✅ Упражнения мигрированы:', coursesData.exercises.length, 'упражнений')
      }
    }
    
    // Миграция about
    const aboutPath = path.join(process.cwd(), 'data', 'about.json')
    if (fs.existsSync(aboutPath)) {
      const aboutData = JSON.parse(fs.readFileSync(aboutPath, 'utf8'))
      await db.collection('about').updateOne(
        { _id: 'main' },
        { $set: { about: aboutData } },
        { upsert: true }
      )
      console.log('✅ About мигрирован')
    }
    
    console.log('\n🎉 Миграция завершена!')
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
  } finally {
    await client.close()
  }
}

migrate()
