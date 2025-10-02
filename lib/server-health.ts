export interface ServerHealth {
  name: string
  url: string
  ping: number | null
  isOnline: boolean
  lastChecked: number
}

const PING_TIMEOUT = 5000
const HEALTH_CHECK_INTERVAL = 30000

export async function checkServerHealth(serverUrl: string): Promise<number | null> {
  try {
    const startTime = performance.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT)

    const response = await fetch(serverUrl, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)
    const endTime = performance.now()
    const ping = Math.round(endTime - startTime)

    return response.ok ? ping : null
  } catch (error) {
    return null
  }
}

export async function checkAllServers(servers: Array<{ name: string; url: string }>): Promise<ServerHealth[]> {
  const healthChecks = await Promise.all(
    servers.map(async (server) => {
      const ping = await checkServerHealth(server.url)
      return {
        name: server.name,
        url: server.url,
        ping,
        isOnline: ping !== null,
        lastChecked: Date.now(),
      }
    }),
  )

  return healthChecks
}

export function getFastestServer(healthData: ServerHealth[]): ServerHealth | null {
  const onlineServers = healthData.filter((s) => s.isOnline && s.ping !== null)
  if (onlineServers.length === 0) return null

  return onlineServers.reduce((fastest, current) => {
    if (!fastest.ping || (current.ping && current.ping < fastest.ping)) {
      return current
    }
    return fastest
  })
}

export function shouldFallbackToFastest(currentServer: string, healthData: ServerHealth[]): ServerHealth | null {
  const current = healthData.find((s) => s.name === currentServer)

  if (!current || !current.isOnline) {
    return getFastestServer(healthData)
  }

  return null
}
