import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { StructuredData } from '@/components/seo/structured-data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { StickyCTA } from '@/components/ui/sticky-cta'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { SignupModalProvider } from '@/components/providers/signup-modal-provider'
import { MetaPixelEvents } from '@/components/analytics/meta-pixel-events'
import { TrackingCapture } from '@/components/analytics/tracking-capture'
import { inter, poppins, dmSerif } from '@/lib/fonts'
import '../globals.css'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['trading', 'education', 'forex', 'investment', 'financial education'],
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'website',
      siteName: 'Mentor do Rendimento',
      url: `https://mentordorendimento.com/${locale}`,
      images: [
        {
          url: 'https://mentordorendimento.com/images/hero-poster.jpg',
          width: 1200,
          height: 630,
          alt: 'Mentor do Rendimento - Trading Education Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://mentordorendimento.com/images/hero-poster.jpg'],
    },
    alternates: {
      canonical: `https://mentordorendimento.com/${locale}`,
      languages: {
        'pt-BR': 'https://mentordorendimento.com/pt-BR',
        'en': 'https://mentordorendimento.com/en',
        'x-default': 'https://mentordorendimento.com/pt-BR',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable} ${dmSerif.variable}`}>
      <head>
        <StructuredData locale={locale} />
        {/* Preload hero image for faster LCP on mobile */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-poster.jpg"
          type="image/jpeg"
          fetchPriority="high"
        />
        {/* Preconnect hints */}
        <link rel="preconnect" href="https://www.clarity.ms" />
      </head>
      <body className="font-sans antialiased bg-white text-primary-800">
        {/* Meta Pixel noscript fallbacks */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2202983003822057&ev=PageView&noscript=1"
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1548652783347184&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <SignupModalProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <StickyCTA />
            <WhatsAppButton />
          </SignupModalProvider>
        </NextIntlClientProvider>
        <TrackingCapture />
        <MetaPixelEvents />
        <Analytics />
        {/* 2. Meta Pixel - deferred to after page interactive */}
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2202983003822057');fbq('init','1548652783347184');var _pvId='pv-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);fbq('track','PageView',{},{eventID:_pvId});window.__mdrPageViewEventId=_pvId;`,
          }}
        />
        {/* 4. Clarity - afterInteractive to capture FB/IG in-app browser sessions */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vd7maw8h2e");`,
          }}
        />
        {/* 5. PeopleDown tracker - pageview + session + UTM capture */}
        <Script
          src="/api/t/script?site=mentordorendimento.com"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
