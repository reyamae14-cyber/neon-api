"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { themeManager } from "@/lib/theme-manager"
import { NeonServerMenu } from "@/components/neon-server-menu"
import { Settings } from "lucide-react"
import { measurePing, proxyUrl } from "@/lib/proxy-utils"
import { fetchTVData } from "@/app/actions/tmdb" // Fixed import to use correct path

interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  first_air_date: string
}

interface ServerOption {
  name: string
  url: string
  ping?: number | null
}

export default function TVPage() {
  const params = useParams()
  const tvId = params.id as string
  const season = params.season as string
  const episode = params.episode as string

  const [tvData, setTVData] = useState<TVShow | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [servers, setServers] = useState<ServerOption[]>([])
  const [isLoadingTMDB, setIsLoadingTMDB] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme())
  const [currentServer, setCurrentServer] = useState("Zeticuz")
  const [isButtonVisible, setIsButtonVisible] = useState(true)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hoverAreaRef = useRef<HTMLDivElement>(null)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const currentServerUrlRef = useRef<string>("")

  const tvServers: ServerOption[] = [
    { name: "Zeticuz", url: "https://watch.vidora.su/watch/tv/" },
    { name: "Infested", url: "https://xprime.tv/watch/" },
    { name: "Spectre", url: "https://hexa.watch/watch/tv/" },
    { name: "Invictuz", url: "https://vidsrc.cc/v3/embed/tv/" },
    { name: "Bastardo", url: "https://proxy.garageband.rocks/embed/tv/" },
    { name: "Icarus", url: "https://vidsrc.xyz/embed/tv/" },
    { name: "Orion", url: "https://player.vidsrc.co/embed/tv/" },
    {
      name: "Theseus",
      url: "https://player.vidify.top/embed/tv/{id}?autoplay=true&poster=true&chromecast=true&servericon=true&setting=true&pip=true&logourl=https%3A%2F%2Fzetflix-tv.vercel.app%2Fzetflix.svg&font=Roboto&fontcolor=6f63ff&fontsize=20&opacity=0.5&primarycolor=b53bf7&secondarycolor=14d0ff&iconcolor=f2b5e2",
    },
  ]

  useEffect(() => {
    const hostname = window.location.hostname
    setIsLocalhost(
      hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172."),
    )
  }, [])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isLocalhost])

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme)
      if (currentServerUrlRef.current) {
        loadContent(currentServerUrlRef.current)
      }
    })
    return unsubscribe
  }, [])

  const refreshPings = async () => {
    const updatedServers = await Promise.all(
      tvServers.map(async (server) => {
        const ping = await measurePing(server.url)
        return {
          ...server,
          ping: ping !== null && ping > 500 ? await measurePing(proxyUrl(server.url)) : ping,
        }
      }),
    )
    setServers(updatedServers)
  }

  const loadContent = (serverUrl: string) => {
    currentServerUrlRef.current = serverUrl

    let fullUrl = ""
    const themeColor = currentTheme.colors.primary.replace("#", "")

    if (serverUrl.includes("watch.vidora.su")) {
      // Zeticuz
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true&colour=${themeColor}&backbutton=https%3A%2F%2Fzetflix-tv.vercel.app&logo=https%3A%2F%2Fzetflix-tv.vercel.app%2Fzetflix-logo.png&pausescreen=true&autonextepisode=true`
    } else if (serverUrl.includes("xprime.tv")) {
      // Infested
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true`
    } else if (serverUrl.includes("hexa.watch")) {
      // Spectre
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true&colour=${themeColor}&pausescreen=true&autonextepisode=true`
    } else if (serverUrl.includes("vidsrc.cc")) {
      // Invictuz
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    } else if (serverUrl.includes("proxy.garageband.rocks")) {
      // Bastardo
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    } else if (serverUrl.includes("vidsrc.xyz")) {
      // Icarus
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    } else if (serverUrl.includes("player.vidsrc.co")) {
      // Orion
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    } else if (serverUrl.includes("player.vidify.top")) {
      // Theseus
      fullUrl = serverUrl.replace("{id}", tvId) + `/${season}/${episode}`
    } else {
      // Default fallback
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    }

    setCurrentUrl(fullUrl)
  }

  const handleServerSelect = (serverUrl: string, serverName: string) => {
    setCurrentServer(serverName)
    loadContent(serverUrl)
    setIsMenuOpen(false)
  }

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    setIsButtonVisible(true)

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    if (!isMenuOpen) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsButtonVisible(false)
      }, 5000)
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [isMenuOpen]) // Added isMenuOpen dependency

  const handleMouseMove = () => {
    setIsButtonVisible(true)

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    if (!isMenuOpen) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsButtonVisible(false)
      }, 5000)
    }
  }

  const handleHoverAreaEnter = () => {
    if (window.innerWidth >= 768) {
      setIsButtonVisible(true)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }

  const handleHoverAreaLeave = () => {
    if (window.innerWidth >= 768 && !isMenuOpen) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsButtonVisible(false)
      }, 1000)
    }
  }

  const handleTapArea = (e: React.MouseEvent) => {
    if (window.innerWidth < 768 && !isButtonVisible) {
      e.stopPropagation()
      setIsButtonVisible(true)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      if (!isMenuOpen) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsButtonVisible(false)
        }, 5000)
      }
    }
  }

  useEffect(() => {
    if (!tvId || !season || !episode || tvId.includes("[") || season.includes("[") || episode.includes("[")) {
      console.error("[v0] Invalid route parameters. Please navigate to a valid TV show URL like /tv/90521/7/36")
      setIsLoadingTMDB(false)
      return
    }

    const loadTVData = async () => {
      try {
        const data = await fetchTVData(tvId)
        setTVData(data)
      } catch (error) {
        console.error("Failed to load TV show data:", error)
      } finally {
        setIsLoadingTMDB(false)
      }
    }

    loadTVData()
    refreshPings()
    loadContent(tvServers[0].url)
  }, [tvId, season, episode])

  useEffect(() => {
    const pingInterval = setInterval(refreshPings, 15000)
    return () => clearInterval(pingInterval)
  }, [])

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      <style jsx global>{`
        html,
        body {
          overflow: hidden !important;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        
        ::-webkit-scrollbar {
          display: none;
        }
        
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes neon-glow {
          0%, 100% {
            box-shadow: 0 0 10px hsl(var(--neon-hue, 255) 80% 60% / 0.5),
                        0 0 20px hsl(var(--neon-hue, 255) 80% 60% / 0.3),
                        0 0 30px hsl(var(--neon-hue, 255) 80% 60% / 0.2);
          }
          50% {
            box-shadow: 0 0 15px hsl(var(--neon-hue, 255) 80% 60% / 0.7),
                        0 0 30px hsl(var(--neon-hue, 255) 80% 60% / 0.5),
                        0 0 45px hsl(var(--neon-hue, 255) 80% 60% / 0.3);
          }
        }

        .neon-button {
          animation: neon-glow 2s ease-in-out infinite;
          border-color: hsl(var(--neon-hue, 255) 80% 60% / 0.5) !important;
          background: linear-gradient(
            135deg,
            hsl(var(--neon-hue, 255) 50% 10% / 0.8),
            hsl(var(--neon-hue, 255) 50% 5% / 0.9)
          ) !important;
        }

        .neon-button:hover {
          background: linear-gradient(
            135deg,
            hsl(var(--neon-hue, 255) 50% 15% / 0.9),
            hsl(var(--neon-hue, 255) 50% 10% / 0.95)
          ) !important;
        }

        .orion-allow-clicks {
          pointer-events: none;
        }

        .orion-allow-clicks.orion {
          pointer-events: auto;
        }
      `}</style>

      <div
        className="fixed top-0 left-0 w-16 h-16 z-[9997] cursor-default"
        style={{
          background: "transparent",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      />

      <div
        ref={hoverAreaRef}
        className="fixed top-1/2 -translate-y-1/2 right-0 w-24 h-32 z-[9997]"
        onMouseEnter={handleHoverAreaEnter}
        onMouseLeave={handleHoverAreaLeave}
        onClick={handleTapArea}
        style={{
          pointerEvents: "auto",
          background: "transparent",
        }}
      />

      <button
        onClick={handleToggleMenu}
        className={`neon-button fixed top-1/2 -translate-y-1/2 z-[9998] backdrop-blur-sm border-2 rounded-full p-3 transition-all duration-500 hover:scale-110 ${
          isButtonVisible ? "right-4" : "-right-16"
        }`}
        style={{
          transform: `translate(${isButtonVisible ? "0" : "100%"}, -50%)`,
        }}
        aria-label="Toggle server settings"
      >
        <Settings
          className="h-6 w-6 text-white"
          style={{ filter: `drop-shadow(0 0 4px hsl(var(--neon-hue, 255) 80% 60%))` }}
        />
      </button>

      <NeonServerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onServerSelect={handleServerSelect}
        servers={servers}
        currentServer={currentServer}
        onRefreshPings={refreshPings}
        tmdbId={tvId}
        mediaType="tv"
        season={season}
        episode={episode}
      />

      {currentUrl && (
        <iframe
          src={currentUrl}
          className="absolute inset-0 w-full h-full border-0"
          style={{
            width: "100vw",
            height: "100vh",
            border: "none",
            margin: 0,
            padding: 0,
            display: "block",
          }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups-to-escape-sandbox allow-presentation"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}
