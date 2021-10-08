# tauri-apps-bot

A bot for tauri-apps to automate various tasks.

## Commands:
tauri-apps-bot will be triggered whenever a comment is made with the command syntax by a tauri-apps org memeber:

- **`/upstream <owner>/<repo>`** - upstreams the issue to the specified repo. ex: `/upstream tauri-apps/tao`
  - on: `['issues']`
  - supported owners: `['tauri-apps']`
  - supported repos: `['tauri', 'tao', 'wry', 'win7-notifications']`
