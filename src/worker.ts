import app from './bot'
import { Probot } from 'probot'

declare global {
  const APP_ID: string
  const PRIVATE_KEY: string
  const WEBHOOK_SECRET: string
}

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  )
})

async function handleRequest(request: Request) {
  const probot = new Probot({
    appId: APP_ID,
    privateKey: PRIVATE_KEY,
    secret: WEBHOOK_SECRET,
  })
  await probot.load(app)
  return new Response('', { status: 200 })
}
