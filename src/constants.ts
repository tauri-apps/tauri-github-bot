import { Octokit } from "@octokit/rest";

export const TAURI_GITHUB_BOT = "tauri-apps[bot]";
/** https://github.com/tauri-bot account */
export const TAURI_BOT_ACC = "tauri-bot";
export const TAURI_BOT_ACC_TOKEN = process.env.TAURI_BOT_ACC_TOKEN;
export const TAURI_BOT_ACC_OCTOKIT = new Octokit({ auth: TAURI_BOT_ACC_TOKEN });
export const TAURI_ORG = "tauri-apps";

export const COMMAND_REGEX = /^\/(upstream) (.+?)\/(.+)/;

export const UPSTREAM_LABEL = "status: upstream";
export const BACKLOG_LABEL = "status: backlog";
