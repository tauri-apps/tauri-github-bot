import { Octokit } from '@octokit/rest'
import { Probot } from 'probot'
import {
  COMMAND_REGEX,
  TAURI_APPS_BOT,
  TAURI_BOT_ACC,
  TAURI_BOT_ACC_OCTOKIT,
  TAURI_ORG,
  UPSTREAM_LABEL,
  UPSTREAM_RESOLVED_LABEL,
} from './constants'
import {
  getUpstreamIssueBody,
  UPSTREAM_ISSUE_BODY_PREDICATE,
  getUpstreamIssueClosedComment,
  UPSTREAM_ISSUE_BODY_SEPARATOR,
} from './templates'
import { getIssueFromUrl, isTauriOrgMemeber } from './util'

export default (app: Probot): void => {
  try {
    app.on('issue_comment.created', async (context) => {
      const matches = COMMAND_REGEX.exec(context.payload.comment.body)
      if (!matches) return

      const [, command, cOwner, cRepo] = matches
      if (command == 'upstream') {
        const { repository, sender } = context.payload

        if (
          // commands from bot is not allowed
          !context.isBot &&
          // only upstream if it is not the same repo
          !(cRepo === repository.name && cOwner === repository.owner.login) &&
          // only upstream to a repo that belongs to tauri-apps
          repository.owner.login === TAURI_ORG &&
          // only upstream from a user that is a memeber in tauri-apps org
          (await isTauriOrgMemeber(sender.login))
        ) {
          app.log.info(
            `Running \`/upstream\` command to ${cOwner}/${cRepo} from ${sender.login}.`
          )

          // create upstream issue
          const { title, body, html_url } = context.payload.issue

          await TAURI_BOT_ACC_OCTOKIT.issues.create({
            title,
            body: getUpstreamIssueBody(html_url, body ?? ''),
            labels: context.payload.issue.labels,
            repo: cRepo,
            owner: cOwner,
          })

          // add label
          await context.octokit.issues.addLabels(
            context.issue({
              labels: [UPSTREAM_LABEL],
              repo: repository.name,
              owner: cOwner,
            })
          )
        }
      }
    })

    app.on('issues.closed', async (context) => {
      const { repository, issue } = context.payload

      if (
        // an issue is closed in a tauri-apps repo
        repository.owner.login === TAURI_ORG &&
        // and was created by our bot
        (issue.user.login === TAURI_APPS_BOT ||
          // or was created by tauri-bot account
          issue.user.login === TAURI_BOT_ACC) &&
        // and it was from an upstream command
        issue.body?.startsWith(UPSTREAM_ISSUE_BODY_PREDICATE)
      ) {
        const originalIssueUrl = issue.body
          .replace(UPSTREAM_ISSUE_BODY_PREDICATE, '')
          .split(UPSTREAM_ISSUE_BODY_SEPARATOR)[0]
          .trim()

        const originalIssue = await getIssueFromUrl(
          context.octokit,
          originalIssueUrl
        )

        if (!originalIssue?.repository) return

        // notify original issue that upstream is resolved
        await context.octokit.issues.createComment({
          body: getUpstreamIssueClosedComment(issue.html_url),
          owner: originalIssue.repository.owner.name ?? TAURI_ORG,
          repo: originalIssue.repository.name,
          issue_number: originalIssue.number,
        })

        // add upstream resolved label
        await context.octokit.issues.addLabels({
          labels: [UPSTREAM_RESOLVED_LABEL],
          owner: originalIssue.repository.owner.name ?? TAURI_ORG,
          repo: originalIssue.repository.name,
          issue_number: originalIssue.number,
        })

        // remove upstream label
        await context.octokit.issues.removeLabel({
          name: UPSTREAM_LABEL,
          owner: originalIssue.repository.owner.name ?? TAURI_ORG,
          repo: originalIssue.repository.name,
          issue_number: originalIssue.number,
        })
      }
    })
  } catch (e) {
    app.log.error(e as string)
  }
}
