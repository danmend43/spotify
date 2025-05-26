"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, ImageIcon, Music, LogIn, LogOut, Play, Pause, Copy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Declara Meyda global
declare global {
  interface Window {
    Meyda: any
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  duration_ms: number
  preview_url: string | null
}

interface SpotifyUser {
  id: string
  display_name: string
  images: { url: string }[]
  email?: string
}

interface SpotifyBeat {
  start: number
  duration: number
  confidence: number
}

interface SpotifyAudioAnalysis {
  beats: SpotifyBeat[]
  sections: any[]
  segments: any[]
  tatums: any[]
  bars: any[]
}

export default function PhotoBeatBorder() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [meydaLoaded, setMeydaLoaded] = useState(false)

  // Spotify states
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false)
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null)
  const [audioAnalysis, setAudioAnalysis] = useState<SpotifyAudioAnalysis | null>(null)
  const [currentProgress, setCurrentProgress] = useState<number>(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const meydaAnalyzerRef = useRef<any>(null)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const spotifyIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const beatTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Carrega Meyda quando o componente monta
  const loadMeyda = () => {
    const script = document.createElement("script")
    script.src = "https://unpkg.com/meyda/dist/web/meyda.min.js"
    script.onload = () => {
      setMeydaLoaded(true)
      console.log("✅ Meyda carregado!")
    }
    script.onerror = () => {
      console.error("❌ Erro ao carregar Meyda")
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }

  // Carrega Spotify Web Playback SDK
  const loadSpotifySDK = () => {
    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true
    document.head.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("✅ Spotify SDK carregado!")
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }

  useEffect(() => {
    loadMeyda()
    loadSpotifySDK()

    // Verifica se já tem token no localStorage
    const savedToken = localStorage.getItem("spotify_token")
    if (savedToken) {
      setSpotifyToken(savedToken)
      fetchSpotifyUser(savedToken)
    }

    // Verifica se voltou do callback com token
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get("access_token")
    const error = urlParams.get("error")
    const details = urlParams.get("details")

    if (error) {
      console.error("❌ Erro do callback:", error)
      let errorMessage = `Erro do Spotify: ${error}`

      if (details) {
        try {
          const errorDetails = JSON.parse(decodeURIComponent(details))
          console.error("❌ Detalhes do erro:", errorDetails)
          errorMessage += `\n\nDetalhes: ${JSON.stringify(errorDetails, null, 2)}`
        } catch (e) {
          errorMessage += `\n\nDetalhes: ${details}`
        }
      }

      alert(errorMessage)
      // Remove parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (accessToken) {
      console.log("✅ Token recebido do callback!")
      localStorage.setItem("spotify_token", accessToken)
      setSpotifyToken(accessToken)
      fetchSpotifyUser(accessToken)
      // Remove parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Configura player do Spotify quando tem token
  useEffect(() => {
    if (spotifyToken && window.Spotify && !spotifyPlayer) {
      const player = new window.Spotify.Player({
        name: "Audio Beat Detector",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(spotifyToken)
        },
        volume: 0.5,
      })

      // Eventos do player
      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("✅ Spotify Player pronto:", device_id)
      })

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("❌ Spotify Player não está pronto:", device_id)
      })

      player.addListener("player_state_changed", (state: any) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track)
          setIsSpotifyPlaying(!state.paused)
          setCurrentProgress(state.position)
          console.log("🎵 Música atual:", state.track_window.current_track.name)
          console.log("🎵 Progresso:", state.position, "ms")
        }
      })

      player.connect()
      setSpotifyPlayer(player)
    }
  }, [spotifyToken, spotifyPlayer])

  // Monitora música atual do Spotify
  useEffect(() => {
    if (spotifyToken) {
      console.log("🔍 Iniciando monitoramento do Spotify...")

      spotifyIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          })

          if (response.status === 401) {
            console.error("❌ Token expirado")
            localStorage.removeItem("spotify_token")
            setSpotifyToken(null)
            setSpotifyUser(null)
            return
          }

          if (response.ok && response.status !== 204) {
            const data = await response.json()

            if (data && data.item && data.is_playing) {
              // Verifica se é uma música nova
              if (!currentTrack || currentTrack.id !== data.item.id) {
                console.log("🎵 Nova música detectada:", data.item.name)
                setCurrentTrack(data.item)
                // Busca análise de áudio para a nova música
                await fetchAudioAnalysis(data.item.id)
              }

              setIsSpotifyPlaying(true)
              setCurrentProgress(data.progress_ms || 0)

              // Inicia sincronização de batidas se temos análise
              if (audioAnalysis) {
                syncBeatsWithProgress(data.progress_ms || 0)
              }
            } else {
              setIsSpotifyPlaying(false)
              stopAllBeats()
            }
          } else if (response.status === 204) {
            setIsSpotifyPlaying(false)
            setCurrentTrack(null)
            stopAllBeats()
          }
        } catch (error) {
          console.error("❌ Erro ao buscar música atual:", error)
        }
      }, 1000) // Verifica a cada 1 segundo para melhor sincronização

      return () => {
        if (spotifyIntervalRef.current) {
          clearInterval(spotifyIntervalRef.current)
        }
      }
    }
  }, [spotifyToken, currentTrack, audioAnalysis])

  // Busca análise de áudio do Spotify
  const fetchAudioAnalysis = async (trackId: string) => {
    if (!spotifyToken) return

    try {
      console.log("🔍 Buscando análise de áudio para:", trackId)
      const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })

      if (response.ok) {
        const analysis = await response.json()
        setAudioAnalysis(analysis)
        console.log("✅ Análise de áudio recebida!")
        console.log("🥁 Batidas encontradas:", analysis.beats?.length || 0)
        console.log("🎵 Seções:", analysis.sections?.length || 0)
        console.log("🎶 Segmentos:", analysis.segments?.length || 0)

        // Log das primeiras batidas para debug
        if (analysis.beats?.length > 0) {
          console.log("🥁 Primeiras 10 batidas:", analysis.beats.slice(0, 10))
        }
      } else {
        console.error("❌ Erro ao buscar análise:", response.status)
        setAudioAnalysis(null)
      }
    } catch (error) {
      console.error("❌ Erro na análise de áudio:", error)
      setAudioAnalysis(null)
    }
  }

  // Sincroniza batidas com o progresso atual da música
  const syncBeatsWithProgress = (progressMs: number) => {
    if (!audioAnalysis?.beats || !isSpotifyPlaying) return

    // Limpa timeouts anteriores
    stopAllBeats()

    const progressSeconds = progressMs / 1000
    console.log("🎵 Sincronizando batidas a partir de:", progressSeconds, "segundos")

    // Encontra batidas futuras (próximos 10 segundos)
    const upcomingBeats = audioAnalysis.beats.filter((beat) => {
      const beatTime = beat.start
      return beatTime > progressSeconds && beatTime < progressSeconds + 10
    })

    console.log("🥁 Batidas próximas:", upcomingBeats.length)

    // Agenda as batidas
    upcomingBeats.forEach((beat, index) => {
      const delay = (beat.start - progressSeconds) * 1000
      if (delay > 0 && delay < 10000) {
        // Só agenda se for nos próximos 10 segundos
        const timeout = setTimeout(() => {
          pulseOnBeat(beat.confidence)
        }, delay)

        beatTimeoutsRef.current.push(timeout)

        // Log apenas das primeiras 5 batidas para não poluir
        if (index < 5) {
          console.log(
            `🥁 Batida ${index + 1} agendada para +${delay.toFixed(0)}ms (confiança: ${beat.confidence.toFixed(2)})`,
          )
        }
      }
    })

    setIsPlaying(upcomingBeats.length > 0)
  }

  // Para todas as batidas agendadas
  const stopAllBeats = () => {
    beatTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    beatTimeoutsRef.current = []
    setIsPlaying(false)

    if (borderRef.current) {
      borderRef.current.style.boxShadow = "none"
      borderRef.current.style.borderColor = "rgb(239, 68, 68)"
    }
  }

  // Cria efeito visual na batida
  const pulseOnBeat = (confidence: number) => {
    if (!borderRef.current) return

    // Intensidade baseada na confiança da batida (0-1)
    const intensity = Math.max(confidence * 30, 10) // Mínimo 10, máximo 30
    const glowSize = intensity * 2
    const opacity = 0.6 + confidence * 0.4

    // Cor baseada na intensidade
    let red, green, blue
    if (confidence > 0.8) {
      // Batida muito forte - amarelo/branco
      red = 255
      green = 255
      blue = 100
    } else if (confidence > 0.6) {
      // Batida forte - laranja
      red = 255
      green = 150
      blue = 0
    } else if (confidence > 0.4) {
      // Batida média - vermelho
      red = 255
      green = 50
      blue = 50
    } else {
      // Batida fraca - vermelho escuro
      red = 200
      green = 50
      blue = 50
    }

    // Aplica o efeito
    borderRef.current.style.boxShadow = `
      0 0 ${glowSize}px rgba(${red}, ${green}, ${blue}, ${opacity}),
      0 0 ${glowSize * 2}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.5}),
      0 0 ${glowSize * 3}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.3})
    `
    borderRef.current.style.borderColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`

    // Volta ao normal após um tempo baseado na confiança
    const duration = 100 + confidence * 200 // 100-300ms
    setTimeout(() => {
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "none"
        borderRef.current.style.borderColor = "rgb(239, 68, 68)"
      }
    }, duration)

    console.log(`🥁 Batida! Confiança: ${confidence.toFixed(2)}, Intensidade: ${intensity.toFixed(1)}`)
  }

  const fetchSpotifyUser = async (token: string) => {
    try {
      console.log("🔍 Buscando dados do usuário...")
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const user = await response.json()
        setSpotifyUser(user)
        console.log("✅ Usuário Spotify:", user.display_name)
      } else {
        localStorage.removeItem("spotify_token")
        setSpotifyToken(null)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  const handleSpotifyLogin = () => {
    const clientId = "384115184ce848c1bf39bdd8d0209f83"
    const redirectUri = "https://spotify-eight-green.vercel.app/api/spotify/callback"

    localStorage.removeItem("spotify_token")

    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "streaming",
      "user-read-email",
      "user-read-private",
    ].join(" ")

    const state = Math.random().toString(36).substring(2, 15)
    localStorage.setItem("spotify_auth_state", state)

    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scopes)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("show_dialog", "true")

    window.location.href = authUrl.toString()
  }

  const handleSpotifyLogout = () => {
    localStorage.removeItem("spotify_token")
    setSpotifyToken(null)
    setSpotifyUser(null)
    setCurrentTrack(null)
    setIsSpotifyPlaying(false)
    setAudioAnalysis(null)
    stopAllBeats()
    if (spotifyPlayer) {
      spotifyPlayer.disconnect()
      setSpotifyPlayer(null)
    }
  }

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        setImageFile(file)
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl)
        }
        const url = URL.createObjectURL(file)
        setImageUrl(url)
      }
    },
    [imageUrl],
  )

  const handleAudioUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !file.type.startsWith("audio/") || !meydaLoaded) return

      setAudioFile(file)

      try {
        // Para análise do Spotify
        stopAllBeats()

        if (sourceRef.current) {
          sourceRef.current.disconnect()
          sourceRef.current.stop()
        }
        if (meydaAnalyzerRef.current) {
          meydaAnalyzerRef.current.stop()
        }

        // Setup Audio Context
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
        }

        const arrayBuffer = await file.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

        // Cria source
        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        sourceRef.current = source

        // Configura Meyda
        const meydaAnalyzer = window.Meyda.createMeydaAnalyzer({
          audioContext: audioContextRef.current,
          source: source,
          bufferSize: 512,
          featureExtractors: ["rms"],
          callback: (features: any) => {
            if (features && features.rms && borderRef.current) {
              const intensity = features.rms * 20
              const glowSize = intensity * 2
              const opacity = 0.7 + intensity * 0.3

              let red, green, blue
              if (intensity > 15) {
                red = 255
                green = 255
                blue = 100
              } else if (intensity > 10) {
                red = 255
                green = 150
                blue = 0
              } else if (intensity > 5) {
                red = 255
                green = 50
                blue = 50
              } else {
                red = 239
                green = 68
                blue = 68
              }

              borderRef.current.style.boxShadow = `
                0 0 ${glowSize}px rgba(${red}, ${green}, ${blue}, ${opacity}),
                0 0 ${glowSize * 2}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.5}),
                0 0 ${glowSize * 3}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.3})
              `
              borderRef.current.style.borderColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`
            }
          },
        })

        meydaAnalyzerRef.current = meydaAnalyzer

        // Conecta e inicia
        source.connect(audioContextRef.current.destination)
        meydaAnalyzer.start()
        source.start()

        setIsPlaying(true)

        source.onended = () => {
          setIsPlaying(false)
          if (borderRef.current) {
            borderRef.current.style.boxShadow = "none"
            borderRef.current.style.borderColor = "rgb(239, 68, 68)"
          }
        }
      } catch (error) {
        console.error("❌ Erro ao processar áudio:", error)
      }
    },
    [meydaLoaded],
  )

  // Função para determinar qual imagem mostrar
  const getDisplayImage = () => {
    if (currentTrack?.album?.images?.[0]?.url) {
      return currentTrack.album.images[0].url
    }
    if (spotifyUser?.images?.[0]?.url) {
      return spotifyUser.images[0].url
    }
    if (imageUrl) {
      return imageUrl
    }
    return null
  }

  const displayImage = getDisplayImage()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Status */}
        <div className="text-center space-y-2">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              meydaLoaded ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${meydaLoaded ? "bg-green-400" : "bg-yellow-400"}`} />
            {meydaLoaded ? "Meyda carregado" : "Carregando Meyda..."}
          </div>

          {spotifyUser && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900/30 text-green-400">
              <div className="w-2 h-2 rounded-full mr-2 bg-green-400" />
              Logado no Spotify: {spotifyUser.display_name}
            </div>
          )}

          {/* Seção "Ouvindo agora" */}
          {currentTrack && (
            <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-green-400 text-sm font-medium mb-1">🎵 OUVINDO AGORA</div>
              <div className="text-white text-xl font-bold">{currentTrack.name}</div>
              <div className="text-gray-300 text-sm">
                {currentTrack.artists.map((artist) => artist.name).join(", ")}
              </div>
              <div className="text-gray-400 text-xs mt-1">{currentTrack.album.name}</div>

              {/* Status de reprodução */}
              <div className="flex items-center justify-center mt-3 gap-4">
                {isSpotifyPlaying ? (
                  <div className="flex items-center text-green-400">
                    <Play className="w-4 h-4 mr-1" />
                    <span className="text-sm">Tocando</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-400">
                    <Pause className="w-4 h-4 mr-1" />
                    <span className="text-sm">Pausado</span>
                  </div>
                )}

                {/* Indicador de análise */}
                {audioAnalysis ? (
                  <div className="flex items-center text-blue-400">
                    <Music className="w-4 h-4 mr-1" />
                    <span className="text-xs">{audioAnalysis.beats?.length || 0} batidas</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-400">
                    <Music className="w-4 h-4 mr-1" />
                    <span className="text-xs">Analisando...</span>
                  </div>
                )}
              </div>

              {/* Progresso da música */}
              {currentProgress > 0 && currentTrack.duration_ms > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">
                    {Math.floor(currentProgress / 1000 / 60)}:
                    {String(Math.floor((currentProgress / 1000) % 60)).padStart(2, "0")} /{" "}
                    {Math.floor(currentTrack.duration_ms / 1000 / 60)}:
                    {String(Math.floor((currentTrack.duration_ms / 1000) % 60)).padStart(2, "0")}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-green-400 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentProgress / currentTrack.duration_ms) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensagem quando não está ouvindo nada */}
          {!currentTrack && spotifyToken && (
            <div className="text-center bg-gray-800/30 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 text-sm">🔍 Nenhuma música detectada</div>
              <div className="text-gray-500 text-xs mt-1">Toque uma música no Spotify para sincronizar</div>
            </div>
          )}

          {/* Debug info */}
          <div className="text-xs text-gray-400 space-y-1">
            {spotifyToken && <div>✅ Token Spotify ativo</div>}
            {spotifyUser && <div>✅ Usuário: {spotifyUser.display_name}</div>}
            {currentTrack && <div>✅ Música: {currentTrack.name}</div>}
            {audioAnalysis && <div>✅ Análise: {audioAnalysis.beats?.length || 0} batidas</div>}
            {isSpotifyPlaying && <div>🎵 Reproduzindo</div>}
            {isPlaying && <div>🥁 Batidas sincronizadas</div>}
          </div>
        </div>

        {/* Foto com borda de onda */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Foto redonda */}
            <div
              className="w-64 h-64 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: displayImage ? `url(${displayImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!displayImage && <ImageIcon className="w-16 h-16 text-gray-400" />}
            </div>

            {/* Borda com efeito de onda */}
            <div
              ref={borderRef}
              className="absolute inset-0 rounded-full border-4 border-red-500 transition-all duration-100 ease-out"
              style={{
                margin: "-1px",
                boxShadow: "none",
              }}
            />
          </div>
        </div>

        {/* Controles */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 space-y-6">
            {/* Spotify Login */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Spotify</label>

              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-400 text-sm mb-2">🔗 Configure no Spotify Dashboard: :D</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-gray-700 rounded text-white text-xs">
                    https://spotify-eight-green.vercel.app/api/spotify/callback
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("https://spotify-eight-green.vercel.app/api/spotify/callback")}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  1. Vá em developer.spotify.com/dashboard
                  <br />
                  2. Clique no seu app → Edit Settings
                  <br />
                  3. Adicione a URL acima em "Redirect URIs"
                  <br />
                  4. Clique Save
                </p>
              </div>

              {!spotifyToken ? (
                <Button onClick={handleSpotifyLogin} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Conectar com Spotify
                </Button>
              ) : (
                <Button onClick={handleSpotifyLogout} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Desconectar Spotify
                </Button>
              )}
            </div>

            {/* Separador */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-3 text-gray-400 text-sm">ou</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Upload de Imagem */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Foto</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">{imageFile ? imageFile.name : "Enviar foto"}</span>
                </label>
              </div>
            </div>

            {/* Upload de Áudio */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Música</label>
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  disabled={!meydaLoaded}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                    meydaLoaded
                      ? "border-green-600 hover:border-green-500 bg-green-900/10"
                      : "border-gray-700 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Music className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 text-sm font-medium">
                    {!meydaLoaded
                      ? "Aguarde Meyda carregar..."
                      : audioFile
                        ? audioFile.name
                        : "🎵 Enviar música (MP3, WAV, etc.)"}
                  </span>
                </label>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Formatos suportados: MP3, WAV, OGG, M4A. A borda pulsará com a batida da música!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
