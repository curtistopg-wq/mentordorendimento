import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0D1B2A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {/* Downward trend line */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: '1.5rem' }}>
            <path d="M10 20 L30 25 L50 40 L70 65" stroke="#C8952E" strokeWidth="3" strokeLinecap="round" />
            <path d="M60 65 L70 65 L70 55" stroke="#C8952E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="20" r="3" fill="#C8952E" />
          </svg>

          <h1 style={{ color: '#C8952E', fontSize: '4rem', margin: '0 0 0.5rem', fontWeight: 400 }}>
            404
          </h1>
          <p style={{ color: '#9FB3C8', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
            Essa página não existe
          </p>
          <p style={{ color: '#627D98', fontSize: '0.9rem', margin: '0 0 2rem' }}>
            — mas seus lucros podem existir
          </p>
          <Link
            href="/pt-BR"
            style={{
              display: 'inline-block',
              backgroundColor: '#F97316',
              color: '#ffffff',
              fontFamily: "system-ui, sans-serif",
              fontSize: '0.875rem',
              fontWeight: 700,
              padding: '0.875rem 2.5rem',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              letterSpacing: '0.025em',
              textTransform: 'uppercase' as const,
            }}
          >
            Voltar ao início
          </Link>
          <p style={{ color: '#334E68', fontSize: '0.75rem', marginTop: '2rem' }}>
            mentordorendimento.com
          </p>
        </div>
      </body>
    </html>
  )
}
