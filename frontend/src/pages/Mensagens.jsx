import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Send, Paperclip, Camera, Star, Phone, Video, Share2, Pin, Archive, Flag, Ban, X, Calendar, CreditCard, MoreHorizontal, Clock, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mockConversations = [
  {
    id: '1', name: 'Linda L.', avatar: 'https://i.pravatar.cc/150?img=47', rating: 5, reviewCount: 2, date: '01/11/2025',
    service: 'Mudanças e ajuda com mudança', lastMessage: 'Você: sim', unread: false, status: 'pending',
    messages: [
      { id: 'm1', type: 'system', text: 'Pedido privado', detail: 'Aqui está meu pedido privado. Aguardo sua resposta.', time: '10:10', date: 'seg. 16 jun 2025', fromMe: false, hasAction: true },
      { id: 'm2', type: 'text', text: 'sim', time: '19:15', date: 'sáb. 01 nov 2025', fromMe: true, read: false },
    ]
  },
  {
    id: '2', name: 'Usuário suspens...', avatar: '', rating: 0, reviewCount: 0, date: '03/04/2025',
    service: 'Vendedor - Comercial', lastMessage: 'Você: Olá', unread: true, status: 'active',
    messages: [
      { id: 'm3', type: 'text', text: 'Olá, tudo bem?', time: '14:30', date: 'qui. 03 abr 2025', fromMe: false },
      { id: 'm4', type: 'text', text: 'Olá', time: '14:35', date: 'qui. 03 abr 2025', fromMe: true, read: true },
    ]
  },
  {
    id: '3', name: 'Cléo M.', avatar: 'https://i.pravatar.cc/150?img=32', rating: 0, reviewCount: 5, date: '25/09/2024',
    service: 'Montagem de móveis em kit', lastMessage: 'Você: Disponível', unread: false, status: 'active',
    messages: [
      { id: 'm5', type: 'text', text: 'Preciso de ajuda para montar um armário.', time: '09:00', date: 'qua. 25 set 2024', fromMe: false },
      { id: 'm6', type: 'text', text: 'Disponível', time: '09:15', date: 'qua. 25 set 2024', fromMe: true, read: true },
    ]
  },
  {
    id: '4', name: 'Julien S.', avatar: 'https://i.pravatar.cc/150?img=11', rating: 4, reviewCount: 5, date: '25/09/2024',
    service: 'Montagem de móveis em kit', lastMessage: 'Você: Disponível', unread: false, status: 'active',
    messages: []
  },
  {
    id: '5', name: 'Milla R.', avatar: 'https://i.pravatar.cc/150?img=23', rating: 3, reviewCount: 5, date: '24/09/2024',
    service: 'Mudanças e ajuda com mudança', lastMessage: 'Você: Disponível', unread: false, status: 'completed',
    messages: []
  }
];

