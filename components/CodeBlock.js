'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function CodeBlock({ code, language = 'python' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Простая подсветка синтаксиса для Python
  const highlightCode = (code) => {
    if (language !== 'python') return code

    const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'yield', 'raise', 'async', 'await']
    
    let highlighted = code
      // Комментарии
      .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
      // Строки
      .replace(/("[^"]*"|'[^']*')/g, '<span class="string">$1</span>')
      // Числа
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')

    // Ключевые слова
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
      highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>')
    })

    // Функции
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(')

    return highlighted
  }

  return (
    <div className="relative group my-4">
      {/* Заголовок с языком */}
      <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Скопировано!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Копировать
            </>
          )}
        </button>
      </div>
      
      {/* Код */}
      <div className="code-block rounded-t-none">
        <pre>
          <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
        </pre>
      </div>
    </div>
  )
}
