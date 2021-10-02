import { BOT_NAME, octokit } from './constants'

export async function checkBot(): Promise<void> {
  try {
    const { data: user } = await octokit.users.getAuthenticated()

    if (!user || user.login !== BOT_NAME) {
      console.error('Invalid GITHUB_TOKEN provided.')
      process.exit(1)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
