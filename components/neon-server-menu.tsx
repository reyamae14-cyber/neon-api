"use client"

import { useEffect, useRef, useState } from "react"
import { Server, Palette, Zap, MapPin, Clock, Wifi } from "lucide-react"
import { themes, themeManager } from "@/lib/theme-manager"
import { getLocationInfo, formatDateTime } from "@/lib/proxy-utils"

interface NeonServerMenuProps {
  isOpen: boolean
  onClose: () => void
  onServerSelect: (serverUrl: string, serverName: string) => void
  servers: Array<{ name: string; url: string; ping?: number | null }>
  currentServer?: string
  onRefreshPings?: () => void
  tmdbId?: string
  mediaType?: "movie" | "tv"
  season?: string
  episode?: string
}

export function NeonServerMenu({
  isOpen,
  onClose,
  onServerSelect,
  servers,
  currentServer,
  onRefreshPings,
  tmdbId,
  mediaType,
  season,
  episode,
}: NeonServerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [hue1, setHue1] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("neon-hue1")
      return saved ? Number(saved) : 255
    }
    return 255
  })
  const [hue2, setHue2] = useState(222)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [mainTab, setMainTab] = useState<"SERVER" | "SETTINGS">("SERVER")

  const [settingsTab, setSettingsTab] = useState<"THEMES" | "NEON">("THEMES")

  const [autoColorChange, setAutoColorChange] = useState(true)
  const [neonEffect, setNeonEffect] = useState<"breathing" | "pulse" | "wave" | "static">("static")
  const [neonSpeed, setNeonSpeed] = useState(50)

  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme())

  const [locationInfo, setLocationInfo] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const rafIdRef = useRef<number | null>(null)
  const pendingHueRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("neon-hue1", String(hue1))

      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      // Store the pending hue value
      pendingHueRef.current = hue1

      // Schedule the CSS update for the next animation frame
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingHueRef.current !== null) {
          document.documentElement.style.setProperty("--neon-hue", String(pendingHueRef.current))
          pendingHueRef.current = null
        }
        rafIdRef.current = null
      })
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [hue1])

  useEffect(() => {
    if (!autoColorChange || !isOpen) return

    const interval = setInterval(() => {
      setHue1((prev) => (prev + 1) % 360)
      setHue2((prev) => (prev + 2) % 360)
    }, 100 - neonSpeed)

    return () => clearInterval(interval)
  }, [autoColorChange, neonSpeed, isOpen])

  useEffect(() => {
    getLocationInfo().then((info) => {
      if (info) setLocationInfo(info)
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme)
    })
    return unsubscribe
  }, [])

  const handleServerClick = (server: { name: string; url: string }, index: number) => {
    setSelectedIndex(index)

    let finalUrl = server.url

    if (server.name === "Icarus" && tmdbId) {
      if (mediaType === "movie") {
        finalUrl = `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}&autoplay=1`
      } else if (mediaType === "tv" && season && episode) {
        finalUrl = `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1&autonext=1`
      }
    }

    if (server.name === "Bastardo" && tmdbId) {
      if (mediaType === "movie") {
        finalUrl = `https://proxy.garageband.rocks/embed/movie/${tmdbId}`
      } else if (mediaType === "tv" && season && episode) {
        finalUrl = `https://proxy.garageband.rocks/embed/tv/${tmdbId}/${season}/${episode}`
      }
    }

    onServerSelect(finalUrl, server.name)
    onClose()
  }

  const handleThemeSelect = (themeId: string) => {
    themeManager.setTheme(themeId)
  }

  const animationDuration = `${(100 - neonSpeed) / 10 + 1}s`
  const { time, date } = formatDateTime(currentTime)

  return (
    <>
      <style jsx global>{`
        .neon-menu {
          --hue1: ${hue1};
          --hue2: ${hue2};
          --border: 1px;
          --border-color: hsl(var(--hue2), 12%, 20%);
          --radius: 22px;
          --ease: cubic-bezier(0.5, 1, 0.89, 1);
          --animation-duration: ${animationDuration};
          will-change: --hue1, --hue2;
        }

        .neon-menu {
          visibility: ${isOpen ? "visible" : "hidden"};
          opacity: ${isOpen ? "1" : "0"};
          pointer-events: ${isOpen ? "auto" : "none"};
          transition-property: visibility, opacity, filter;
          transition-duration: 0s, 0.25s, 0.25s;
          transition-delay: ${isOpen ? "0s" : "0.5s, 0s, 0s"};
          transition-timing-function: var(--ease);
          filter: ${isOpen ? "blur(0px)" : "blur(4px)"};
          font-family: var(--font-sans);
          color: #737985;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          min-width: 306px;
          max-width: 357px;
          max-height: 72vh;
          border-radius: var(--radius);
          border: var(--border) solid var(--border-color);
          padding: 1.5em;
          background: linear-gradient(
              235deg,
              hsl(var(--hue1) 50% 10% / 0.8),
              hsl(var(--hue1) 50% 10% / 0) 33%
            ),
            linear-gradient(45deg, hsl(var(--hue2) 50% 10% / 0.8), hsl(var(--hue2) 50% 10% / 0) 33%),
            linear-gradient(hsl(220deg 25% 4.8% / 0.95));
          backdrop-filter: blur(16px);
          box-shadow: hsl(var(--hue2) 50% 2%) 0px 10px 16px -8px, hsl(var(--hue2) 50% 4%) 0px 20px 36px -14px;
          z-index: 9999;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .neon-menu::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @media (max-width: 640px) {
          .neon-menu {
            min-width: 280px;
            max-width: 320px;
            max-height: 70vh;
            padding: 1.2em;
          }
        }

        .neon-menu .shine,
        .neon-menu .shine::before,
        .neon-menu .shine::after {
          pointer-events: none;
          border-radius: 0;
          border-top-right-radius: inherit;
          border-bottom-left-radius: inherit;
          border: 1px solid transparent;
          width: 75%;
          height: auto;
          min-height: 0px;
          aspect-ratio: 1;
          display: block;
          position: absolute;
          right: calc(var(--border) * -1);
          top: calc(var(--border) * -1);
          left: auto;
          z-index: 1;
          --start: 12%;
          background: conic-gradient(
            from var(--conic, -45deg) at center in oklch,
            transparent var(--start, 0%),
            hsl(var(--hue), var(--sat, 80%), var(--lit, 60%)),
            transparent var(--end, 50%)
          ) border-box;
          mask: linear-gradient(transparent), linear-gradient(black);
          mask-repeat: no-repeat;
          mask-clip: padding-box, border-box;
          mask-composite: subtract;
          will-change: background;
          transition: background 0.1s linear;
        }

        .neon-menu .shine::before,
        .neon-menu .shine::after {
          content: "";
          width: auto;
          inset: -2px;
          mask: none;
        }

        .neon-menu .shine::after {
          z-index: 2;
          --start: 17%;
          --end: 33%;
          background: conic-gradient(
            from var(--conic, -45deg) at center in oklch,
            transparent var(--start, 0%),
            hsl(var(--hue), var(--sat, 80%), var(--lit, 85%)),
            transparent var(--end, 50%)
          );
        }

        .neon-menu .shine-bottom {
          top: auto;
          bottom: calc(var(--border) * -1);
          left: calc(var(--border) * -1);
          right: auto;
        }

        .neon-menu .glow {
          pointer-events: none;
          border-top-right-radius: calc(var(--radius) * 2.5);
          border-bottom-left-radius: calc(var(--radius) * 2.5);
          border: calc(var(--radius) * 1.25) solid transparent;
          inset: calc(var(--radius) * -2);
          width: 75%;
          height: auto;
          min-height: 0px;
          aspect-ratio: 1;
          display: block;
          position: absolute;
          left: auto;
          bottom: auto;
          opacity: 1;
          filter: blur(12px) saturate(1.25) brightness(0.5);
          mix-blend-mode: plus-lighter;
          z-index: 3;
          will-change: filter, opacity;
          transition: filter 0.1s linear, opacity 0.1s linear;
        }

        .neon-menu .glow.glow-bottom {
          inset: calc(var(--radius) * -2);
          top: auto;
          right: auto;
        }

        .neon-menu .glow::before,
        .neon-menu .glow::after {
          content: "";
          position: absolute;
          inset: 0;
          border: inherit;
          border-radius: inherit;
          background: conic-gradient(
            from var(--conic, -45deg) at center in oklch,
            transparent var(--start, 0%),
            hsl(var(--hue), var(--sat, 95%), var(--lit, 60%)),
            transparent var(--end, 50%)
          ) border-box;
          mask: linear-gradient(transparent), linear-gradient(black);
          mask-repeat: no-repeat;
          mask-clip: padding-box, border-box;
          mask-composite: subtract;
          filter: saturate(2) brightness(1);
          will-change: background;
          transition: background 0.1s linear;
        }

        .neon-menu .glow::after {
          --lit: 70%;
          --sat: 100%;
          --start: 15%;
          --end: 35%;
          border-width: calc(var(--radius) * 1.75);
          border-radius: calc(var(--radius) * 2.75);
          inset: calc(var(--radius) * -0.25);
          z-index: 4;
          opacity: 0.75;
        }

        .neon-menu .glow-bright {
          --lit: 80%;
          --sat: 100%;
          --start: 13%;
          --end: 37%;
          border-width: 5px;
          border-radius: calc(var(--radius) + 2px);
          inset: -7px;
          left: auto;
          filter: blur(2px) brightness(0.66);
        }

        .neon-menu .glow-bright::after {
          content: none;
        }

        .neon-menu .glow-bright.glow-bottom {
          inset: -7px;
          right: auto;
          top: auto;
        }

        .neon-menu .shine,
        .neon-menu .glow {
          --hue: var(--hue1);
        }

        .neon-menu .shine-bottom,
        .neon-menu .glow-bottom {
          --hue: var(--hue2);
          --conic: 135deg;
        }

        ${
          isOpen && neonEffect === "breathing"
            ? `
        .neon-menu .glow,
        .neon-menu .shine {
          animation: breathing var(--animation-duration) ease-in-out infinite;
        }
        @keyframes breathing {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        `
            : ""
        }

        ${
          isOpen && neonEffect === "pulse"
            ? `
        .neon-menu .glow,
        .neon-menu .shine {
          animation: pulse var(--animation-duration) ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        `
            : ""
        }

        ${
          isOpen && neonEffect === "wave"
            ? `
        .neon-menu .glow {
          animation: wave var(--animation-duration) linear infinite;
        }
        .neon-menu .shine {
          animation: wave var(--animation-duration) linear infinite reverse;
        }
        @keyframes wave {
          0% { opacity: 0.5; filter: blur(12px) saturate(1.25) brightness(0.5) hue-rotate(0deg); }
          50% { opacity: 1; filter: blur(12px) saturate(1.25) brightness(0.7) hue-rotate(30deg); }
          100% { opacity: 0.5; filter: blur(12px) saturate(1.25) brightness(0.5) hue-rotate(0deg); }
        }
        `
            : ""
        }

        ${
          isOpen && neonEffect === "static"
            ? `
        .neon-menu::before,
        .neon-menu::after,
        .neon-menu .glow,
        .neon-menu .shine {
          animation: glow 1s var(--ease) both;
        }
        .neon-menu .shine {
          animation-delay: 0s;
          animation-duration: 2s;
        }
        .neon-menu .glow {
          animation-delay: 0.2s;
        }
        .neon-menu .glow-bright {
          animation-delay: 0.1s;
          animation-duration: 1.5s;
        }
        .neon-menu .shine-bottom {
          animation-delay: 0.1s;
          animation-duration: 1.8s;
        }
        .neon-menu .glow-bottom {
          animation-delay: 0.3s;
        }
        .neon-menu .glow-bright.glow-bottom {
          animation-delay: 0.3s;
          animation-duration: 1.1s;
        }
        `
            : ""
        }

        @keyframes glow {
          0% {
            opacity: 0;
          }
          3% {
            opacity: 1;
          }
          10% {
            opacity: 0;
          }
          12% {
            opacity: 0.7;
          }
          16% {
            opacity: 0.3;
            animation-timing-function: var(--ease);
          }
          100% {
            opacity: 1;
            animation-timing-function: var(--ease);
          }
        }

        .neon-menu .inner {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          font-size: 0.875rem;
        }

        .neon-menu hr {
          width: 100%;
          height: 0.5px;
          background: var(--border-color);
          border: none;
          margin: 0.25em 0 0.5em;
          opacity: 0.66;
        }

        .neon-menu section {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

        .neon-menu header {
          font-size: 0.75rem;
          font-weight: 300;
          padding: 0 0.66em;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .neon-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .neon-menu li {
          position: relative;
          padding: 0.66em;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 0.75em;
          border-radius: calc(var(--radius) * 0.33333);
          border: 1px solid transparent;
          transition: all 0.3s ease-in;
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / var(--item-opacity, 0)),
            hsl(var(--hue1) 30% 15% / var(--item-opacity, 0)) 24% 32%,
            hsl(var(--hue1) 5% 7% / var(--item-opacity, 0))
          ) border-box;
          cursor: pointer;
        }

        .neon-menu li::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: inherit;
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 15% 16% / var(--item-opacity, 0)),
            hsl(var(--hue1) 40% 24% / var(--item-opacity, 0)) 20% 32%,
            hsl(var(--hue1) 2% 12% / var(--item-opacity, 0))
          ) border-box;
          mask: linear-gradient(transparent), linear-gradient(black);
          mask-repeat: no-repeat;
          mask-clip: padding-box, border-box;
          mask-composite: subtract;
        }

        .neon-menu li:hover,
        .neon-menu li.selected {
          --item-opacity: 0.5;
          transition: all 0.1s ease-out;
          color: white;
        }

        .neon-menu li.active {
          --item-opacity: 0.7;
          color: hsl(var(--hue1) 80% 70%);
          border-color: hsl(var(--hue1) 50% 30% / 0.3);
        }

        .neon-menu li svg {
          fill: none;
          stroke-width: 1.5;
          height: 20px;
          width: 20px;
          flex-shrink: 0;
        }

        .neon-menu .tab-toggle {
          display: flex;
          gap: 0.5em;
          margin-bottom: 1em;
          background: hsl(var(--hue1) 0% 40% / 0.05);
          border-radius: calc(var(--radius) * 0.33333);
          padding: 0.25em;
        }

        .neon-menu .tab-button {
          flex: 1;
          padding: 0.5em;
          border: none;
          background: transparent;
          color: #737985;
          border-radius: calc(var(--radius) * 0.25);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .neon-menu .tab-button.active {
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.7),
            hsl(var(--hue1) 30% 15% / 0.7) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.7)
          );
          color: white;
          box-shadow: 0 0 12px hsl(var(--hue1) 80% 60% / 0.3);
        }

        .neon-menu .color-sliders {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

        .neon-menu .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.25em;
        }

        .neon-menu .slider-label {
          font-size: 0.7rem;
          opacity: 0.7;
          padding: 0 0.5em;
        }

        .neon-menu input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: hsl(var(--hue1) 0% 40% / 0.1);
          outline: none;
          padding: 0;
          -webkit-appearance: none;
        }

        .neon-menu input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--hue1) 80% 60%);
          cursor: pointer;
          box-shadow: 0 0 8px hsl(var(--hue1) 80% 60% / 0.5);
        }

        .neon-menu input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--hue1) 80% 60%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px hsl(var(--hue1) 80% 60% / 0.5);
        }

        .neon-menu .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5em;
          padding: 0.5em;
          cursor: pointer;
        }

        .neon-menu input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: hsl(var(--hue1) 80% 60%);
        }

        .neon-menu .effect-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5em;
        }

        .neon-menu .effect-button {
          padding: 0.5em;
          border: 1px solid hsl(var(--hue1) 13% 18.5% / 0.5);
          background: hsl(var(--hue1) 0% 40% / 0.05);
          border-radius: calc(var(--radius) * 0.25);
          color: #737985;
          cursor: pointer;
          font-size: 0.7rem;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .neon-menu .effect-button.active {
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.5),
            hsl(var(--hue1) 30% 15% / 0.5) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.5)
          );
          color: white;
          border-color: hsl(var(--hue1) 50% 30% / 0.3);
        }

        .neon-menu .theme-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5em;
        }

        .neon-menu .theme-button {
          padding: 0.75em;
          border: 1px solid hsl(var(--hue1) 50% 40% / 0.3);
          border-radius: calc(var(--radius) * 0.33333);
          cursor: pointer;
          font-size: 0.8rem;
          color: white;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.3),
            hsl(var(--hue1) 30% 15% / 0.3) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.3)
          );
          backdrop-filter: blur(8px);
        }

        .neon-menu .theme-button::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.2;
          z-index: 0;
          border-radius: inherit;
        }

        .neon-menu .theme-button span {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .neon-menu .theme-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px hsl(var(--hue1) 80% 60% / 0.3);
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.5),
            hsl(var(--hue1) 30% 15% / 0.5) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.5)
          );
        }

        .neon-menu .theme-button.active {
          border-color: hsl(var(--hue1) 80% 60% / 0.6);
          box-shadow: 0 0 16px hsl(var(--hue1) 80% 60% / 0.4);
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.6),
            hsl(var(--hue1) 30% 15% / 0.6) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.6)
          );
        }

        .neon-menu .info-card {
          background: linear-gradient(
            90deg in oklch,
            hsl(var(--hue1) 29% 13% / 0.4),
            hsl(var(--hue1) 30% 15% / 0.4) 24% 32%,
            hsl(var(--hue1) 5% 7% / 0.4)
          );
          border: 1px solid hsl(var(--hue1) 50% 30% / 0.3);
          border-radius: calc(var(--radius) * 0.33333);
          padding: 0.75em;
          margin-bottom: 1em;
        }

        .neon-menu .info-row {
          display: flex;
          align-items: center;
          gap: 0.5em;
          font-size: 0.75rem;
          margin-bottom: 0.5em;
        }

        .neon-menu .info-row:last-child {
          margin-bottom: 0;
        }

        .neon-menu .info-label {
          opacity: 0.7;
          min-width: 60px;
        }

        .neon-menu .info-value {
          color: hsl(var(--hue1) 80% 70%);
          font-weight: 500;
        }

        .neon-menu .ping-badge {
          margin-left: auto;
          font-size: 0.7rem;
          padding: 0.25em 0.5em;
          border-radius: 4px;
          font-weight: 600;
          font-family: monospace;
        }

        .neon-menu .ping-good {
          background: hsl(120 60% 20% / 0.5);
          color: hsl(120 80% 60%);
        }

        .neon-menu .ping-medium {
          background: hsl(60 60% 20% / 0.5);
          color: hsl(60 80% 60%);
        }

        .neon-menu .ping-bad {
          background: hsl(0 60% 20% / 0.5);
          color: hsl(0 80% 60%);
        }

        .neon-menu .ping-offline {
          background: hsl(0 0% 20% / 0.5);
          color: hsl(0 0% 60%);
        }
      `}</style>

      <div ref={menuRef} className="neon-menu">
        <span className="shine shine-top"></span>
        <span className="shine shine-bottom"></span>
        <span className="glow glow-top"></span>
        <span className="glow glow-bottom"></span>
        <span className="glow glow-bright glow-top"></span>
        <span className="glow glow-bright glow-bottom"></span>

        <div className="inner">
          <div className="tab-toggle">
            <button
              className={`tab-button ${mainTab === "SERVER" ? "active" : ""}`}
              onClick={() => setMainTab("SERVER")}
            >
              <Server style={{ display: "inline", width: "14px", height: "14px", marginRight: "4px" }} />
              Server
            </button>
            <button
              className={`tab-button ${mainTab === "SETTINGS" ? "active" : ""}`}
              onClick={() => setMainTab("SETTINGS")}
            >
              <Zap style={{ display: "inline", width: "14px", height: "14px", marginRight: "4px" }} />
              Settings
            </button>
          </div>

          {mainTab === "SERVER" && (
            <section>
              <div className="info-card">
                <div className="info-row">
                  <Clock style={{ width: "14px", height: "14px" }} />
                  <span className="info-label">Time:</span>
                  <span className="info-value">{time}</span>
                </div>
                {locationInfo && (
                  <>
                    <div className="info-row">
                      <MapPin style={{ width: "14px", height: "14px" }} />
                      <span className="info-label">Location:</span>
                      <span className="info-value">
                        {locationInfo.city}, {locationInfo.country}
                      </span>
                    </div>
                    <div className="info-row">
                      <Wifi style={{ width: "14px", height: "14px" }} />
                      <span className="info-label">IP:</span>
                      <span className="info-value">{locationInfo.ip}</span>
                    </div>
                  </>
                )}
              </div>

              <header>Available Servers</header>
              <ul>
                {servers.map((server, index) => {
                  const isActive = currentServer === server.name
                  const ping = server.ping
                  let pingClass = "ping-offline"
                  if (ping !== null && ping !== undefined) {
                    if (ping <= 200) pingClass = "ping-good"
                    else if (ping <= 400) pingClass = "ping-medium"
                    else pingClass = "ping-bad"
                  }

                  return (
                    <li
                      key={server.name}
                      className={`${selectedIndex === index ? "selected" : ""} ${isActive ? "active" : ""}`}
                      onClick={() => handleServerClick(server, index)}
                    >
                      <Server className="h-5 w-5" />
                      <span>{server.name}</span>
                      {isActive && <span style={{ marginLeft: "auto", fontSize: "0.7rem", opacity: 0.7 }}>active</span>}
                      {ping !== undefined && (
                        <span className={`ping-badge ${pingClass}`}>{ping !== null ? `${ping}ms` : "offline"}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {mainTab === "SETTINGS" && (
            <>
              <div className="tab-toggle">
                <button
                  className={`tab-button ${settingsTab === "THEMES" ? "active" : ""}`}
                  onClick={() => setSettingsTab("THEMES")}
                >
                  <Palette style={{ display: "inline", width: "14px", height: "14px", marginRight: "4px" }} />
                  Themes
                </button>
                <button
                  className={`tab-button ${settingsTab === "NEON" ? "active" : ""}`}
                  onClick={() => setSettingsTab("NEON")}
                >
                  <Zap style={{ display: "inline", width: "14px", height: "14px", marginRight: "4px" }} />
                  Neon
                </button>
              </div>

              {settingsTab === "THEMES" && (
                <section>
                  <header>Theme Selection</header>
                  <div className="theme-grid">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`theme-button ${currentTheme.id === theme.id ? "active" : ""}`}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: theme.gradient || theme.colors.primary,
                            opacity: 0.2,
                          }}
                        />
                        <span>
                          {theme.name}
                          {currentTheme.id === theme.id && <span>✓</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {settingsTab === "NEON" && (
                <section>
                  <header>Neon Controller</header>

                  <div className="checkbox-group" onClick={() => setAutoColorChange(!autoColorChange)}>
                    <input
                      type="checkbox"
                      checked={autoColorChange}
                      onChange={(e) => setAutoColorChange(e.target.checked)}
                    />
                    <span style={{ fontSize: "0.8rem" }}>Automatic Color Change</span>
                  </div>

                  <hr />

                  <div className="color-sliders">
                    <div className="slider-group">
                      <div className="slider-label">Primary Hue: {hue1}°</div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hue1}
                        onChange={(e) => setHue1(Number(e.target.value))}
                        disabled={autoColorChange}
                      />
                    </div>
                    <div className="slider-group">
                      <div className="slider-label">Secondary Hue: {hue2}°</div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hue2}
                        onChange={(e) => setHue2(Number(e.target.value))}
                        disabled={autoColorChange}
                      />
                    </div>
                  </div>

                  <hr />

                  <header>Light Effect Mode</header>
                  <div className="effect-selector">
                    <button
                      className={`effect-button ${neonEffect === "static" ? "active" : ""}`}
                      onClick={() => setNeonEffect("static")}
                    >
                      Static
                    </button>
                    <button
                      className={`effect-button ${neonEffect === "breathing" ? "active" : ""}`}
                      onClick={() => setNeonEffect("breathing")}
                    >
                      Breathing
                    </button>
                    <button
                      className={`effect-button ${neonEffect === "pulse" ? "active" : ""}`}
                      onClick={() => setNeonEffect("pulse")}
                    >
                      Pulse
                    </button>
                    <button
                      className={`effect-button ${neonEffect === "wave" ? "active" : ""}`}
                      onClick={() => setNeonEffect("wave")}
                    >
                      Wave
                    </button>
                  </div>

                  <hr />

                  <div className="slider-group">
                    <div className="slider-label">Effect Speed: {neonSpeed}%</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={neonSpeed}
                      onChange={(e) => setNeonSpeed(Number(e.target.value))}
                    />
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
