import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageSquare, Video } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = [
    { title: 'Product', links: [{ label: 'Your Arm', href: '/your-arm' }, { label: 'Engineering', href: '/engineering' }, { label: 'The Future', href: '/the-future' }] },
    { title: 'Experience', links: [{ label: 'Private Demo', href: '/private-demo' }, { label: 'Configurator', href: '/your-arm' }] },
    { title: 'Company', links: [{ label: 'Philosophy', href: '/the-future' }, { label: 'Vision', href: '/the-future' }, { label: 'Careers', href: '#' }] }
  ];

  const socialLinks = [
    { icon: Share2, href: '#', label: 'LinkedIn' },
    { icon: MessageSquare, href: '#', label: 'Twitter' },
    { icon: Video, href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="relative bg-neutral-950 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="text-white font-medium text-xl tracking-tight inline-block mb-6">
              ReArm<span className="text-accent-400 text-xs align-top">®</span>
            </Link>
            <p className="font-light text-neutral-500 text-sm max-w-xs leading-relaxed">
              The future of prosthetics is here. Revolutionary engineering for those who refuse to compromise.
            </p>
            <div className="flex items-center gap-4 mt-8">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-500 hover:text-white hover:border-white/20 transition-all duration-300" aria-label={label}>
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="grid grid-cols-3 gap-8">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <h3 className="section-label text-neutral-500 mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors duration-300 link-underline inline-block">{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-xs tracking-wide">© 2025 ReArm®. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors duration-300">Privacy</a>
            <a href="#" className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors duration-300">Terms</a>
            <a href="#" className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors duration-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
