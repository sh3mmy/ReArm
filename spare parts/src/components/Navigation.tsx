import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'ReArm®', href: '/', isLogo: true },
    { label: 'The Future', href: '/the-future' },
    { label: 'Engineering', href: '/engineering' },
    { label: 'Your Arm', href: '/your-arm' },
    { label: 'Private Demo', href: '/private-demo' },
    { label: 'Account', href: '/account' } // <-- New Account page
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 lg:h-20">
          {/* Centered Navigation (Desktop) */}
          <div className="hidden lg:flex items-center space-x-16">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-colors duration-200 ${
                  link.isLogo 
                    ? 'text-white font-bold text-xl hover:text-gray-300' 
                    : `text-sm font-medium ${
                        isActive(link.href) 
                          ? 'text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-between items-center w-full">
            <Link to="/" className="text-white font-bold text-xl">
              ReArm®
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`block transition-colors duration-200 text-base font-medium ${
                    link.isLogo 
                      ? 'text-white font-bold' 
                      : `${
                          isActive(link.href) 
                            ? 'text-white' 
                            : 'text-gray-300 hover:text-white'
                        }`
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
