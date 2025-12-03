import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Функции для работы с курсами
export const coursesAPI = {
  // Получить все курсы
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (
              *,
              sublessons (*)
            )
          )
        `)
        .order('created_at')
      
      if (error) {
        console.log('Database not ready, returning empty data:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.log('Database connection error, returning empty data:', err)
      return []
    }
  },

  // Создать курс
  async create(course) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить курс
  async update(id, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить курс
  async delete(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Функции для работы с модулями
export const modulesAPI = {
  // Создать модуль
  async create(courseId, module) {
    const { data, error } = await supabase
      .from('modules')
      .insert([{ ...module, course_id: courseId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить модуль
  async update(id, updates) {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить модуль
  async delete(id) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Функции для работы с уроками
export const lessonsAPI = {
  // Создать урок
  async create(moduleId, lesson) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([{ ...lesson, module_id: moduleId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить урок
  async update(id, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить урок
  async delete(id) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Функции для работы с подуроками
export const sublessonsAPI = {
  // Создать подурок
  async create(lessonId, sublesson) {
    const { data, error } = await supabase
      .from('sublessons')
      .insert([{ ...sublesson, lesson_id: lessonId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить подурок
  async update(id, updates) {
    const { data, error } = await supabase
      .from('sublessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить подурок
  async delete(id) {
    const { error } = await supabase
      .from('sublessons')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Функции для работы с упражнениями
export const exercisesAPI = {
  // Получить все упражнения
  async getAll() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at')
    
    if (error) throw error
    return data || []
  },

  // Получить упражнение по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Создать упражнение
  async create(exercise) {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить упражнение
  async update(id, updates) {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить упражнение
  async delete(id) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}
