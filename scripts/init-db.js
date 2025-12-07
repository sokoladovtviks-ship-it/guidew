import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function initDB() {
    // Проверяем наличие DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.log('⚠️ DATABASE_URL не установлена, пропускаем инициализацию БД')
        return
    }
    
    let client
    try {
        client = await pool.connect()
    } catch (error) {
        console.error('❌ Не удалось подключиться к базе данных:', error.message)
        console.log('⚠️ Продолжаем запуск без базы данных (будет использован JSON fallback)')
        return
    }
    
    try {
        console.log('🔄 Инициализация базы данных...')

        // Создаём таблицы
        await client.query(`
      CREATE TABLE IF NOT EXISTS courses_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        await client.query(`
      CREATE TABLE IF NOT EXISTS exercises_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        await client.query(`
      CREATE TABLE IF NOT EXISTS about_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        // Проверяем есть ли уже данные
        const result = await client.query('SELECT COUNT(*) as count FROM courses_data')
        const coursesCount = parseInt(result.rows[0].count)

        if (coursesCount === 0) {
            console.log('📦 База данных пуста, миграция данных из JSON файлов...')
            console.log('⚠️ ВАЖНО: Миграция выполняется ТОЛЬКО если база пуста, чтобы не потерять данные!')

            // Мигрируем курсы
            try {
                const coursesPath = path.join(__dirname, '../data/courses.json')
                if (fs.existsSync(coursesPath)) {
                    const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'))
                    if (coursesData.courses && coursesData.courses.length > 0) {
                        await client.query(
                            'INSERT INTO courses_data (data) VALUES ($1)',
                            [JSON.stringify({ courses: coursesData.courses })]
                        )
                        console.log('✅ Курсы загружены:', coursesData.courses.length)
                    }
                }
            } catch (e) {
                console.log('⚠️ Ошибка при загрузке курсов:', e.message)
            }

            // Мигрируем упражнения
            try {
                const exercisesPath = path.join(__dirname, '../data/exercises.json')
                if (fs.existsSync(exercisesPath)) {
                    const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'))
                    if (exercisesData.exercises && exercisesData.exercises.length > 0) {
                        await client.query(
                            'INSERT INTO exercises_data (data) VALUES ($1)',
                            [JSON.stringify({ exercises: exercisesData.exercises })]
                        )
                        console.log('✅ Упражнения загружены:', exercisesData.exercises.length)
                    }
                }
            } catch (e) {
                console.log('⚠️ Ошибка при загрузке упражнений:', e.message)
            }

            // Мигрируем about
            try {
                const aboutPath = path.join(__dirname, '../data/about.json')
                if (fs.existsSync(aboutPath)) {
                    const aboutData = JSON.parse(fs.readFileSync(aboutPath, 'utf8'))
                    await client.query(
                        'INSERT INTO about_data (data) VALUES ($1)',
                        [JSON.stringify(aboutData)]
                    )
                    console.log('✅ About загружен')
                }
            } catch (e) {
                console.log('⚠️ Ошибка при загрузке about:', e.message)
            }
        } else {
            console.log('✅ База данных уже инициализирована. Курсов в БД:', coursesCount)
        }

        console.log('✅ Инициализация завершена\n')
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error)
        console.log('⚠️ Продолжаем запуск без базы данных (будет использован JSON fallback)')
        // Не убиваем процесс, приложение может работать с JSON fallback
    } finally {
        if (client) {
            client.release()
        }
    }
}

initDB().catch((error) => {
    console.error('❌ Критическая ошибка при инициализации БД:', error)
    console.log('⚠️ Продолжаем запуск без базы данных')
    // Завершаемся с кодом 0, чтобы не блокировать запуск приложения
    process.exit(0)
})
