import { Link } from 'react-router-dom';
import { Globe, Globe2, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 flex items-center" aria-label="Velora home">
              <BrandLogo />
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Order delicious food from the best restaurants near you. Fast delivery, easy checkout, and amazing deals every day.
            </p>
            <div className="flex gap-3">
              {[Globe, Globe2, ExternalLink].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--color-primary-light)]"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/restaurants', label: 'Restaurants' },
                { to: '/orders', label: 'My Orders' },
                { to: '/profile', label: 'Profile' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm transition-colors hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Categories</h4>
            <ul className="space-y-2.5">
              {['Pizza', 'Burgers', 'Indian', 'Chinese', 'Desserts', 'Drinks'].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/restaurants"
                    className="text-sm transition-colors hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                support@quickbite.com
              </li>
              <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                Bangalore, Karnataka, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            © {new Date().getFullYear()} Velora. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
