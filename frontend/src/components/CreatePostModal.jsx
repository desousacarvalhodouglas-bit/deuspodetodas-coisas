import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Camera, X, MapPin, Loader2, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { compressImage, isInvalidImageUrl } from '../lib/imageUtils';

const CreatePostModal = ({ open, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');
  const [postPhotos, setPostPhotos] = useState([]);
  const [postVideos, setPostVideos] = useState([]);
  const [postAddress, setPostAddress] = useState(user?.location || 'Jataí, Goiás');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRefs = useRef([]);
  const videoInputRef = useRef(null);

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1024, 0.7);
      const newPhotos = [...postPhotos];
      newPhotos[index] = dataUrl;
      setPostPhotos(newPhotos);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Erro ao processar imagem. Tente outra foto.');
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostVideos([...postVideos, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...postPhotos];
    newPhotos[index] = null;
    setPostPhotos(newPhotos);
  };

  const removeVideo = (index) => {
    setPostVideos(postVideos.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!postText.trim()) {
      alert('Por favor, descreva o serviço que você precisa');
      return;
    }
    
    try {
      setIsLoading(true);
      const postData = {
        description: postText,
        location: postAddress,
        budget: 'A combinar',
        images: postPhotos.filter(Boolean).filter(u => !isInvalidImageUrl(u)),
        videos: postVideos.filter(Boolean).filter(u => !isInvalidImageUrl(u))
      };
      
      const res = await api.post('/posts', postData);

      // Reset form
      setPostText('');
      setPostPhotos([]);
      setPostVideos([]);
      setPostAddress(user?.location || 'Jataí, Goiás');

      // Notify parent and any listeners (the feed) so the new post is prepended
      if (onPostCreated) {
        onPostCreated(res.data);
      }
      window.dispatchEvent(new CustomEvent('post-created', { detail: res.data }));

      // Close modal and ensure user lands on the feed where the new post appears
      onClose();
      if (window.location.pathname !== '/feed') {
        navigate('/feed');
      }
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
          onClose();
          navigate('/abonamento');
        }
      } else {
        alert('Erro ao publicar pedido. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Criar Publicação</DialogTitle>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Nova Publicação</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Descreva o serviço que você precisa..."
            className="w-full h-28 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
          />

          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Adicione fotos e vídeos</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative">
                  {postPhotos[i] ? (
                    <div className="relative w-16 h-16">
                      <img 
                        src={postPhotos[i]} 
                        alt={`Foto ${i + 1}`} 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="10"%3EErro%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
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
            
            <button 
              onClick={() => videoInputRef.current?.click()} 
              className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors mt-2"
            >
              <Video className="w-3.5 h-3.5" /> Adicionar vídeo
            </button>
            <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoUpload} />

            {postVideos.length > 0 && (
              <div className="mt-2 space-y-2">
                {postVideos.map((vid, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden">
                    <video 
                      src={vid} 
                      controls 
                      playsInline 
                      className="w-full rounded-lg object-cover" 
                      style={{ maxHeight: '150px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        const parent = e.target.parentElement;
                        parent.innerHTML = '<div class="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded-lg">Vídeo não suportado</div>';
                      }}
                    />
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
              className="h-9 text-sm border-gray-200"
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
                  ⚠️ Limite atingido. <button onClick={() => { onClose(); navigate('/abonamento'); }} className="underline font-semibold">Assine Premium</button> para continuar
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handlePublish}
            disabled={!postText.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base mt-4 rounded-lg"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
