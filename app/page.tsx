"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Search,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Grid3X3,
  List,
  Play,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Upload,
  ImageIcon,
  Video,
  Link,
  Send,
  Calendar,
  MapPin,
  Users,
  Crown,
  Flame,
  Edit3,
  Check,
  Plus,
  Eye,
  ThumbsUp,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  Bookmark,
  Download,
  Flag,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Declara Meyda global
declare global {
  interface Window {
    Meyda: any
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

// Interfaces
interface Post {
  id: string
  type: "text" | "image" | "video" | "youtube"
  content: string
  imageUrl?: string
  videoUrl?: string
  youtubeId?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  isLiked: boolean
  visibility: "public" | "friends" | "private"
}

interface VideoType {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: number
  uploadDate: string
  youtubeId?: string
}

interface Collection {
  id: string
  name: string
  description: string
  itemCount: number
  thumbnail: string
  isPrivate: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
  progress?: number
  maxProgress?: number
}

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
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

export default function ProfilePage() {
  // Estados principais
  const [activeTab, setActiveTab] = useState("posts")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  // Estados do formulário de post
  const [postContent, setPostContent] = useState("")
  const [postType, setPostType] = useState<"text" | "image" | "video" | "youtube">("text")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends" | "private">("public")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")

  // Estados do player de vídeo
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  // Estados dos comentários
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  // Spotify states (adicionar após os outros estados)
  const [meydaLoaded, setMeydaLoaded] = useState(false)
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

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoPlayerRef = useRef<HTMLVideoElement>(null)

  // Dados mockados
  const userProfile = {
    name: "Alex Chen",
    username: "@alexchen",
    bio: "Digital creator & tech enthusiast 🚀\nLove sharing knowledge and connecting with amazing people ✨\n📍 San Francisco, CA",
    avatar: "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=300&width=1200",
    followers: 12500,
    following: 890,
    posts: 234,
    joinDate: "March 2020",
    location: "San Francisco, CA",
    website: "alexchen.dev",
    verified: true,
  }

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      type: "image",
      content:
        "Just finished building this amazing React component! The attention to detail in modern UI frameworks never ceases to amaze me. 🚀",
      imageUrl: "/placeholder.svg?height=400&width=600",
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: "2 hours ago",
      isLiked: false,
      visibility: "public",
    },
    {
      id: "2",
      type: "youtube",
      content:
        "Check out this incredible tutorial on advanced React patterns! This really helped me understand the concepts better.",
      youtubeId: "dQw4w9WgXcQ",
      likes: 189,
      comments: 67,
      shares: 23,
      timestamp: "1 day ago",
      isLiked: true,
      visibility: "public",
    },
    {
      id: "3",
      type: "text",
      content:
        "Working on some exciting new projects! Can't wait to share what I've been building. The intersection of AI and web development is absolutely fascinating. 🤖✨",
      likes: 156,
      comments: 28,
      shares: 8,
      timestamp: "3 days ago",
      isLiked: false,
      visibility: "public",
    },
  ])

  const videos: VideoType[] = [
    {
      id: "1",
      title: "Building Modern React Applications",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "15:42",
      views: 12500,
      uploadDate: "2 days ago",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      id: "2",
      title: "Advanced TypeScript Patterns",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "22:18",
      views: 8900,
      uploadDate: "1 week ago",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      id: "3",
      title: "CSS Grid vs Flexbox: When to Use What",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "18:35",
      views: 15600,
      uploadDate: "2 weeks ago",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      id: "4",
      title: "State Management in React 2024",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "28:12",
      views: 21300,
      uploadDate: "3 weeks ago",
      youtubeId: "dQw4w9WgXcQ",
    },
  ]

  const collections: Collection[] = [
    {
      id: "1",
      name: "React Tutorials",
      description: "My favorite React learning resources",
      itemCount: 24,
      thumbnail: "/placeholder.svg?height=200&width=300",
      isPrivate: false,
    },
    {
      id: "2",
      name: "Design Inspiration",
      description: "Beautiful UI/UX designs that inspire me",
      itemCount: 67,
      thumbnail: "/placeholder.svg?height=200&width=300",
      isPrivate: false,
    },
    {
      id: "3",
      name: "Personal Projects",
      description: "Work in progress and completed projects",
      itemCount: 12,
      thumbnail: "/placeholder.svg?height=200&width=300",
      isPrivate: true,
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Early Adopter",
      description: "Joined in the first month",
      icon: <Crown className="w-6 h-6" />,
      unlockedAt: "March 2020",
      rarity: "legendary",
    },
    {
      id: "2",
      name: "Content Creator",
      description: "Posted 100+ times",
      icon: <Edit3 className="w-6 h-6" />,
      unlockedAt: "June 2020",
      rarity: "epic",
    },
    {
      id: "3",
      name: "Community Builder",
      description: "Gained 10K+ followers",
      icon: <Users className="w-6 h-6" />,
      unlockedAt: "January 2023",
      rarity: "epic",
    },
    {
      id: "4",
      name: "Viral Post",
      description: "Post reached 50K+ views",
      icon: <Flame className="w-6 h-6" />,
      unlockedAt: "August 2023",
      rarity: "rare",
    },
    {
      id: "5",
      name: "Helpful Member",
      description: "Received 1K+ likes",
      icon: <Heart className="w-6 h-6" />,
      unlockedAt: "December 2023",
      rarity: "rare",
    },
    {
      id: "6",
      name: "Video Master",
      description: "Uploaded 50+ videos",
      icon: <Video className="w-6 h-6" />,
      unlockedAt: "February 2024",
      rarity: "common",
    },
  ]

  // Funções utilitárias
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getRarityColor = (rarity: Achievement["rarity"]): string => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "epic":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      case "rare":
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
      case "common":
        return "bg-gradient-to-r from-gray-400 to-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

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

  // useEffect para carregar SDKs
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
        name: "SocialHub Profile",
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
            } else {
              setIsSpotifyPlaying(false)
            }
          } else if (response.status === 204) {
            setIsSpotifyPlaying(false)
            setCurrentTrack(null)
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

  // Busca características de áudio do Spotify
  const fetchAudioFeatures = async (trackId: string) => {
    if (!spotifyToken) return

    try {
      console.log("🔍 Buscando características de áudio para:", trackId)

      const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })

      if (response.ok) {
        const features = await response.json()
        setAudioFeatures(features)
        console.log("✅ Audio features recebidas!")
      } else {
        console.error("❌ Erro ao buscar características:", response.status)
        setAudioFeatures(null)
      }
    } catch (error) {
      console.error("❌ Erro na busca de características:", error)
      setAudioFeatures(null)
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
    if (spotifyPlayer) {
      spotifyPlayer.disconnect()
      setSpotifyPlayer(null)
    }
  }

  // Handlers
  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleCreatePost = () => {
    if (!postContent.trim()) return

    const newPost: Post = {
      id: Date.now().toString(),
      type: postType,
      content: postContent,
      imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      videoUrl: selectedVideoFile ? URL.createObjectURL(selectedVideoFile) : undefined,
      youtubeId: postType === "youtube" ? extractYouTubeId(youtubeUrl) || undefined : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: "now",
      isLiked: false,
      visibility: postVisibility,
    }

    setPosts([newPost, ...posts])
    setIsCreatePostOpen(false)
    setPostContent("")
    setSelectedImage(null)
    setSelectedVideoFile(null)
    setYoutubeUrl("")
    setPostType("text")
  }

  const handleVideoPlay = (video: VideoType) => {
    setSelectedVideo(video)
    setIsVideoPlayerOpen(true)
    setComments([
      {
        id: "1",
        author: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        content: "Great tutorial! This really helped me understand the concepts.",
        timestamp: "2 hours ago",
        likes: 12,
        isLiked: false,
      },
      {
        id: "2",
        author: "Mike Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        content: "Could you make a follow-up video about advanced patterns?",
        timestamp: "5 hours ago",
        likes: 8,
        isLiked: true,
      },
    ])
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: userProfile.name,
      avatar: userProfile.avatar,
      content: newComment,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleCommentLike = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  // Componente Header
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">SocialHub</h1>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input type="text" placeholder="Search posts, people, or topics..." className="pl-10 pr-4 py-2 w-full" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )

  // Componente Profile Header
  const ProfileHeader = () => (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        <img src={userProfile.coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
                <AvatarFallback className="text-2xl">{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {userProfile.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    {userProfile.name}
                    {userProfile.verified && (
                      <Badge variant="secondary" className="ml-2">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-gray-600">{userProfile.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="flex items-center"
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" defaultValue={userProfile.name} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bio" className="text-right">
                            Bio
                          </Label>
                          <Textarea id="bio" defaultValue={userProfile.bio} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location" className="text-right">
                            Location
                          </Label>
                          <Input id="location" defaultValue={userProfile.location} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="website" className="text-right">
                            Website
                          </Label>
                          <Input id="website" defaultValue={userProfile.website} className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                <p className="text-gray-700 whitespace-pre-line">{userProfile.bio}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {userProfile.joinDate}
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a href={`https://${userProfile.website}`} className="text-blue-600 hover:underline">
                      {userProfile.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(userProfile.posts)}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(userProfile.followers)}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(userProfile.following)}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Componente Post Card
  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{userProfile.name}</p>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={post.visibility === "public" ? "default" : "secondary"}>
              {post.visibility === "public" ? (
                <Globe className="w-3 h-3 mr-1" />
              ) : post.visibility === "friends" ? (
                <Users className="w-3 h-3 mr-1" />
              ) : (
                <Lock className="w-3 h-3 mr-1" />
              )}
              {post.visibility}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save post
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 mb-4">{post.content}</p>

        {/* Media Content */}
        {post.type === "image" && post.imageUrl && (
          <div className="mb-4">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post content"
              className="w-full rounded-lg max-h-96 object-cover"
            />
          </div>
        )}

        {post.type === "video" && post.videoUrl && (
          <div className="mb-4">
            <video src={post.videoUrl} controls className="w-full rounded-lg max-h-96" />
          </div>
        )}

        {post.type === "youtube" && post.youtubeId && (
          <div className="mb-4">
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeId}`}
                title="YouTube video"
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className={post.isLiked ? "text-red-500" : ""}
            >
              <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              {post.shares}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Componente Video Card
  const VideoCard = ({ video }: { video: VideoType }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleVideoPlay(video)}>
      <div className="relative">
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatNumber(video.views)} views</span>
          <span>{video.uploadDate}</span>
        </div>
      </CardContent>
    </Card>
  )

  // Componente Collection Card
  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={collection.thumbnail || "/placeholder.svg"}
          alt={collection.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {collection.isPrivate && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Private
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {collection.itemCount} items
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{collection.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
      </CardContent>
    </Card>
  )

  // Componente Achievement Badge
  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full ${getRarityColor(achievement.rarity)} text-white`}>{achievement.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{achievement.name}</h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          <p className="text-xs text-gray-500 mt-1">Unlocked {achievement.unlockedAt}</p>
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <Badge variant="outline" className={`${getRarityColor(achievement.rarity)} text-white border-0`}>
          {achievement.rarity}
        </Badge>
      </div>
    </Card>
  )

  // Modal Create Post
  const CreatePostModal = () => (
    <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, images, videos, or YouTube content with your followers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="flex space-x-2">
            <Button variant={postType === "text" ? "default" : "outline"} size="sm" onClick={() => setPostType("text")}>
              <Edit3 className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button
              variant={postType === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostType("image")}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image
            </Button>
            <Button
              variant={postType === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostType("video")}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant={postType === "youtube" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostType("youtube")}
            >
              <Link className="w-4 h-4 mr-2" />
              YouTube
            </Button>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Media Upload */}
          {postType === "image" && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                ref={fileInputRef}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {selectedImage ? selectedImage.name : "Upload Image"}
              </Button>
            </div>
          )}

          {postType === "video" && (
            <div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                ref={videoInputRef}
                className="hidden"
              />
              <Button variant="outline" onClick={() => videoInputRef.current?.click()} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {selectedVideoFile ? selectedVideoFile.name : "Upload Video"}
              </Button>
            </div>
          )}

          {postType === "youtube" && (
            <Input placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          )}

          {/* Visibility Selector */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="visibility">Visibility:</Label>
            <Select value={postVisibility} onValueChange={(value: any) => setPostVisibility(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Friends
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreatePost} disabled={!postContent.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Modal Video Player
  const VideoPlayerModal = () => (
    <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
        {selectedVideo && (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video ref={videoPlayerRef} src="/placeholder-video.mp4" className="w-full h-full" controls autoPlay />
              )}
            </div>

            {/* Video Info */}
            <div>
              <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {formatNumber(selectedVideo.views)} views • {selectedVideo.uploadDate}
                </span>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

              {/* Add Comment */}
              <div className="flex space-x-3 mb-6">
                <Avatar>
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                </div>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar>
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{comment.timestamp}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentLike(comment.id)}
                          className={`h-auto p-0 ${comment.isLiked ? "text-blue-600" : ""}`}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  // Modal Edit Profile com Spotify
  const EditProfileModal = () => (
    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue={userProfile.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea id="bio" defaultValue={userProfile.bio} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input id="location" defaultValue={userProfile.location} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website" className="text-right">
              Website
            </Label>
            <Input id="website" defaultValue={userProfile.website} className="col-span-3" />
          </div>

          {/* Seção Spotify */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label className="text-right font-semibold">Spotify</Label>
              <div className="col-span-3">
                {!spotifyToken ? (
                  <Button onClick={handleSpotifyLogin} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Music className="w-4 h-4 mr-2" />
                    Connect with Spotify
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-green-600">Connected as {spotifyUser?.display_name}</span>
                      </div>
                      <Button onClick={handleSpotifyLogout} variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Componente Spotify Player
  const SpotifyPlayer = () => {
    if (!spotifyToken) return null

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {currentTrack ? (
              <>
                {/* Track Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <img
                      src={currentTrack.album.images[0]?.url || "/placeholder.svg?height=60&width=60"}
                      alt={currentTrack.album.name}
                      className="w-15 h-15 rounded-lg shadow-md"
                    />
                    {isSpotifyPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentTrack.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {currentTrack.artists.map((artist) => artist.name).join(", ")}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{currentTrack.album.name}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 max-w-md mx-8">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                      {Math.floor(currentProgress / 1000 / 60)}:
                      {String(Math.floor((currentProgress / 1000) % 60)).padStart(2, "0")}
                    </span>
                    <span>
                      {Math.floor(currentTrack.duration_ms / 1000 / 60)}:
                      {String(Math.floor((currentTrack.duration_ms / 1000) % 60)).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentProgress / currentTrack.duration_ms) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Audio Features */}
                {audioFeatures && (
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="text-center">
                      <div className="text-gray-900 font-medium">{Math.round(audioFeatures.tempo)}</div>
                      <div className="text-gray-500">BPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 font-medium">{Math.round(audioFeatures.energy * 100)}%</div>
                      <div className="text-gray-500">Energy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 font-medium">{Math.round(audioFeatures.danceability * 100)}%</div>
                      <div className="text-gray-500">Dance</div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isSpotifyPlaying ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span className="text-xs text-gray-600">{isSpotifyPlaying ? "Playing" : "Paused"}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full py-2">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Music className="w-4 h-4" />
                  <span className="text-sm">No music playing - Open Spotify to see your current track</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Footer
  const Footer = () => (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SocialHub</h3>
            <p className="text-gray-600 text-sm">
              Connect, share, and discover amazing content with people around the world.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Posts & Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Video Sharing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Collections
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Achievements
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Feedback
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  DMCA
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 SocialHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProfileHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              {(activeTab === "videos" || activeTab === "collections") && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Create Post Button */}
              <Button onClick={() => setIsCreatePostOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="posts" className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="videos">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreatePostModal />
      <VideoPlayerModal />
      <EditProfileModal />

      {/* Spotify Player */}
      <SpotifyPlayer />

      <Footer />
    </div>
  )
}
