import { BOT_NAME, octokit, ORG_NAME } from './constants'
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

const REGEX_UPSTREAM = new RegExp(`@${BOT_NAME} upstream (tao|wry)`, 'i')

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
      e.repository.owner.login === ORG_NAME &&
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
      owner: issue.repository?.owner.login ?? ORG_NAME,
      repo: issue.repository?.name ?? 'tauri',
    })
    if (!user || (await isTauriOrgMember(user.login))) continue

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

  for (const t of tasks) {
    const newIssue = (
      await octokit.issues.create({
        owner: ORG_NAME,
        repo: t.upstreamRepo,
        title: t.issue.title,
        body: upstreamIssueBody(t.issue.url, t.issue.body),
      })
    ).data

    await octokit.issues.createComment({
      owner: ORG_NAME,
      repo: t.originalRepo,
      body: issueUpstreamedComment(newIssue.html_url),
      issue_number: t.issue.number,
    })

    await octokit.issues.addLabels({
      owner: ORG_NAME,
      repo: t.originalRepo,
      issue_number: t.issue.number,
      labels: ['status: upstream'],
    })
  }
}
