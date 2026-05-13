import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Bell, MessageSquare, Menu, MapPin, X, User, LogOut, CreditCard, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import BottomNav from './BottomNav';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { label: 'Feed', path: '/feed' },
    { label: 'Empregos', path: '/empregos' },
    { label: 'Mapa', path: '/mapa' },
    { label: 'Mensagens', path: '/mensagens' },
    { label: 'Dashboard', path: '/admin/dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/feed')}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-green-400 rounded-lg flex items-center justify-center text-white font-bold">
              J
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight">
                <span className="text-green-500">Jataí</span>
                <span className="text-orange-500"> Região</span>
              </span>
              <span className="text-[10px] text-gray-500 uppercase leading-tight">Facilitador de Trabalho</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-green-600 border-b-2 border-green-600 pb-1'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button onClick={() => navigate('/mensagens')} className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar with Dropdown - Clickable */}
            <div className="relative group">
              <button 
                onClick={() => navigate('/perfil')}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-full p-1 pr-3 transition-colors"
              >
                <Avatar className="w-9 h-9 border-2 border-green-400 cursor-pointer">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden lg:inline">{user?.name}</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-sm">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => navigate('/perfil')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => navigate('/abonamento')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Assinatura
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          {/* Logo and Location */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/feed')}>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-green-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                J
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold">
                  <span className="text-green-500">Jataí</span>
                  <span className="text-orange-500"> Região</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="relative p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar - Click to go to profile */}
              <button onClick={() => navigate('/perfil')} className="relative">
                <Avatar className="w-9 h-9 border-2 border-green-400">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Menu Button */}
              <button onClick={() => setShowMobileMenu(true)} className="p-2">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
            <MapPin className="w-3 h-3" />
            <span>Jataí, Goiás</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-green-400">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user?.name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-2">
                <button
                  onClick={() => { navigate('/perfil'); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Meu Perfil</span>
                </button>

                <button
                  onClick={() => { navigate('/empregos'); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Empregos</span>
                </button>

                <button
                  onClick={() => { navigate('/abonamento'); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Assinatura Premium</span>
                </button>

                {user?.email === 'mecjohnson97@gmail.com' && (
                  <button
                    onClick={() => { navigate('/admin/dashboard'); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">Dashboard Admin</span>
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </>
  );
};

export default Header;
