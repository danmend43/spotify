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

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const meydaAnalyzerRef = useRef<any>(null)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const spotifyIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

      // Inicia monitoramento da música atual
      spotifyIntervalRef.current = setInterval(async () => {
        try {
          console.log("🔍 Verificando música atual...")
          const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          })

          console.log("🔍 Response status:", response.status)

          if (response.ok && response.status !== 204) {
            const data = await response.json()
            console.log("🔍 Dados recebidos:", data)

            if (data && data.item && data.is_playing) {
              setCurrentTrack(data.item)
              setIsSpotifyPlaying(true)
              console.log("🎵 Música tocando:", data.item.name)
              console.log("🎵 Preview URL:", data.item.preview_url)

              // Se tem preview_url, usa para análise de batida
              if (data.item.preview_url && meydaLoaded) {
                console.log("🎵 Analisando preview:", data.item.preview_url)
                await analyzeSpotifyPreview(data.item.preview_url)
              } else {
                // Se não tem preview, simula pulsação baseada no tempo
                console.log("🎵 Sem preview, simulando pulsação")
                simulateBeatPulse()
              }
            } else {
              console.log("🔍 Nenhuma música tocando ou pausada")
              setIsSpotifyPlaying(false)
              if (!data || !data.item) {
                setCurrentTrack(null)
              }
              stopPulse()
            }
          } else if (response.status === 204) {
            console.log("🔍 Nenhuma música ativa (204)")
            setIsSpotifyPlaying(false)
            setCurrentTrack(null)
            stopPulse()
          } else {
            console.log("🔍 Erro na resposta:", response.status)
            setIsSpotifyPlaying(false)
            stopPulse()
          }
        } catch (error) {
          console.error("❌ Erro ao buscar música atual:", error)
        }
      }, 2000) // Atualiza a cada 2 segundos

      return () => {
        if (spotifyIntervalRef.current) {
          clearInterval(spotifyIntervalRef.current)
        }
      }
    }
  }, [spotifyToken, meydaLoaded])

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
        console.log("✅ Foto do usuário:", user.images?.[0]?.url)
      } else {
        // Token expirado
        localStorage.removeItem("spotify_token")
        setSpotifyToken(null)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error)
    }
  }

  const analyzeSpotifyPreview = async (previewUrl: string) => {
    try {
      // Para análise anterior
      stopPulse()

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

      // Baixa o preview
      const response = await fetch(previewUrl)
      const arrayBuffer = await response.arrayBuffer()
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

      // Conecta e inicia (sem som, só análise)
      const gainNode = audioContextRef.current.createGain()
      gainNode.gain.value = 0 // Sem som
      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      meydaAnalyzer.start()
      source.start()

      setIsPlaying(true)
      console.log("✅ Análise de preview iniciada")
    } catch (error) {
      console.error("❌ Erro ao analisar preview:", error)
      // Se falhar, usa simulação
      simulateBeatPulse()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  const handleSpotifyLogin = () => {
    const clientId = "384115184ce848c1bf39bdd8d0209f83"
    const redirectUri = "https://spotify-eight-green.vercel.app/api/spotify/callback"

    console.log("🔍 Iniciando login do Spotify...")
    console.log("🔍 Client ID:", clientId)
    console.log("🔗 Redirect URI:", redirectUri)

    // Limpa token anterior se existir
    localStorage.removeItem("spotify_token")

    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "streaming",
      "user-read-email",
      "user-read-private",
    ].join(" ")

    // Gera um state aleatório para segurança
    const state = Math.random().toString(36).substring(2, 15)
    localStorage.setItem("spotify_auth_state", state)

    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("response_type", "code") // Mudança aqui!
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scopes)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("show_dialog", "true")

    console.log("🚀 URL de autorização:", authUrl.toString())

    // Redireciona para o Spotify
    window.location.href = authUrl.toString()
  }

  const handleSpotifyLogout = () => {
    localStorage.removeItem("spotify_token")
    setSpotifyToken(null)
    setSpotifyUser(null)
    setCurrentTrack(null)
    setIsSpotifyPlaying(false)
    stopPulse()
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
        // Para áudio anterior
        stopPulse()

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

  const simulateBeatPulse = () => {
    if (!borderRef.current) return

    console.log("🎵 Iniciando simulação de pulsação")

    // Para análise anterior
    stopPulse()

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current.stop()
    }
    if (meydaAnalyzerRef.current) {
      meydaAnalyzerRef.current.stop()
    }

    // Simula pulsação a 120 BPM (batida a cada 500ms)
    pulseIntervalRef.current = setInterval(() => {
      if (!borderRef.current || !isSpotifyPlaying) {
        console.log("🔍 Parando pulsação - sem borda ou não tocando")
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current)
        }
        return
      }

      // Cria efeito de pulsação
      const intensity = 10 + Math.random() * 15 // Varia entre 10-25
      const glowSize = intensity * 2
      const opacity = 0.7 + intensity * 0.02

      let red, green, blue
      if (intensity > 20) {
        red = 255
        green = 255
        blue = 100
      } else if (intensity > 15) {
        red = 255
        green = 150
        blue = 0
      } else {
        red = 255
        green = 50
        blue = 50
      }

      borderRef.current.style.boxShadow = `
        0 0 ${glowSize}px rgba(${red}, ${green}, ${blue}, ${opacity}),
        0 0 ${glowSize * 2}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.5}),
        0 0 ${glowSize * 3}px rgba(${red}, ${green}, ${blue}, ${opacity * 0.3})
      `
      borderRef.current.style.borderColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`

      // Volta ao normal após 200ms
      setTimeout(() => {
        if (borderRef.current) {
          borderRef.current.style.boxShadow = "none"
          borderRef.current.style.borderColor = "rgb(239, 68, 68)"
        }
      }, 200)
    }, 500) // Pulsa a cada 500ms (120 BPM)

    setIsPlaying(true)
    console.log("✅ Simulação de pulsação iniciada")
  }

  const stopPulse = () => {
    console.log("🔍 Parando todas as pulsações")

    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current)
      pulseIntervalRef.current = null
    }

    if (borderRef.current) {
      borderRef.current.style.boxShadow = "none"
      borderRef.current.style.borderColor = "rgb(239, 68, 68)"
    }
    setIsPlaying(false)
  }

  // Função para determinar qual imagem mostrar
  const getDisplayImage = () => {
    if (spotifyUser?.images?.[0]?.url) {
      console.log("🖼️ Usando foto do Spotify:", spotifyUser.images[0].url)
      return spotifyUser.images[0].url
    }
    if (currentTrack?.album?.images?.[0]?.url) {
      console.log("🖼️ Usando capa do álbum:", currentTrack.album.images[0].url)
      return currentTrack.album.images[0].url
    }
    if (imageUrl) {
      console.log("🖼️ Usando foto enviada:", imageUrl)
      return imageUrl
    }
    console.log("🖼️ Nenhuma imagem disponível")
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

          {/* Debug info */}
          <div className="text-xs text-gray-400">
            {spotifyUser?.images?.[0]?.url && <div>✅ Foto Spotify disponível</div>}
            {currentTrack?.album?.images?.[0]?.url && <div>✅ Capa álbum disponível</div>}
            {imageUrl && <div>✅ Foto enviada disponível</div>}
            {isSpotifyPlaying && <div>🎵 Música tocando</div>}
            {isPlaying && <div>🌊 Pulsação ativa</div>}
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

        {/* Música atual do Spotify */}
        {currentTrack && (
          <div className="text-center">
            <div className="text-white text-lg font-medium">{currentTrack.name}</div>
            <div className="text-gray-400 text-sm">{currentTrack.artists.map((artist) => artist.name).join(", ")}</div>
            <div className="flex items-center justify-center mt-2">
              {isSpotifyPlaying ? (
                <div className="flex items-center text-green-400">
                  <Play className="w-4 h-4 mr-1" />
                  Tocando no Spotify
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <Pause className="w-4 h-4 mr-1" />
                  Pausado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status geral */}
        <div className="text-center">
          <div className="text-white text-lg mb-2">
            {spotifyUser
              ? "🎵 Logado no Spotify!"
              : isSpotifyPlaying
                ? "🎵 Sincronizado com Spotify!"
                : isPlaying
                  ? "🌊 Ondas na batida!"
                  : audioFile
                    ? "🎵 Áudio carregado"
                    : "📁 Carregue um áudio ou conecte o Spotify"}
          </div>
        </div>

        {/* Controles */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 space-y-6">
            {/* Spotify Login */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Spotify</label>

              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-400 text-sm mb-2">🔗 Configure no Spotify Dashboard:</p>
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
