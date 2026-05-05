import './globals.css'
import './forecast-upgrade.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WStation Weather Intelligence Center',
  description: 'Advanced personal weather telemetry and forecast automation platform'
}

const weatherSceneStyles = `
.hero-panel[data-weather] .hero-bg,
.forecast-card[data-weather] .forecast-bg,
.camera-bg {
  transition: background 600ms ease, filter 600ms ease, opacity 600ms ease;
}

.hero-panel[data-weather='sunny'] .hero-bg {
  background:
    radial-gradient(circle at 72% 24%, rgba(255, 238, 88, .98), transparent 44px),
    radial-gradient(circle at 72% 24%, rgba(255, 164, 31, .36), transparent 118px),
    linear-gradient(180deg, rgba(64, 190, 255, .46), rgba(255, 191, 80, .23) 58%, rgba(7, 18, 26, .72)),
    linear-gradient(120deg, #1f80c8, #f7b24c 74%, #061320);
  filter: saturate(1.35) contrast(1.08) brightness(1.02);
}

.hero-panel[data-weather='cloudy'] .hero-bg {
  background:
    radial-gradient(ellipse at 35% 24%, rgba(242, 250, 255, .88), transparent 88px),
    radial-gradient(ellipse at 62% 28%, rgba(180, 202, 216, .70), transparent 118px),
    radial-gradient(ellipse at 80% 36%, rgba(92, 116, 130, .58), transparent 142px),
    linear-gradient(180deg, #25394a, #0a1620 58%, #02070d);
  filter: saturate(.9) contrast(1.1) brightness(.86);
}

.hero-panel[data-weather='rain'] .hero-bg {
  background:
    radial-gradient(circle at 72% 0%, rgba(210, 236, 255, .58), transparent 88px),
    linear-gradient(111deg, rgba(0, 0, 0, .84) 0 34%, rgba(0, 0, 0, .2) 50% 72%, rgba(0, 0, 0, .78) 100%),
    linear-gradient(180deg, #10273b, #07111c 48%, #02050a);
  filter: saturate(1.15) contrast(1.12) brightness(.82);
}

.hero-panel[data-weather='storm'] .hero-bg {
  background:
    radial-gradient(circle at 70% 0%, rgba(235, 250, 255, .82), transparent 88px),
    linear-gradient(112deg, transparent 0 46%, rgba(245, 250, 255, .96) 47%, transparent 49% 53%, rgba(154, 204, 255, .62) 54%, transparent 56% 100%),
    linear-gradient(111deg, rgba(0, 0, 0, .86) 0 34%, rgba(0, 0, 0, .22) 50% 72%, rgba(0, 0, 0, .82) 100%),
    linear-gradient(180deg, #08172d, #050b16 52%, #020408);
  filter: saturate(1.25) contrast(1.22) brightness(.78);
}

.hero-panel[data-weather='snow'] .hero-bg {
  background:
    radial-gradient(ellipse at 50% 18%, rgba(255, 255, 255, .90), transparent 112px),
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, .8), transparent 2px),
    radial-gradient(circle at 35% 42%, rgba(255, 255, 255, .9), transparent 2px),
    radial-gradient(circle at 58% 22%, rgba(255, 255, 255, .72), transparent 2px),
    radial-gradient(circle at 82% 38%, rgba(255, 255, 255, .84), transparent 2px),
    linear-gradient(180deg, #5d7381, #162632 60%, #03070c);
  filter: saturate(.74) contrast(1.12) brightness(.98);
}

.hero-panel[data-weather='fog'] .hero-bg {
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, .16) 0 2px, transparent 2px 26px),
    radial-gradient(ellipse at 50% 36%, rgba(255, 255, 255, .55), transparent 160px),
    linear-gradient(180deg, #6a7880, #23313a 58%, #060b10);
  filter: saturate(.55) contrast(.96) brightness(.88);
}

.hero-panel[data-weather='night'] .hero-bg {
  background:
    radial-gradient(circle at 72% 18%, rgba(238, 247, 255, .88), transparent 34px),
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, .82), transparent 1px),
    radial-gradient(circle at 35% 18%, rgba(255, 255, 255, .7), transparent 1px),
    radial-gradient(circle at 64% 42%, rgba(255, 255, 255, .82), transparent 1px),
    linear-gradient(180deg, #061637, #030814 62%, #010408);
  filter: saturate(1.05) contrast(1.14) brightness(.76);
}

.hero-panel[data-weather='rain'] .hero-bg::after,
.hero-panel[data-weather='storm'] .hero-bg::after {
  opacity: .82;
  background:
    repeating-linear-gradient(105deg, rgba(210, 238, 255, .34) 0 1px, transparent 1px 10px),
    linear-gradient(180deg, transparent, rgba(42, 160, 255, .16));
  animation: hero-rain 1.1s linear infinite;
}

.hero-panel[data-weather='snow'] .hero-bg::after {
  opacity: .92;
  background:
    radial-gradient(circle at 14% 12%, white, transparent 2px),
    radial-gradient(circle at 31% 32%, white, transparent 2px),
    radial-gradient(circle at 58% 18%, white, transparent 2px),
    radial-gradient(circle at 78% 36%, white, transparent 2px),
    radial-gradient(circle at 91% 16%, white, transparent 2px);
  animation: hero-snow 5.8s linear infinite;
}

.forecast-card[data-weather='sunny'] .forecast-bg {
  background-image: radial-gradient(circle at 65% 26%, rgba(255, 230, 66, .95), transparent 42px), linear-gradient(180deg, #2e9edc, #f0a83c 64%, #10202a) !important;
}

.forecast-card[data-weather='cloudy'] .forecast-bg {
  background-image: radial-gradient(ellipse at 40% 28%, rgba(240, 248, 255, .85), transparent 64px), radial-gradient(ellipse at 70% 34%, rgba(139, 164, 180, .72), transparent 80px), linear-gradient(180deg, #425666, #101b24) !important;
}

.forecast-card[data-weather='rain'] .forecast-bg {
  background-image: linear-gradient(180deg, #112b42, #050b12) !important;
}

.forecast-card[data-weather='storm'] .forecast-bg {
  background-image: linear-gradient(115deg, transparent 0 45%, rgba(245, 250, 255, .92) 46%, transparent 48% 100%), linear-gradient(180deg, #0a1233, #02040a) !important;
}

.forecast-card[data-weather='snow'] .forecast-bg {
  background-image: radial-gradient(circle at 20% 18%, white, transparent 2px), radial-gradient(circle at 48% 35%, white, transparent 2px), radial-gradient(circle at 72% 21%, white, transparent 2px), linear-gradient(180deg, #78909f, #13222d) !important;
}

.forecast-card[data-weather='night'] .forecast-bg {
  background-image: radial-gradient(circle at 72% 20%, rgba(238, 247, 255, .86), transparent 28px), linear-gradient(180deg, #061637, #02050b) !important;
}

@keyframes hero-rain {
  from { background-position: 0 0, 0 0; }
  to { background-position: -30px 78px, 0 0; }
}

@keyframes hero-snow {
  from { background-position: 0 0, 0 0, 0 0, 0 0, 0 0; }
  to { background-position: -12px 68px, 16px 84px, -8px 76px, 22px 90px, -18px 72px; }
}
`

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
        <style dangerouslySetInnerHTML={{ __html: weatherSceneStyles }} />
        <script dangerouslySetInnerHTML={{ __html: weatherStateScript }} />
      </body>
    </html>
  )
}