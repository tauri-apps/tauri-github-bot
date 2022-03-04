import { Octokit } from '@octokit/rest'

/** the Github App (bot) name  */
export const TAURI_APPS_BOT = 'tauri-apps[bot]'
/** https://github.com/tauri-bot account */
export const TAURI_BOT_ACC = 'tauri-bot'
export const TAURI_BOT_ACC_TOKEN = process.env.TAURI_BOT_ACC_TOKEN
export const TAURI_BOT_ACC_OCTOKIT = new Octokit({ auth: TAURI_BOT_ACC_TOKEN })
export const TAURI_ORG = 'tauri-apps'
export const COMMAND_REGEX = /^\/(upstream) (.+?)\/(.+)/
export const UPSTREAM_LABEL = 'status: upstream'
export const UPSTREAM_RESOLVED_LABEL = 'status: upstream (resolved)'
