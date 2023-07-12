// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

export const UPSTREAM_ISSUE_BODY_PREDICATE =
  "> This issue has been upstreamed from";
export const UPSTREAM_ISSUE_BODY_SEPARATOR = "\n\n";
export function makeUpstreamIssueBody(
  originalIssueUrl: string,
  body: string,
): string {
  return `${UPSTREAM_ISSUE_BODY_PREDICATE} ${originalIssueUrl} ${UPSTREAM_ISSUE_BODY_SEPARATOR}${body}`;
}
export function makeUpstreamIssueClosedComment(url: string): string {
  return `Upstream issue at ${url} has been closed.`;
}
