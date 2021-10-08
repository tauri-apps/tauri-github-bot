export const upstreamIssueBodyPredicate = '> This issue has been upstream from'
export const upstreamIssueBody = (
  originalIssueUrl: string,
  body: string
): string => `${upstreamIssueBodyPredicate} ${originalIssueUrl} \n\n${body}`
export const issueUpstreamedComment = (url: string): string =>
  `I have created an upstream issue at ${url}, I will notify you once it is resolved.`
export const upstreamIssueResolved = (url: string): string =>
  `Upstream issue at ${url} probably got resolved.`