const Mensagens = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('todas');
  const [conversations, setConversations] = useState(mockConversations);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionToast, setActionToast] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const conv = conversations.find(c => c.id === selectedConvId);

  // Process incoming navigation state (from "Responder" button on Home)
  useEffect(() => {
    const target = location.state?.targetUser;
    const initialMsg = location.state?.initialMessage;
    if (!target) return;

    // Try to find an existing conversation with this user (by id or name)
    const matchKey = target.id || target.name;
    let existing = conversations.find(c =>
      (target.id && c.authorId === target.id) || c.name === target.name
    );

    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      // Create a new conversation entry for this author
      const newConv = {
        id: `new-${matchKey}-${Date.now()}`,
        authorId: target.id,
        name: target.name || 'Usuário',
        avatar: target.avatar || '',
        rating: 0,
        reviewCount: 0,
        date: new Date().toLocaleDateString('pt-BR'),
        service: target.service || 'Pedido público',
        lastMessage: '',
        unread: false,
        status: 'active',
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConvId(newConv.id);
    }

    if (initialMsg) {
      setMessage(initialMsg);
    }

    // Clear navigation state to avoid re-triggering on re-renders
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conv?.messages?.length]);

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3000);
  };

  const addSystemMessage = (text) => {
    if (!conv) return;
    const sysMsg = {
      id: `sys-${Date.now()}`,
      type: 'system',
      text,
      detail: '',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: 'Hoje',
      fromMe: true
    };
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, messages: [...c.messages, sysMsg], lastMessage: `Você: ${text}` } : c
    ));
  };

  const handleSend = () => {
    if (!message.trim() && !attachedPhoto) return;
    if (!conv) return;
    const newMsg = {
      id: `m${Date.now()}`,
      type: attachedPhoto ? 'image' : 'text',
      text: message || '',
      imageUrl: attachedPhoto || null,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: 'Hoje',
      fromMe: true,
      read: false
    };
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: `Você: ${message || 'Foto'}` } : c
    ));
    setMessage('');
    setAttachedPhoto(null);
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) return;
    addSystemMessage(`Agendamento proposto: ${scheduleDate} às ${scheduleTime}`);
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
    showToast('Agendamento enviado com sucesso!');
  };

  const handlePayment = () => {
    if (!paymentAmount) return;
    addSystemMessage(`Solicitação de pagamento: R$ ${paymentAmount}`);
    setShowPaymentModal(false);
    setPaymentAmount('');
    showToast('Solicitação de pagamento enviada!');
  };

  const handleDecline = () => {
    addSystemMessage(`Pedido recusado${declineReason ? `: ${declineReason}` : ''}`);
    setConversations(prev => prev.map(c =>
      c.id === conv?.id ? { ...c, status: 'declined' } : c
    ));
    setShowDeclineModal(false);
    setDeclineReason('');
    showToast('Pedido recusado');
  };

  const handlePhotoAttach = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedPhoto(URL.createObjectURL(file));
  };

  const filtered = filter === 'nao-lidas' ? conversations.filter(c => c.unread) : filter === 'arquivadas' ? [] : conversations;

  return (
    <div className="min-h-screen bg-[#FFF5F3] pb-20 sm:pb-0">
      <Header />

      {/* Action Toast */}
      {actionToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm" data-testid="action-toast">
          <Check className="w-4 h-4 inline mr-2" />{actionToast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-0 sm:px-2 py-0 sm:py-2">
        <div className="bg-white sm:rounded-xl sm:shadow-sm sm:border border-gray-100 h-[calc(100vh-80px)] sm:h-[calc(100vh-80px)] flex overflow-hidden">

          {/* LEFT - Conversation List */}
          <div className={`${selectedConvId ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 border-r border-gray-200 flex-col`} data-testid="conversations-list">
            {/* Mobile Header (Above tabs) */}
            <div className="sm:hidden bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900 mx-auto">Messages</h1>
                <button className="text-sm font-medium text-gray-700 absolute right-4">
                  Modifier
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  type="text"
                  placeholder="Rechercher"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              <div className="sm:hidden flex gap-2 px-4 pb-3 w-full overflow-x-auto">
                <button onClick={() => setFilter('todas')} data-testid="filter-todas"
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'todas' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-300 text-gray-700'}`}>
                  Toutes
                </button>
                <button onClick={() => setFilter('nao-lidas')} data-testid="filter-nao-lidas"
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'nao-lidas' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-300 text-gray-700'}`}>
                  Non lues
                </button>
                <button onClick={() => setFilter('arquivadas')} data-testid="filter-arquivadas"
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'arquivadas' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-300 text-gray-700'}`}>
                  Archivées
                </button>
              </div>

              <div className="hidden sm:flex w-full">
                {['todas', 'nao-lidas', 'arquivadas'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`}
                    className={`flex-1 py-3 text-xs font-medium transition-colors ${filter === f ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>
                    {f === 'todas' ? 'Todas' : f === 'nao-lidas' ? 'Não lidas' : 'Arquivadas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Last Message Indicator (Mobile Only) */}
            <div className="sm:hidden px-4 py-3 bg-gray-50 text-sm text-gray-600 border-b border-gray-200">
              Vous : <span className="font-medium">bonjour</span>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma conversa</p>
              ) : filtered.map(c => (
                <div key={c.id} onClick={() => setSelectedConvId(c.id)} data-testid={`conv-${c.id}`}
                  className={`px-4 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConvId === c.id ? 'bg-blue-50 sm:border-l-2 sm:border-l-blue-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-14 h-14 sm:w-10 sm:h-10 flex-shrink-0">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback className="bg-gray-200 text-gray-500 text-sm">{c.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base sm:text-sm truncate">{c.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
                            <span>-/{c.rating}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{c.date}</span>
                      </div>
                      <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700 mt-1.5 sm:mt-0.5">
                        {c.service}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1.5 sm:mt-0.5">{c.lastMessage}</p>
                    </div>
                    {c.unread && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2 sm:mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER - Chat Area */}
          <div className={`${selectedConvId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col w-full`} data-testid="chat-area">
            {conv ? (
              <>
                {/* Chat Header */}
                <div className="px-3 sm:px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                  {/* Back Button (Mobile Only) */}
                  <button 
                    onClick={() => setSelectedConvId(null)} 
                    className="sm:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{conv.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{conv.service}</p>
                  </div>
                  {conv.status === 'declined' && (
                    <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full whitespace-nowrap">Recusado</span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-white">
                  {conv.messages.length === 0 && (
                    <p className="text-center text-sm text-gray-400 mt-8">Nenhuma mensagem ainda. Inicie a conversa!</p>
                  )}
                  {conv.messages.map((msg, i) => {
                    const showDate = i === 0 || conv.messages[i - 1]?.date !== msg.date;
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.date}</span>
                          </div>
                        )}
                        <div className={`flex mb-3 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                          {!msg.fromMe && (
                            <Avatar className="w-7 h-7 mr-2 flex-shrink-0 mt-1">
                              <AvatarImage src={conv.avatar} />
                              <AvatarFallback className="text-xs">{conv.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            msg.fromMe
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : msg.type === 'system'
                                ? 'bg-[#E8F4FD] rounded-bl-md'
                                : 'bg-gray-100 rounded-bl-md'
                          }`}>
                            {msg.type === 'system' && <p className="text-sm font-semibold text-blue-700 mb-1">{msg.text}</p>}
                            {msg.type === 'system' && msg.detail && <p className="text-sm text-gray-700">{msg.detail}</p>}
                            {msg.type === 'system' && msg.hasAction && (
                              <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-300 text-blue-700">Consultar</Button>
                            )}
                            {msg.type === 'text' && <p className="text-sm">{msg.text}</p>}
                            {msg.type === 'image' && (
                              <div>
                                {msg.imageUrl && <img src={msg.imageUrl} alt="Foto" className="max-w-full rounded-lg mb-1" />}
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                              </div>
                            )}
                            <div className={`flex items-center gap-1 mt-1 ${msg.fromMe ? 'justify-end' : ''}`}>
                              <span className={`text-xs ${msg.fromMe ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
                  <button onClick={() => setShowDeclineModal(true)} className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors" data-testid="action-decline">
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-gray-600 mt-0.5">Recusar</span>
                  </button>
                  <button onClick={() => setShowScheduleModal(true)} className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors" data-testid="action-schedule">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-600 mt-0.5">Agendar</span>
                  </button>
                  <button onClick={() => setShowPaymentModal(true)} className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors" data-testid="action-payment">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-600 mt-0.5">Pagamento</span>
                  </button>
                  <button onClick={() => setShowMoreActions(!showMoreActions)} className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors relative" data-testid="action-more">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-600 mt-0.5">Ver tudo</span>
                    {showMoreActions && (
                      <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-10" data-testid="more-actions-menu">
                        <button onClick={() => { addSystemMessage('Serviço marcado como concluído'); showToast('Serviço concluído!'); setShowMoreActions(false); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />Marcar como concluído
                        </button>
                        <button onClick={() => { showToast('Conversa arquivada'); setShowMoreActions(false); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Archive className="w-4 h-4" />Arquivar conversa
                        </button>
                        <button onClick={() => { showToast('Perfil denunciado'); setShowMoreActions(false); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-500">
                          <Flag className="w-4 h-4" />Denunciar
                        </button>
                      </div>
                    )}
                  </button>
                </div>

                {/* Photo Preview */}
                {attachedPhoto && (
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                    <img src={attachedPhoto} alt="Anexo" className="w-16 h-16 object-cover rounded-lg" />
                    <button onClick={() => setAttachedPhoto(null)} className="text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                )}

                {/* Message Input */}
                <div className="px-3 sm:px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600 flex-shrink-0" onClick={() => fileInputRef.current?.click()} data-testid="attach-file-btn">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 hidden sm:block" onClick={() => fileInputRef.current?.click()} data-testid="attach-photo-btn">
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoAttach} />
                    <Input data-testid="message-input" placeholder="Sua mensagem" value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 h-10 sm:h-10 rounded-full border-gray-200 text-sm" />
                    <Button data-testid="send-message-btn" onClick={handleSend} size="sm"
                      className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0 flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">Selecione uma conversa</p>
                  <p className="text-sm">para começar a conversar</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Profile Sidebar (desktop only) */}
          {conv && (
            <div className="hidden lg:flex w-72 border-l border-gray-200 flex-col p-4 overflow-y-auto" data-testid="profile-sidebar">
              <div className="text-center mb-4">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={conv.avatar} />
                  <AvatarFallback className="text-xl bg-gray-200">{conv.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{conv.name}</h3>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{conv.rating}/5 ({conv.reviewCount} avis)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{conv.service}</p>
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={() => { addSystemMessage('Chamada de vídeo iniciada'); showToast('Chamada de vídeo iniciada com ' + conv.name); }}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  data-testid="video-call-btn"
                >
                  <Video className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => { addSystemMessage('Chamada de voz iniciada'); showToast('Ligando para ' + conv.name + '...'); }}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
                  data-testid="phone-call-btn"
                >
                  <Phone className="w-4 h-4 text-green-500" />
                </button>
                <Button variant="outline" size="sm" className="rounded-full text-xs" data-testid="view-profile-btn">
                  Ver perfil
                </Button>
              </div>

              <div className="space-y-1 border-t border-gray-100 pt-4">
                <button onClick={() => showToast('Link copiado!')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Share2 className="w-4 h-4" /> Compartilhar perfil
                </button>
                <button onClick={() => showToast('Conversa fixada!')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Pin className="w-4 h-4" /> Fixar conversa
                </button>
                <button onClick={() => showToast('Conversa arquivada!')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Archive className="w-4 h-4" /> Arquivar conversa
                </button>
              </div>

              <div className="space-y-1 border-t border-gray-100 pt-4 mt-4">
                <button onClick={() => showToast('Perfil denunciado!')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                  <Flag className="w-4 h-4" /> Denunciar perfil
                </button>
                <button onClick={() => showToast('Usuário bloqueado!')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Ban className="w-4 h-4" /> Bloquear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-bold">Agendar serviço</DialogTitle>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-600">Data</label>
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="mt-1" data-testid="schedule-date" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Horário</label>
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-1" data-testid="schedule-time" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSchedule} disabled={!scheduleDate || !scheduleTime} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" data-testid="schedule-confirm-btn">
                <Calendar className="w-4 h-4 mr-2" />Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-bold">Solicitar pagamento</DialogTitle>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-600">Valor (R$)</label>
              <Input type="number" placeholder="0,00" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1 text-lg" data-testid="payment-amount" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handlePayment} disabled={!paymentAmount} className="flex-1 bg-green-500 hover:bg-green-600 text-white" data-testid="payment-confirm-btn">
                <CreditCard className="w-4 h-4 mr-2" />Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-bold">Recusar pedido</DialogTitle>
          <div className="space-y-4 mt-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">Ao recusar, o solicitante será notificado.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Motivo (opcional)</label>
              <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ex: Não estou disponível nessa data..."
                className="w-full mt-1 border border-gray-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-200"
                data-testid="decline-reason" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeclineModal(false)} className="flex-1">Voltar</Button>
              <Button onClick={handleDecline} className="flex-1 bg-red-500 hover:bg-red-600 text-white" data-testid="decline-confirm-btn">
                <X className="w-4 h-4 mr-2" />Recusar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MessageIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

export default Mensagens;
