import { Inter, Poppins } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-poppins',
})
