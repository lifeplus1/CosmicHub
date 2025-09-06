import React, { useCallback } from 'react';
import { ErrorBoundary } from '@cosmichub/ui';
import '../styles/cosmic-components.css';

const Footer: React.FC = React.memo(() => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
    }
  }, []);

  return (
    <ErrorBoundary level="component" name="Footer">
      <footer className='cosmic-footer cosmic-bg-footer'>
        <div className='cosmic-footer-content'>
          <div className='cosmic-footer-header'>
            <svg
              viewBox='0 0 32 32'
              className='cosmic-sun-icon'
              fill='currentColor'
              aria-hidden="true"
            >
              <circle cx='16' cy='16' r='12' fill='#f8d477' opacity='0.25' />
              <circle cx='16' cy='16' r='7' fill='#f4b400' />
              <path
                d='M16 6v-2M16 28v-2M6 16H4M28 16h-2M23.07 23.07l1.41 1.41M7.52 7.52l1.41 1.41M23.07 8.93l1.41-1.41M7.52 24.48l1.41-1.41'
                stroke='#db9e00'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
            </svg>
            <p className='cosmic-footer-copyright'>
              © 2024 Cosmic Hub. All rights reserved.
            </p>
          </div>
          <nav className='cosmic-nav' role="navigation" aria-label="Footer navigation">
            <a
              href='/privacy'
              className='cosmic-link-secondary'
              onKeyDown={(e) => handleKeyDown(e, '/privacy')}
              aria-label="View Privacy Policy"
              tabIndex={0}
            >
              Privacy Policy
            </a>
            <a
              href='/terms'
              className='cosmic-link-secondary'
              onKeyDown={(e) => handleKeyDown(e, '/terms')}
              aria-label="View Terms of Service"
              tabIndex={0}
            >
              Terms of Service
            </a>
            <a
              href='/contact'
              className='cosmic-link-secondary'
              onKeyDown={(e) => handleKeyDown(e, '/contact')}
              aria-label="Contact us"
              tabIndex={0}
            >
              Contact Us
            </a>
          </nav>
        </div>
      </footer>
    </ErrorBoundary>
  );
});

Footer.displayName = 'Footer';

export default Footer;
