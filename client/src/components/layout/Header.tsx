import React, { useState, useEffect } from 'react';
import { Menu, X, Download, Github as GitHub, Linkedin, Twitter, Moon, Sun, User, LogIn, LogOut } from 'lucide-react';
import { personalInfo } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/administration');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-white/10 py-3' 
          : 'bg-transparent dark:bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <a 
            href="#" 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
          ><span>&lt;</span>
            KSML<span className="text-blue-400">.dev</span><span>/&gt;</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: '#about', label: 'À propos' },
              { href: '#skills', label: 'Compétences' },
              { href: '#projects', label: 'Projets' },
              { href: '#certifications', label: 'Certifications' },
              { href: '#experience', label: 'Expérience' },
              { href: '#contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-800/30"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isAdminPage && (
                user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span className="hidden md:inline">{user.name}</span>
                    </button>
                    
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-50">
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Tableau de bord
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <LogIn size={16} />
                    <span className="hidden md:inline">Connexion</span>
                  </Link>
                )
              )}
              
              <a 
                href="/resume.pdf" 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                download
              >
                <Download size={16} />
                CV
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors p-2"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {[
              { href: '#about', label: 'À propos' },
              { href: '#skills', label: 'Compétences' },
              { href: '#projects', label: 'Projets' },
              { href: '#certifications', label: 'Certifications' },
              { href: '#experience', label: 'Expérience' },
              { href: '#contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            
            <div className="flex space-x-4 py-4 px-4">
              {Object.entries(personalInfo.socialLinks).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                >
                  {platform === 'github' && <GitHub size={20} />}
                  {platform === 'linkedin' && <Linkedin size={20} />}
                  {platform === 'twitter' && <Twitter size={20} />}
                </a>
              ))}
            </div>
            
            {isAdminPage && (
              user ? (
                <>
                  <div className="w-full px-4 py-2">
                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span>{user.name}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-lg mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-lg flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                  <a 
                    href="/resume.pdf" 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white mx-4 px-6 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    download
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download size={16} />
                    Télécharger CV
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-gray-300 hover:text-blue-400 transition-colors px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={16} />
                    Se connecter
                  </Link>
                  <a 
                    href="/resume.pdf" 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white mx-4 px-6 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    download
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download size={16} />
                    Télécharger CV
                  </a>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;