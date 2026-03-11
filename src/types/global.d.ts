// Global window type declarations - single source of truth
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    clarity?: (method: string, key: string, value?: string) => void
    fbq?: (...args: unknown[]) => void
    PeopleDown?: {
      trackLead: (data: { name?: string; email?: string; phone?: string }) => Promise<{ id?: string; status: string }>
      getSessionId: () => string
      trackPageview: () => void
    }
  }
}

export {}
