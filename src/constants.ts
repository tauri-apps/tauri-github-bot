import { Octokit } from '@octokit/rest'

export const BOT_NAME = 'tauri-bot'
export const ORG_NAME = 'tauri-apps'
export const octokit = new Octokit({
  auth: process.env.TAURI_BOT_TOKEN,
})
