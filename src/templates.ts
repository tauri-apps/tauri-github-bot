export const upstreamIssueBodyPredicate = '> This issue has been upstream from'
export const upstreamIssueBody = (ogIssueUrl: string, body: string): string =>
  `${upstreamIssueBodyPredicate} ${ogIssueUrl} \n\n ${body}`
export const issueUpstreamedComment = (url: string): string =>
  `I have created an upstream issue at ${url}, I will notify you once it is resolved.`
export const upstreamIssueResolved = 'Upstream issue probably got resolved.'
