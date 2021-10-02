import { RestEndpointMethodTypes } from '@octokit/rest'
import { createLogger, transports, format } from 'winston'
import { octokit, TAURI_ORG_NAME } from './constants'

export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.timestamp({ format: 'MM/DD HH:mm' }),
        format.printf(
          (info) =>
            `${info.level} ${info.timestamp} | ${info.message}${
              info.splat !== undefined ? `${info.splat}` : ' '
            }`
        )
      ),
    }),
    new transports.File({
      format: format.json(),
      filename: 'error.log',
      level: 'error',
    }),
  ],
})

export async function isIssueOpen(url: string): Promise<boolean> {
  return (await octokit.request(url)).data.state === 'open'
}

export async function getIssueFromUrl(
  url: string
): Promise<
  RestEndpointMethodTypes['issues']['get']['response']['data'] | undefined
> {
  const matches =
    /api\.github\.com\/repos\/(.+?)\/(.+?)\/issues\/([0-9]+)$/.exec(url)
  if (!matches) return

  const [, owner, repo, issue_number] = matches

  if (!+issue_number) return

  return (
    await octokit.issues.get({ issue_number: +issue_number, owner, repo })
  ).data
}

export function getCommentIdFromUrl(url: string): number {
  return +url.split('/').splice(-1)[0]
}

export async function isTauriOrgMember(user: string): Promise<boolean> {
  const members = (
    await octokit.orgs.listMembers({ org: TAURI_ORG_NAME })
  ).data.map((i) => i.login)
  console.log(members)
  return members.includes(user)
}
