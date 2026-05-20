
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Beaker, Crown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">SkinChem</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link to={createPageUrl('Home')}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-xl",
                    currentPageName === 'Home' && "bg-slate-100"
                  )}
                >
                  Analyzer
                </Button>
              </Link>
              <Link to={createPageUrl('ProductRecommendations')}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-xl",
                    currentPageName === 'ProductRecommendations' && "bg-slate-100"
                  )}
                >
                  Products
                </Button>
              </Link>
              <Link to={createPageUrl('Subscription')}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-xl gap-2",
                    currentPageName === 'Subscription' && "bg-slate-100"
                  )}
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
            <Link to={createPageUrl('Home')} onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start rounded-xl",
                  currentPageName === 'Home' && "bg-slate-100"
                )}
              >
                Analyzer
              </Button>
            </Link>
            <Link to={createPageUrl('ProductRecommendations')} onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start rounded-xl",
                  currentPageName === 'ProductRecommendations' && "bg-slate-100"
                )}
              >
                Products
              </Button>
            </Link>
            <Link to={createPageUrl('Subscription')} onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start rounded-xl gap-2",
                  currentPageName === 'Subscription' && "bg-slate-100"
                )}
              >
                <Crown className="w-4 h-4 text-amber-500" />
                Premium
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Beaker className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">SkinChem</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 SkinChem. Your skincare chemistry companion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
