# Hostinger Deployment

This app runs as a Hostinger Node.js app. Scheduled reports and alarms should be triggered by a Hostinger Cron Job.

## Website App Startup

Use this startup command for the Node.js app:

```bash
npm start
```

`npm start` runs:

```bash
node server.js
```

## Automatic Reports and Alarms

Do not run anything manually every few minutes.

Create one Hostinger Cron Job. Hostinger will run it automatically.

The cron job should call the public cron URL:

```text
https://staleyclimate.info/api/cron
```

That cron URL checks both:

```text
Daily report: /api/send-daily-report logic
Alarms: /api/evaluate-alarms logic
```

The daily report only sends when the saved report time is due. Running the cron every 5 minutes does not send an email every 5 minutes.

## Recommended Hostinger Cron Setup

Choose **Custom**, not PHP.

Use this command:

```bash
curl -fsS https://staleyclimate.info/api/cron
```

Use this schedule:

```cron
*/5 * * * *
```

That means Hostinger calls the cron URL every 5 minutes automatically.

## If CRON_SECRET Is Set

If the Hostinger environment has `CRON_SECRET` set, add it to the URL:

```bash
curl -fsS "https://staleyclimate.info/api/cron?secret=YOUR_SECRET"
```

If `CRON_SECRET` is not set, use the plain URL command.

## Expected Cron Output

The **View Output** button should show JSON like this:

```json
{
  "ok": true,
  "dailyReport": {
    "skipped": true,
    "reason": "Daily report is not due yet"
  },
  "alarms": {
    "triggers": []
  }
}
```

When the saved report time is due, `dailyReport.sentCount` should be greater than `0`.

## Environment Variables

Set these in the Hostinger Node.js app environment:

```bash
SITE_URL=https://staleyclimate.info
REPORT_TIME_ZONE=America/New_York
RESEND_API_KEY=your_resend_key
CRON_SECRET=optional_secret
```

For SMS alerts:

```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_API_KEY_SID=your_twilio_api_key_sid
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret
TWILIO_FROM_NUMBER=+18555065425
```

## Manual Test URLs

Cron check without forcing a send:

```text
https://staleyclimate.info/api/cron
```

Manual forced daily report test:

```text
https://staleyclimate.info/api/send-daily-report?force=1
```
