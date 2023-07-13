// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { ProbotOctokit } from "probot";
import { TAURI_BOT_ACC_OCTOKIT, TAURI_ORG } from "./constants";

export async function getIssueInfoFromUrl(
  octokit: InstanceType<typeof ProbotOctokit>,
  url: string,
): Promise<[string, string, number, string] | undefined> {
  const matches = /\.*github\.com\/(.+?)\/(.+?)\/issues\/([0-9]+)$/.exec(url);
  if (!matches) return;

  const [, owner, repo, issue_number] = matches;

  if (!+issue_number) return;

  return [
    owner,
    repo,
    +issue_number,
    (await octokit.issues.get({ issue_number: +issue_number, owner, repo }))
      .data.state,
  ];
}

export async function isTauriOrgMemeber(user: string): Promise<boolean> {
  return (await TAURI_BOT_ACC_OCTOKIT.orgs.listMembers({ org: TAURI_ORG })).data
    .map((u: { login: string }) => u.login)
    .includes(user);
}
