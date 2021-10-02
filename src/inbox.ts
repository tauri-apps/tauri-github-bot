import { getNewTasks, runUpstreamTasks } from './task'

export async function inbox(): Promise<void> {
  const tasks = await getNewTasks()
  await runUpstreamTasks(tasks)
}
