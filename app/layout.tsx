import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ZETICUZ",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: "/Logo.ico",
    shortcut: "/Logo.ico",
    apple: "/Logo.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <head>
        <link rel="dns-prefetch" href="https://vidsrc.xyz" />
        <link rel="dns-prefetch" href="https://proxy.garageband.rocks" />
        <link rel="dns-prefetch" href="https://vidsrc.cc" />
        <link rel="dns-prefetch" href="https://vidsrc.net" />
        <link rel="dns-prefetch" href="https://vidsrc.rip" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />
        <link rel="dns-prefetch" href="https://vidsrc.in" />
        <link rel="dns-prefetch" href="https://vidsrc.me" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.ipify.org" />

        <link rel="preconnect" href="https://vidsrc.xyz" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://proxy.garageband.rocks" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
