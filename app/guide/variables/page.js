import Navbar from '@/components/Navbar'
import CodeBlock from '@/components/CodeBlock'
import InfoBox from '@/components/InfoBox'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function VariablesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Навигация хлебные крошки */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guide" className="hover:text-blue-600 transition-colors">
            Курс
          </Link>
          <span>/</span>
          <span className="text-gray-800">Переменные</span>
        </div>

        {/* Заголовок урока */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Переменные в Python
        </h1>

        {/* Контент урока */}
        <article className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Переменная — это как <strong>коробка с названием</strong>, в которую можно положить какое-то значение. 
            Название помогает нам потом найти эту коробку и достать из неё то, что мы туда положили.
          </p>

          {/* Схема-иллюстрация */}
          <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              📦 Как работает переменная
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-blue-300 flex items-center justify-center text-3xl font-bold text-blue-600">
                  42
                </div>
                <p className="mt-2 text-sm text-gray-600">значение</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <div className="w-32 h-24 bg-blue-100 rounded-xl border-2 border-blue-400 flex flex-col items-center justify-center">
                  <span className="text-xs text-blue-600 font-medium mb-1">переменная</span>
                  <span className="text-xl font-mono font-bold text-blue-800">age</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">имя коробки</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Создание переменной
          </h2>

          <p className="text-gray-700 mb-4">
            Чтобы создать переменную в Python, просто пишем имя, знак равно и значение:
          </p>

          <CodeBlock
            language="python"
            code={`# Создаём переменные
name = "Артём"
age = 25
is_student = True

# Выводим на экран
print(name)      # Артём
print(age)       # 25
print(is_student) # True`}
          />

          <InfoBox type="tip" title="Совет">
            Давайте переменным понятные имена! Вместо <code>x</code> лучше написать <code>user_age</code> — 
            так код будет понятнее и тебе, и другим.
          </InfoBox>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Правила именования
          </h2>

          <p className="text-gray-700 mb-4">
            В Python есть несколько правил для имён переменных:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Можно использовать буквы, цифры и подчёркивание <code>_</code></li>
            <li>Нельзя начинать с цифры (<code>1name</code> — ошибка)</li>
            <li>Нельзя использовать пробелы (вместо этого используй <code>_</code>)</li>
            <li>Python различает регистр: <code>Name</code> и <code>name</code> — разные переменные</li>
          </ul>

          <CodeBlock
            language="python"
            code={`# Правильно ✓
user_name = "Аня"
age2 = 30
_private = "секрет"

# Неправильно ✗
# 2name = "Ошибка"   # начинается с цифры
# user name = "Аня"  # есть пробел`}
          />

          <InfoBox type="warning" title="Осторожно">
            Не используй зарезервированные слова Python как имена переменных: 
            <code>if</code>, <code>for</code>, <code>while</code>, <code>class</code>, <code>def</code> и другие.
          </InfoBox>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Изменение значения
          </h2>

          <p className="text-gray-700 mb-4">
            Переменную можно изменить в любой момент — просто присвой новое значение:
          </p>

          <CodeBlock
            language="python"
            code={`score = 0
print(score)  # 0

score = 10
print(score)  # 10

score = score + 5  # добавляем 5 к текущему значению
print(score)  # 15`}
          />

          <InfoBox type="info" title="Интересно">
            В Python можно присвоить несколько переменных в одной строке:
            <code className="block mt-2 bg-gray-100 p-2 rounded">x, y, z = 1, 2, 3</code>
          </InfoBox>

          {/* Место для своей схемы/фотографии */}
          <div className="my-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500 mb-2">📸 Место для твоей схемы</p>
            <p className="text-sm text-gray-400">
              Добавь сюда свою фотографию схемы из папки <code>/public/images/</code>
            </p>
            {/* Пример как добавить изображение: */}
            {/* <img src="/images/variables-schema.png" alt="Схема переменных" className="schema-image mx-auto" /> */}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Итог
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-green-800 mb-3">Что запомнить:</h3>
            <ul className="space-y-2 text-green-700">
              <li>✓ Переменная — это имя для хранения значения</li>
              <li>✓ Создаётся через <code>=</code> (присваивание)</li>
              <li>✓ Давай понятные имена на английском</li>
              <li>✓ Значение можно менять сколько угодно раз</li>
            </ul>
          </div>
        </article>

        {/* Навигация между уроками */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/guide/installation"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Установка Python</span>
          </Link>
          <Link
            href="/guide/data-types"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>Типы данных</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Футер */}
      <footer className="py-8 px-4 border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Мои заметки по программированию</p>
        </div>
      </footer>
    </div>
  )
}
