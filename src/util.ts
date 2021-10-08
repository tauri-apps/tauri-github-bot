import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'

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
