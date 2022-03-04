import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'
import { TAURI_BOT_ACC_TOKEN, TAURI_ORG } from './constants'

export async function getIssueFromUrl(
  octokit: Octokit,
  url: string
): Promise<
  RestEndpointMethodTypes['issues']['get']['response']['data'] | undefined
> {
  const matches = /\.github\.com\/(.+?)\/(.+?)\/issues\/([0-9]+)$/.exec(url)
  if (!matches) return

  const [, owner, repo, issue_number] = matches

  if (!+issue_number) return

  return (
    await octokit.issues.get({ issue_number: +issue_number, owner, repo })
  ).data
}

export async function isTauriOrgMemeber(user: string): Promise<boolean> {
  if (TAURI_BOT_ACC_TOKEN) {
    let octokit = new Octokit({ auth: TAURI_BOT_ACC_TOKEN })
    return (await octokit.orgs.listMembers({ org: TAURI_ORG })).data
      .map((u) => u.login)
      .includes(user)
  } else {
    return false
  }
}
