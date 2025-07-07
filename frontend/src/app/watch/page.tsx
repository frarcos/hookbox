"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RequestData {
  method: string
  headers: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  source: string
  timestamp: string
  id?: string // Add unique ID for animation tracking
}

function WatchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const key = searchParams.get("key")
  const [requests, setRequests] = useState<RequestData[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set()) // Track new requests for animation
  const wsRef = useRef<WebSocket | null>(null)

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  useEffect(() => {
    if (!key) {
      router.push("/")
      return
    }

    const connectWebSocket = () => {
      setConnectionStatus("connecting")
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
      const wsUrl = `${wsBaseUrl}/ws?key=${encodeURIComponent(key)}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setConnectionStatus("connected")
        console.log("WebSocket connected")
      }

      ws.onmessage = (event) => {
        try {
          const requestData: RequestData = JSON.parse(event.data)
          // Add unique ID for animation tracking
          const requestWithId = {
            ...requestData,
            id: `${Date.now()}-${Math.random()}`
          }
          
          setRequests(prev => {
            // Add new request and limit to 100 items
            const updated = [requestWithId, ...prev].slice(0, 100)
            return updated
          })
          
          // Mark as new for animation
          setNewRequestIds(prev => new Set([...prev, requestWithId.id!]))
          
          // Remove the "new" status after animation
          setTimeout(() => {
            setNewRequestIds(prev => {
              const updated = new Set(prev)
              updated.delete(requestWithId.id!)
              return updated
            })
          }, 2000) // Animation duration
          
        } catch (error) {
          console.log("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        setConnectionStatus("disconnected")
        console.log("WebSocket disconnected")
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.log("WebSocket error:", error)
        setConnectionStatus("disconnected")
      }

      wsRef.current = ws
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [key, router])

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
      POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800", 
      PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800",
      PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800"
    }
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800"
  }

  const getMethodIcon = (method: string) => {
    const icons = {
      GET: "📥",
      POST: "📤", 
      PUT: "🔄",
      DELETE: "🗑️",
      PATCH: "✏️"
    }
    return icons[method as keyof typeof icons] || "📨"
  }

  const getStatusColor = (status: "connecting" | "connected" | "disconnected") => {
    const colors = {
      connecting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
      connected: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700",
      disconnected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700"
    }
    return colors[status]
  }

  const extractHeaderInfo = (headers: Record<string, string>) => {
    return {
      userAgent: headers['user-agent'] || headers['User-Agent'] || 'Unknown',
      contentType: headers['content-type'] || headers['Content-Type'] || 'Unknown',
      contentLength: headers['content-length'] || headers['Content-Length'] || 'Unknown',
      origin: headers['origin'] || headers['Origin'] || 'Unknown',
      referer: headers['referer'] || headers['Referer'] || 'Unknown',
      host: headers['host'] || headers['Host'] || 'Unknown'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      time: date.toLocaleTimeString(),
      date: date.toLocaleDateString(),
      relative: getRelativeTime(date)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const clearRequests = () => {
    setRequests([])
    setNewRequestIds(new Set())
  }

  const copyEndpoint = () => {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/in/${key}`
    navigator.clipboard.writeText(endpoint)
  }

  if (!key) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      {/* Fixed Back Button */}
      <Button
        onClick={() => router.push("/")}
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg transition-all duration-200 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span className="ml-1">Home</span>
      </Button>

      {/* Fixed Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <Badge className={`${getStatusColor(connectionStatus)} border text-sm px-4 py-2 shadow-lg backdrop-blur-sm`}>
          {connectionStatus === "connecting" && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              Connecting...
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Connected
            </div>
          )}
          {connectionStatus === "disconnected" && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              Disconnected
            </div>
          )}
        </Badge>
      </div>

      <div className="relative pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-md opacity-30 animate-pulse" />
                  <div className="relative text-4xl">👀</div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-relaxed">
                Monitoring: <span className="font-mono text-indigo-600 dark:text-indigo-400">{key}</span>
              </h1>
              
              <div className="max-w-3xl mx-auto">
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Send requests to your endpoint and watch them appear in real-time:
                </p>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <code className="font-mono text-sm md:text-base text-slate-800 dark:text-slate-200 break-all flex-1">
                      {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/in/{key}
                    </code>
                    <Button
                      onClick={copyEndpoint}
                      variant="outline"
                      size="sm"
                      className="shrink-0 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      📋 Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Controls */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <CardContent className="px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    📊 {requests.length} request{requests.length !== 1 ? "s" : ""} received
                  </div>
                  {requests.length >= 100 && (
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600">
                      ⚠️ Limited to 100 (auto-cleaning)
                    </Badge>
                  )}
                  {requests.length > 0 && (
                    <div className="text-slate-500 dark:text-slate-400">
                      Latest: {formatTimestamp(requests[0].timestamp).relative}
                    </div>
                  )}
                </div>
                
                {requests.length > 0 && (
                  <Button variant="outline" onClick={clearRequests} className="gap-2 hover:bg-red-50 dark:hover:bg-red-900/20">
                    🗑️ Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div>
            {requests.length === 0 ? (
              <Card className="text-center py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-8xl opacity-50">🎯</div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Waiting for requests...</h3>
                      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Send a request to your endpoint to see it appear here in real-time with beautiful animations.
                      </p>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg p-4 max-w-xl mx-auto">
                      <p className="mb-2 font-medium">Try this example:</p>
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`curl -X POST ${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/in/${key} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello HookBox!"}'`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[700px] rounded-lg">
                <div className="space-y-6 p-4">
                  {requests.map((request, index) => {
                    const headerInfo = extractHeaderInfo(request.headers)
                    const timeInfo = formatTimestamp(request.timestamp)
                    const isExpanded = expandedCards.has(index)
                    const isNew = request.id && newRequestIds.has(request.id)
                    
                    return (
                      <Card 
                        key={request.id || index} 
                        className={`
                          bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 
                          transition-all duration-500 overflow-hidden transform shadow-md hover:shadow-lg
                          ${isNew ? 'animate-slide-in-fade ring-2 ring-indigo-400/50 shadow-xl scale-[1.01]' : ''}
                        `}
                        style={{
                          animation: isNew ? 'slideInFade 0.5s ease-out, highlight 2s ease-out' : undefined
                        }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Badge className={`${getMethodColor(request.method)} text-sm px-3 py-2 font-bold flex items-center gap-2 border shadow-sm`}>
                                {getMethodIcon(request.method)} {request.method}
                              </Badge>
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🕐</span>
                                  <div className="flex flex-col">
                                    <span className="font-mono text-sm font-semibold">{timeInfo.time}</span>
                                    <span className="text-xs">{timeInfo.relative}</span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="font-mono text-xs px-2 py-1 flex items-center gap-1">
                                  🌐 <span>{request.source}</span>
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCard(index)}
                              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <span className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶️
                              </span>
                            </Button>
                          </div>
                          
                          {/* Compact summary when collapsed */}
                          {!isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">🖥️ {headerInfo.host}</span>
                                <span className="flex items-center gap-1">📄 {headerInfo.contentType.split(';')[0]}</span>
                                {headerInfo.contentLength !== 'Unknown' && (
                                  <span className="flex items-center gap-1">📏 {headerInfo.contentLength} bytes</span>
                                )}
                              </div>
                            </div>
                          )}
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="space-y-6 p-6">
                            {/* Request Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🖥️</span>
                                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Host</h4>
                                </div>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 break-words overflow-hidden">
                                  {headerInfo.host}
                                </p>
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">📄</span>
                                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Content Type</h4>
                                </div>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 break-words">
                                  {headerInfo.contentType}
                                </p>
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">📏</span>
                                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Content Length</h4>
                                </div>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                  {headerInfo.contentLength} bytes
                                </p>
                              </div>
                            </div>

                            {/* User Agent */}
                            {headerInfo.userAgent !== 'Unknown' && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">🔍</span>
                                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">User Agent</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-words whitespace-pre-wrap overflow-hidden">
                                    {headerInfo.userAgent}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Origin & Referer */}
                            {(headerInfo.origin !== 'Unknown' || headerInfo.referer !== 'Unknown') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {headerInfo.origin !== 'Unknown' && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">🌍</span>
                                      <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Origin</h4>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-words overflow-hidden">
                                        {headerInfo.origin}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {headerInfo.referer !== 'Unknown' && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">🔗</span>
                                      <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Referer</h4>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-words overflow-hidden">
                                        {headerInfo.referer}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Headers */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">📋</span>
                                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">All Headers</h4>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-auto">
                                <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words overflow-hidden">
                                  {JSON.stringify(request.headers, null, 2)}
                                </pre>
                              </div>
                            </div>

                            {/* Body */}
                            {request.body && Object.keys(request.body).length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">📦</span>
                                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Request Body</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-auto">
                                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words overflow-hidden">
                                    {JSON.stringify(request.body, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInFade {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes highlight {
          0% {
            background-color: rgba(99, 102, 241, 0.1);
            border-color: rgba(99, 102, 241, 0.3);
          }
          100% {
            background-color: transparent;
            border-color: transparent;
          }
        }
        
        .animate-slide-in-fade {
          animation: slideInFade 0.5s ease-out;
        }

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

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h3 className="text-2xl font-semibold">Loading...</h3>
        </div>
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  )
} 