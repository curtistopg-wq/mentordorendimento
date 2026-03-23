'use client'

import { useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTrackingData, generateEventId } from '@/lib/tracking'

interface DraftData {
  name?: string
  email?: string
  phone?: string
  source: string
}

export function useDraftLead(source: string) {
  const sessionId = useRef<string>('')
  const lastSaved = useRef<string>('')

  // Generate stable session ID once per component mount
  if (!sessionId.current) {
    sessionId.current = generateEventId()
  }

  const saveDraft = useCallback(async (data: DraftData) => {
    // Only save if we have at least an email
    if (!data.email) return

    // Dedupe: don't save if nothing changed
    const key = `${data.name}|${data.email}|${data.phone}`
    if (key === lastSaved.current) return
    lastSaved.current = key

    const tracking = getTrackingData()

    try {
      const supabase = createClient()
      await supabase.from('draft_leads').upsert(
        {
          session_id: sessionId.current,
          name: data.name?.trim() || null,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || null,
          source: data.source || source,
          page: window.location.pathname,
          utm_source: tracking.utm_source || null,
          utm_medium: tracking.utm_medium || null,
          utm_campaign: tracking.utm_campaign || null,
          referrer: tracking.referrer || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )
    } catch {
      // Silent fail — don't interfere with form UX
    }
  }, [source])

  const markConverted = useCallback(async () => {
    if (!sessionId.current || !lastSaved.current) return
    try {
      const supabase = createClient()
      // Re-upsert with converted flag (uses INSERT policy, no UPDATE needed)
      const [name, email, phone] = lastSaved.current.split('|')
      await supabase.from('draft_leads').upsert(
        {
          session_id: sessionId.current,
          name: name || null,
          email: email || null,
          phone: phone || null,
          source,
          converted: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )
    } catch {
      // Silent fail
    }
  }, [source])

  return { saveDraft, markConverted, sessionId: sessionId.current }
}
