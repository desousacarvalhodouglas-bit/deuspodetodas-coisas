import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Search, Wrench, ArrowLeft, Loader2, Building2, User, Briefcase, Eye, EyeOff, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NewHome = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: new password, 3: success
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('PT');
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    lastName: '',
    commercialName: '',
    profession: '',
    email: '',
    password: '',
    location: '',
    phone: '',
    avatar: null,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Imagem muito grande. Máximo 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setRegisterData({ ...registerData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Detectar localização automaticamente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Usar Google Maps Geocoding API para obter endereço
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyC1rsLAluPX1QVAdblELEVf1rFcOXde3DU`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted_address;
              setUserLocation(address);
              setRegisterData(prev => ({ ...prev, location: address }));
            }
          } catch (err) {
            console.error('Erro ao obter localização:', err);
            setUserLocation('Jataí, Goiás');
          }
        },
        (error) => {
          console.error('Erro ao obter geolocalização:', error);
          setUserLocation('Jataí, Goiás');
        }
      );
    } else {
      setUserLocation('Jataí, Goiás');
    }
  }, []);

  const resetRegister = () => {
    setStep(1);
    setAccountType('');
    setRegisterData({ 
      name: '', 
      lastName: '', 
      commercialName: '', 
      profession: '', 
      email: '', 
      password: '', 
      location: userLocation || 'Jataí, Goiás', 
      phone: '',
      avatar: null,
    });
    setAcceptTerms(false);
    setError('');
    setAvatarPreview(null);
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (!acceptTerms) {
      setError('Aceite os termos de uso para continuar');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const fullName = accountType === 'particular'
        ? `${registerData.name} ${registerData.lastName}`.trim()
        : registerData.commercialName || registerData.name;
      await register({
        name: fullName || 'Usuário',
        email: registerData.email,
        password: registerData.password,
        location: registerData.location || 'Brasil',
        phone: registerData.phone || undefined,
      });
      setShowCreateAccount(false);
      resetRegister();
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('Preencha email e senha');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(loginData.email, loginData.password);
      setShowLogin(false);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotPasswordStep === 1) {
      // Step 1: Validate email
      if (!forgotPasswordEmail) {
        setError('Digite seu email');
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // Proceed to step 2 without backend check
        setForgotPasswordStep(2);
      } catch (err) {
        setError('Erro inesperado');
      } finally {
        setIsLoading(false);
      }
    } else if (forgotPasswordStep === 2) {
      // Step 2: Set new password
      if (!newPassword || !confirmPassword) {
        setError('Preencha todos os campos');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
      if (newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      setIsLoading(true);
      setError('');
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password?email=${encodeURIComponent(forgotPasswordEmail)}&new_password=${encodeURIComponent(newPassword)}`;
        const response = await fetch(url, {
          method: 'POST',
        });
        
        if (response.ok) {
          setForgotPasswordStep(3);
        } else {
          const data = await response.json();
          setError(data.detail || 'Erro ao resetar senha');
        }
      } catch (err) {
        setError('Erro ao resetar senha. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForgotPassword = () => {
    setForgotPasswordEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordStep(1);
    setError('');
  };

  const selectAccountType = (type) => {
    setAccountType(type);
    setStep(2);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-green-400 rounded-lg flex items-center justify-center text-white font-bold">
              J
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">
                <span className="text-green-500">Jataí</span>
                <span className="text-orange-500"> Região</span>
              </span>
              <span className="text-xs text-gray-500 uppercase">Facilitador de Trabalho</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              {['PT', 'EN', 'ES'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded ${language === lang ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:text-green-600'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => { setShowLogin(true); setError(''); }} className="border-gray-300">
              Entrar
            </Button>
            <Button onClick={() => { setShowCreateAccount(true); resetRegister(); }} className="bg-gray-900 hover:bg-gray-800 text-white">
              Cadastrar-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full mb-4">
                <span className="text-green-600 font-semibold flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span>4.8/5</span>
                </span>
                <span className="text-gray-600 text-sm">420k avaliações</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Conectando profissionais
              <br />
              <span className="text-green-600">em Jataí e Goiás</span>
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              A maior plataforma de serviços e empregos de Goiás
            </p>
            <div className="flex items-center space-x-2 mb-8 text-sm text-gray-600">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>Atuando em Jataí, Rio Verde, Goiânia e toda região goiana</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button onClick={() => { setShowCreateAccount(true); resetRegister(); }} className="bg-gray-900 hover:bg-gray-800 text-white h-14 px-8 text-base">
                <Search className="w-5 h-5 mr-2" />
                Preciso de um serviço
              </Button>
              <Button onClick={() => navigate('/abonamento')} variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50 h-14 px-8 text-base">
                <Wrench className="w-5 h-5 mr-2" />
                Busco emprego em Goiás
              </Button>
            </div>
            
            {/* Regional Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">5.000+</p>
                <p className="text-sm text-gray-600">Profissionais em Goiás</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">850+</p>
                <p className="text-sm text-gray-600">Vagas em Jataí</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">12k+</p>
                <p className="text-sm text-gray-600">Serviços realizados</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXJzfGVufDB8fHx8MTc3NTcwMDMxOHww&ixlib=rb-4.1.0&q=85" alt="Profissionais trabalhando em Jataí" className="w-full h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Goiás Region Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher Jataí Região Trabalho em Goiás?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Somos a ponte entre quem precisa de serviços e profissionais qualificados em todo estado de Goiás
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Cobertura Regional</h3>
              <p className="text-gray-600 text-sm">
                Jataí, Rio Verde, Goiânia, Anápolis, Aparecida de Goiânia e mais de 50 cidades goianas
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Empregos Locais</h3>
              <p className="text-gray-600 text-sm">
                Vagas específicas para a região do sudoeste goiano, conectando empresas locais com talentos
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Comunidade Ativa</h3>
              <p className="text-gray-600 text-sm">
                Milhares de goianos já confiam em Jataí Região Trabalho para encontrar serviços e oportunidades
              </p>
            </div>
          </div>
          
          {/* Cities Coverage */}
          <div className="mt-12 bg-gray-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-center mb-6">Principais cidades atendidas</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Jataí', 'Rio Verde', 'Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Catalão', 'Itumbiara', 'Luziânia', 'Formosa', 'Mineiros', 'Senador Canedo', 'Trindade'].map(city => (
                <span key={city} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App Store Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl">▶</div>
              <div>
                <p className="font-semibold text-lg mb-1">Google Play</p>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="font-bold">4.6/5</span>
                </div>
                <p className="text-sm text-gray-600">47.154 avaliações</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl"></div>
              <div>
                <p className="font-semibold text-lg mb-1">App Store</p>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="font-bold">4.6/5</span>
                </div>
                <p className="text-sm text-gray-600">66.000 avaliações</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-green-500 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-white text-lg font-medium mb-1">
              Junte-se aos milhares de goianos em Jataí Região Trabalho
            </p>
            <p className="text-green-50 text-sm">
              {userLocation ? `📍 Sua localização: ${userLocation}` : 'Encontre serviços e empregos perto de você'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => { setShowCreateAccount(true); resetRegister(); }} className="bg-white text-green-600 hover:bg-gray-100 px-8">
              Cadastrar-se Grátis
            </Button>
            <button onClick={() => { setShowLogin(true); setError(''); }} className="text-white underline hover:no-underline">
              Já tem conta? Entrar
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-STEP REGISTER MODAL */}
      <Dialog open={showCreateAccount} onOpenChange={(open) => { setShowCreateAccount(open); if (!open) resetRegister(); }}>
        <DialogContent className="max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Criar conta</DialogTitle>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              {step > 1 ? (
                <button onClick={() => { setStep(1); setError(''); }} className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : <div />}
            </div>

            {step === 1 && (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8">
                  Me inscrevo como:
                </h2>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => selectAccountType('particular')}
                    className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <User className="w-5 h-5" />
                    Particular
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-500">ou</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => selectAccountType('autonomo')}
                    className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <Briefcase className="w-5 h-5" />
                    Autônomo
                  </button>
                  <button
                    onClick={() => selectAccountType('empresa')}
                    className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <Building2 className="w-5 h-5" />
                    Empresa
                  </button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-6 sm:mt-8">Etapa 1/2</p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">Criar conta</h2>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs sm:text-sm p-2 sm:p-3 rounded-lg mb-4">{error}</div>
                )}

                {/* Avatar Upload */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-green-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mb-3 sm:mb-4">Adicione uma foto de perfil (opcional)</p>

                <div className="space-y-3 sm:space-y-4">
                  {accountType === 'particular' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Nome</Label>
                        <Input
                          placeholder="Nome"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="h-10 sm:h-12 border-gray-300 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Sobrenome</Label>
                        <Input
                          placeholder="Sobrenome"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          className="h-10 sm:h-12 border-gray-300 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {(accountType === 'autonomo' || accountType === 'empresa') && (
                    <div>
                      <Label className="text-xs text-gray-500">Nome comercial</Label>
                      <Input
                        placeholder="Nome comercial"
                        value={registerData.commercialName}
                        onChange={(e) => setRegisterData({ ...registerData, commercialName: e.target.value })}
                        className="h-10 sm:h-12 border-gray-300 text-sm"
                      />
                    </div>
                  )}

                  {accountType === 'empresa' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Nome do dirigente</Label>
                        <Input
                          placeholder="Nome"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="h-10 sm:h-12 border-gray-300 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Sobrenome do dirigente</Label>
                        <Input
                          placeholder="Sobrenome"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          className="h-10 sm:h-12 border-gray-300 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-gray-500">Profissão</Label>
                    <Input
                      placeholder="Profissão"
                      value={registerData.profession}
                      onChange={(e) => setRegisterData({ ...registerData, profession: e.target.value })}
                      className="h-10 sm:h-12 border-gray-300 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Endereço</Label>
                    <Input
                      placeholder="Endereço postal"
                      value={registerData.location}
                      onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                      className="h-10 sm:h-12 border-gray-300 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Celular</Label>
                    <Input
                      placeholder="Celular"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="h-10 sm:h-12 border-gray-300 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="h-10 sm:h-12 border-gray-300 text-sm"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Label className="text-xs text-gray-500">Senha</Label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="h-10 sm:h-12 border-gray-300 pr-10 text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-7 sm:top-8">
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-1 rounded border-gray-300" />
                      <span className="text-xs text-gray-600">Receber informações dos nossos parceiros</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600">
                        Aceito as{' '}
                        <span className="text-green-600 underline cursor-pointer">condições gerais de venda e utilização</span>
                      </span>
                    </label>
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 sm:h-14 text-sm sm:text-base mt-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Inscrever-me'}
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-4">Etapa 2/2</p>

                <div className="text-center mt-3">
                  <button onClick={() => { setShowCreateAccount(false); setShowLogin(true); setError(''); resetRegister(); }} className="text-xs sm:text-sm text-green-600 hover:underline">
                    Já tem conta? Entrar
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* LOGIN MODAL */}
      <Dialog open={showLogin} onOpenChange={(open) => { if (!isLoading) { setShowLogin(open); if (!open) setError(''); } }}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => { if (isLoading) e.preventDefault(); }}>
          <DialogTitle className="sr-only">Entrar</DialogTitle>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Que bom te ver de volta!</h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">E-mail</Label>
                <Input
                  type="email"
                  placeholder="E-mail"
                  className="h-12"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <Label className="text-xs text-gray-500">Senha</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  className="h-12 pr-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8">
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 h-12">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
              </Button>
            </form>
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => { 
                  setShowLogin(false); 
                  setShowForgotPassword(true); 
                  resetForgotPassword();
                }} 
                className="text-sm text-gray-500 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="text-center mt-2">
              <button onClick={() => { setShowLogin(false); setShowCreateAccount(true); setError(''); resetRegister(); }} className="text-sm text-green-600 hover:underline">
                Não tem conta? Criar conta
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FORGOT PASSWORD MODAL */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => { if (!isLoading) { setShowForgotPassword(open); if (!open) resetForgotPassword(); } }}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Recuperar senha</DialogTitle>
          <div className="p-6">
            {forgotPasswordStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">Recuperar Senha</h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Digite seu email cadastrado para criar uma nova senha
                </p>
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="h-12"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    onClick={handleForgotPassword} 
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 h-12"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <button 
                    onClick={() => { 
                      setShowForgotPassword(false); 
                      setShowLogin(true); 
                      resetForgotPassword(); 
                    }} 
                    className="text-sm text-green-600 hover:underline"
                  >
                    Voltar para o login
                  </button>
                </div>
              </>
            )}

            {forgotPasswordStep === 2 && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">Nova Senha</h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Email: <strong>{forgotPasswordEmail}</strong>
                </p>
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
                )}
                <div className="space-y-4">
                  <div className="relative">
                    <Label className="text-xs text-gray-500">Nova Senha</Label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha"
                      className="h-12 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-8"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Confirmar Senha</Label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      className="h-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    onClick={handleForgotPassword} 
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 h-12"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar Senha'}
                  </Button>
                </div>
              </>
            )}

            {forgotPasswordStep === 3 && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Senha Atualizada!</h2>
                  <p className="text-gray-600 mb-6">
                    Sua senha foi atualizada com sucesso. Agora você pode fazer login com sua nova senha.
                  </p>
                  <Button 
                    onClick={() => { 
                      setShowForgotPassword(false); 
                      setShowLogin(true); 
                      resetForgotPassword();
                      setLoginData({ email: forgotPasswordEmail, password: '' });
                    }} 
                    className="w-full bg-green-600 hover:bg-green-700 h-12"
                  >
                    Fazer Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewHome;
