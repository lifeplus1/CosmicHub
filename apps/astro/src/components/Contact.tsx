import React from 'react';
import { ErrorBoundary } from '@cosmichub/ui';
import '../styles/cosmic-components.css';

const Contact: React.FC = React.memo(() => {
  return (
    <ErrorBoundary level="component" name="Contact">
      <div className='cosmic-card cosmic-bg-contact max-w-2xl mx-auto mt-16'>
        <h1 className='cosmic-card-header'>
          Contact Us
        </h1>
        <p className='cosmic-card-content mb-2'>
          Have questions or feedback? Reach out to us at{' '}
          <a
            className='cosmic-link'
            href='mailto:support@cosmichub.com'
            aria-label="Send email to support team at support@cosmichub.com"
            tabIndex={0}
          >
            support@cosmichub.com
          </a>
          .
        </p>
        <p className='text-sm text-cosmic-gold'>
          We usually respond within 1-2 business days.
        </p>
      </div>
    </ErrorBoundary>
  );
});

Contact.displayName = 'Contact';

export default Contact;
