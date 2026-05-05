import './globals.css'
import './forecast-upgrade.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WStation Weather Intelligence Center',
  description: 'Advanced personal weather telemetry and forecast automation platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}