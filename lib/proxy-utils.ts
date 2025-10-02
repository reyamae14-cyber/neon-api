export const PROXY_URL = "https://simple-proxy.reyamae14.workers.dev"

// Multiple proxy servers across different regions for optimal global performance
const PROXY_SERVERS = [
  "https://simple-proxy.reyamae14.workers.dev", // Primary (US)
  "https://corsproxy.io/?", // Global CDN
  "https://api.allorigins.win/raw?url=", // Europe
  "https://proxy.cors.sh/", // Asia-Pacific
]

let currentProxyIndex = 0
const proxyPerformance: Map<string, number> = new Map()

/**
 * Get the best performing proxy based on recent measurements
 */
function getBestProxy(): string {
  if (proxyPerformance.size === 0) {
    return PROXY_SERVERS[0]
  }

  let bestProxy = PROXY_SERVERS[0]
  let bestTime = Number.POSITIVE_INFINITY

  proxyPerformance.forEach((time, proxy) => {
    if (time < bestTime) {
      bestTime = time
      bestProxy = proxy
    }
  })

  return bestProxy
}

/**
 * Rotate to next proxy server
 */
function getNextProxy(): string {
  currentProxyIndex = (currentProxyIndex + 1) % PROXY_SERVERS.length
  return PROXY_SERVERS[currentProxyIndex]
}

/**
 * Wraps a server URL with the best performing proxy
 */
export function proxyUrl(url: string): string {
  try {
    const proxy = getBestProxy()
    const encodedUrl = encodeURIComponent(url)

    if (proxy.includes("simple-proxy")) {
      return `${proxy}/?url=${encodedUrl}&block_ads=true&no_tracking=true`
    } else if (proxy.includes("allorigins")) {
      return `${proxy}${encodedUrl}`
    } else {
      return `${proxy}${encodedUrl}`
    }
  } catch (error) {
    console.error("[v0] Error creating proxy URL:", error)
    return url
  }
}

const pingCache = new Map<string, { ping: number | null; timestamp: number }>()
const PING_CACHE_DURATION = 15000 // 15 seconds cache for better performance

/**
 * Measures the ping/latency to a server URL with optimized timeout and caching
 */
export async function measurePing(url: string): Promise<number | null> {
  try {
    // Check cache first
    const cached = pingCache.get(url)
    if (cached && Date.now() - cached.timestamp < PING_CACHE_DURATION) {
      return cached.ping
    }

    const domain = new URL(url).origin
    const start = performance.now()
    const controller = new AbortController()

    // Reduced timeout for faster measurements
    const timeoutId = setTimeout(() => controller.abort(), 1500)

    const response = await fetch(domain, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
      priority: "high",
    })

    clearTimeout(timeoutId)
    const end = performance.now()
    const ping = Math.round(end - start)

    pingCache.set(url, { ping, timestamp: Date.now() })

    return ping
  } catch (error) {
    pingCache.set(url, { ping: null, timestamp: Date.now() })
    return null
  }
}

/**
 * Measure proxy performance and update rankings
 */
export async function measureProxyPerformance(): Promise<void> {
  const testUrl = "https://www.google.com"

  for (const proxy of PROXY_SERVERS) {
    try {
      const start = performance.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      let testTarget = testUrl
      if (proxy.includes("simple-proxy")) {
        testTarget = `${proxy}/?url=${encodeURIComponent(testUrl)}`
      } else if (proxy.includes("allorigins")) {
        testTarget = `${proxy}${encodeURIComponent(testUrl)}`
      } else {
        testTarget = `${proxy}${testUrl}`
      }

      await fetch(testTarget, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const end = performance.now()
      proxyPerformance.set(proxy, end - start)
    } catch (error) {
      proxyPerformance.set(proxy, 9999)
    }
  }
}

/**
 * Clears the ping cache (useful for manual refresh)
 */
export function clearPingCache() {
  pingCache.clear()
}

/**
 * Gets user's IP and location information with caching
 */
export async function getLocationInfo() {
  try {
    const cached = sessionStorage.getItem("location-info")
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 300000) {
        // 5 minutes cache
        return data
      }
    }

    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    const locationData = {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone,
      isp: data.org,
      latitude: data.latitude,
      longitude: data.longitude,
    }

    sessionStorage.setItem("location-info", JSON.stringify({ data: locationData, timestamp: Date.now() }))
    return locationData
  } catch (error) {
    console.error("[v0] Error fetching location info:", error)
    return null
  }
}

/**
 * Formats date and time for display
 */
export function formatDateTime(date: Date = new Date()) {
  return {
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}
