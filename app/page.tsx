"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { ImageIcon, Music, LogIn, LogOut, Play, Pause } from "lucide-react"
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

interface SpotifyAudioFeatures {
  tempo: number
  energy: number
  danceability: number
  valence: number
  loudness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  speechiness: number
  time_signature: number
}

interface SimulatedBeat {
  start: number
  duration: number
  confidence: number
  intensity: number
  type: "kick" | "snare" | "hihat" | "accent"
}

export default function AudioBeatDetector() {
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
  const [audioFeatures, setAudioFeatures] = useState<SpotifyAudioFeatures | null>(null)
  const [simulatedBeats, setSimulatedBeats] = useState<SimulatedBeat[]>([])
  const [currentProgress, setCurrentProgress] = useState<number>(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const meydaAnalyzerRef = useRef<any>(null)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const spotifyIntervalRef = useRef<NodeJS.Timeout | null>(null)
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
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (accessToken) {
      console.log("✅ Token recebido do callback!")
      localStorage.setItem("spotify_token", accessToken)
      setSpotifyToken(accessToken)
      fetchSpotifyUser(accessToken)
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
              if (!currentTrack || currentTrack.id !== data.item.id) {
                console.log("🎵 Nova música detectada:", data.item.name)
                setCurrentTrack(data.item)
                await fetchAudioFeatures(data.item.id)
              }

              setIsSpotifyPlaying(true)
              setCurrentProgress(data.progress_ms || 0)

              if (simulatedBeats.length > 0) {
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
      }, 500)

      return () => {
        if (spotifyIntervalRef.current) {
          clearInterval(spotifyIntervalRef.current)
        }
      }
    }
  }, [spotifyToken, currentTrack, simulatedBeats])

  // Busca BPM da música e inicia pulsação simples
  const fetchAudioFeatures = async (trackId: string) => {
    if (!spotifyToken) return

    try {
      console.log("🔍 Buscando BPM para:", trackId)

      const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })

      if (response.ok) {
        const features = await response.json()
        setAudioFeatures(features)
        console.log("✅ BPM recebido:", features.tempo)

        // Inicia pulsação baseada no BPM
        startBPMPulse(features.tempo)
      } else {
        console.error("❌ Erro ao buscar BPM:", response.status)
        // Fallback: usa BPM padrão
        const defaultBPM = 120
        console.log("🔄 Usando BPM padrão:", defaultBPM)
        startBPMPulse(defaultBPM)
      }
    } catch (error) {
      console.error("❌ Erro na busca de BPM:", error)
      // Fallback: usa BPM padrão
      const defaultBPM = 120
      console.log("🔄 Usando BPM padrão:", defaultBPM)
      startBPMPulse(defaultBPM)
    }
  }

  // Inicia pulsação simples baseada no BPM
  const startBPMPulse = (bpm: number) => {
    stopAllBeats() // Para qualquer pulsação anterior

    // Calcula intervalo entre batidas em ms
    const interval = 60000 / bpm
    console.log(`🥁 Iniciando pulsação: ${bpm} BPM (${interval.toFixed(0)}ms por batida)`)

    // Função de pulso simples
    const pulse = () => {
      if (!borderRef.current || !isSpotifyPlaying) return

      console.log("🔥 PULSE!")

      // Aplica efeito visual
      borderRef.current.style.boxShadow = "0 0 30px 15px #1DB954"
      borderRef.current.style.borderColor = "#1DB954"
      borderRef.current.style.borderWidth = "6px"

      // Remove efeito após metade do intervalo
      setTimeout(() => {
        if (borderRef.current) {
          borderRef.current.style.boxShadow = "none"
          borderRef.current.style.borderColor = "rgb(239, 68, 68)"
          borderRef.current.style.borderWidth = "4px"
        }
      }, interval / 2)
    }

    // Inicia pulsação imediata
    pulse()

    // Configura intervalo de pulsação
    const pulseInterval = setInterval(() => {
      if (isSpotifyPlaying) {
        pulse()
      }
    }, interval)

    // Salva referência para poder parar depois
    beatTimeoutsRef.current.push(pulseInterval as any)
    setIsPlaying(true)
  }

  // Sincroniza batidas com o progresso atual da música
  const syncBeatsWithProgress = (progressMs: number) => {
    // This function can be removed or simplified
  }

  // Para todas as batidas agendadas
  const stopAllBeats = () => {
    beatTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    beatTimeoutsRef.current = []
    setIsPlaying(false)

    if (borderRef.current) {
      borderRef.current.style.boxShadow = "none"
      borderRef.current.style.borderColor = "rgb(239, 68, 68)"
      borderRef.current.style.borderWidth = "4px"
    }
  }

  // Cria efeito visual na batida baseado no tipo e intensidade
  const pulseOnBeat = (beat: SimulatedBeat) => {
    // This function can be removed
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

  const handleSpotifyLogin = () => {
    const clientId = "384115184ce848c1bf39bdd8d0209f83"

    // Tenta usar a URL atual como base para o redirect
    const currentUrl = window.location.origin
    const redirectUri = `${currentUrl}/api/spotify/callback`

    localStorage.removeItem("spotify_token")

    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-recently-played",
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-library-read", // Adiciona este scope
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

    console.log("🔍 URL de autenticação:", authUrl.toString())
    console.log("🔍 Redirect URI:", redirectUri)
    window.location.href = authUrl.toString()
  }

  const handleSpotifyLogout = () => {
    localStorage.removeItem("spotify_token")
    setSpotifyToken(null)
    setSpotifyUser(null)
    setCurrentTrack(null)
    setIsSpotifyPlaying(false)
    setAudioFeatures(null)
    setSimulatedBeats([])
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
        stopAllBeats()

        if (sourceRef.current) {
          sourceRef.current.disconnect()
          sourceRef.current.stop()
        }
        if (meydaAnalyzerRef.current) {
          meydaAnalyzerRef.current.stop()
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
        }

        const arrayBuffer = await file.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        sourceRef.current = source

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

              {/* Características da música */}
              {audioFeatures && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-gray-400">BPM:</span>{" "}
                    <span className="text-white">{Math.round(audioFeatures.tempo)}</span>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-gray-400">Energia:</span>{" "}
                    <span className="text-white">{Math.round(audioFeatures.energy * 100)}%</span>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-gray-400">Dança:</span>{" "}
                    <span className="text-white">{Math.round(audioFeatures.danceability * 100)}%</span>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-gray-400">Humor:</span>{" "}
                    <span className="text-white">{Math.round(audioFeatures.valence * 100)}%</span>
                  </div>
                </div>
              )}

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

                {/* Indicador de batidas simuladas */}
                {simulatedBeats.length > 0 ? (
                  <div className="flex items-center text-blue-400">
                    <Music className="w-4 h-4 mr-1" />
                    <span className="text-xs">{simulatedBeats.length} batidas simuladas</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-400">
                    <Music className="w-4 h-4 mr-1" />
                    <span className="text-xs">Simulando batidas...</span>
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
              <div className="text-gray-500 text-xs mt-1">Toque uma música no Spotify para ver os efeitos!</div>
            </div>
          )}
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

            {/* Upload de Áudio */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Música Local</label>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
