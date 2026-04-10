import { Inter, Poppins, DM_Serif_Display } from 'next/font/google'

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
  preload: false,
})

export const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-serif',
  preload: false,
})
