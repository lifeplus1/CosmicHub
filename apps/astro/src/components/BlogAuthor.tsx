import React from 'react';
import { Link } from 'react-router-dom';
import { FaPen, FaUser, FaEnvelope, FaTwitter, FaInstagram, FaGlobe } from 'react-icons/fa';

interface Author {
  name: string;
  bio: string;
  avatar?: string;
  expertise: string[];
  social?: {
    twitter?: string;
    instagram?: string;
    website?: string;
    email?: string;
  };
}

const authors: Record<string, Author> = {
  'Luna Starweaver': {
    name: 'Luna Starweaver',
    bio: 'Professional astrologer with over 15 years of experience in natal chart interpretation and lunar wisdom. Specializes in emotional astrology and Moon sign guidance.',
    expertise: ['Emotional Astrology', 'Moon Signs', 'Lunar Cycles', 'Intuitive Guidance'],
    social: {
      twitter: '@lunastarweaver',
      email: 'luna@cosmichub.com'
    }
  },
  'Cosmic Chris': {
    name: 'Cosmic Chris',
    bio: 'Relationship astrologer and Venus specialist. Passionate about helping people understand love cycles and relationship patterns through astrological wisdom.',
    expertise: ['Relationship Astrology', 'Venus Cycles', 'Synastry', 'Love Patterns'],
    social: {
      instagram: '@cosmic_chris_astro',
      website: 'cosmicchris.com'
    }
  },
  'Design Maven': {
    name: 'Design Maven',
    bio: 'Certified Human Design analyst and consciousness coach. Dedicated to helping individuals understand their unique energetic blueprint and life strategy.',
    expertise: ['Human Design', 'Energy Types', 'Life Strategy', 'Decision Making'],
    social: {
      website: 'designmaven.com',
      email: 'maven@cosmichub.com'
    }
  },
  'Numbers Oracle': {
    name: 'Numbers Oracle',
    bio: 'Master numerologist with expertise in Pythagorean and Chaldean systems. Specializes in life path analysis and career guidance through numbers.',
    expertise: ['Numerology', 'Life Path Numbers', 'Career Guidance', 'Sacred Geometry'],
    social: {
      twitter: '@numbers_oracle',
      website: 'numbersoracle.com'
    }
  },
  'Key Keeper': {
    name: 'Key Keeper',
    bio: 'Gene Keys facilitator and consciousness explorer. Guides individuals through the contemplative journey of the Gene Keys system.',
    expertise: ['Gene Keys', 'Shadow Work', 'Contemplation', 'Consciousness Evolution'],
    social: {
      email: 'keys@cosmichub.com',
      website: 'keykeeper.com'
    }
  },
  'Retrograde Guru': {
    name: 'Retrograde Guru',
    bio: 'Mercury retrograde specialist and astrological timing expert. Helps people navigate planetary retrogrades with practical wisdom.',
    expertise: ['Mercury Retrograde', 'Planetary Timing', 'Practical Astrology', 'Communication'],
    social: {
      twitter: '@retrograde_guru',
      instagram: '@retrograde_wisdom'
    }
  },
  'Saturn Sage': {
    name: 'Saturn Sage',
    bio: 'Saturn specialist and life transitions coach. Expert in Saturn returns, transits, and karmic astrology.',
    expertise: ['Saturn Transits', 'Life Cycles', 'Karmic Astrology', 'Personal Growth'],
    social: {
      email: 'saturn@cosmichub.com',
      website: 'saturnsage.com'
    }
  }
};

interface BlogAuthorProps {
  authorName: string;
  showFullProfile?: boolean;
  className?: string;
}

const BlogAuthor: React.FC<BlogAuthorProps> = ({ 
  authorName, 
  showFullProfile = false, 
  className = '' 
}) => {
  const author = authors[authorName];

  if (!author) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-cosmic-silver/20 flex items-center justify-center">
          <FaUser className="w-4 h-4 text-cosmic-silver/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-cosmic-silver">{authorName}</p>
          <p className="text-xs text-cosmic-silver/60">Cosmic Author</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  if (!showFullProfile) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-gold flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(author.name)}
        </div>
        <div>
          <p className="text-sm font-medium text-cosmic-silver">{author.name}</p>
          <p className="text-xs text-cosmic-silver/60">
            {author.expertise.slice(0, 2).join(' • ')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-cosmic-blue/10 rounded-xl p-6 border border-cosmic-silver/10 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-gold flex items-center justify-center text-white font-bold text-lg">
          {getInitials(author.name)}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-cosmic-gold mb-2">{author.name}</h3>
          <p className="text-cosmic-silver/90 mb-4 leading-relaxed">{author.bio}</p>
          
          {/* Expertise Tags */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-cosmic-silver mb-2">Expertise:</h4>
            <div className="flex flex-wrap gap-2">
              {author.expertise.map(skill => (
                <span 
                  key={skill}
                  className="px-2 py-1 bg-cosmic-purple/20 text-cosmic-silver text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {author.social && Object.keys(author.social).length > 0 && (
            <div className="flex items-center gap-4">
              {author.social.email && (
                <a
                  href={`mailto:${author.social.email}`}
                  className="flex items-center gap-2 text-cosmic-silver/80 hover:text-cosmic-gold transition-colors duration-200"
                  aria-label={`Email ${author.name}`}
                >
                  <FaEnvelope className="w-4 h-4" />
                </a>
              )}
              {author.social.twitter && (
                <a
                  href={`https://twitter.com/${author.social.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cosmic-silver/80 hover:text-cosmic-gold transition-colors duration-200"
                  aria-label={`${author.name} on Twitter`}
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              )}
              {author.social.instagram && (
                <a
                  href={`https://instagram.com/${author.social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cosmic-silver/80 hover:text-cosmic-gold transition-colors duration-200"
                  aria-label={`${author.name} on Instagram`}
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
              )}
              {author.social.website && (
                <a
                  href={`https://${author.social.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cosmic-silver/80 hover:text-cosmic-gold transition-colors duration-200"
                  aria-label={`${author.name}'s website`}
                >
                  <FaGlobe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Authors page component
const BlogAuthors: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cosmic-gold to-cosmic-purple bg-clip-text text-transparent font-cinzel">
          Meet Our Authors
        </h1>
        <p className="text-xl text-cosmic-silver max-w-3xl mx-auto">
          Our team of expert practitioners brings decades of experience in astrology, numerology, human design, and consciousness exploration.
        </p>
      </div>

      <div className="space-y-8">
        {Object.values(authors).map(author => (
          <BlogAuthor 
            key={author.name}
            authorName={author.name}
            showFullProfile={true}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl p-8 border border-cosmic-silver/10">
          <h3 className="text-2xl font-bold text-cosmic-gold mb-4 font-cinzel">
            Become a Contributor
          </h3>
          <p className="text-cosmic-silver mb-6 max-w-2xl mx-auto">
            Are you passionate about astrology, numerology, human design, or consciousness studies? 
            We&apos;d love to feature your insights on our blog.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <FaPen />
            Submit Your Article
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogAuthor;
export { BlogAuthors };
