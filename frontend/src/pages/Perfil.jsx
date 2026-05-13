import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MapPin, Star, Calendar, Users, CheckCircle, XCircle, Flag, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('presentation');

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <Header />
      
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Cover Photo */}
        <div className="relative mb-[-60px]">
          <div className="h-40 sm:h-64 bg-gradient-to-r from-orange-400 via-green-400 to-emerald-500 rounded-t-xl"></div>

          {/* Avatar */}
          <div className="absolute bottom-[-60px] left-4 sm:left-8">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-gray-300 text-2xl sm:text-4xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info Card */}
        <Card className="pt-24 sm:pt-20 pb-6 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold break-words mb-1" data-testid="profile-name">
                {user?.name || 'Usuário'}
              </h1>
              <div className="mb-2">
                <Badge className="bg-gray-600 text-white px-2 py-0.5 text-xs">Particular</Badge>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{user?.location || 'Localização não informada'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>

              <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                <Flag className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Denunciar</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="presentation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Apresentação
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Fotos
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Avaliações
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Atividade
              </TabsTrigger>
            </TabsList>

            {/* Presentation Tab */}
            <TabsContent value="presentation" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Rating */}
                  <Card className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      <span className="text-4xl font-bold ml-2">5</span>
                      <span className="text-2xl text-gray-400">/5</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Baseado em 2 avaliações</p>
                    <Button variant="outline" className="w-full">
                      Ver avaliações
                    </Button>
                  </Card>

                  {/* Member Since */}
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold">10 junho 2025</p>
                        <p className="text-sm text-gray-600">Data de inscrição</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold">118</p>
                        <p className="text-sm text-gray-600">Contatos estabelecidos</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* About */}
                  <Card className="p-6">
                    <p className="text-gray-700 italic">
                      "Ainda não preenchi minha apresentação"
                    </p>
                  </Card>

                  {/* Location Map */}
                  <Card className="p-0 overflow-hidden">
                    <div className="h-64 bg-gray-200 relative">
                      <img 
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(user?.location || 'Jataí, Goiás')}&zoom=13&size=600x300&markers=color:green|${encodeURIComponent(user?.location || 'Jataí, Goiás')}&key=AIzaSyC1rsLAluPX1QVAdblELEVf1rFcOXde3DU`}
                        alt="Mapa de localização"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>

                  {/* Verifications */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Verificações
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Número de telefone verificado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-gray-500">Identidade não verificada</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="mt-6">
              <Card className="p-12 text-center">
                <p className="text-gray-500">Nenhuma foto adicionada ainda</p>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="https://i.pravatar.cc/150?img=20" />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Maria Silva</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Excelente profissional! Muito atencioso e caprichoso.
                      </p>
                      <p className="text-xs text-gray-500">Há 2 semanas</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="https://i.pravatar.cc/150?img=32" />
                      <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">João Santos</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Serviço impecável! Recomendo muito.
                      </p>
                      <p className="text-xs text-gray-500">Há 1 mês</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card className="p-12 text-center">
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
