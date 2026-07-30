import './globals.css'

export const metadata = {
  title: 'Vive Fractal · Copropiedad',
  description: 'Copropiedad fraccionada de activos de lujo · Colombia',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/brand/app-icon.png',
  },
  openGraph: {
    title: 'Vive Fractal · Copropiedad',
    description: 'Segundo hogar. Activo real. Copropiedad fraccionada en Colombia.',
    images: ['/brand/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
