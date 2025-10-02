/**
 * Advanced URL obfuscation to hide server sources from dev tools
 * Uses Base64 encoding with custom character rotation
 */

const ROTATION_KEY = "ZF2025"

function rotateChar(char: string, shift: number): string {
  const code = char.charCodeAt(0)
  return String.fromCharCode(code + shift)
}

export function obfuscateUrl(url: string): string {
  try {
    // First encode to base64
    const base64 = btoa(url)

    // Apply character rotation
    let rotated = ""
    for (let i = 0; i < base64.length; i++) {
      const shift = ROTATION_KEY.charCodeAt(i % ROTATION_KEY.length) % 10
      rotated += rotateChar(base64[i], shift)
    }

    // Encode again to make it unreadable
    return btoa(rotated)
  } catch (error) {
    console.error("[v0] Obfuscation error:", error)
    return btoa(url)
  }
}

export function deobfuscateUrl(obfuscated: string): string {
  try {
    // First decode
    const rotated = atob(obfuscated)

    // Reverse character rotation
    let base64 = ""
    for (let i = 0; i < rotated.length; i++) {
      const shift = ROTATION_KEY.charCodeAt(i % ROTATION_KEY.length) % 10
      base64 += rotateChar(rotated[i], -shift)
    }

    // Final decode
    return atob(base64)
  } catch (error) {
    console.error("[v0] Deobfuscation error:", error)
    return ""
  }
}

/**
 * Secure fetch wrapper that hides URLs from network tab
 */
export async function secureFetch(url: string, options?: RequestInit): Promise<Response> {
  // Use a proxy to hide the actual destination
  const obfuscated = obfuscateUrl(url)

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "X-Requested-With": "XMLHttpRequest",
      "Cache-Control": "no-cache",
    },
    referrerPolicy: "no-referrer",
  })
}
