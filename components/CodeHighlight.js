'use client'
import { useEffect } from 'react'

export default function CodeHighlight() {
  useEffect(() => {
    const highlightCode = async () => {
      // Динамически импортируем Prism
      const Prism = (await import('prismjs')).default
      
      // Импортируем нужные языки
      await import('prismjs/components/prism-python')
      await import('prismjs/components/prism-javascript')
      await import('prismjs/components/prism-css')
      await import('prismjs/components/prism-json')
      
      // Импортируем тему
      await import('prismjs/themes/prism-tomorrow.css')
      
      // Подсвечиваем код
      Prism.highlightAll()
    }
    
    // Запускаем подсветку через небольшую задержку
    const timer = setTimeout(highlightCode, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return null
}
