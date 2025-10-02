"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { fetchTVData } from "@/app/actions/tmdb"
import { Settings } from "lucide-react"
import { themeManager } from "@/lib/theme-manager"
import { NeonServerMenu } from "@/components/neon-server-menu"
import { measurePing, proxyUrl } from "@/lib/proxy-utils"

interface ServerOption {
  name: string
  url: string
  ping?: number | null
}

interface TVShow {
  id: number
  name: string
  original_name: string
}

export default function TVEpisodePage() {
  const params = useParams()
  const router = useRouter()
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
    {
      name: "SamXerz",
      url: "https://player.vidplus.to/embed/tv/{id}/{season}/{episode}",
    },
    { name: "Icarus", url: "https://vidfast.pro/tv/" },
    { name: "Orion", url: "https://player.vidsrc.co/embed/tv/" },
    {
      name: "Theseus",
      url: "https://player.vidify.top/embed/tv/{id}/{season}/{episode}?autoplay=true&poster=true&chromecast=true&servericon=true&setting=true&pip=true&download=true&logourl=https%3A%2F%2Fzetflix-tv.vercel.app%2Fzetflix.svg&font=Roboto&fontcolor=6f63ff&fontsize=20&opacity=0.5&primarycolor=00FFFF&secondarycolor=FF00FF&iconcolor=00FFFF",
    },
  ]

  useEffect(() => {
    const getTVData = async () => {
      setIsLoadingTMDB(true)
      try {
        const data = await fetchTVData(tvId)
        setTVData(data)
      } catch (error) {
        console.error("Error fetching TV data:", error)
      } finally {
        setIsLoadingTMDB(false)
      }
    }

    if (tvId) {
      getTVData()
    }
  }, [tvId])

  useEffect(() => {
    if (tvId?.includes("[") || season?.includes("[") || episode?.includes("[")) {
      console.error("Invalid route parameters detected. Please navigate to an actual TV show URL like /tv/90521/7/36")
    }
  }, [tvId, season, episode])

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

  useEffect(() => {
    refreshPings()
    const interval = setInterval(refreshPings, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadContent = (serverUrl: string) => {
    currentServerUrlRef.current = serverUrl

    let fullUrl = ""
    const themeColor = currentTheme.colors.primary.replace("#", "")
    const primaryColor = currentTheme.colors.primary.replace("#", "")
    const secondaryColor = currentTheme.colors.secondary.replace("#", "")
    const accentColor = currentTheme.colors.accent.replace("#", "")

    if (serverUrl.includes("watch.vidora.su")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true&colour=${themeColor}&backbutton=https%3A%2F%2Fzetflix-tv.vercel.app&logo=https%3A%2F%2Fzetflix-tv.vercel.app%2Fzetflix-logo.png&pausescreen=true&autonextepisode=true`
    } else if (serverUrl.includes("hexa.watch")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true&colour=${themeColor}&pausescreen=true&autonextepisode=true`
    } else if (serverUrl.includes("xprime.tv")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true`
    } else if (serverUrl.includes("vidfast.pro")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    } else if (serverUrl.includes("vidsrc.cc")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true`
    } else if (serverUrl.includes("player.vidsrc.co")) {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}?autoplay=true`
    } else if (serverUrl.includes("player.vidplus.to")) {
      fullUrl =
        serverUrl.replace("{id}", tvId).replace("{season}", season).replace("{episode}", episode) +
        `?autoplay=true&autonext=true&nextbutton=true&episodelist=true&primarycolor=${primaryColor}&secondarycolor=${secondaryColor}&iconcolor=FFFFFF&poster=true&title=true&chromecast=true&icons=netflix&font=Poppins&fontcolor=FFFFFF&fontsize=20&opacity=0.8&logourl=https%3A%2F%2Fzetflix-tv.vercel.app%2Fzetflix.svg`
    } else if (serverUrl.includes("player.vidify.top")) {
      fullUrl = serverUrl.replace("{id}", tvId).replace("{season}", season).replace("{episode}", episode)
    } else {
      fullUrl = `${serverUrl}${tvId}/${season}/${episode}`
    }

    setCurrentUrl(fullUrl)
  }

  const handleServerSelect = (serverUrl: string, serverName: string) => {
    setCurrentServer(serverName)
    loadContent(serverUrl)
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
    loadContent(tvServers[0].url)
  }, [tvId, season, episode])

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
      `}</style>

      {currentServer !== "Icarus" &&
        currentServer !== "Theseus" &&
        currentServer !== "Infested" &&
        currentServer !== "Invictuz" &&
        currentServer !== "Orion" &&
        currentServer !== "SamXerz" && (
          <div
            className="fixed top-0 left-0 w-16 h-16 z-[9997] cursor-default"
            style={{
              background: "transparent",
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />
        )}

      {currentServer === "Infested" && (
        <div
          className="fixed top-0 left-0 w-[120px] h-[80px] z-[9997] cursor-default"
          style={{
            background: "transparent",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      )}

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
        mediaType="movie"
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
          sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}
