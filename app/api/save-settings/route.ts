import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
const body = await req.json()

const payload = {
notification_emails: body.notification_emails || [],
notification_phones: body.notification_phones || [],
daily_report_time: body.daily_report_time || '07:00',
daily_report_enabled: body.daily_report_enabled ?? true,
abnormal_alerts_enabled: body.abnormal_alerts_enabled ?? true,
}

const existingQuery = await supabase
.from('station_settings')
.select('id')
.limit(1)
.maybeSingle()

if (existingQuery.error) {
return NextResponse.json({
ok: false,
stage: 'read_existing',
error: existingQuery.error.message,
})
}

if (existingQuery.data?.id) {
const updateQuery = await supabase
.from('station_settings')
.update(payload)
.eq('id', existingQuery.data.id)

if (updateQuery.error) {
return NextResponse.json({
ok: false,
stage: 'update_existing',
error: updateQuery.error.message,
payload,
})
}
} else {
const insertQuery = await supabase
.from('station_settings')
.insert(payload)

if (insertQuery.error) {
return NextResponse.json({
ok: false,
stage: 'insert_new',
error: insertQuery.error.message,
payload,
})
}
}

const verifyQuery = await supabase
.from('station_settings')
.select('*')
.limit(1)
.maybeSingle()

return NextResponse.json({
ok: true,
saved: verifyQuery.data || null,
})
}

export async function GET() {
const query = await supabase
.from('station_settings')
.select('*')
.limit(1)
.maybeSingle()

if (query.error) {
return NextResponse.json({
ok: false,
error: query.error.message,
})
}

return NextResponse.json(query.data || {})
}
