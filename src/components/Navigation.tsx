import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import AccountModal from "./AccountModal";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-premium ${
          scrolled
            ? "nav-glass"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="text-white font-medium text-lg tracking-tight hover:opacity-70 transition-opacity duration-300"
            >
              ReArm<span className="text-accent-400 text-xs align-top">®</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-300 ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-accent-400/60" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAccountOpen(true)}
                className="text-neutral-400 hover:text-white transition-colors duration-300 p-2"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </button>

              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white p-2"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ease-premium ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative h-full flex flex-col items-center justify-center space-y-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-3xl font-light tracking-tight transition-all duration-500 ${
                isActive(link.href) ? "text-white" : "text-neutral-500 hover:text-white"
              } ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: `${i * 50}ms` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <AccountModal open={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
};

export default Navigation;
