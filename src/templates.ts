export const upstreamIssueBody = (ogIssueUrl: string, body: string): string =>
  `> This issue has been upstream from ${ogIssueUrl} \n\n ${body}`
export const issueUpstreamedComment = (url: string): string =>
  `I have created an upstream issue at ${url}, I will notify you once it is resolved.`
