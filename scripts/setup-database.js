// Скрипт для создания таблиц в Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsafvmiermjsfgemzdbf.supabase.co'
const supabaseServiceKey = 'your_service_role_key_here' // Нужен service key, не anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Creating tables...')
    
    // Создаем таблицу курсов
    const { error: coursesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (coursesError) {
      console.error('Error creating courses table:', coursesError)
    } else {
      console.log('✓ Courses table created')
    }
    
    // Создаем таблицу модулей
    const { error: modulesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          number INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (modulesError) {
      console.error('Error creating modules table:', modulesError)
    } else {
      console.log('✓ Modules table created')
    }
    
    console.log('Database setup complete!')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase()
