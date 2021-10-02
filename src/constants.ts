import { Octokit } from '@octokit/rest'

export const TAURI_BOT_NAME = 'tauri-bot'
export const TAURI_ORG_NAME = 'tauri-apps'
export const TAURI_REPO_NAME = 'tauri'
export const octokit = new Octokit({
  auth: process.env.TAURI_BOT_TOKEN,
})
