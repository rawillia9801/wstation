'use client'

import { useEffect, useState } from 'react'
import type { StationSettings } from '@/types/dashboard'

function emailText(settings?: StationSettings) {
  return (settings?.notification_emails || []).join(', ')
}

function parseEmails(value: string) {
  return Array.from(new Set(value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)))
}

export default function AlertPreferencesForm({ settings }: { settings: StationSettings }) {
  const [email, setEmail] = useState(emailText(settings))
  const [daily, setDaily] = useState(settings.daily_report_enabled !== false)
  const [severe, setSevere] = useState(settings.abnormal_alerts_enabled !== false)
  const [status, setStatus] = useState('Loading saved alert preferences...')

  useEffect(() => {
    let cancelled = false

    async function loadSaved() {
      try {
        const response = await fetch('/api/save-settings', { cache: 'no-store' })
        const saved = await response.json()
        if (cancelled || saved?.error) return
        setEmail(emailText(saved))
        setDaily(saved.daily_report_enabled !== false)
        setSevere(saved.abnormal_alerts_enabled !== false)
        setStatus(saved.notification_emails?.length ? 'Saved recipients loaded.' : 'No saved recipients yet.')
      } catch {
        if (!cancelled) setStatus('Saved preferences could not be loaded.')
      }
    }

    loadSaved()
    return () => {
      cancelled = true
    }
  }, [])

  async function savePreferences() {
    setStatus('Saving alert preferences...')
    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification_emails: parseEmails(email),
        daily_report_enabled: daily,
        abnormal_alerts_enabled: severe
      })
    })
    const result = await response.json()

    if (result.ok) {
      const saved = result.saved || {}
      setEmail(emailText(saved))
      setDaily(saved.daily_report_enabled !== false)
      setSevere(saved.abnormal_alerts_enabled !== false)
      setStatus(`Alert preferences saved${result.source ? ` to ${result.source}` : ''}.`)
      return
    }

    setStatus(result.error || 'Settings service did not save preferences.')
  }

  async function sendTest() {
    setStatus('Sending test alert...')
    const response = await fetch('/api/alerts/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, daily, severe })
    })
    const result = await response.json()
    setStatus(result.ok ? 'Test alert dispatched.' : result.error || 'Alert service did not send the test.')
  }

  return (
    <div className="panel settings-grid">
      <label>
        Email recipients
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alerts@example.com" />
      </label>
      <label><input type="checkbox" checked={daily} onChange={(event) => setDaily(event.target.checked)} /> Daily weather summary</label>
      <label><input type="checkbox" checked={severe} onChange={(event) => setSevere(event.target.checked)} /> Severe threshold alerts</label>
      <div className="settings-actions">
        <button type="button" onClick={savePreferences}>Save Preferences</button>
        <button type="button" onClick={sendTest}>Send Test Alert</button>
      </div>
      <div className="settings-status">{status}</div>
    </div>
  )
}
