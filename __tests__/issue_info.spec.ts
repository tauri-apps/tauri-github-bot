import { Octokit } from "@octokit/rest";
import { it, expect } from "vitest"
import { getIssueInfoFromUrl } from "../src/util";


it("Parses issue info correctly from a GitHub url", async () => {
  let dummyOctokit = {
    issues: {
      async get(_: {}) {
        return { data: { state: 'closed' } }
      }
    }
  };
  let correctUrl = "https://github.com/tauri-apps/tauri/issues/165"
  //@ts-expect-error
  const [owner, repo, issue_number, state] = await getIssueInfoFromUrl(dummyOctokit as Octokit, correctUrl);

  expect(owner).toBe("tauri-apps")
  expect(repo).toBe("tauri")
  expect(issue_number).toBe(165)
  expect(state).toBe("closed")

  let wrongUrl = "https://github.com/tauri-apps/tauri/issues"
  const info = await getIssueInfoFromUrl(dummyOctokit as Octokit, wrongUrl);

  expect(info).toBeUndefined();

})
