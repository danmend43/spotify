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
              setCurrentProgress(data.progress_ms || 0)
            } else {
              setIsSpotifyPlaying(false)
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

  // Busca BPM e inicia pulsação com fallback inteligente
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
        console.log("✅ BPM real obtido:", Math.round(features.tempo))
        startBPMPulse(features.tempo, features.energy)
      } else {
        console.warn(`⚠️ API retornou ${response.status}, usando estimativa inteligente`)
        const estimatedFeatures = estimateBPMFromTrack(currentTrack)
        setAudioFeatures(estimatedFeatures)
        console.log("🧠 BPM estimado:", Math.round(estimatedFeatures.tempo))
        startBPMPulse(estimatedFeatures.tempo, estimatedFeatures.energy)
      }
    } catch (error) {
      console.warn("⚠️ Erro na API, usando estimativa:", error)
      const estimatedFeatures = estimateBPMFromTrack(currentTrack)
      setAudioFeatures(estimatedFeatures)
      console.log("🧠 BPM estimado:", Math.round(estimatedFeatures.tempo))
      startBPMPulse(estimatedFeatures.tempo, estimatedFeatures.energy)
    }
  }

  // Estima BPM baseado no nome e artista da música
  const estimateBPMFromTrack = (track: SpotifyTrack | null): SpotifyAudioFeatures => {
    if (!track) {
      return { tempo: 120, energy: 0.6, danceability: 0.6, valence: 0.6 }
    }

    const trackName = track.name.toLowerCase()
    const artistName = track.artists[0]?.name.toLowerCase() || ""
    const combined = `${trackName} ${artistName}`

    // Palavras que indicam músicas lentas
    const slowWords = ["ballad", "acoustic", "love", "slow", "sad", "emotional", "piano", "unplugged"]
    // Palavras que indicam músicas rápidas
    const fastWords = ["dance", "electronic", "techno", "house", "dubstep", "drum", "bass", "party", "club"]
    // Palavras que indicam rock/metal
    const rockWords = ["rock", "metal", "punk", "hardcore", "alternative", "grunge"]

    let estimatedBPM = 120 // Padrão
    let estimatedEnergy = 0.6

    if (slowWords.some((word) => combined.includes(word))) {
      estimatedBPM = 70 + Math.random() * 20 // 70-90 BPM
      estimatedEnergy = 0.2 + Math.random() * 0.3 // 0.2-0.5
    } else if (fastWords.some((word) => combined.includes(word))) {
      estimatedBPM = 130 + Math.random() * 40 // 130-170 BPM
      estimatedEnergy = 0.7 + Math.random() * 0.3 // 0.7-1.0
    } else if (rockWords.some((word) => combined.includes(word))) {
      estimatedBPM = 110 + Math.random() * 30 // 110-140 BPM
      estimatedEnergy = 0.6 + Math.random() * 0.3 // 0.6-0.9
    }

    return {
      tempo: estimatedBPM,
      energy: estimatedEnergy,
      danceability: 0.5 + Math.random() * 0.3,
      valence: 0.4 + Math.random() * 0.4,
    }
  }

  // Inicia pulsação simples baseada no BPM
  const startBPMPulse = (bpm: number, energy = 0.6) => {
    stopPulse() // Para qualquer pulsação anterior

    // Calcula intervalo entre batidas em ms
    const interval = 60000 / bpm
    console.log(`🥁 Iniciando pulsação: ${Math.round(bpm)} BPM (${Math.round(interval)}ms por batida)`)

    // Ajusta intensidade baseada na energia
    const intensity = Math.max(0.3, energy)
    const glowSize = 20 + intensity * 30 // 20-50px
    const glowIntensity = 10 + intensity * 20 // 10-30px

    // Cores baseadas na energia
    let color = "#1DB954" // Verde Spotify padrão
    if (energy > 0.8) {
      color = "#FF6B6B" // Vermelho para alta energia
    } else if (energy > 0.6) {
      color = "#4ECDC4" // Ciano para energia média-alta
    } else if (energy < 0.3) {
      color = "#45B7D1" // Azul para baixa energia
    }

    // Função de pulso
    const pulse = () => {
      if (!borderRef.current || !isSpotifyPlaying) return

      console.log("🔥 PULSE!")

      // Aplica efeito visual
      borderRef.current.style.boxShadow = `0 0 ${glowSize}px ${glowIntensity}px ${color}`
      borderRef.current.style.borderColor = color
      borderRef.current.style.borderWidth = `${4 + intensity * 4}px`

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
    pulseIntervalRef.current = setInterval(() => {
      if (isSpotifyPlaying) {
        pulse()
      }
    }, interval)
  }

  // Para pulsação
  const stopPulse = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current)
      pulseIntervalRef.current = null
    }

    if (borderRef.current) {
      borderRef.current.style.boxShadow = "none"
      borderRef.current.style.borderColor = "rgb(239, 68, 68)"
      borderRef.current.style.borderWidth = "4px"
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
