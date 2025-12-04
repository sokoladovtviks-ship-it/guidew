import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Мои заметки по программированию',
  description: 'Персональный сайт с заметками и объяснениями по программированию',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* Prism.js для подсветки кода */}
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" 
          rel="stylesheet" 
        />
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"
          defer
        />
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"
          defer
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
