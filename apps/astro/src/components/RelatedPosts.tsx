import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaClock, FaArrowRight } from 'react-icons/fa';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: 'astrology' | 'numerology' | 'human-design' | 'gene-keys' | 'general';
  featured?: boolean;
}

interface RelatedPostsProps {
  currentPostId: string;
  currentCategory: string;
  currentTags: string[];
  posts: BlogPost[];
  maxPosts?: number;
}

const categoryColors = {
  astrology: 'from-purple-500 to-blue-500',
  numerology: 'from-green-500 to-teal-500',
  'human-design': 'from-orange-500 to-red-500',
  'gene-keys': 'from-pink-500 to-purple-500',
  general: 'from-gray-500 to-gray-600'
};

const categoryLabels = {
  astrology: 'Astrology',
  numerology: 'Numerology',
  'human-design': 'Human Design',
  'gene-keys': 'Gene Keys',
  general: 'General'
};

const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  currentPostId, 
  currentCategory, 
  currentTags, 
  posts,
  maxPosts = 3 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Smart algorithm to find related posts
  const getRelatedPosts = (): BlogPost[] => {
    const otherPosts = posts.filter(post => post.id !== currentPostId);
    
    // Score posts based on relevance
    const scoredPosts = otherPosts.map(post => {
      let score = 0;
      
      // Same category gets high score
      if (post.category === currentCategory) {
        score += 10;
      }
      
      // Shared tags get score based on number of matches
      const sharedTags = post.tags.filter(tag => currentTags.includes(tag));
      score += sharedTags.length * 3;
      
      // Featured posts get slight boost
      if (post.featured) {
        score += 2;
      }
      
      // Recent posts get slight boost
      const daysSincePublished = Math.floor(
        (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePublished <= 30) {
        score += 1;
      }
      
      return { post, score };
    });
    
    // Sort by score (highest first) and return top posts
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPosts)
      .map(item => item.post);
  };

  const relatedPosts = getRelatedPosts();

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-cosmic-silver/20">
      <h3 className="text-2xl font-bold text-cosmic-gold mb-6 font-cinzel">
        Continue Your Cosmic Journey
      </h3>
      <p className="text-cosmic-silver/80 mb-8">
        Explore more insights hand-picked based on your interests in {categoryLabels[currentCategory as keyof typeof categoryLabels].toLowerCase()} and related cosmic wisdom.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map(post => {
          // Calculate shared tags for display
          const sharedTags = post.tags.filter(tag => currentTags.includes(tag));
          const hasSharedTags = sharedTags.length > 0;
          const sameCategory = post.category === currentCategory;
          
          return (
            <article key={post.id} className="group">
              <Link 
                to={`/blog/${post.id}`}
                className="block bg-gradient-to-br from-cosmic-blue/10 to-cosmic-purple/10 rounded-xl overflow-hidden border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-cosmic-purple/10 hover:-translate-y-1"
              >
                {/* Relevance indicators */}
                <div className="relative p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                    
                    {/* Relevance badges */}
                    <div className="flex items-center gap-1">
                      {sameCategory && (
                        <span className="px-2 py-1 bg-cosmic-gold/20 text-cosmic-gold text-xs rounded-full font-medium">
                          Same Category
                        </span>
                      )}
                      {hasSharedTags && (
                        <span className="px-2 py-1 bg-cosmic-purple/20 text-cosmic-purple text-xs rounded-full font-medium">
                          Related Tags
                        </span>
                      )}
                      {post.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark text-xs rounded-full font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <h4 className="text-lg font-bold text-cosmic-silver mb-2 group-hover:text-cosmic-gold transition-colors duration-300 leading-tight">
                    {post.title}
                  </h4>
                  <p className="text-cosmic-silver/80 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Shared tags display */}
                  {hasSharedTags && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-cosmic-silver/60 mr-1">Shared:</span>
                        {sharedTags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-cosmic-gold/10 text-cosmic-gold text-xs rounded border border-cosmic-gold/20">
                            #{tag}
                          </span>
                        ))}
                        {sharedTags.length > 3 && (
                          <span className="text-xs text-cosmic-silver/60">+{sharedTags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-cosmic-silver/60 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        <span>{post.readTime} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-cosmic-silver/60">
                      {sameCategory && hasSharedTags 
                        ? 'Highly relevant' 
                        : sameCategory 
                          ? 'Same category' 
                          : hasSharedTags 
                            ? 'Similar topics' 
                            : 'Recommended'}
                    </div>
                    <div className="flex items-center gap-1 text-cosmic-gold group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-xs font-medium">Read More</span>
                      <FaArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      
      {/* CTA to explore more */}
      <div className="mt-8 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Explore All Posts
          <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default RelatedPosts;
