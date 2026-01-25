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

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Map', icon: MapPin, page: 'IssueMap' },
    { name: 'Leaderboard', icon: Users, page: 'Leaderboard' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <style>{`
        :root {
          --primary: #047857;
          --primary-dark: #065f46;
          --accent: #34d399;
          --neutral: #f0fdf4;
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6975aa81c03ae9bc99ebadca/17cdf2ece_ChatGPT_Image_Jan_25__2026__11_48_34_AM-removebg-preview.png"
                alt="Civic Audit Logo"
                className="h-10 w-auto"
              />
              <span className="font-bold text-xl text-emerald-950 hidden sm:block">
                Civic Audit
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    currentPageName === item.page
                      ? "bg-emerald-700 text-white shadow-lg shadow-emerald-700/25"
                      : "text-emerald-950 hover:bg-emerald-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-950 hover:bg-emerald-50 transition-all duration-200 ml-2"
                title="View tutorial - Learn how Civic Audit works"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-emerald-950 hover:bg-emerald-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-200/50 py-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-950 hover:bg-emerald-50"
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
      <footer className="bg-emerald-950 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6975aa81c03ae9bc99ebadca/17cdf2ece_ChatGPT_Image_Jan_25__2026__11_48_34_AM-removebg-preview.png"
                alt="Civic Audit Logo"
                className="h-8 w-auto"
              />
              <span className="font-semibold">Civic Audit</span>
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