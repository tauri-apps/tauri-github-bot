import {
  octokit,
  TAURI_BOT_NAME,
  TAURI_ORG_NAME,
  TAURI_REPO_NAME,
} from './constants'
import { upstreamIssueBodyPredicate, upstreamIssueResolved } from './templates'
import { getIssueFromUrl, logger } from './utils'

export async function notify(upstreamurl: string): Promise<void> {
  const upstreamIssue = await getIssueFromUrl(upstreamurl)
  if (!upstreamIssue || upstreamIssue.user?.login !== TAURI_BOT_NAME) return

  const ogIssueUrl = upstreamIssue.body
    ?.replace(upstreamIssueBodyPredicate, '')
    .split('\n\n')[0]
    .trim()
  if (!ogIssueUrl) return

  const issue = await getIssueFromUrl(ogIssueUrl)
  if (!issue) return

  logger.info(
    `Notifying issue (${TAURI_ORG_NAME}/${
      issue.repository?.name ?? TAURI_REPO_NAME
    }#${issue.number})...`
  )
  await octokit.issues.createComment({
    owner: TAURI_ORG_NAME,
    repo: issue.repository?.name ?? TAURI_REPO_NAME,
    body: upstreamIssueResolved,
    issue_number: issue.number,
  })

  logger.info(
    `Adding upstream resolved label to origianl issue (${TAURI_ORG_NAME}/${
      issue.repository?.name ?? TAURI_REPO_NAME
    }#${issue.number}).`
  )
  await octokit.issues.addLabels({
    owner: TAURI_ORG_NAME,
    repo: issue.repository?.name ?? TAURI_REPO_NAME,
    issue_number: issue.number,
    labels: ['status: upstream resolved'],
  })
}
