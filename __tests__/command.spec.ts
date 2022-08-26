// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { it, expect, describe } from "vitest";
import { COMMAND_REGEX } from "../src/constants";

describe("Parses command info from a GitHub comment", () => {
  it("Parses upstream command", async () => {
    const comment = "/upstream tauri-apps/tao";
    const [, command, owner, repo] = COMMAND_REGEX.exec(comment)!;
    expect(command).toBe("upstream");
    expect(owner).toBe("tauri-apps");
    expect(repo).toBe("tao");
  });

  it("Parses nothing from a slash predicated comment ", async () => {
    const comment = "/downstream rust-lang/rust";
    const matches = COMMAND_REGEX.exec(comment);
    expect(matches).toBeNull();
  });

  it("Parses nothing", async () => {
    const comment = "fasdk asfjadf asd;klajsdf qwrpo";
    const matches = COMMAND_REGEX.exec(comment);
    expect(matches).toBeNull();
  });
});
