// src/components/Navigation.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import AccountModal from "./AccountModal";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "The Future", href: "/the-future" },
    { label: "Engineering", href: "/engineering" },
    { label: "Your Arm", href: "/your-arm" },
    { label: "Private Demo", href: "/private-demo" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* LEFT: Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-white font-bold text-xl hover:text-gray-300"
            >
              ReArm®
            </Link>
          </div>

          {/* CENTER: Links (desktop only) */}
          <div className="hidden lg:flex items-center space-x-16">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-colors duration-200 text-sm font-medium ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* RIGHT: Account + Mobile menu toggle */}
          <div className="flex items-center space-x-4">
            {/* Account button */}
            <button
              onClick={() => setIsAccountOpen(true)}
              className="text-white hover:text-gray-300"
            >
              <User size={22} />
            </button>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
                    isActive(link.href)
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
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

      {/* Account modal */}
      <AccountModal open={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </nav>
  );
};

export default Navigation;
