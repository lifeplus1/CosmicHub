import React, { useState } from 'react';
import { FaShare, FaTwitter, FaFacebook, FaLinkedin, FaCopy, FaWhatsapp, FaReddit } from 'react-icons/fa';
import { EducationalTooltip } from './EducationalTooltip';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  author?: string;
  tags?: string[];
  variant?: 'compact' | 'expanded' | 'floating';
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  description, 
  // author currently unused – keeping for future analytics, prefix underscore to satisfy lint
  author: _author = 'Christopher',
  tags = [],
  variant = 'compact'
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtags = tags.map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');
  
  const shareData = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=CosmicHub${hashtags ? `&hashtags=${encodeURIComponent(hashtags.replace(/#/g, ''))}` : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        setShowOptions(true);
      }
    } else {
      setShowOptions(true);
    }
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: shareData.twitter,
      color: 'hover:bg-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: shareData.facebook,
      color: 'hover:bg-blue-600',
      bgColor: 'bg-blue-600/20'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: shareData.linkedin,
      color: 'hover:bg-blue-700',
      bgColor: 'bg-blue-700/20'
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: shareData.whatsapp,
      color: 'hover:bg-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      url: shareData.reddit,
      color: 'hover:bg-orange-500',
      bgColor: 'bg-orange-500/20'
    }
  ];

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2">
        <div className="bg-cosmic-dark/90 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-3 shadow-xl">
          <div className="text-xs text-cosmic-silver/60 mb-2 text-center">Share</div>
          {shareButtons.slice(0, 3).map((button) => (
            <EducationalTooltip key={button.name} title={`Share on ${button.name}`} description={`Share this post on ${button.name}`}>
              <a
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${button.bgColor} ${button.color} text-white transition-all duration-200 mb-2 last:mb-0 hover:scale-110`}
                aria-label={`Share on ${button.name}`}
              >
                <button.icon className="w-4 h-4" />
              </a>
            </EducationalTooltip>
          ))}
          <button
            onClick={() => { void handleCopyLink(); }}
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${copySuccess ? 'bg-green-500/20 text-green-400' : 'bg-cosmic-silver/20 hover:bg-cosmic-silver/30 text-cosmic-silver'} transition-all duration-200 hover:scale-110`}
            aria-label="Copy link"
          >
            <FaCopy className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className="bg-cosmic-blue/10 rounded-xl p-6 border border-cosmic-silver/10">
        <h4 className="text-lg font-semibold text-cosmic-gold mb-4 font-cinzel">Share This Post</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shareButtons.map((button) => (
            <a
              key={button.name}
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${button.bgColor} ${button.color} text-white transition-all duration-200 hover:scale-105`}
            >
              <button.icon className="w-5 h-5" />
              <span className="font-medium">{button.name}</span>
            </a>
          ))}
          <button
            onClick={() => { void handleCopyLink(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${copySuccess ? 'bg-green-500/20 text-green-400' : 'bg-cosmic-silver/20 hover:bg-cosmic-silver/30 text-cosmic-silver'} transition-all duration-200 hover:scale-105`}
          >
            <FaCopy className="w-5 h-5" />
            <span className="font-medium">{copySuccess ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className="flex items-center gap-3">
      <EducationalTooltip title="Share Post" description="Share this blog post with others">
        <button
          onClick={() => { void handleNativeShare(); }}
          className="flex items-center gap-2 px-3 py-2 bg-cosmic-blue/20 text-cosmic-silver rounded-lg hover:bg-cosmic-blue/30 transition-colors duration-200"
          aria-label="Share this post"
        >
          <FaShare className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </EducationalTooltip>

      <button
  onClick={() => { void handleCopyLink(); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          copySuccess 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-cosmic-silver/20 text-cosmic-silver hover:bg-cosmic-silver/30'
        }`}
        aria-label="Copy link to post"
      >
        <FaCopy className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">
          {copySuccess ? 'Copied!' : 'Copy Link'}
        </span>
      </button>

      {/* Show expanded options when native share isn't available */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cosmic-dark border border-cosmic-silver/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cosmic-gold">Share Post</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="text-cosmic-silver hover:text-cosmic-gold transition-colors"
                aria-label="Close share options"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {shareButtons.map((button) => (
                <a
                  key={button.name}
                  href={button.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowOptions(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${button.bgColor} ${button.color} text-white transition-all duration-200 hover:scale-105`}
                >
                  <button.icon className="w-4 h-4" />
                  <span className="font-medium">{button.name}</span>
                </a>
              ))}
            </div>
            
            <button
              onClick={() => { void handleCopyLink(); setShowOptions(false); }}
              className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${copySuccess ? 'bg-green-500/20 text-green-400' : 'bg-cosmic-silver/20 hover:bg-cosmic-silver/30 text-cosmic-silver'} transition-all duration-200`}
            >
              <FaCopy className="w-4 h-4" />
              <span className="font-medium">{copySuccess ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
