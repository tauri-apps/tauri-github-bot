// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import nock from "nock";
import app from "../src";
import { Probot, ProbotOctokit } from "probot";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  makeUpstreamIssueBody,
  makeUpstreamIssueClosedComment,
} from "../src/templates";
import { BACKLOG_LABEL, UPSTREAM_LABEL } from "../src/constants";
import noUpstream from "./__fixtures__/no-upstream.json";
import upstreamSuccess from "./__fixtures__/upstream-success.json";
import upstreamFailPerm from "./__fixtures__/upstream-fail-perm.json";
import upstreamFailSameRepo from "./__fixtures__/upstream-fail-same_repo.json";
import issueClosed from "./__fixtures__/issue_closed.json";
import issueClosedUpstreamed from "./__fixtures__/issue_closed-upstreamed.json";
import issueClosedUpstreamedNotTauriBot from "./__fixtures__/issue_closed-upstreamed-not_tauri-bot.json";

describe("Tauri Github bot", () => {
  let probot;

  beforeEach(() => {
    process.env["TAURI_BOT_ACC_TOKEN"] = "test";
    nock.disableNetConnect();
    probot = new Probot({
      githubToken: "test",
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    app(probot);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  const inteceptListingOrgMembers = () => {
    nock("https://api.github.com")
      .get("/orgs/tauri-apps/members")
      .reply(200, [{ login: "username1" }, { login: "username2" }]);
  };

  it("issue comment, doesn't upstream an issue", async () => {
    await probot.receive({
      name: "issue_comment",
      payload: noUpstream,
    });
  });

  it("issue comment, upstreams an issue", async () => {
    inteceptListingOrgMembers();

    nock("https://api.github.com")
      .post("/repos/tauri-apps/tao/issues", (body) => {
        expect(body.body).toMatch(
          makeUpstreamIssueBody(
            upstreamSuccess.issue.html_url,
            upstreamSuccess.issue.body,
          ),
        );
        return true;
      })
      .reply(200);

    nock("https://api.github.com")
      .post(
        `/repos/tauri-apps/tauri/issues/${upstreamSuccess.issue.number}/labels`,
        (body) => {
          expect(body.labels).toMatchObject([UPSTREAM_LABEL]);
          return true;
        },
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      payload: upstreamSuccess,
    });
  });

  it("issue comment, doesn't upstream an issue, not enough permissions", async () => {
    inteceptListingOrgMembers();
    await probot.receive({ name: "issue_comment", payload: upstreamFailPerm });
  });

  it("issue comment, doesn't upstream an issue, same repo", async () => {
    inteceptListingOrgMembers();
    await probot.receive({
      name: "issue_comment",
      payload: upstreamFailSameRepo,
    });
  });

  it("issue closed, wasn't upstreamed", async () => {
    await probot.receive({
      name: "issues",
      payload: issueClosed,
    });
  });

  it("issue closed, was upstreamed, notifying original issue", async () => {
    nock("https://api.github.com")
      .get("/repos/tauri-apps/tauri/issues/90")
      .reply(200, { state: "open" });

    nock("https://api.github.com")
      .post(`/repos/tauri-apps/tauri/issues/90/comments`, (body) => {
        expect(body.body).toMatch(
          makeUpstreamIssueClosedComment(issueClosedUpstreamed.issue.html_url),
        );
        return true;
      })
      .reply(200);

    nock("https://api.github.com")
      .post(`/repos/tauri-apps/tauri/issues/90/labels`, (body) => {
        expect(body.labels).toMatchObject([BACKLOG_LABEL]);
        return true;
      })
      .reply(200);

    nock("https://api.github.com")
      .delete(
        `/repos/tauri-apps/tauri/issues/90/labels/${UPSTREAM_LABEL.replace(
          ":",
          "%3A",
        ).replace(" ", "%20")}`,
      )
      .reply(200);

    await probot.receive({
      name: "issues",
      payload: issueClosedUpstreamed,
    });
  });

  it("issue closed, was upstreamed, but original is closed, don't notify", async () => {
    nock("https://api.github.com")
      .get("/repos/tauri-apps/tauri/issues/90")
      .reply(200, { state: "closed" });

    await probot.receive({
      name: "issues",
      payload: issueClosedUpstreamed,
    });
  });

  it("issue closed, was upstreamed, but not from tauri-bot account, don't notify", async () => {
    await probot.receive({
      name: "issues",
      payload: issueClosedUpstreamedNotTauriBot,
    });
  });
});
