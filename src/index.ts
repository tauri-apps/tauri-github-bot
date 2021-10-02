import { checkBot } from './auth'
import { getNewTasks, runUpstreamTasks } from './task'

async function run() {
  await checkBot()
  const tasks = await getNewTasks()
  await runUpstreamTasks(tasks)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
