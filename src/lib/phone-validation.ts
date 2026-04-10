import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js/min'

export interface PhoneValidationResult {
  valid: boolean
  formatted: string | null
  error: string | null
}

/**
 * Client-side Brazilian phone validation using libphonenumber-js
 */
export function validateBrazilianPhone(raw: string): PhoneValidationResult {
  try {
    const digits = raw.replace(/\D/g, '')
    const withCountry = digits.startsWith('55') ? `+${digits}` : `+55${digits}`

    if (!isValidPhoneNumber(withCountry, 'BR')) {
      return { valid: false, formatted: null, error: 'Número de telefone inválido' }
    }

    const parsed = parsePhoneNumber(withCountry, 'BR')
    if (!parsed) {
      return { valid: false, formatted: null, error: 'Número de telefone inválido' }
    }

    return {
      valid: true,
      formatted: parsed.format('E.164'),
      error: null,
    }
  } catch {
    return { valid: false, formatted: null, error: 'Número de telefone inválido' }
  }
}

/**
 * Format phone for display: (DD) 9XXXX-XXXX
 */
export function formatBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('55') ? digits.slice(2) : digits

  if (local.length <= 2) return `(${local}`
  if (local.length <= 7) return `(${local.slice(0, 2)}) ${local.slice(2)}`
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`
}
