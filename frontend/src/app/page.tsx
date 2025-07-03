"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [key, setKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const generateRandomKey = () => {
    setIsGenerating(true)
    
    // Add a small delay for better UX
    setTimeout(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setKey(result)
      setIsGenerating(false)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key.trim()) {
      router.push(`/watch?key=${encodeURIComponent(key.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero Section */}
          <div className={`mt-5 text-center space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-lg opacity-30 animate-pulse" />
                  <div className="relative text-6xl md:text-7xl">🪝</div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Hook<span className="text-indigo-600 dark:text-indigo-400">Box</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                The modern way to monitor HTTP requests in real-time. 
                <span className="block mt-2 text-lg text-slate-500 dark:text-slate-400">
                  Enter your unique key and watch the magic happen ✨
                </span>
              </p>
            </div>

            {/* Quick Start Demo */}
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 max-w-2xl mx-auto backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Try it now:</p>
              <code className="text-sm font-mono bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-200">
                curl -X POST {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/in/your-key -d &quot;Hello HookBox!&quot;
              </code>
            </div>
          </div>

          {/* Main Form Card */}
          <div className={`flex justify-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  Get Started
                </CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                  Create your monitoring endpoint in seconds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Enter your unique key..."
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="text-center text-lg h-14 border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200"
                        required
                      />
                      {key && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="text-green-500 text-lg">✓</div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={generateRandomKey}
                      disabled={isGenerating}
                      className="w-full h-12 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          🎲 Generate Random Key
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={!key.trim()}
                  >
                    <div className="flex items-center gap-2">
                      🚀 Start Monitoring
                    </div>
                  </Button>
                </form>

                {/* Key Preview */}
                {key && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Your endpoint will be:</p>
                    <code className="text-sm font-mono bg-white dark:bg-slate-800 px-3 py-2 rounded border text-indigo-700 dark:text-indigo-300 block break-all">
                      {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/in/{key}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="text-center p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌐</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Universal Endpoint</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Send any HTTP request method (GET, POST, PUT, DELETE) to your unique endpoint
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Real-time Updates</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  See requests instantly via WebSocket with beautiful animations and live notifications
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Detailed Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inspect headers, body, timestamps, source IPs, and complete request metadata
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className={`text-center space-y-6 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Perfect for Developers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { icon: "🔗", title: "Webhook Testing", desc: "Test your webhooks instantly" },
                { icon: "🐛", title: "API Debugging", desc: "Debug API integrations" },
                { icon: "📱", title: "Mobile Development", desc: "Monitor app requests" },
                { icon: "🤖", title: "Bot Development", desc: "Test bot interactions" }
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-slate-200 {
          background-image: radial-gradient(circle, rgb(203 213 225) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .dark .bg-grid-slate-700\/25 {
          background-image: radial-gradient(circle, rgba(71, 85, 105, 0.25) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}
