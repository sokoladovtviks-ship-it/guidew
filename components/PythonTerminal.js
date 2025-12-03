'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Trash2, Terminal, Loader2 } from 'lucide-react'

export default function PythonTerminal({ initialCode = '' }) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pyodide, setPyodide] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const textareaRef = useRef(null)

  // Загружаем Pyodide при первом использовании
  const loadPyodide = async () => {
    if (pyodide) return pyodide

    setIsLoading(true)
    setOutput('⏳ Загрузка Python...')

    try {
      // Загружаем скрипт Pyodide
      if (!window.loadPyodide) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        document.head.appendChild(script)
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      const py = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      })

      setPyodide(py)
      setIsReady(true)
      setOutput('✅ Python готов к работе!')
      setIsLoading(false)
      return py
    } catch (error) {
      setOutput('❌ Ошибка загрузки Python: ' + error.message)
      setIsLoading(false)
      return null
    }
  }

  // Запуск кода
  const runCode = async () => {
    setIsLoading(true)
    
    let py = pyodide
    if (!py) {
      py = await loadPyodide()
      if (!py) return
    }

    try {
      // Перехватываем stdout
      py.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `)

      // Выполняем код пользователя
      py.runPython(code)

      // Получаем вывод
      const stdout = py.runPython('sys.stdout.getvalue()')
      const stderr = py.runPython('sys.stderr.getvalue()')

      let result = ''
      if (stdout) result += stdout
      if (stderr) result += '\n⚠️ ' + stderr

      setOutput(result || '✅ Код выполнен (нет вывода)')
    } catch (error) {
      setOutput('❌ Ошибка: ' + error.message)
    }

    setIsLoading(false)
  }

  // Очистка
  const clearAll = () => {
    setCode('')
    setOutput('')
  }

  // Автовысота textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [code])

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 my-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Python Terminal</span>
          {isReady && <span className="text-xs text-green-400">● Ready</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Очистить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={runCode}
            disabled={isLoading || !code.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Запустить
          </button>
        </div>
      </div>

      {/* Редактор кода */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="# Введите Python код здесь...&#10;print('Привет, мир!')"
          className="w-full bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none min-h-[120px]"
          spellCheck={false}
        />
      </div>

      {/* Вывод */}
      {output && (
        <div className="border-t border-gray-700">
          <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400">
            Вывод:
          </div>
          <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
