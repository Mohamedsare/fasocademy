import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { applyPageSEO } from '@/lib/seo';
import Logo from '@/components/common/Logo';
import NotificationBell from '@/components/common/NotificationBell';
import AriaChat from '@/components/common/AriaChat';
import {
  Home, BookOpen, GraduationCap, Users, User, Search, Menu, X, 
  LogOut, BarChart3, Sun, Moon
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    applyPageSEO(currentPageName);
  }, [currentPageName]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
        if (auth) {
          const u = await base44.auth.me();
          setUser(u);
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const publicPages = ['Home', 'Catalog', 'CoursePage', 'VerifyCertificate'];
  const isPublic = publicPages.includes(currentPageName);

  const navItems = [
    { name: 'Accueil', page: 'Home', icon: Home },
    { name: 'Catalogue', page: 'Catalog', icon: BookOpen },
    { name: 'Mon apprentissage', page: 'MyLearning', icon: GraduationCap, auth: true },
  ];

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-8">
              <Link to={createPageUrl('Home')}>
                <Logo size="md" zoom={1.6} />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => {
                  if (item.auth && !isAuthenticated) return null;
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'text-[#FF6B00] bg-[#FFF3E8] dark:bg-orange-900/30' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-[#1B1F3B] dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
                {isInstructor && (
                  <Link
                    to={createPageUrl('InstructorDashboard')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPageName === 'InstructorDashboard' 
                        ? 'text-[#FF6B00] bg-[#FFF3E8] dark:bg-orange-900/30' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-[#1B1F3B] dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Formateur
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to={createPageUrl('AdminDashboard')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPageName === 'AdminDashboard'
                        ? 'text-[#FF6B00] bg-[#FFF3E8] dark:bg-orange-900/30' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-[#1B1F3B] dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to={createPageUrl('Catalog')} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 md:hidden">
                <Search className="w-5 h-5" />
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <NotificationBell userEmail={user?.email} />
                  <Link to={createPageUrl('MyLearning')} className="hidden sm:flex">
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-[#FF6B00]">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      Continuer
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Profile')}>
                    <div className="w-9 h-9 rounded-full bg-[#FF6B00]/10 dark:bg-orange-500/20 flex items-center justify-center text-[#FF6B00] font-bold text-sm cursor-pointer hover:bg-[#FF6B00]/20 dark:hover:bg-orange-500/30 transition-colors">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Connexion
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="bg-[#FF6B00] hover:bg-[#E55D00] text-white hidden sm:flex"
                  >
                    S'inscrire gratuitement
                  </Button>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 md:hidden"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
            {navItems.map(item => {
              if (item.auth && !isAuthenticated) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            {isInstructor && (
              <Link
                to={createPageUrl('InstructorDashboard')}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <BarChart3 className="w-5 h-5" />
                Espace Formateur
              </Link>
            )}
            {isAdmin && (
              <Link
                to={createPageUrl('AdminDashboard')}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Users className="w-5 h-5" />
                Administration
              </Link>
            )}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
                <Link
                  to={createPageUrl('Profile')}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <User className="w-5 h-5" />
                  Mon profil
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main content — structure sémantique pour SEO / accessibilité */}
      <main id="main-content" className="pb-16 sm:pb-0" role="main">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1B1F3B] dark:bg-gray-950 text-white mt-20 border-t border-transparent dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" zoom={1.6} />
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                La plateforme de formation en ligne #1 au Burkina Faso. Apprenez, progressez, certifiez.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Explorer</h4>
              <div className="space-y-2.5">
                <Link to={createPageUrl('Catalog')} className="block text-sm text-gray-400 hover:text-white transition-colors">Catalogue</Link>
                <Link to={createPageUrl('Catalog') + '?cat=developpement-web'} className="block text-sm text-gray-400 hover:text-white transition-colors">Développement Web</Link>
                <Link to={createPageUrl('Catalog') + '?cat=data-ia'} className="block text-sm text-gray-400 hover:text-white transition-colors">Data & IA</Link>
                <Link to={createPageUrl('Catalog') + '?cat=cybersecurite'} className="block text-sm text-gray-400 hover:text-white transition-colors">Cybersécurité</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Communauté</h4>
              <div className="space-y-2.5">
                <Link to={createPageUrl('BecomeInstructor')} className="block text-sm text-gray-400 hover:text-white transition-colors">Devenir formateur</Link>
                <Link to={createPageUrl('Blog')} className="block text-sm text-gray-400 hover:text-white transition-colors">Blog</Link>
                <a href="https://wa.me/22664712044" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-white transition-colors">WhatsApp</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <div className="space-y-2.5">
                <Link to={createPageUrl('Help')} className="block text-sm text-gray-400 hover:text-white transition-colors">Aide</Link>
                <Link to={createPageUrl('Contact')} className="block text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link to={createPageUrl('Terms')} className="block text-sm text-gray-400 hover:text-white transition-colors">Conditions</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2026 FasoCademy. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>🇧🇫 Fait au Burkina Faso</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-2 py-1 shadow-lg">
        <Link to={createPageUrl('Home')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${currentPageName === 'Home' ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link to={createPageUrl('Catalog')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${currentPageName === 'Catalog' ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Catalogue</span>
        </Link>
        {isAuthenticated ? (
          <>
            <Link to={createPageUrl('MyLearning')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${currentPageName === 'MyLearning' ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
              <GraduationCap className="w-5 h-5" />
              <span className="text-[10px] font-medium">Mes cours</span>
            </Link>
            <Link to={createPageUrl('Profile')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${currentPageName === 'Profile' ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profil</span>
            </Link>
          </>
        ) : (
          <button onClick={() => base44.auth.redirectToLogin()} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400 dark:text-gray-500">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Connexion</span>
          </button>
        )}
      </nav>

      <AriaChat />
    </div>
  );
}