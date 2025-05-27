"use client"
import { useState, useRef, useEffect } from "react"
import { ImageIcon, Music, LogIn, LogOut, Play, Pause } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  duration_ms: number
}

interface SpotifyUser {
  id: string
  display_name: string
  images: { url: string }[]
}

interface SpotifyAudioFeatures {
  tempo: number
  energy: number
  danceability: number
  valence: number
}

export default function AudioBeatDetector() {
  // Spotify states
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false)
  const [audioFeatures, setAudioFeatures] = useState<SpotifyAudioFeatures | null>(null)
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [isPulsing, setIsPulsing] = useState(false)

  const borderRef = useRef<HTMLDivElement | null>(null)
  const spotifyIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
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

    if (error) {
      console.error("❌ Erro do callback:", error)
      alert(`Erro do Spotify: ${error}`)
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
                await fetchBPMAndStartPulse(data.item.id)
              }

              setIsSpotifyPlaying(true)
              setIsPulsing(true)
              setCurrentProgress(data.progress_ms || 0)
            } else {
              setIsSpotifyPlaying(false)
              setIsPulsing(false)
              stopPulse()
            }
          } else if (response.status === 204) {
            setIsSpotifyPlaying(false)
            setCurrentTrack(null)
            stopPulse()
          }
        } catch (error) {
          console.error("❌ Erro ao buscar música atual:", error)
        }
      }, 1000)

      return () => {
        if (spotifyIntervalRef.current) {
          clearInterval(spotifyIntervalRef.current)
        }
      }
    }
  }, [spotifyToken, currentTrack])

  // Estima BPM baseado no nome da música e artista
  const estimateBPMFromTrack = (track: SpotifyTrack | null): number => {
    if (!track) return 120

    const trackName = track.name.toLowerCase()
    const artistName = track.artists[0]?.name.toLowerCase() || ""
    const combined = `${trackName} ${artistName}`

    // Palavras que indicam música lenta (60-90 BPM)
    const slowKeywords = ["ballad", "slow", "love", "acoustic", "piano", "sad", "emotional", "calm"]

    // Palavras que indicam música rápida (140-180 BPM)
    const fastKeywords = ["dance", "electronic", "techno", "house", "edm", "dubstep", "drum", "bass", "party", "club"]

    // Palavras que indicam música média-rápida (120-140 BPM)
    const mediumFastKeywords = ["rock", "pop", "indie", "alternative", "punk", "metal"]

    // Verifica palavras-chave
    if (slowKeywords.some((keyword) => combined.includes(keyword))) {
      return 75 + Math.random() * 15 // 75-90 BPM
    }

    if (fastKeywords.some((keyword) => combined.includes(keyword))) {
      return 140 + Math.random() * 40 // 140-180 BPM
    }

    if (mediumFastKeywords.some((keyword) => combined.includes(keyword))) {
      return 120 + Math.random() * 20 // 120-140 BPM
    }

    // Padrão: música média
    return 110 + Math.random() * 20 // 110-130 BPM
  }

  // Busca BPM e inicia pulsação
  const fetchBPMAndStartPulse = async (trackId: string) => {
    if (!spotifyToken) return

    try {
      console.log("🔍 Tentando buscar BPM real para:", trackId)

      const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })

      if (response.ok) {
        const features = await response.json()
        setAudioFeatures(features)
        console.log("✅ BPM recebido:", Math.round(features.tempo))

        // Inicia pulsação baseada no BPM
        startBPMPulse(features.tempo, features.energy)
      } else {
        console.log("⚠️ API retornou 403, usando estimativa inteligente")
        const estimatedBPM = estimateBPMFromTrack(currentTrack)
        console.log("🧠 BPM estimado:", estimatedBPM)
        startBPMPulse(estimatedBPM, 0.6)
      }
    } catch (error) {
      console.error("❌ Erro na busca de BPM:", error)
      // Fallback: usa BPM padrão
      console.log("🔄 Usando BPM padrão: 120")
      startBPMPulse(120, 0.6)
    }
  }

  // Inicia pulsação sincronizada baseada no BPM
  const startBPMPulse = (bpm: number, energy = 0.6) => {
    stopPulse() // Para qualquer pulsação anterior

    // Calcula intervalo entre batidas em ms
    const interval = 60000 / bpm
    console.log(`🥁 Iniciando pulsação: ${Math.round(bpm)} BPM (${Math.round(interval)}ms por batida)`)

    // Ajusta intensidade baseada na energia
    const intensity = Math.max(0.3, energy)
    const glowSize = 15 + intensity * 25 // 15-40px
    const glowIntensity = 8 + intensity * 15 // 8-23px

    // Cores baseadas na energia
    let color = "#1DB954" // Verde Spotify padrão
    if (energy > 0.8) {
      color = "#FF6B6B" // Vermelho para alta energia
    } else if (energy > 0.6) {
      color = "#4ECDC4" // Ciano para energia média-alta
    } else if (energy < 0.3) {
      color = "#45B7D1" // Azul para baixa energia
    }

    // Sincroniza com o progresso da música
    const syncWithProgress = () => {
      if (!isSpotifyPlaying || !currentProgress) return interval

      // Calcula quantas batidas já passaram desde o início da música
      const beatsElapsed = currentProgress / interval
      const nextBeatTime = Math.ceil(beatsElapsed) * interval
      const timeToNextBeat = nextBeatTime - currentProgress

      return Math.max(50, timeToNextBeat) // Mínimo 50ms para evitar problemas
    }

    // Função de pulso melhorada
    const pulse = () => {
      if (!borderRef.current || !isSpotifyPlaying) return

      console.log("🔥 PULSE!")

      // Aplica efeito visual mais suave
      borderRef.current.style.transition = "all 0.1s ease-out"
      borderRef.current.style.boxShadow = `0 0 ${glowSize}px ${glowIntensity}px ${color}`
      borderRef.current.style.borderColor = color
      borderRef.current.style.borderWidth = `${3 + intensity * 3}px`
      borderRef.current.style.transform = `scale(${1 + intensity * 0.05})`

      // Remove efeito após 40% do intervalo (mais natural)
      setTimeout(() => {
        if (borderRef.current) {
          borderRef.current.style.transition = "all 0.3s ease-out"
          borderRef.current.style.boxShadow = "0 0 5px 2px rgba(239, 68, 68, 0.3)"
          borderRef.current.style.borderColor = "rgb(239, 68, 68)"
          borderRef.current.style.borderWidth = "3px"
          borderRef.current.style.transform = "scale(1)"
        }
      }, interval * 0.4)
    }

    // Primeira pulsação sincronizada
    const initialDelay = syncWithProgress()
    setTimeout(() => {
      pulse()

      // Configura intervalo regular após sincronização
      pulseIntervalRef.current = setInterval(() => {
        if (isSpotifyPlaying) {
          pulse()
        } else {
          stopPulse()
        }
      }, interval)
    }, initialDelay)
  }

  // Para pulsação melhorada
  const stopPulse = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current)
      pulseIntervalRef.current = null
    }

    if (borderRef.current) {
      borderRef.current.style.transition = "all 0.5s ease-out"
      borderRef.current.style.boxShadow = "0 0 5px 2px rgba(239, 68, 68, 0.3)"
      borderRef.current.style.borderColor = "rgb(239, 68, 68)"
      borderRef.current.style.borderWidth = "3px"
      borderRef.current.style.transform = "scale(1)"
    }
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
    const currentUrl = window.location.origin
    const redirectUri = `${currentUrl}/api/spotify/callback`

    localStorage.removeItem("spotify_token")

    const scopes = [
      "user-read-playback-state",
      "user-read-currently-playing",
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

    console.log("🔍 Redirecionando para Spotify...")
    window.location.href = authUrl.toString()
  }

  const handleSpotifyLogout = () => {
    localStorage.removeItem("spotify_token")
    setSpotifyToken(null)
    setSpotifyUser(null)
    setCurrentTrack(null)
    setIsSpotifyPlaying(false)
    setAudioFeatures(null)
    stopPulse()
  }

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
          {spotifyUser && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900/30 text-green-400">
              <div className="w-2 h-2 rounded-full mr-2 bg-green-400" />
              Conectado: {spotifyUser.display_name}
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

              {/* BPM e características */}
              {audioFeatures && (
                <div className="mt-3 flex justify-center gap-4">
                  <div className="bg-gray-700/50 rounded px-3 py-1 text-sm">
                    <span className="text-gray-400">BPM:</span>{" "}
                    <span className="text-white font-bold">{Math.round(audioFeatures.tempo)}</span>
                  </div>
                  <div className="bg-gray-700/50 rounded px-3 py-1 text-sm">
                    <span className="text-gray-400">Energia:</span>{" "}
                    <span className="text-white font-bold">{Math.round(audioFeatures.energy * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Status de reprodução */}
              <div className="flex items-center justify-center mt-3 gap-4">
                {isSpotifyPlaying ? (
                  <div className="flex items-center text-green-400">
                    <Play className="w-4 h-4 mr-1" />
                    <span className="text-sm">Tocando - Borda pulsando!</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-400">
                    <Pause className="w-4 h-4 mr-1" />
                    <span className="text-sm">Pausado</span>
                  </div>
                )}
              </div>

              {/* Progresso da música */}
              {currentProgress > 0 && currentTrack.duration_ms > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {Math.floor(currentProgress / 1000 / 60)}:
                    {String(Math.floor((currentProgress / 1000) % 60)).padStart(2, "0")} /{" "}
                    {Math.floor(currentTrack.duration_ms / 1000 / 60)}:
                    {String(Math.floor((currentTrack.duration_ms / 1000) % 60)).padStart(2, "0")}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000"
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
              <div className="text-gray-500 text-xs mt-1">Toque uma música no Spotify para ver a borda pulsar!</div>
            </div>
          )}
        </div>

        {/* Foto com borda pulsante */}
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

            {/* Borda pulsante */}
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
          <CardContent className="p-6">
            <div>
              <label className="block text-white text-sm font-medium mb-3">Spotify</label>

              {!spotifyToken ? (
                <Button onClick={handleSpotifyLogin} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Conectar com Spotify
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button onClick={handleSpotifyLogout} variant="outline" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Desconectar Spotify
                  </Button>

                  {!currentTrack && (
                    <div className="text-center text-gray-400 text-sm">
                      <Music className="w-5 h-5 mx-auto mb-1" />
                      Abra o Spotify e toque uma música!
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legenda de cores */}
        {audioFeatures && (
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-2">Cores da borda por energia:</div>
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
                <span className="text-gray-400">Baixa</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                <span className="text-gray-400">Média</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-1"></div>
                <span className="text-gray-400">Alta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                <span className="text-gray-400">Muito Alta</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
