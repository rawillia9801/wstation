import Link from 'next/link'

const updated = 'May 3, 2026'

export const metadata = {
  title: 'SMS Consent Proof | StaleyClimate.Info',
  description: 'Proof of consumer opt-in consent for StaleyClimate.Info weather alert text messages.'
}

function ConsentProof() {
  return (
    <section className="legal-card">
      <p className="legal-kicker">SMS Consent Proof</p>
      <h1>StaleyClimate.Info Weather Alerts Opt-In</h1>
      <p>
        This page explains how mobile subscribers give consent to receive weather alert text messages from
        StaleyClimate.Info Weather Alerts, operated by SWVA Chihuahua LLC.
      </p>

      <h2>Program Details</h2>
      <dl className="legal-list">
        <div><dt>Program Name</dt><dd>StaleyClimate.Info Weather Alerts</dd></div>
        <div><dt>Sender</dt><dd>SWVA Chihuahua LLC</dd></div>
        <div><dt>Message Purpose</dt><dd>Weather alerts, severe weather notifications, station alerts, and related local weather updates.</dd></div>
        <div><dt>Message Frequency</dt><dd>Message frequency varies based on weather conditions and selected alerts.</dd></div>
        <div><dt>Message &amp; Data Rates</dt><dd>Message and data rates may apply.</dd></div>
      </dl>

      <h2>How Consent Is Collected</h2>
      <p>
        A subscriber gives consent by requesting to be added to the StaleyClimate.Info Weather Alerts notification
        list and providing their mobile phone number for weather alert messaging. The number is then entered into
        the site&apos;s SMS phone number list by the site operator.
      </p>
      <p>
        Before receiving weather alert text messages, subscribers are informed that they are signing up for recurring
        weather alert messages from StaleyClimate.Info Weather Alerts, that message frequency varies, that message
        and data rates may apply, and that they can reply STOP to opt out or HELP for help.
      </p>

      <h2>Opt-In Disclosure</h2>
      <p className="consent-disclosure">
        By providing your mobile number, you consent to receive recurring weather alert text messages from
        StaleyClimate.Info Weather Alerts. Message frequency varies based on weather conditions and alerts.
        Message and data rates may apply. Reply STOP to cancel. Reply HELP for help.
      </p>

      <h2>Opt-Out and Help</h2>
      <p>
        Subscribers may opt out at any time by replying STOP to any message. For help, subscribers may reply HELP
        or contact support at <a href="tel:+12767804739">2767804739</a>.
      </p>

      <h2>Related Policies</h2>
      <p>
        The program&apos;s <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms &amp; Conditions</Link>
        are publicly available on this website.
      </p>

      <p className="legal-updated">Last updated: {updated}</p>
    </section>
  )
}

export default function ConsentPage() {
  return (
    <main className="legal-shell">
      <nav className="legal-nav">
        <Link href="/">Staley Street Weather</Link>
        <span />
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/consent">Consent</Link>
      </nav>
      <ConsentProof />
      <footer className="site-footer legal-footer">
        <span>© 2026 SWVA Chihuahua LLC. All rights reserved. WeatherClimate.info is operated by SWVA Chihuahua LLC. For terms of use and privacy policy, please visit <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms &amp; Conditions</Link>.</span>
      </footer>
    </main>
  )
}
