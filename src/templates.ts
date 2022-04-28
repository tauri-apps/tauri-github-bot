export const UPSTREAM_ISSUE_BODY_PREDICATE =
  '> This issue has been upstreamed from'
export const UPSTREAM_ISSUE_BODY_SEPARATOR = '\n\n'
export function getUpstreamIssueBody(
  originalIssueUrl: string,
  body: string
): string {
  return `${UPSTREAM_ISSUE_BODY_PREDICATE} ${originalIssueUrl} ${UPSTREAM_ISSUE_BODY_SEPARATOR}${body}`
}
export function getUpstreamIssueClosedComment(url: string): string {
  return `Upstream issue at ${url} has been closed.`
}
