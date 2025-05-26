"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SpotifyCallback() {
  const router = useRouter()

  useEffect(() => {
    // Extrai o token do hash da URL
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get("access_token")

    if (token) {
      // Salva o token no localStorage
      localStorage.setItem("spotify_token", token)
      console.log("✅ Token Spotify salvo!")

      // Redireciona de volta para a página principal
      router.push("/")
    } else {
      console.error("❌ Erro: Token não encontrado")
      router.push("/")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p>Conectando com Spotify...</p>
      </div>
    </div>
  )
}
