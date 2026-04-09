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
import { inter, poppins } from '@/lib/fonts'
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
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <StructuredData locale={locale} />
        {/* 1. fbclid capture - tiny and critical for attribution */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function getCookie(name){var match=document.cookie.match(new RegExp('(^| )'+name+'=([^;]+)'));return match?match[2]:null;}var urlParams=new URLSearchParams(window.location.search);var fbclid=urlParams.get('fbclid');if(fbclid&&!getCookie('_fbc')){var fbc='fb.1.'+Date.now()+'.'+fbclid;var d=new Date();d.setTime(d.getTime()+(90*24*60*60*1000));var domain=window.location.hostname.replace(/^www\\./,'');document.cookie='_fbc='+fbc+'; expires='+d.toUTCString()+'; path=/; domain=.'+domain+'; SameSite=Lax';}})();`,
          }}
        />
        {/* UTM persistence - first-party cookies (30d) survive tab close & in-app browsers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(location.search);var d=new Date();d.setTime(d.getTime()+(30*24*60*60*1000));var ex='; expires='+d.toUTCString()+'; path=/; SameSite=Lax';var dm='; domain=.'+location.hostname.replace(/^www\\./,'');['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(function(k){var v=p.get(k);if(v){document.cookie='mdr_'+k+'='+encodeURIComponent(v)+ex+dm;sessionStorage.setItem('mdr_'+k,v);}});if(!document.cookie.match('mdr_landing=')){document.cookie='mdr_landing='+encodeURIComponent(location.href)+ex+dm;}if(!document.cookie.match('mdr_referrer=')){document.cookie='mdr_referrer='+encodeURIComponent(document.referrer)+ex+dm;}if(!sessionStorage.getItem('mdr_landing'))sessionStorage.setItem('mdr_landing',location.href);if(!sessionStorage.getItem('mdr_referrer'))sessionStorage.setItem('mdr_referrer',document.referrer);}catch(e){}})();`,
          }}
        />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-white text-primary-800">
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WQ7DNJRL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* Meta Pixel noscript fallbacks */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1610736693381201&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1856669588586928&ev=PageView&noscript=1"
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
        <MetaPixelEvents />
        <Analytics />
        {/* 2. GTM - deferred to after page interactive */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WQ7DNJRL');`,
          }}
        />
        {/* 3. Meta Pixel - deferred to after page interactive */}
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1610736693381201');fbq('init','1856669588586928');fbq('track','PageView');`,
          }}
        />
        {/* 4. Clarity - lazy loaded, non-critical analytics */}
        <Script
          id="clarity-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vd7maw8h2e");`,
          }}
        />
        {/* 5. PeopleDown tracker - pageview + session + UTM capture */}
        <Script
          src="/api/t/script?site=mentordorendimento.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
