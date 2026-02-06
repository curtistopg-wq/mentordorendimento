'use client'

import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AccountPage() {
  const t = useTranslations('accountPage')

  return (
    <div className="pt-36 pb-20 bg-gray-50 min-h-screen">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-primary-500 mb-10">{t('subtitle')}</p>

          {/* Login Form */}
          <div className="bg-white p-8 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-primary-800 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('login.title')}
            </h2>

            <form className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-primary-700 mb-1.5">
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    id="login-email"
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                    placeholder={t('login.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-primary-700 mb-1.5">
                  {t('login.password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-800 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                {t('login.submit')}
              </button>

              <p className="text-center text-sm text-primary-500">
                {t('login.forgot')}
              </p>
            </form>
          </div>

          {/* Benefits */}
          <div className="bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary-800 mb-6">{t('benefits.title')}</h2>
            <div className="space-y-4">
              {(['courses', 'community', 'support', 'updates'] as const).map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-primary-600">{t(`benefits.${key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
