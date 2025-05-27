import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")

  console.log("🔍 Callback recebido:", { code: !!code, error, state })
  console.log("🔍 Client Secret existe:", !!process.env.SPOTIFY_CLIENT_SECRET)

  if (error) {
    console.error("❌ Erro do Spotify:", error)
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    console.error("❌ Código não encontrado")
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    // Troca o código por um token
    const clientId = "384115184ce848c1bf39bdd8d0209f83"
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    // Usa a URL atual como base para o redirect URI
    const redirectUri = `${request.nextUrl.origin}/api/spotify/callback`

    console.log("🔍 Iniciando troca de código por token...")
    console.log("🔍 Client ID:", clientId)
    console.log("🔍 Client Secret existe:", !!clientSecret)
    console.log("🔍 Redirect URI:", redirectUri)

    if (!clientSecret) {
      console.error("❌ SPOTIFY_CLIENT_SECRET não encontrado!")
      return NextResponse.redirect(new URL("/?error=missing_client_secret", request.url))
    }

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log("🔍 Token response status:", tokenResponse.status)
    console.log("🔍 Token response:", {
      access_token: tokenData.access_token ? "✅ Presente" : "❌ Ausente",
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token ? "✅ Presente" : "❌ Ausente",
      scope: tokenData.scope,
    })

    if (!tokenResponse.ok) {
      console.error("❌ Erro ao trocar código por token:", tokenData)
      return NextResponse.redirect(
        new URL(`/?error=token_exchange_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`, request.url),
      )
    }

    if (!tokenData.access_token) {
      console.error("❌ Access token não recebido")
      return NextResponse.redirect(
        new URL(`/?error=no_access_token&details=${encodeURIComponent(JSON.stringify(tokenData))}`, request.url),
      )
    }

    // Redireciona de volta com o token
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("access_token", tokenData.access_token)
    redirectUrl.searchParams.set("token_type", tokenData.token_type || "Bearer")
    redirectUrl.searchParams.set("expires_in", (tokenData.expires_in || 3600).toString())

    if (tokenData.refresh_token) {
      redirectUrl.searchParams.set("refresh_token", tokenData.refresh_token)
    }

    console.log("✅ Token obtido com sucesso!")
    console.log("🔄 Redirecionando para:", redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("❌ Erro no callback:", error)
    return NextResponse.redirect(
      new URL(`/?error=callback_error&details=${encodeURIComponent(String(error))}`, request.url),
    )
  }
}
