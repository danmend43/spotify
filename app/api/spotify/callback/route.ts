import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")

  console.log("🔍 Callback recebido:", { code: !!code, error, state })

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
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`384115184ce848c1bf39bdd8d0209f83:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://spotify-eight-green.vercel.app/api/spotify/callback",
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log("🔍 Token response:", { success: tokenResponse.ok, hasToken: !!tokenData.access_token })

    if (!tokenResponse.ok) {
      console.error("❌ Erro ao trocar código por token:", tokenData)
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
    }

    // Redireciona de volta com o token
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("access_token", tokenData.access_token)
    redirectUrl.searchParams.set("token_type", tokenData.token_type)
    redirectUrl.searchParams.set("expires_in", tokenData.expires_in.toString())

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("❌ Erro no callback:", error)
    return NextResponse.redirect(new URL("/?error=callback_error", request.url))
  }
}
