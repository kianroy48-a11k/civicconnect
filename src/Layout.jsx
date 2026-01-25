import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Home, 
  MapPin, 
  PlusCircle, 
  Users, 
  TrendingUp,
  Menu,
  X,
  Zap,
  HelpCircle,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OnboardingModal from './components/onboarding/OnboardingModal';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { LanguageProvider, useLanguage } from './components/providers/LanguageProvider';
import ThemeToggle from './components/ui/ThemeToggle';
import LanguageSelector from './components/ui/LanguageSelector';

function LayoutContent({ children, currentPageName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { t } = useLanguage();

    React.useEffect(() => {
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      if (!onboardingCompleted && currentPageName === 'Home') {
        setShowOnboarding(true);
      }
    }, [currentPageName]);

  const navItems = [
    { name: t('nav.home'), icon: Home, page: 'Home' },
    { name: t('nav.map'), icon: MapPin, page: 'IssueMap' },
    { name: t('nav.leaderboard'), icon: Users, page: 'Leaderboard' },
    { name: t('nav.profile'), icon: User, page: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <style>{`
        :root {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --accent: #60a5fa;
          --neutral: #eff6ff;
          --danger: #E74C3C;
          --warning: #F39C12;
          --success: #10b981;
        }

        * {
          scroll-behavior: smooth;
        }

        body {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-blue-200/50 dark:border-blue-800/50">
        <div className="w-full px-[5%]">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6975aa81c03ae9bc99ebadca/17cdf2ece_ChatGPT_Image_Jan_25__2026__11_48_34_AM-removebg-preview.png"
                alt="Civic Connect Logo"
                className="h-10 w-auto"
              />
              <span className="font-bold text-xl text-slate-900 dark:text-white hidden sm:block">
                Civic Connect
              </span>
            </Link>

            {/* Desktop Nav - Centered */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center mx-6">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    currentPageName === item.page
                      ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-500/25"
                      : "text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Utilities */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                title={t('nav.help')}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="h-8 w-px bg-blue-200 dark:bg-blue-800" />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-blue-200/50 dark:border-blue-800/50 py-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}

          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 mt-auto border-t border-slate-800 dark:border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6975aa81c03ae9bc99ebadca/17cdf2ece_ChatGPT_Image_Jan_25__2026__11_48_34_AM-removebg-preview.png"
                alt="Civic Connect Logo"
                className="h-8 w-auto"
              />
              <span className="font-semibold">Civic Connect</span>
            </div>
            <p className="text-white/60 text-sm text-center">
              Empowering citizens through transparent civic accountability
            </p>
          </div>
        </div>
      </footer>
      </div>
      );
      }

      export default function Layout({ children, currentPageName }) {
      return (
      <ThemeProvider>
        <LanguageProvider>
          <LayoutContent children={children} currentPageName={currentPageName} />
        </LanguageProvider>
      </ThemeProvider>
      );
      }