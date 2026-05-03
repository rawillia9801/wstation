import Link from 'next/link'

const updated = 'May 3, 2026'

export const metadata = {
  title: 'Terms and Conditions | StaleyClimate.Info',
  description: 'Terms and privacy policy for StaleyClimate.Info weather alerts.'
}

function Terms() {
  return (
    <section className="legal-card">
      <p className="legal-kicker">Terms and Conditions</p>
      <h1>Terms and Conditions</h1>

      <dl className="legal-list">
        <div><dt>Program Name</dt><dd>StaleyClimate.Info Weather Alerts</dd></div>
        <div><dt>Description</dt><dd>Receive weather alerts and important notifications related to your area.</dd></div>
        <div><dt>Message Frequency</dt><dd>Message frequency will vary based on weather conditions and alerts.</dd></div>
        <div><dt>Message &amp; Data Rates</dt><dd>Message and data rates may apply. Please check with your mobile carrier.</dd></div>
      </dl>

      <h2>Opt-In</h2>
      <p>You will only receive messages if you have requested to be added to our notification list. By providing your mobile number, you consent to receive recurring weather alert messages from us.</p>

      <h2>Opt-Out</h2>
      <p>You may opt out at any time by replying STOP to any message. For help, reply HELP or contact us at <a href="tel:+12767804739">2767804739</a>.</p>

      <h2>Privacy</h2>
      <p>We respect your privacy. Please see our <Link href="/privacy">Privacy Policy</Link> for details on how your information is handled.</p>

      <h2>Support</h2>
      <p>For support, contact <a href="tel:+12767804739">2767804739</a>.</p>

      <h2>Changes to Terms</h2>
      <p>We may update these terms from time to time. Continued use of the service constitutes acceptance of the new terms.</p>

      <p className="legal-updated">Last updated: {updated}</p>
    </section>
  )
}

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <nav className="legal-nav">
        <Link href="/">Staley Street Weather</Link>
        <span />
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/consent">Consent</Link>
      </nav>
      <Terms />
      <footer className="site-footer legal-footer">
        <span>© 2026 SWVA Chihuahua LLC. All rights reserved. WeatherClimate.info is operated by SWVA Chihuahua LLC. For terms of use and privacy policy, please visit <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms &amp; Conditions</Link>.</span>
      </footer>
    </main>
  )
}
