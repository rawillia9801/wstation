import Link from 'next/link'

const updated = 'May 3, 2026'

export const metadata = {
  title: 'Privacy Policy | StaleyClimate.Info',
  description: 'Privacy policy and terms for StaleyClimate.Info weather alerts.'
}

function PrivacyPolicy() {
  return (
    <section className="legal-card">
      <p className="legal-kicker">Privacy Policy</p>
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This policy explains what information we collect, how we use it, and your choices regarding your information.</p>

      <h2>Information We Collect</h2>
      <p>We collect your mobile phone number and, if provided, your name or email address for the sole purpose of sending you weather alert messages.</p>

      <h2>How We Use Your Information</h2>
      <p>Your information is used exclusively to deliver weather alerts and related notifications. We do not share, sell, or disclose your information to third parties for marketing or any other purposes.</p>

      <h2>Opt-Out</h2>
      <p>You may opt out of receiving messages at any time by replying STOP to any message you receive from us. Your number will be promptly removed from our notification list.</p>

      <h2>Data Security</h2>
      <p>We take reasonable measures to protect your information from unauthorized access or disclosure.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about this policy, please contact us at <a href="tel:+12767804739">2767804739</a>.</p>

      <p className="legal-updated">Last updated: {updated}</p>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <nav className="legal-nav">
        <Link href="/">Staley Street Weather</Link>
        <span />
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
      <PrivacyPolicy />
    </main>
  )
}
