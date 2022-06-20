# tauri-github-bot
A GitHub bot for tauri-apps org to automate various tasks and intended to used only by tauri-apps org members.

## Commands:
> Commands are comments on issues or pull requests, that start with a special syntax.
- **`/upstream <owner>/<upstream-repo>`** - creates an issue at the specified upstream repo and notifies back once upstream gets closed.
  - on: `['issues']`
  - by: `['member of tauri-apps']`
  - supported owners: `['tauri-apps']`
  - supported upstream repos: `['tauri-apps/*']`
