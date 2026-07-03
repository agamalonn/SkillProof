import { spawn } from 'node:child_process'

const apiPort = process.env.API_PORT || '8787'
const webPort = process.env.WEB_PORT || '5175'

const children = [
  {
    name: 'api',
    command: process.execPath,
    args: ['server/index.mjs'],
    env: { ...process.env, PORT: apiPort },
  },
  {
    name: 'web',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', webPort],
    env: { ...process.env },
  },
]

const running = children.map(({ name, command, args, env }) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`)
  })

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`)
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code
      stopAll()
    }
  })

  return child
})

function stopAll() {
  for (const child of running) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
}

process.on('SIGINT', () => {
  stopAll()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})

console.log(`SkillProof full stack dev server: http://127.0.0.1:${webPort}`)
