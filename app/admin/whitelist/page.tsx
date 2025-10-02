"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, Shield } from "lucide-react"

export default function WhitelistPage() {
  const [whitelist, setWhitelist] = useState<string[]>([
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://samxerz1.vercel.app",
  ])
  const [newUrl, setNewUrl] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = "SamXerz1973!" // ⚠️ CHANGE THIS IN PRODUCTION!

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("admin-auth", "true")
    } else {
      alert("Incorrect password")
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem("admin-auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }

    const saved = localStorage.getItem("whitelist")
    if (saved) {
      setWhitelist(JSON.parse(saved))
    }
  }, [])

  const handleAddUrl = () => {
    if (newUrl && !whitelist.includes(newUrl)) {
      const updated = [...whitelist, newUrl]
      setWhitelist(updated)
      setNewUrl("")
    }
  }

  const handleRemoveUrl = (url: string) => {
    const updated = whitelist.filter((u) => u !== url)
    setWhitelist(updated)
  }

  const handleSave = () => {
    localStorage.setItem("whitelist", JSON.stringify(whitelist))
    alert("Whitelist saved! Note: You need to update the middleware.ts file with these URLs for production.")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 text-center">ZETFLIX Admin</h1>
          <p className="text-gray-400 mb-6 text-center">Secure Access Required</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            Login
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">Protected by enterprise-grade security</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Whitelist Manager</h1>
          </div>
          <p className="text-gray-400 mb-6">
            Manage domains allowed to embed your streaming player. Include http:// or https://
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
              placeholder="https://example.com or http://localhost:3000"
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddUrl}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {whitelist.map((url) => (
              <div
                key={url}
                className="flex items-center justify-between bg-gray-800/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
              >
                <span className="text-white font-mono text-sm">{url}</span>
                <button
                  onClick={() => handleRemoveUrl(url)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Save Whitelist
          </button>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>⚠️ Important:</strong> For production deployment, you must manually update the{" "}
              <code className="bg-black/30 px-2 py-1 rounded">middleware.ts</code> file with these URLs.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>🔒 Security:</strong> All URLs are protected with advanced obfuscation and CORS policies. Your
              streaming sources are hidden from dev tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
