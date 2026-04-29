export function buildDailyForecastEmail(data: any) {
  return {
    subject: `Staley Climate Daily Forecast • ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#06111d;color:#ffffff;padding:30px;">
        <h1 style="color:#67e8f9;">Staley Street Weather Daily Outlook</h1>
        <p><strong>Current Temp:</strong> ${data.temp}°F</p>
        <p><strong>Humidity:</strong> ${data.humidity}%</p>
        <p><strong>Pressure:</strong> ${data.pressure} inHg</p>
        <p><strong>Wind:</strong> ${data.wind} mph</p>
        <p><strong>UV Index:</strong> ${data.uv}</p>
        <hr style="border-color:#164e63;" />
        <p><strong>Today High:</strong> ${data.high}°F</p>
        <p><strong>Today Low:</strong> ${data.low}°F</p>
        <p><strong>Forecast:</strong> ${data.summary}</p>
        <p><strong>Hungry Mother Swim Advisory:</strong> Water Temp ${data.waterTemp}°F • Quality ${data.waterQuality} • UV ${data.uvRisk}</p>
      </div>
    `,
    text: `Staley Street Weather Daily Outlook | Temp ${data.temp}F | High ${data.high}F | Low ${data.low}F | ${data.summary}`
  }
}

export function buildAlertEmail(type: string, message: string) {
  return {
    subject: `⚠ Weather Alert Triggered: ${type}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#1e0404;color:#fff;padding:30px;">
        <h1 style="color:#f87171;">Staley Climate Alert Center</h1>
        <p><strong>${type}</strong></p>
        <p>${message}</p>
        <p>This abnormal weather condition triggered your custom notification center.</p>
      </div>
    `,
    text: `${type}: ${message}`
  }
}
