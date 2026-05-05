import './globals.css'
import './forecast-upgrade.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WStation Weather Intelligence Center',
  description: 'Advanced personal weather telemetry and forecast automation platform'
}

const weatherStateScript = `
(() => {
  const classify = (raw, daylight = true) => {
    const text = String(raw || '').toLowerCase();
    if (!text || text.includes('unavailable')) return 'unknown';
    if (text.includes('snow') || text.includes('sleet') || text.includes('flurr')) return 'snow';
    if (text.includes('thunder') || text.includes('storm') || text.includes('lightning')) return 'storm';
    if (text.includes('rain') || text.includes('shower') || text.includes('drizzle')) return 'rain';
    if (text.includes('fog') || text.includes('mist') || text.includes('haze') || text.includes('smoke')) return 'fog';
    if (text.includes('cloud') || text.includes('overcast')) return 'cloudy';
    if (text.includes('clear') && !daylight) return 'night';
    if (text.includes('sun') || text.includes('clear')) return 'sunny';
    return daylight ? 'cloudy' : 'night';
  };

  const applyWeatherStates = () => {
    const hero = document.querySelector('.hero-panel');
    const heroCondition = hero?.querySelector('.condition-glyph strong')?.textContent || '';
    const isNight = /clear|mostly clear/i.test(heroCondition) && !/sunny/i.test(heroCondition);
    if (hero) hero.setAttribute('data-weather', classify(heroCondition, !isNight));

    document.querySelectorAll('.forecast-card').forEach((card) => {
      const condition = card.querySelector('.forecast-condition')?.textContent || '';
      card.setAttribute('data-weather', classify(condition, true));
    });
  };

  applyWeatherStates();
  const observer = new MutationObserver(applyWeatherStates);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: weatherStateScript }} />
      </body>
    </html>
  )
}