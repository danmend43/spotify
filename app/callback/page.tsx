"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SpotifyCallback() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo((prev) => [...prev, info])
  }

  useEffect(() => {
    addDebugInfo("🔍 Callback page carregada")
    addDebugInfo(`🔍 URL completa: ${window.location.href}`)
    addDebugInfo(`🔍 Hash: ${window.location.hash}`)
    addDebugInfo(`🔍 Search: ${window.location.search}`)

    // Método 1: Tentar extrair do hash (padrão para implicit flow)
    const hash = window.location.hash.substring(1)
    addDebugInfo(`🔍 Hash processado: ${hash}`)

    if (hash) {
      const params = new URLSearchParams(hash)
      const token = params.get("access_token")
      const error = params.get("error")
      const errorDescription = params.get("error_description")

      addDebugInfo(`🔍 Token encontrado no hash: ${token ? "SIM" : "NÃO"}`)
      addDebugInfo(`🔍 Erro encontrado: ${error}`)

      if (error) {
        addDebugInfo(`❌ Erro do Spotify: ${error} - ${errorDescription}`)
        alert(`Erro do Spotify: ${error}\n${errorDescription}`)
        setTimeout(() => router.push("/"), 3000)
        return
      }

      if (token) {
        localStorage.setItem("spotify_token", token)
        addDebugInfo("✅ Token Spotify salvo no localStorage!")
        addDebugInfo(`✅ Token (primeiros 20 chars): ${token.substring(0, 20)}...`)

        // Pequeno delay para garantir que o token foi salvo
        setTimeout(() => {
          addDebugInfo("🔄 Redirecionando para página principal...")
          router.push("/")
        }, 1000)
        return
      }
    }

    // Método 2: Tentar extrair dos query parameters
    const searchParams = new URLSearchParams(window.location.search)
    const tokenFromSearch = searchParams.get("access_token")
    const codeFromSearch = searchParams.get("code")

    addDebugInfo(`🔍 Token nos query params: ${tokenFromSearch ? "SIM" : "NÃO"}`)
    addDebugInfo(`🔍 Code nos query params: ${codeFromSearch ? "SIM" : "NÃO"}`)

    if (tokenFromSearch) {
      localStorage.setItem("spotify_token", tokenFromSearch)
      addDebugInfo("✅ Token encontrado nos query params e salvo!")
      setTimeout(() => router.push("/"), 1000)
      return
    }

    // Método 3: Verificar se há algum parâmetro útil
    addDebugInfo("🔍 Todos os parâmetros do hash:")
    if (hash) {
      const hashParams = new URLSearchParams(hash)
      for (const [key, value] of hashParams.entries()) {
        addDebugInfo(`  ${key}: ${value}`)
      }
    }

    addDebugInfo("🔍 Todos os parâmetros da query:")
    for (const [key, value] of searchParams.entries()) {
      addDebugInfo(`  ${key}: ${value}`)
    }

    // Se chegou até aqui, não encontrou token
    addDebugInfo("❌ Nenhum token encontrado!")
    setTimeout(() => {
      alert(
        "Erro: Token não encontrado. Verifique:\n1. Redirect URI no Spotify Dashboard\n2. Client ID correto\n3. Permissões do app",
      )
      router.push("/")
    }, 5000)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-white text-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg">Conectando com Spotify...</p>
          <p className="text-sm text-gray-400 mt-2">Processando autenticação...</p>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-medium mb-3">🔍 Debug Info:</h3>
          <div className="space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs font-mono text-gray-300">
                {info}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => router.push("/")} className="text-blue-400 hover:text-blue-300 text-sm underline">
            Voltar para página principal
          </button>
        </div>
      </div>
    </div>
  )
}
