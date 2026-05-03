# Hostinger Deployment

This app runs as a Hostinger Node.js app. Hostinger should start the website process, and Hostinger Cron should trigger the scheduled report/alarm checks automatically.

## Website App

Use this startup command for the Node.js app:

```bash
npm start
```

`npm start` runs:

```bash
node server.js
```

The app listens on the `PORT` value provided by Hostinger.

## Automatic Reports and Alarms

Do not run this manually every few minutes. Create one Hostinger cron job and Hostinger will run it automatically.

Recommended cron frequency: every 5 minutes.

That does not mean the daily report sends every 5 minutes. The cron job only asks the app, "Is anything due right now?" The app checks the saved daily report time from the website settings and only sends when that time window is due.

The same cron job also checks weather alarms so alerts can be sent without someone pressing a button.

## Cron Command

In Hostinger, go to Advanced -> Cron Jobs and create a cron job with this command:

```bash
cd /home/YOUR_HOSTINGER_USER/domains/staleyclimate.info/public_html && npm run cron:daily-report
```

Replace `YOUR_HOSTINGER_USER` with the real Hostinger account folder name.

If your app files are not in `public_html`, use the folder where `package.json` is located.

## Cron Schedule

Use every 5 minutes if Hostinger gives you a simple interval selector.

If Hostinger asks for cron syntax, use:

```cron
*/5 * * * *
```

Every 15 minutes also works:

```cron
*/15 * * * *
```

Every 5 minutes is better because the daily report send window is short and alarms are more time-sensitive.

## Required Environment Variables

Set these in the Hostinger Node.js app environment:

```bash
SITE_URL=https://staleyclimate.info
REPORT_TIME_ZONE=America/New_York
RESEND_API_KEY=your_resend_key
CRON_SECRET=your_secret_if_using_one
```

For SMS alerts, also set:

```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_API_KEY_SID=your_twilio_api_key_sid
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret
TWILIO_FROM_NUMBER=+18555065425
```

## What the Cron Script Does

The npm script is:

```bash
npm run cron:daily-report
```

That runs:

```bash
node scripts/hostinger-daily-report.mjs
```

The script calls these app routes:

```text
/api/send-daily-report
/api/evaluate-alarms
```

`/api/send-daily-report` sends only if the saved report time is currently due.

`/api/evaluate-alarms` checks thresholds and sends alarm emails/SMS if an alarm is triggered.

## Manual Test

The Reports page button still manually triggers:

```text
/api/send-daily-report?force=1
```

That button is only for testing. The automatic path is the Hostinger cron job.
