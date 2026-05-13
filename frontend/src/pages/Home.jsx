import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Heart, Share2, MessageSquare, MapPin, X, Camera, Globe, ChevronRight, Users, Send, Image as ImageIcon, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { compressImage, isInvalidImageUrl } from '../lib/imageUtils';

const initialPosts = [
  {
    id: '1',
    userName: 'João S.',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    time: 'postado às 19:38',
    description: 'Olá, estou precisando de um eletricista para fazer algumas instalações na minha casa. Tenho 3 pontos de tomada para instalar e preciso trocar o disjuntor principal.',
    location: 'São Paulo, SP - 1.8 km',
    budget: 'A combinar',
    images: [],
    likes: 12,
    recommends: 5,
    responses: 6
  },
  {
    id: '2',
    userName: 'Maria F.',
    userAvatar: 'https://i.pravatar.cc/150?img=45',
    time: 'postado às 19:18',
    description: 'Preciso de professor particular de matemática para minha filha que está no ensino médio. Aulas 2x por semana, preferencialmente aos sábados pela manhã.',
    location: 'Rio de Janeiro, RJ - 3.2 km',
    budget: 'R$ 80/aula',
    images: [],
    likes: 8,
    recommends: 3,
    responses: 12
  },
  {
    id: '3',
    userName: 'Carlos O.',
    userAvatar: 'https://i.pravatar.cc/150?img=33',
    time: 'postado às 18:45',
    description: 'Procuro desenvolvedor para criar um site institucional simples. Preciso de algo profissional mas sem muita complexidade. Prazo de 2 semanas.',
    location: 'Belo Horizonte, MG - 3 km',
    budget: 'R$ 2.000',
    images: [],
    likes: 15,
    recommends: 8,
    responses: 4
  }
];

