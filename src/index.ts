import { checkBot } from './auth'
import { inbox } from './inbox'
import { notify } from './notify'

async function run() {
  await checkBot()
  const cmd = process.argv[2]
  if (cmd === 'inbox') await inbox()
  if (cmd === 'notify') await notify(process.argv[3])
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
