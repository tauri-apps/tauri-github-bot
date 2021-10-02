import {
  TAURI_BOT_NAME,
  octokit,
  TAURI_ORG_NAME,
  TAURI_REPO_NAME,
} from './constants'
import {
  getCommentIdFromUrl,
  getIssueFromUrl,
  isIssueOpen,
  isTauriOrgMember,
  logger,
} from './utils'
import pFilter from 'p-filter'
import chalk from 'chalk'
import { issueUpstreamedComment, upstreamIssueBody } from './templates'

interface Task {
  issue: {
    number: number
    body: string
    title: string
    url: string
  }
  upstreamRepo: string
  originalRepo: string
}

const REGEX_UPSTREAM = new RegExp(`@${TAURI_BOT_NAME} upstream (tao|wry)`, 'i')

export async function getNewTasks(): Promise<Task[]> {
  logger.info('checking notifications...')
  const notifications = await pFilter(
    (
      await octokit.activity.listNotificationsForAuthenticatedUser({
        all: false,
      })
    ).data,
    async (e) =>
      e.reason === 'mention' &&
      e.subject.type === 'Issue' &&
      e.repository.owner.login === TAURI_ORG_NAME &&
      (await isIssueOpen(e.subject.url))
  )
  logger.info(`found ${chalk.blue(notifications.length)} valid notifications.`)
  octokit.activity.markNotificationsAsRead()

  const tasks: Task[] = []
  for (const i of notifications) {
    const issue = await getIssueFromUrl(i.subject.url)
    const comment_id = getCommentIdFromUrl(i.subject.latest_comment_url)
    if (!issue || !comment_id) continue

    const {
      data: { body = '', user },
    } = await octokit.issues.getComment({
      comment_id,
      owner: issue.repository?.owner.login ?? TAURI_ORG_NAME,
      repo: issue.repository?.name ?? TAURI_REPO_NAME,
    })
    if (!user || !(await isTauriOrgMember(user.login))) continue

    logger.info(
      `comment received on ${chalk.green(
        `${issue.repository?.owner.login}/${issue.repository?.name}#${issue.number}(@${user.login})`
      )} ${chalk.blue(body)}`
    )

    const matches = body.match(REGEX_UPSTREAM)
    if (!matches) continue

    tasks.push({
      originalRepo: issue.repository?.name ?? 'tauri',
      upstreamRepo: matches[0].split(' ')[2],
      issue: {
        number: issue.number,
        title: issue.title,
        body: issue.body ?? '',
        url: issue.html_url,
      },
    })
  }

  return tasks
}

export async function runUpstreamTasks(tasks: Task[]): Promise<void> {
  if (tasks.length === 0) return
  logger.info('running upstream tasks...')

  for (const t of tasks) {
    logger.info(`creating an issue at ${TAURI_ORG_NAME}/${t.upstreamRepo}...`)
    const newIssue = (
      await octokit.issues.create({
        owner: TAURI_ORG_NAME,
        repo: t.upstreamRepo,
        title: t.issue.title,
        body: upstreamIssueBody(t.issue.url, t.issue.body),
      })
    ).data

    logger.info(
      `Commenting on original issue (${TAURI_ORG_NAME}/${t.originalRepo}#${t.issue.number})...`
    )
    await octokit.issues.createComment({
      owner: TAURI_ORG_NAME,
      repo: t.originalRepo,
      body: issueUpstreamedComment(newIssue.html_url),
      issue_number: t.issue.number,
    })

    logger.info(
      `Adding upstream label to origianl issue (${TAURI_ORG_NAME}/${t.originalRepo}#${t.issue.number}).`
    )
    await octokit.issues.addLabels({
      owner: TAURI_ORG_NAME,
      repo: t.originalRepo,
      issue_number: t.issue.number,
      labels: ['status: upstream'],
    })
  }
  logger.info('Finished upstream tasks.')
}
