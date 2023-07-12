// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { ProbotOctokit } from "probot";
import { it, expect, describe } from "vitest";
import { getIssueInfoFromUrl } from "../src/util";

let dummyOctokit = {
  issues: {
    async get(_: {}) {
      return { data: { state: "closed" } };
    },
  },
} as InstanceType<typeof ProbotOctokit>;

describe("Parses issue info correctly from a GitHub url", () => {
  it("Parses issue info correctly from a GitHub url", async () => {
    let url = "https://github.com/tauri-apps/tauri/issues/165";
    const [owner, repo, issue_number, state] = (await getIssueInfoFromUrl(
      dummyOctokit,
      url,
    ))!;
    expect(owner).toBe("tauri-apps");
    expect(repo).toBe("tauri");
    expect(issue_number).toBe(165);
    expect(state).toBe("closed");
  });

  it("Parses issue info correctly from a GitHub url", async () => {
    let url = "https://github.com/tauri-apps/tauri/issues";
    const info = await getIssueInfoFromUrl(dummyOctokit, url);

    expect(info).toBeUndefined();
  });
});
