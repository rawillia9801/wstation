# Hostinger Deployment

This project is configured for Hostinger Node.js hosting.

## App startup

Use:

```bash
npm install
npm run build
npm start
```

The production entrypoint is:

```bash
server.js
```

`npm start` runs `node server.js` and listens on `process.env.PORT`.

## Daily report cron

Create a Hostinger cron job that runs every 15 minutes:

```bash
cd /home/YOUR_ACCOUNT/domains/staleyclimate.info/public_html && npm run cron:daily-report
```

The app itself decides whether the daily report is due based on the saved report time and `REPORT_TIME_ZONE`.
Do not rely on an in-process `setInterval` scheduler on Hostinger. Hostinger can recycle Node apps that keep background work running, so the stable automatic path is the Hostinger cron job calling the API route.

Required environment variables:

```bash
SITE_URL=https://staleyclimate.info
RESEND_API_KEY=...
REPORT_TIME_ZONE=America/New_York
CRON_SECRET=...
```

If `CRON_SECRET` is configured, the cron script automatically passes it to `/api/send-daily-report`.
