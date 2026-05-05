const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3000)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(port, hostname, () => {
    console.log(`Staley Weather app listening on http://${hostname}:${port}`)
  })
}).catch((error) => {
  console.error('Failed to start Staley Weather app', error)
  process.exit(1)
})
