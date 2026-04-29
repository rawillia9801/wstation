import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const { data: settings } = await supabase.from('station_settings').select('*').limit(1).single()
  if (!settings) return NextResponse.json({ ok:false, error:'No settings' })

  const triggers:string[] = []

  if ((settings.current_wind || 0) > 30) triggers.push('Wind Advisory')
  if ((settings.current_uv || 0) > 7) triggers.push('High UV Exposure')
  if ((settings.current_temp_drop || 0) > 10) triggers.push('Rapid Temperature Drop')
  if ((settings.current_storm_probability || 0) > 40) triggers.push('Thunderstorm Probability High')

  for (const trigger of triggers) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-alert-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: trigger,
        message: `${trigger} exceeded configured abnormal weather threshold at Marion station.`
      })
    })
  }

  return NextResponse.json({ ok:true, triggers })
}