const themes = [
  { id: 't1', title: 'Preciso de ajuda para pequenos trabalhos', image: 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=400&h=300&fit=crop', likes: '10.0k', shares: '2.7k' },
  { id: 't2', title: 'Preciso de ajuda para limpeza', image: 'https://images.unsplash.com/photo-1758273238795-c284e5ae09b6?w=400&h=300&fit=crop', likes: '13.1k', shares: '3.5k' },
  { id: 't3', title: 'É primavera!', image: 'https://images.unsplash.com/photo-1606676539940-12768ce0e762?w=400&h=300&fit=crop', likes: '1.1k', shares: '277' }
];

const PostCard = ({ post, onRecommend }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [recommended, setRecommended] = useState(false);
  const [recommendCount, setRecommendCount] = useState(post.recommends);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleRecommend = () => {
    setRecommended(!recommended);
    setRecommendCount(prev => recommended ? prev - 1 : prev + 1);
    if (!recommended && onRecommend) onRecommend(post);
  };

  return (
    <Card className="p-4 mb-3 hover:shadow-md transition-shadow border border-gray-100" data-testid={`post-${post.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Globe className="w-3.5 h-3.5" />
          <span>Pedido público</span>
        </div>
        <span className="text-xs text-gray-400">{post.time}</span>
      </div>

      <div className="flex items-start space-x-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.userAvatar} alt={post.userName} />
          <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{post.userName}</h3>
          <p className="text-sm text-gray-700 mt-1">{post.description}</p>

          {/* Display post images - full width like allovoisins */}
          {post.images && post.images.length > 0 && (
            <div className="mt-3 -mx-3" data-testid={`post-images-${post.id}`}>
              {post.images.length === 1 ? (
                <img
                  src={post.images[0]}
                  alt="Foto do pedido"
                  className="w-full max-h-[400px] object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                    e.target.style.objectFit = 'contain';
                  }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3">
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg bg-gray-50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12"%3EImagem%3C/text%3E%3C/svg%3E';
                        e.target.style.objectFit = 'contain';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Display post videos - full width, no black borders */}
          {post.videos && post.videos.length > 0 && (
            <div className="mt-3 space-y-2" data-testid={`post-videos-${post.id}`}>
              {post.videos.map((vid, idx) => (
                <video
                  key={idx}
                  src={vid}
                  controls
                  playsInline
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '400px' }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{post.location}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Orçamento: <span className="font-medium">{post.budget}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400 text-right mb-2 justify-end">
        <span>{likeCount} curtidas</span>
        <span>{recommendCount} recomendações</span>
        <span>{post.responses} respostas</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          data-testid={`like-btn-${post.id}`}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all ${liked ? 'text-red-500 bg-red-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
          {liked ? 'Curtido' : 'Curtir'}
        </button>
        <button
          onClick={handleRecommend}
          data-testid={`recommend-btn-${post.id}`}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all ${recommended ? 'text-blue-500 bg-blue-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Users className={`w-4 h-4 ${recommended ? 'fill-blue-100' : ''}`} />
          {recommended ? 'Recomendado' : 'Recomendar'}
        </button>
        <button
          onClick={() => navigate('/mensagens', {
            state: {
              targetUser: {
                id: post.userId,
                name: post.userName,
                avatar: post.userAvatar,
                service: post.description?.slice(0, 60) || 'Pedido público'
              },
              initialMessage: 'eu tenho interesse no trabalho'
            }
          })}
          data-testid={`respond-btn-${post.id}`}
          className="flex items-center gap-1.5 text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Responder
        </button>
      </div>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [postText, setPostText] = useState('');
  const [postPhotos, setPostPhotos] = useState([]);
  const [postAddress, setPostAddress] = useState(user?.location || 'São Paulo, SP');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [recommendedToast, setRecommendedToast] = useState('');
  const fileInputRefs = useRef([]);
  const cameraInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [postVideos, setPostVideos] = useState([]);

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
  }, []);

  // Listen for posts created from the mobile FAB modal (BottomNav) and prepend them
  useEffect(() => {
    const handleNewPost = (e) => {
      const post = e.detail;
      if (!post) return;
      const formatted = {
        id: post.id,
        userId: post.user_id,
        userName: post.user_name,
        userAvatar: post.user_avatar,
        time: 'agora mesmo',
        description: post.description,
        location: post.location,
        budget: post.budget,
        images: (post.images || []).filter(u => !isInvalidImageUrl(u)),
        videos: (post.videos || []).filter(u => !isInvalidImageUrl(u)),
        likes: post.likes,
        recommends: post.recommends,
        responses: post.responses
      };
      setPosts(prev => [formatted, ...prev]);
    };
    window.addEventListener('post-created', handleNewPost);
    return () => window.removeEventListener('post-created', handleNewPost);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      // Convert API response to component format and filter stale blob: URLs
      const formattedPosts = res.data.map(post => ({
        id: post.id,
        userId: post.user_id,
        userName: post.user_name,
        userAvatar: post.user_avatar,
        time: getTimeAgo(post.created_at),
        description: post.description,
        location: post.location,
        budget: post.budget,
        images: (post.images || []).filter(u => !isInvalidImageUrl(u)),
        videos: (post.videos || []).filter(u => !isInvalidImageUrl(u)),
        likes: post.likes,
        recommends: post.recommends,
        responses: post.responses
      }));
      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      // Fallback to initial posts if API fails
      setPosts(initialPosts);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds
    
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} horas`;
    return `postado às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1024, 0.7);
      setPostPhotos(prev => {
        const updated = [...prev];
        updated[index] = dataUrl;
        return updated;
      });
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Erro ao processar imagem. Tente outra foto.');
    }
  };

  const removePhoto = (index) => {
    setPostPhotos(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1024, 0.7);
      setPostPhotos(prev => [...prev, dataUrl]);
    } catch (err) {
      console.error('Erro ao processar foto:', err);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Videos are kept as object URLs only for in-session preview;
    // we will not upload them as data URLs (too large). Strip on publish.
    setPostVideos(prev => [...prev, URL.createObjectURL(file)]);
  };

  const removeVideo = (index) => {
    setPostVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!postText.trim()) return;
    
    try {
      const postData = {
        description: postText,
        location: postAddress,
        budget: 'A combinar',
        images: postPhotos.filter(Boolean).filter(u => !isInvalidImageUrl(u)),
        videos: [] // Videos via blob: URLs cannot be persisted; skip until proper upload exists
      };
      
      const res = await api.post('/posts', postData);
      
      // Add new post to the beginning of the list
      const newPost = {
        id: res.data.id,
        userId: res.data.user_id,
        userName: res.data.user_name,
        userAvatar: res.data.user_avatar,
        time: 'agora mesmo',
        description: res.data.description,
        location: res.data.location,
        budget: res.data.budget,
        images: res.data.images || [],
        videos: res.data.videos || [],
        likes: res.data.likes,
        recommends: res.data.recommends,
        responses: res.data.responses
      };
      
      setPosts(prev => [newPost, ...prev]);
      setPostText('');
      setPostPhotos([]);
      setPostVideos([]);
    } catch (err) {
      console.error('Error creating post:', err);
      
      // Check if it's a 403 error (limit reached)
      if (err.response?.status === 403) {
        const confirmUpgrade = window.confirm(
          '⚠️ Você atingiu o limite de 2 posts gratuitos!\n\n' +
          'Assine o plano Premium para continuar postando sem limites.\n\n' +
          'Deseja ir para a página de assinatura?'
        );
        if (confirmUpgrade) {
          navigate('/abonamento');
        }
      } else {
        alert('Erro ao publicar pedido. Tente novamente.');
      }
    }
  };

  const handleRespond = (post) => {
    setReplyTarget(post);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      await api.post(`/posts/${replyTarget.id}/respond`, {
        type: 'respond',
        response_text: replyText
      });
      
      // Update response count locally
      setPosts(prev => prev.map(p =>
        p.id === replyTarget.id ? { ...p, responses: p.responses + 1 } : p
      ));
      
      setShowReplyModal(false);
      setReplyText('');
      setReplyTarget(null);
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Erro ao enviar resposta. Tente novamente.');
    }
  };

  const handleRecommend = (post) => {
    setRecommendedToast(`Você recomendou o pedido de ${post.userName}`);
    setTimeout(() => setRecommendedToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F3] pb-16 md:pb-0">
      <Header />

      {/* Toast for recommendation */}
      {recommendedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm animate-in fade-in slide-in-from-top-2" data-testid="recommend-toast">
          {recommendedToast}
        </div>
      )}

      {/* Premium Banner */}
      {showBanner && (
        <div className="bg-[#FFE5E0]">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center relative">
            <p className="text-sm text-[#E85D4A] font-medium">
              Acesse novamente ferramentas e serviços exclusivos: torne-se Premier!
            </p>
            <Button size="sm" className="bg-[#FF6B6B] hover:bg-[#E85D4A] text-white mt-2 rounded-full px-6" onClick={() => navigate('/abonamento')} data-testid="premium-banner-btn">
              Assinar novamente
            </Button>
            <button onClick={() => setShowBanner(false)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">

          {/* Left Column - Feed */}
          <div className="lg:col-span-2">
            <div className="space-y-0">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onRecommend={handleRecommend} />
              ))}
            </div>

            {/* Themed Categories - Hidden on mobile */}
            <div className="mt-6 mb-4 hidden sm:block">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#127912;</span>
                <h3 className="font-bold text-base">Temáticas do momento</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ganhe tempo: publique todos os seus pedidos em um clique.</p>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <div key={theme.id} className="relative rounded-xl overflow-hidden cursor-pointer group h-48" data-testid={`theme-${theme.id}`}>
                    <img src={theme.image} alt={theme.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium leading-tight">{theme.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/80">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{theme.likes}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{theme.shares}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button variant="outline" className="rounded-full text-sm" data-testid="view-all-themes-btn">
                  Ver todas as temáticas
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar - Hidden on mobile */}
          <div className="space-y-4 hidden lg:block">
            {/* Post Form Card */}
            <Card className="p-4" data-testid="post-form-card">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Descreva o serviço que você precisa..."
                className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                data-testid="post-textarea"
              />

              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Adicione fotos e vídeos</p>
                <p className="text-xs text-gray-500 mb-2">Aumente suas chances em 25% ilustrando sua necessidade.</p>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="relative">
                      {postPhotos[i] ? (
                        <div className="relative w-16 h-16">
                          <img src={postPhotos[i]} alt={`Foto ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            data-testid={`remove-photo-${i}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors" data-testid={`photo-upload-${i}`}>
                          <Camera className="w-5 h-5 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={el => fileInputRefs.current[i] = el}
                            onChange={(e) => handlePhotoUpload(e, i)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors" data-testid="camera-capture-btn">
                    <Camera className="w-3.5 h-3.5" /> Tirar foto
                  </button>
                  <button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors" data-testid="video-upload-btn">
                    <Video className="w-3.5 h-3.5" /> Vídeo
                  </button>
                  <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
                  <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </div>
                {/* Video previews */}
                {postVideos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {postVideos.map((vid, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden" data-testid={`post-video-preview-${idx}`}>
                        <video src={vid} controls playsInline className="w-full rounded-lg object-cover" style={{ maxHeight: '150px' }} />
                        <button onClick={() => removeVideo(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Input
                  value={postAddress}
                  onChange={(e) => setPostAddress(e.target.value)}
                  placeholder="Seu endereço"
                  className="h-8 text-xs border-gray-200"
                  data-testid="post-address-input"
                />
              </div>

              {/* Posts limit indicator */}
              {user && !user.isPremium && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-yellow-800">
                      Posts Gratuitos
                    </span>
                    <span className="text-xs font-bold text-yellow-900">
                      {user.posts_count || 0}/2
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all"
                      style={{ width: `${((user.posts_count || 0) / 2) * 100}%` }}
                    />
                  </div>
                  {(user.posts_count || 0) >= 2 && (
                    <p className="text-xs text-yellow-800 mt-2">
                      ⚠️ Limite atingido. <button onClick={() => navigate('/abonamento')} className="underline font-semibold">Assine Premium</button> para continuar
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handlePublish}
                disabled={!postText.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-white mt-4 rounded-full h-11 disabled:opacity-50"
                data-testid="post-demand-btn"
              >
                Publicar meu pedido
              </Button>
            </Card>

            {/* Earn Money Card */}
            <Card className="p-4" data-testid="earn-money-card">
              <h3 className="font-bold text-lg mb-2">Arredonde sua renda</h3>
              <p className="text-sm text-gray-600 mb-4">
                Responda aos pedidos publicados perto de você e gere um complemento de renda.
              </p>
              <Button className="w-full bg-[#FF9B8A] hover:bg-[#FF8A79] text-white rounded-full h-11" data-testid="offer-services-btn" onClick={() => navigate('/empregos')}>
                Propor meus serviços
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Responder pedido</DialogTitle>
          {replyTarget && (
            <div className="p-4">
              <h3 className="font-bold text-base mb-2">Responder a {replyTarget.userName}</h3>
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{replyTarget.description}</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                data-testid="reply-textarea"
              />
              <div className="flex gap-2 mt-3">
                <Button variant="outline" onClick={() => setShowReplyModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  data-testid="send-reply-btn"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
