// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { Probot } from "probot";
import {
  BACKLOG_LABEL,
  COMMAND_REGEX,
  TAURI_BOT_ACC,
  TAURI_BOT_ACC_OCTOKIT,
  TAURI_GITHUB_BOT,
  TAURI_ORG,
  UPSTREAM_LABEL,
} from "./constants";
import {
  makeUpstreamIssueBody,
  makeUpstreamIssueClosedComment,
  UPSTREAM_ISSUE_BODY_PREDICATE,
  UPSTREAM_ISSUE_BODY_SEPARATOR,
} from "./templates";
import { getIssueInfoFromUrl, isTauriOrgMemeber } from "./util";

export default (app: Probot): void => {
  try {
    app.on("issue_comment.created", async (context) => {
      const matches = COMMAND_REGEX.exec(context.payload.comment.body);
      if (!matches) return;

      const [, command, cOwner, cRepo] = matches;
      if (command == "upstream") {
        const { repository, sender } = context.payload;

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
          const { title, body, html_url, number } = context.payload.issue;

          app.log.info(
            `Running "/upstream" command from ${repository.owner.login}/${repository.name}#${number} to ${cOwner}/${cRepo} by ${sender.login}.`,
          );

          await TAURI_BOT_ACC_OCTOKIT.issues.create({
            title,
            body: makeUpstreamIssueBody(html_url, body ?? ""),
            labels: context.payload.issue.labels,
            repo: cRepo,
            owner: cOwner,
          });

          // add label
          await context.octokit.issues.addLabels(
            context.issue({
              labels: [UPSTREAM_LABEL],
              repo: repository.name,
              owner: cOwner,
            }),
          );
        }
      }
    });

    app.on("issues.closed", async (context) => {
      const { repository, issue } = context.payload;

      if (
        // an issue is closed in a tauri-apps repo
        repository.owner.login === TAURI_ORG &&
        // and was created by our bot
        (issue.user.login === TAURI_GITHUB_BOT ||
          // or was created by tauri-bot account
          issue.user.login === TAURI_BOT_ACC) &&
        // and it was from an upstream command
        issue.body?.startsWith(UPSTREAM_ISSUE_BODY_PREDICATE)
      ) {
        const originalIssueUrl = issue.body
          .replace(UPSTREAM_ISSUE_BODY_PREDICATE, "")
          .split(UPSTREAM_ISSUE_BODY_SEPARATOR)[0]
          .trim();

        let info = await getIssueInfoFromUrl(context.octokit, originalIssueUrl);

        if (!info) return;

        const [owner, repo, issue_number, state] = info;

        if (state === "closed") return;

        app.log.info(
          `Upstream issue ${repository.owner.login}/${repository.name}#${issue.number} has been closed; notifying original issue ${owner}/${repo}#${issue_number} .`,
        );

        // notify original issue that upstream is resolved
        await context.octokit.issues.createComment({
          body: makeUpstreamIssueClosedComment(issue.html_url),
          owner,
          repo,
          issue_number,
        });

        // add backlog label
        await context.octokit.issues.addLabels({
          labels: [BACKLOG_LABEL],
          owner,
          repo,
          issue_number,
        });

        // remove upstream label
        await context.octokit.issues.removeLabel({
          name: UPSTREAM_LABEL,
          owner,
          repo,
          issue_number,
        });
      }
    });
  } catch (e) {
    app.log.error(e as string);
  }
};
