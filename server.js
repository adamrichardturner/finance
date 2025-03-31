import express from 'express'
import compression from 'compression'
import { createRequestHandler } from '@remix-run/express'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUILD_DIR = path.join(__dirname, 'build')

const app = express()

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// Compress responses
app.use(compression())

// Add CORS headers if needed
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  next()
})

// Serve public files
app.use(express.static('public', { maxAge: '1h' }))

// Serve build files
app.use(express.static('build/client', { maxAge: '1y' }))

// Handle Remix requests
app.all(
  '*',
  createRequestHandler({
    build: await import('./build/server/index.js'),
    mode: process.env.NODE_ENV,
  })
)

// Determine port based on environment
const port =
  process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 6001)
const host = process.env.HOST || '0.0.0.0'

app.listen(port, host, () => {
  console.log(`Express server listening on http://${host}:${port}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})
