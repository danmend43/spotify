"use client"

import type React from "react"
import { Edit, X, Smile, Youtube, Menu } from "lucide-react"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Bell,
  Upload,
  Eye,
  TrendingUp,
  Star,
  MessageCircle,
  Trophy,
  Heart,
  MoreHorizontal,
  Verified,
  MapPin,
  Calendar,
  LinkIcon,
  Settings,
  UserPlus,
  Share,
  Play,
  Grid3X3,
  List,
  Crown,
  ImageIcon,
  BarChart3,
  LocateIcon as LocationIcon,
  Plus,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Home,
  Compass,
  Users,
  Gamepad2,
  Music,
  Palette,
  ChefHat,
  BookOpen,
  Zap,
  Film,
  Headphones,
  Code,
  Sparkles,
} from "lucide-react"

export default function Component() {
  const [viewMode, setViewMode] = useState("grid")
  const [activeTab, setActiveTab] = useState("posts")
  const [isPlaying, setIsPlaying] = useState(true)
  const [coverImage, setCoverImage] = useState("/placeholder.svg?height=192&width=768")
  const [avatarImage, setAvatarImage] = useState("/placeholder.svg?height=128&width=128")
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("Pessoal")
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null)
  const [newPostMediaType, setNewPostMediaType] = useState<"image" | "video" | "youtube" | null>(null)
  const [newPostYoutubeUrl, setNewPostYoutubeUrl] = useState("")
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [showYouTubeModal, setShowYouTubeModal] = useState(false)
  const [currentYouTubeUrl, setCurrentYouTubeUrl] = useState("")
  const [currentVideoData, setCurrentVideoData] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [videoComments, setVideoComments] = useState([])
  const [videoDuration, setVideoDuration] = useState<string | null>(null)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [megaMenuDescription, setMegaMenuDescription] = useState("Descubra mais conteúdo incrível na nossa plataforma")

  const [userProfile, setUserProfile] = useState({
    name: "Dan",
    username: "@dan",
    bio: "🎬 Criador de conteúdo apaixonado por Tecnologia\n📚 Compartilhando conhecimento através de vídeos educativos\n🌟 Transformando ideias em histórias visuais",
    verified: true,
    location: "São Paulo, Brasil",
    website: "youtube.com",
    joinDate: "Março 2021",
    stats: {
      followers: 125600,
      following: 342,
      posts: 1247,
      likes: 2840000,
    },
    level: 28,
    exp: 6750,
    nextLevelExp: 8000,
    badges: [
      {
        name: "Criador Verificado",
        icon: Verified,
        color: "text-blue-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "legendary",
      },
      {
        name: "Top Creator",
        icon: Crown,
        color: "text-yellow-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "epic",
      },
      {
        name: "Milhão de Views",
        icon: Play,
        color: "text-red-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "rare",
      },
      {
        name: "Expert em Anime",
        icon: Star,
        color: "text-purple-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "epic",
      },
      {
        name: "Streamer Pro",
        icon: Upload,
        color: "text-green-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "rare",
      },
      {
        name: "Community Hero",
        icon: Heart,
        color: "text-pink-500",
        image: "/placeholder.svg?height=64&width=64",
        rarity: "common",
      },
    ],
    currentMusic: {
      title: "Lofi Hip Hop Radio",
      artist: "ChilledCow",
      cover: "/placeholder.svg?height=64&width=64",
      isPlaying: true,
    },
    topMusic: {
      title: "Anime Opening Mix",
      artist: "Various Artists",
      cover: "/placeholder.svg?height=64&width=64",
      playCount: 1247,
    },
  })

  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [editingName, setEditingName] = useState(userProfile.name)
  const [editingBio, setEditingBio] = useState(userProfile.bio)
  const [tempCoverImage, setTempCoverImage] = useState(coverImage)
  const [tempAvatarImage, setTempAvatarImage] = useState(avatarImage)
  const [useBlurredAvatar, setUseBlurredAvatar] = useState(false)
  const [blurAmount, setBlurAmount] = useState(10)

  const [userPosts, setUserPosts] = useState([
    {
      id: 1001,
      type: "youtube",
      title: "Neow.ai - Brainrot Gang (Official Video)",
      content: "3 minutes of chaos, characters, and cinematic crime. Written, animated, edited and scored by one person. Welcome to my universe.",
      thumbnail: "https://i.ytimg.com/vi/2D1rExarl4M/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCd5vR9GbjAUi5iAAnqS7ZB40UbTQ",
      youtubeUrl: "https://www.youtube.com/watch?v=2D1rExarl4M",
      duration: "03:00",
      stats: {
        views: 45000,
        likes: 12800,
        comments: 567,
        shares: 234,
      },
      timestamp: "1 dia atrás",
      category: "Anime",
      author: {
        name: "Dan",
        username: "@dan",
        avatar: "/placeholder.svg?height=128&width=128",
        verified: true,
      },
    },
  ])

  const collections = [
   
  ]

  const achievements = [
    {
      name: "Primeiro Milhão",
      description: "Primeiro vídeo a atingir 1M de visualizações",
      icon: Trophy,
      date: "Janeiro 2024",
      rarity: "legendary",
    },
    {
      name: "Criador Consistente",
      description: "100 vídeos publicados",
      icon: Upload,
      date: "Dezembro 2023",
      rarity: "epic",
    },
    {
      name: "Comunidade Ativa",
      description: "10K comentários respondidos",
      icon: MessageCircle,
      date: "Novembro 2023",
      rarity: "rare",
    },
    {
      name: "Trending Master",
      description: "10 vídeos em trending",
      icon: TrendingUp,
      date: "Outubro 2023",
      rarity: "epic",
    },
  ]

  const categories = ["Pessoal", "Anime", "Tecnologia", "Jogos", "Culinária", "Música", "Arte"]

  const megaMenuCategories = [
    {
      title: "Navegação",
      description: "Navegue pelas principais seções da plataforma",
      items: [
        { name: "Início", icon: Home, href: "#", description: "Página inicial com conteúdo personalizado" },
        { name: "Explorar", icon: Compass, href: "#", description: "Descubra novos criadores e conteúdos" },
        { name: "Trending", icon: TrendingUp, href: "#", description: "Veja o que está em alta agora" },
        { name: "Comunidade", icon: Users, href: "#", description: "Conecte-se com outros usuários" },
      ],
    },
    {
      title: "Categorias",
      description: "Explore conteúdo por categoria de interesse",
      items: [
        { name: "Anime", icon: Star, href: "#", description: "Reviews, análises e discussões sobre anime" },
        { name: "Tecnologia", icon: Code, href: "#", description: "Tutoriais e novidades do mundo tech" },
        { name: "Jogos", icon: Gamepad2, href: "#", description: "Gameplay, reviews e dicas de jogos" },
        { name: "Música", icon: Music, href: "#", description: "Covers, análises e descobertas musicais" },
        { name: "Arte", icon: Palette, href: "#", description: "Criações artísticas e tutoriais" },
        { name: "Culinária", icon: ChefHat, href: "#", description: "Receitas e técnicas culinárias" },
      ],
    },
    {
      title: "Conteúdo",
      description: "Diferentes formatos de conteúdo disponíveis",
      items: [
        { name: "Vídeos", icon: Play, href: "#", description: "Assista vídeos de alta qualidade" },
        { name: "Lives", icon: Zap, href: "#", description: "Transmissões ao vivo interativas" },
        { name: "Podcasts", icon: Headphones, href: "#", description: "Ouça conversas e discussões" },
        { name: "Artigos", icon: BookOpen, href: "#", description: "Leia conteúdo escrito detalhado" },
      ],
    },
    {
      title: "Recursos",
      description: "Ferramentas para criadores e usuários avançados",
      items: [
        { name: "Criador Studio", icon: Film, href: "#", description: "Gerencie seu conteúdo e canal" },
        { name: "Analytics", icon: BarChart3, href: "#", description: "Acompanhe suas estatísticas" },
        { name: "Monetização", icon: Sparkles, href: "#", description: "Monetize seu conteúdo" },
        { name: "Suporte", icon: MessageCircle, href: "#", description: "Obtenha ajuda e suporte" },
      ],
    },
  ]

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null
  }

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.preload = "metadata"

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const duration = video.duration
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const openYouTubeModal = (url: string, videoData?: any) => {
    setCurrentYouTubeUrl(url)
    setCurrentVideoData(videoData)
    setShowYouTubeModal(true)
  }

  const closeYouTubeModal = () => {
    setShowYouTubeModal(false)
    setCurrentYouTubeUrl("")
    setCurrentVideoData(null)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: videoComments.length + 1,
      user: userProfile.name,
      avatar: avatarImage,
      comment: newComment,
      timestamp: "agora",
      likes: 0,
    }

    setVideoComments([comment, ...videoComments])
    setNewComment("")
  }

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewPostMediaChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPostMedia(e.target?.result as string)
        setNewPostMediaType(file.type.startsWith("video/") ? "video" : "image")
      }
      reader.readAsDataURL(file)

      // Get video duration if it's a video file
      if (file.type.startsWith("video/")) {
        const duration = await getVideoDuration(file)
        setVideoDuration(duration)
      }
    }
  }

  const handleYouTubeUrlChange = (url: string) => {
    setNewPostYoutubeUrl(url)
    if (url && extractYouTubeId(url)) {
      setNewPostMediaType("youtube")
      setNewPostMedia(getYouTubeThumbnail(url))
      setVideoDuration("15:42") // Placeholder for YouTube videos
    } else {
      if (newPostMediaType === "youtube") {
        setNewPostMediaType(null)
        setNewPostMedia(null)
        setVideoDuration(null)
      }
    }
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    // Criar uma cópia da imagem para evitar referências perdidas
    const postThumbnail =
      newPostMediaType === "youtube"
        ? getYouTubeThumbnail(newPostYoutubeUrl)
        : newPostMedia
          ? `${newPostMedia}`
          : undefined

    const post = {
      id: Date.now(), // Usar timestamp para ID único
      type: newPostMediaType === "youtube" ? "youtube" : newPostMediaType === "video" ? "video" : "post",
      title: newPostContent.length > 50 ? newPostContent.substring(0, 50) + "..." : newPostContent,
      content: newPostContent,
      thumbnail: postThumbnail,
      youtubeUrl: newPostMediaType === "youtube" ? newPostYoutubeUrl : undefined,
      duration: videoDuration || undefined,
      stats: {
        views: newPostMediaType === "video" || newPostMediaType === "youtube" ? 0 : undefined,
        likes: 0,
        comments: 0,
        shares: 0,
      },
      timestamp: "agora",
      category: newPostCategory,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: `${avatarImage}`, // Criar cópia do avatar também
        verified: userProfile.verified,
      },
    }

    setUserPosts([post, ...userPosts])

    // Resetar estados após criar o post
    setNewPostContent("")
    setNewPostCategory("Pessoal")
    setNewPostMedia(null)
    setNewPostMediaType(null)
    setNewPostYoutubeUrl("")
    setVideoDuration(null)
    setShowYoutubeInput(false)
    setShowPollCreator(false)
    setPollOptions(["", ""])
    setShowCreatePostModal(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toLocaleString()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Anime: "text-pink-600 bg-pink-50",
      Tecnologia: "text-blue-600 bg-blue-50",
      Jogos: "text-purple-600 bg-purple-50",
      Culinária: "text-yellow-600 bg-yellow-50",
      Pessoal: "text-green-600 bg-green-50",
      Música: "text-orange-600 bg-orange-50",
      Arte: "text-indigo-600 bg-indigo-50",
    }
    return colors[category] || "text-gray-600 bg-gray-50"
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      legendary: "border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50",
      epic: "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50",
      rare: "border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50",
      common: "border-gray-400 bg-gray-50",
    }
    return colors[rarity] || colors.common
  }

  const handleEditProfileSave = () => {
    // Atualizar o perfil do usuário
    setUserProfile((prev) => ({
      ...prev,
      name: editingName,
      bio: editingBio,
    }))

    // Se usar avatar com desfoque, aplicar o desfoque
    if (useBlurredAvatar) {
      // Criar uma versão com desfoque da imagem do avatar
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Aplicar desfoque via CSS filter no canvas
        ctx.filter = `blur(${blurAmount}px)`
        ctx.drawImage(img, 0, 0)

        // Converter para data URL e definir como capa
        const blurredDataUrl = canvas.toDataURL()
        setCoverImage(blurredDataUrl)
      }

      img.src = tempAvatarImage
    } else {
      setCoverImage(tempCoverImage)
    }

    setAvatarImage(tempAvatarImage)
    setShowEditProfileModal(false)
  }

  const handleTempCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTempCoverImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTempAvatarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTempAvatarImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const postMediaInputRef = useRef<HTMLInputElement>(null)
  const tempCoverInputRef = useRef<HTMLInputElement>(null)
  const tempAvatarInputRef = useRef<HTMLInputElement>(null)

  // Adicione este estilo no head ou em um arquivo CSS
  const sliderStyle = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`

  // Adicione o estilo ao head
  if (typeof document !== "undefined") {
    const styleElement = document.createElement("style")
    styleElement.textContent = sliderStyle
    if (!document.head.querySelector("style[data-slider-style]")) {
      styleElement.setAttribute("data-slider-style", "true")
      document.head.appendChild(styleElement)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hidden file inputs */}
      <input type="file" ref={coverInputRef} onChange={handleCoverImageChange} accept="image/*" className="hidden" />
      <input type="file" ref={avatarInputRef} onChange={handleAvatarImageChange} accept="image/*" className="hidden" />
      <input
        type="file"
        ref={postMediaInputRef}
        onChange={handleNewPostMediaChange}
        accept="image/*,video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={tempCoverInputRef}
        onChange={handleTempCoverImageChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={tempAvatarInputRef}
        onChange={handleTempAvatarImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMegaMenu(!showMegaMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Menu className="w-5 h-5 text-gray-600" />
                    </Button>

                    {/* Mega Menu */}
                    {showMegaMenu && (
                      <div className="absolute top-full left-0 mt-2 w-[800px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50">
                        <div className="p-6">
                          <div className="grid grid-cols-4 gap-8">
                            {megaMenuCategories.map((category, index) => (
                              <div key={index} className="space-y-4">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                                  {category.title}
                                </h3>
                                <ul className="space-y-3">
                                  {category.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                      <a
                                        href={item.href}
                                        className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors group"
                                        onMouseEnter={() => setMegaMenuDescription(item.description)}
                                        onMouseLeave={() =>
                                          setMegaMenuDescription("Descubra mais conteúdo incrível na nossa plataforma")
                                        }
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                          <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{item.name}</span>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 mt-6 pt-6">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">{megaMenuDescription}</div>
                              <Button
                                onClick={() => setShowMegaMenu(false)}
                                variant="outline"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Fechar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">BILIBILI</span>
              </div>
              <nav className="hidden md:flex gap-6">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Início
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Explorar
                </Button>
                <Button variant="ghost" className="text-blue-600 font-medium">
                  Perfil
                </Button>
              </nav>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Input
                  placeholder="Buscar..."
                  className="pl-4 pr-10 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button size="sm" className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreatePostModal(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 border"
              >
                <Upload className="w-4 h-4 mr-2" />
                Criar Post
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarImage || "/placeholder.svg"} />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Overlay para fechar o mega menu */}
        {showMegaMenu && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowMegaMenu(false)} />}
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl overflow-hidden">
          <img src={coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20"></div>
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900"
            onClick={() => setShowEditProfileModal(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar perfil
          </Button>
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Profile Info */}
            <div className="flex-1">
              <div className="flex items-end gap-6 -mt-16 mb-6">
                {/* Avatar with Frame */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                    <Avatar
                      className="w-full h-full border-4 border-white cursor-pointer"
                      onClick={() => setShowAvatarModal(true)}
                    >
                      <AvatarImage src={avatarImage || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl"></AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Seguir
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                    {userProfile.verified && <Verified className="w-6 h-6 text-blue-500" />}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-md">
                        <Crown className="w-4 h-4" />
                        Nível {userProfile.level}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold shadow-md">
                        <Trophy className="w-3 h-3" />
                        #127
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{userProfile.username}</p>
                </div>

                <div className="whitespace-pre-line text-gray-900 leading-relaxed">{userProfile.bio}</div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href="#" className="text-blue-600 hover:underline">
                      {userProfile.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Ingressou em {userProfile.joinDate}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 py-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatNumber(userProfile.stats.followers)}</div>
                    <div className="text-sm text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatNumber(userProfile.stats.following)}</div>
                    <div className="text-sm text-gray-600">Seguindo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatNumber(userProfile.stats.posts)}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{formatNumber(userProfile.stats.likes)}</div>
                    <div className="text-sm text-gray-600">Curtidas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:w-80 space-y-6" style={{ marginTop: "10px" }}>
              {/* Badges Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-pink-500" />
                    Conquistas e Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {userProfile.badges.slice(0, 6).map((badge, index) => (
                      <div key={index} className="text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <badge.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs font-medium text-gray-900 truncate">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-4 w-fit">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="videos">Vídeos</TabsTrigger>
                <TabsTrigger value="collections">Coleções</TabsTrigger>
                <TabsTrigger value="achievements">Conquistas</TabsTrigger>
              </TabsList>

              {(activeTab === "posts" || activeTab === "videos") && (
                <div className="flex items-center gap-2">
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
            </div>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <div className="min-h-[400px]">
                {userPosts.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"
                    }
                  >
                    {userPosts.map((post) =>
                      viewMode === "grid" ? (
                        // Grid View - Card Style
                        <Card
                          key={post.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 transform hover:scale-105 cursor-pointer"
                          onClick={() => {
                            if (post.type === "youtube" && post.youtubeUrl) {
                              openYouTubeModal(post.youtubeUrl, post)
                            }
                          }}
                        >
                          <div className="relative">
                            <img
                              src={post.thumbnail || "/placeholder.svg?height=192&width=320"}
                              alt={post.content}
                              className="w-full object-cover h-48"
                            />
                            {(post.type === "youtube" || post.type === "video") && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                                  <Play className="w-6 h-6 text-white ml-0.5" />
                                </div>
                              </div>
                            )}
                            {post.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {post.duration}
                              </div>
                            )}
                            <Badge className={`absolute top-2 left-2 ${getCategoryColor(post.category)}`}>
                              {post.category}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Author Info */}
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={post.author?.avatar || avatarImage || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{post.author?.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-700">
                                  {post.author?.name || userProfile.name}
                                </span>
                                {post.author?.verified && <Verified className="w-3 h-3 text-blue-500" />}
                              </div>

                              <p className="text-sm text-gray-900 line-clamp-3 leading-relaxed">{post.content}</p>

                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-4">
                                  {post.stats.views !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {formatNumber(post.stats.views)}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {formatNumber(post.stats.likes)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    {formatNumber(post.stats.comments)}
                                  </div>
                                </div>
                                <span>{post.timestamp}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        // List View - Original Style
                        <Card
                          key={post.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl bg-white transform hover:scale-[1.02]"
                        >
                          <CardContent className="p-6">
                            {/* Header do Post */}
                            <div className="flex gap-4 mb-4">
                              <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                                <AvatarImage src={post.author?.avatar || avatarImage || "/placeholder.svg"} />
                                <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    {post.author?.name || userProfile.name}
                                  </span>
                                  {post.author?.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                  <span className="text-gray-500 text-sm">
                                    {post.author?.username || userProfile.username}
                                  </span>
                                  <span className="text-gray-400">·</span>
                                  <span className="text-gray-500 text-sm">{post.timestamp}</span>
                                </div>
                                <Badge className={`w-fit ${getCategoryColor(post.category)}`}>{post.category}</Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Conteúdo do Post */}
                            <div className="space-y-4">
                              {/* Layout dividido: conteúdo à esquerda, mídia à direita */}
                              <div className="flex gap-6">
                                {/* Lado esquerdo - Conteúdo */}
                                <div className="flex-1">
                                  <p className="text-gray-900 leading-relaxed text-base">{post.content}</p>
                                </div>

                                {/* Lado direito - Mídia (miniatura) */}
                                {post.thumbnail && (
                                  <div className="w-48 flex-shrink-0">
                                    <div className="relative rounded-xl overflow-hidden shadow-md h-32 bg-gray-100">
                                      {post.type === "youtube" ? (
                                        <div className="relative h-full">
                                          <img
                                            src={post.thumbnail || "/placeholder.svg"}
                                            alt="YouTube thumbnail"
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={() => post.youtubeUrl && openYouTubeModal(post.youtubeUrl, post)}
                                          />
                                          <div
                                            className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
                                            onClick={() => post.youtubeUrl && openYouTubeModal(post.youtubeUrl, post)}
                                          >
                                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
                                              <Play className="w-5 h-5 text-white ml-0.5" />
                                            </div>
                                          </div>
                                        </div>
                                      ) : post.type === "video" ? (
                                        <div className="relative h-full">
                                          <img
                                            src={post.thumbnail || "/placeholder.svg"}
                                            alt="Video thumbnail"
                                            className="w-full h-full object-cover cursor-pointer"
                                          />
                                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer">
                                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg">
                                              <Play className="w-5 h-5 text-white ml-0.5" />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <img
                                          src={post.thumbnail || "/placeholder.svg"}
                                          alt="Post media"
                                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                      )}
                                      {post.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                          {post.duration}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Ações do Post - Movidas para baixo */}
                              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-4">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
                                  <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                                    <Heart className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium">{formatNumber(post.stats.likes)}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium">{formatNumber(post.stats.comments)}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
                                  <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                    <Share className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium">{formatNumber(post.stats.shares)}</span>
                                </button>
                                {post.stats.views !== undefined && (
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <div className="p-2 rounded-full">
                                      <Eye className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{formatNumber(post.stats.views)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Nenhum post ainda</h3>
                    <p className="text-sm text-center">Quando você criar posts, eles aparecerão aqui.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="min-h-[400px]">
                {userPosts.filter((post) => post.type === "video" || post.type === "youtube").length > 0 ? (
                  <div
                    className={
                      viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"
                    }
                  >
                    {userPosts
                      .filter((post) => post.type === "video" || post.type === "youtube")
                      .map((video) =>
                        viewMode === "grid" ? (
                          // Grid View
                          <Card
                            key={video.id}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 transform hover:scale-105 cursor-pointer"
                            onClick={() => {
                              if (video.type === "youtube" && video.youtubeUrl) {
                                openYouTubeModal(video.youtubeUrl, video)
                              }
                            }}
                          >
                            <div className="relative">
                              <img
                                src={video.thumbnail || "/placeholder.svg"}
                                alt={video.content}
                                className="w-full object-cover h-40"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                                  <Play className="w-6 h-6 text-white ml-0.5" />
                                </div>
                              </div>
                              {video.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {video.duration}
                                </div>
                              )}
                              <Badge className={`absolute top-2 left-2 ${getCategoryColor(video.category)}`}>
                                {video.category}
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Author Info */}
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={video.author?.avatar || avatarImage || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs">
                                      {video.author?.name?.[0] || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium text-gray-700">
                                    {video.author?.name || userProfile.name}
                                  </span>
                                  {video.author?.verified && <Verified className="w-3 h-3 text-blue-500" />}
                                </div>

                                <p className="text-sm text-gray-900 line-clamp-2 leading-relaxed">{video.content}</p>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-3">
                                    <span>{formatNumber(video.stats.views || 0)} views</span>
                                    <span>{formatNumber(video.stats.likes)} likes</span>
                                  </div>
                                  <span>{video.timestamp}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          // List View
                          <Card
                            key={video.id}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl bg-white transform hover:scale-[1.02]"
                          >
                            <CardContent className="p-6">
                              {/* Header do Vídeo */}
                              <div className="flex gap-4 mb-4">
                                <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                                  <AvatarImage src={video.author?.avatar || avatarImage || "/placeholder.svg"} />
                                  <AvatarFallback>{video.author?.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">
                                      {video.author?.name || userProfile.name}
                                    </span>
                                    {video.author?.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                    <span className="text-gray-500 text-sm">
                                      {video.author?.username || userProfile.username}
                                    </span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-500 text-sm">{video.timestamp}</span>
                                  </div>
                                  <Badge className={`w-fit ${getCategoryColor(video.category)}`}>
                                    {video.category}
                                  </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Conteúdo do Vídeo */}
                              <div className="space-y-4">
                                {/* Layout dividido: conteúdo à esquerda, thumbnail à direita */}
                                <div className="flex gap-6">
                                  {/* Lado esquerdo - Conteúdo */}
                                  <div className="flex-1">
                                    <p className="text-gray-900 leading-relaxed text-base">{video.content}</p>
                                  </div>

                                  {/* Lado direito - Thumbnail do vídeo */}
                                  <div className="w-48 flex-shrink-0">
                                    <div className="relative rounded-xl overflow-hidden shadow-md h-32 bg-gray-100">
                                      <img
                                        src={video.thumbnail || "/placeholder.svg"}
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => {
                                          if (video.type === "youtube" && video.youtubeUrl) {
                                            openYouTubeModal(video.youtubeUrl, video)
                                          }
                                        }}
                                      />
                                      <div
                                        className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
                                        onClick={() => {
                                          if (video.type === "youtube" && video.youtubeUrl) {
                                            openYouTubeModal(video.youtubeUrl, video)
                                          }
                                        }}
                                      >
                                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
                                          <Play className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                      </div>
                                      {video.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                          {video.duration}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Ações do Vídeo - Movidas para baixo */}
                                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-4">
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
                                    <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                                      <Heart className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{formatNumber(video.stats.likes)}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                                    <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                      <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{formatNumber(video.stats.comments)}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
                                    <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                      <Share className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{formatNumber(video.stats.shares)}</span>
                                  </button>
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <div className="p-2 rounded-full">
                                      <Eye className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{formatNumber(video.stats.views || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Play className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Nenhum vídeo ainda</h3>
                    <p className="text-sm text-center"></p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections">
              <div className="min-h-[400px]">
                {collections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                      <Card
                        key={collection.id}
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 transform hover:scale-105 cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={collection.thumbnail || "/placeholder.svg"}
                            alt={collection.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {collection.videoCount} vídeos
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{collection.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Eye className="w-4 h-4" />
                            {formatNumber(collection.totalViews)} visualizações
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Grid3X3 className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma coleção ainda</h3>
                    <p className="text-sm text-center">Organize seus vídeos em coleções para facilitar a navegação.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <div className="min-h-[400px]">
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => (
                      <Card
                        key={index}
                        className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-2 transform hover:scale-105 ${getRarityColor(achievement.rarity)}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                              <achievement.icon className="w-6 h-6 text-gray-700" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{achievement.date}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Trophy className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma conquista ainda</h3>
                    <p className="text-sm text-center">Continue criando conteúdo para desbloquear conquistas!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Post Modal */}
        {showCreatePostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Criar Post</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreatePostModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-blue-100">
                      <AvatarImage src={avatarImage || "/placeholder.svg"} />
                      <AvatarFallback>VC</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <Textarea
                        placeholder="Compartilhe algo interessante..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px] max-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />

                      {showYoutubeInput && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 space-y-3 border border-red-100">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                              <Youtube className="w-4 h-4" />
                              Link do YouTube
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowYoutubeInput(false)
                                setNewPostYoutubeUrl("")
                                if (newPostMediaType === "youtube") {
                                  setNewPostMediaType(null)
                                  setNewPostMedia(null)
                                  setVideoDuration(null)
                                }
                              }}
                              className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={newPostYoutubeUrl}
                            onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                            className="border-red-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                          />
                          {newPostYoutubeUrl && !extractYouTubeId(newPostYoutubeUrl) && (
                            <p className="text-xs text-red-600">Por favor, insira um link válido do YouTube</p>
                          )}
                        </div>
                      )}

                      {newPostMedia && newPostMediaType !== "youtube" && (
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {newPostMediaType === "image" ? "Imagem anexada" : "Vídeo anexado"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {videoDuration ? `Duração: ${videoDuration}` : "Clique em publicar para compartilhar"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 rounded-full"
                            onClick={() => {
                              setNewPostMedia(null)
                              setNewPostMediaType(null)
                              setVideoDuration(null)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {newPostMediaType === "youtube" && newPostYoutubeUrl && extractYouTubeId(newPostYoutubeUrl) && (
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Youtube className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Vídeo do YouTube anexado</p>
                            <p className="text-xs text-gray-500">Clique em publicar para compartilhar</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 rounded-full"
                            onClick={() => {
                              setNewPostMedia(null)
                              setNewPostMediaType(null)
                              setNewPostYoutubeUrl("")
                              setVideoDuration(null)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {showPollCreator && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4 space-y-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700">Criar Enquete</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPollCreator(false)}
                              className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {pollOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                                {index + 1}
                              </div>
                              <Input
                                type="text"
                                placeholder={`Opção ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...pollOptions]
                                  newOptions[index] = e.target.value
                                  setPollOptions(newOptions)
                                }}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                              />
                              {index > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 rounded-full"
                                  onClick={() => {
                                    const newOptions = [...pollOptions]
                                    newOptions.splice(index, 1)
                                    setPollOptions(newOptions)
                                  }}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {pollOptions.length < 4 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPollOptions([...pollOptions, ""])}
                              className="text-blue-600 hover:bg-blue-50 w-full rounded-xl border border-dashed border-blue-300"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Opção
                            </Button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => postMediaInputRef.current?.click()}
                            className="text-blue-600 hover:bg-blue-50 rounded-full p-3 transition-all duration-200 hover:scale-105"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                            className="text-red-600 hover:bg-red-50 rounded-full p-3 transition-all duration-200 hover:scale-105"
                          >
                            <Youtube className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPollCreator(!showPollCreator)}
                            className="text-green-600 hover:bg-green-50 rounded-full p-3 transition-all duration-200 hover:scale-105"
                          >
                            <BarChart3 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:bg-yellow-50 rounded-full p-3 transition-all duration-200 hover:scale-105"
                          >
                            <Smile className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:bg-purple-50 rounded-full p-3 transition-all duration-200 hover:scale-105"
                          >
                            <LocationIcon className="w-5 h-5" />
                          </Button>

                          <select
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="ml-3 px-4 py-2 border border-gray-200 rounded-full text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {newPostContent.length}/500
                          </span>
                          <Button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Publicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Modal */}
        {showYouTubeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl overflow-hidden max-w-7xl w-full max-h-[90vh] flex">
              {/* Video Section */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-600" />
                    Reproduzindo vídeo
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeYouTubeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(currentYouTubeUrl) || ""}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Sidebar - Video Info + Comments */}
              <div className="w-96 border-l border-gray-200 flex flex-col bg-gray-50">
                {/* Video Info */}
                {currentVideoData && (
                  <div className="bg-white border-b border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={currentVideoData.author?.avatar || avatarImage || "/placeholder.svg"} />
                        <AvatarFallback>{currentVideoData.author?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {currentVideoData.author?.name || userProfile.name}
                          </span>
                          {currentVideoData.author?.verified && <Verified className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-xs text-gray-600">{currentVideoData.timestamp}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{currentVideoData.content}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{formatNumber(currentVideoData.stats.likes)}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <Share className="w-4 h-4" />
                        <span className="text-xs">Compartilhar</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">{formatNumber(currentVideoData.stats.views || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments Header */}
                <div className="p-4 border-b border-gray-100 bg-white">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    Comentários
                  </h4>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4 p-4">
                    {videoComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{comment.user}</span>
                            <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">{comment.comment}</p>
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                              <Heart className="w-3 h-3" />
                              <span className="text-xs">{comment.likes}</span>
                            </button>
                            <button className="text-gray-500 hover:text-blue-500 transition-colors text-xs">
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={avatarImage || "/placeholder.svg"} />
                      <AvatarFallback></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[60px] resize-none text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{newComment.length}/500</span>
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditProfileModal(false)
                    setTempCoverImage(coverImage)
                    setTempAvatarImage(avatarImage)
                    setEditingName(userProfile.name)
                    setEditingBio(userProfile.bio)
                    setUseBlurredAvatar(false)
                    setBlurAmount(10)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>

                  {/* Checkbox para usar avatar com desfoque */}
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useBlurredAvatar}
                        onChange={(e) => setUseBlurredAvatar(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Usar foto de perfil como capa com desfoque</span>
                    </label>
                  </div>

                  {useBlurredAvatar ? (
                    // Seção de desfoque
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img
                          src={tempAvatarImage || "/placeholder.svg"}
                          alt="Cover preview with blur"
                          className="w-full h-full object-cover"
                          style={{ filter: `blur(${blurAmount}px)` }}
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-2 right-2 bg-white/90 text-gray-900 text-xs px-2 py-1 rounded">
                          Desfoque: {blurAmount}px
                        </div>
                      </div>

                      {/* Controle de desfoque */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Intensidade do desfoque: {blurAmount}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={blurAmount}
                          onChange={(e) => setBlurAmount(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(blurAmount / 30) * 100}%, #e5e7eb ${(blurAmount / 30) * 100}%, #e5e7eb 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Sem desfoque</span>
                          <span>Máximo desfoque</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Seção de upload normal
                    <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden">
                      <img
                        src={tempCoverImage || "/placeholder.svg"}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-900"
                        onClick={() => tempCoverInputRef.current?.click()}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Alterar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                      <Avatar className="w-full h-full border-2 border-white">
                        <AvatarImage src={tempAvatarImage || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg"></AvatarFallback>
                      </Avatar>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => tempAvatarInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Alterar foto
                    </Button>
                  </div>
                </div>

                {/* Name Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Seu nome"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                  <Textarea
                    value={editingBio}
                    onChange={(e) => setEditingBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={300}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">{editingBio.length}/300</div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditProfileModal(false)
                      setTempCoverImage(coverImage)
                      setTempAvatarImage(avatarImage)
                      setEditingName(userProfile.name)
                      setEditingBio(userProfile.bio)
                      setUseBlurredAvatar(false)
                      setBlurAmount(10)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleEditProfileSave} className="bg-blue-600 hover:bg-blue-700">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-md max-h-[80vh]">
            <img
              src={avatarImage || "/placeholder.svg"}
              alt="Profile"
              className="max-w-full max-h-full object-contain rounded-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Rodapé */}
      <footer className="bg-gray-900 text-white mt-16 w-full">
        <div className="max-w-full mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="text-xl font-bold">BILIBILI</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">A plataforma do corono.</p>
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <Youtube className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <Share className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Explorar</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Trending
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Anime
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Tecnologia
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Jogos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Música
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Comunidade</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Diretrizes
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Suporte
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Feedback
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Desenvolvedores
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Política de Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Direitos Autorais
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Cookies
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8">
              <p className="text-gray-400 text-sm text-center">© 2024 Bilibili. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
