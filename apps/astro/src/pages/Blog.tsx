import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaSearch, FaClock, FaArrowRight } from 'react-icons/fa';
import BlogSubscription from '../components/BlogSubscription';
import '../styles/blog.css';

// Mock blog data - in a real app, this would come from an API or CMS
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: 'astrology' | 'numerology' | 'human-design' | 'gene-keys' | 'general';
  featured?: boolean;
  imageUrl?: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Your Moon Sign: The Key to Emotional Intelligence',
    excerpt: 'Discover how your Moon sign influences your emotional patterns, reactions, and inner world. Learn to harness this cosmic wisdom for better self-understanding.',
    content: 'Your Moon sign represents your emotional core, subconscious patterns, and instinctive reactions...',
    author: 'Christopher',
    publishedAt: '2025-01-15',
    readTime: 7,
    tags: ['moon-sign', 'emotions', 'self-discovery'],
    category: 'astrology',
    featured: true,
    imageUrl: '/blog-images/moon-sign-guide.jpg'
  },
  {
    id: '2',
    title: 'The Power of Venus Return: Love Cycles in Astrology',
    excerpt: 'Every 19 months, Venus returns to its natal position in your chart. Explore how these cycles influence your relationships and values.',
    content: 'Venus returns are powerful periods for relationship renewal and value reassessment...',
    author: 'Christopher',
    publishedAt: '2025-01-12',
    readTime: 5,
    tags: ['venus', 'relationships', 'cycles'],
    category: 'astrology',
    imageUrl: '/blog-images/venus-return.jpg'
  },
  {
    id: '3',
    title: 'Human Design: Finding Your Life Strategy',
    excerpt: 'Learn how your Human Design type influences your decision-making process and discover your unique strategy for navigating life.',
    content: 'Human Design combines ancient wisdom with modern science to reveal your energetic blueprint...',
    author: 'Christopher',
    publishedAt: '2025-01-10',
    readTime: 8,
    tags: ['strategy', 'energy', 'decision-making'],
    category: 'human-design',
    imageUrl: '/blog-images/human-design-strategy.jpg'
  },
  {
    id: '4',
    title: 'Numerology Life Path Numbers: Your Cosmic Blueprint',
    excerpt: 'Uncover the hidden meaning behind your Life Path number and how it shapes your purpose and destiny.',
    content: 'Your Life Path number is calculated from your birth date and reveals your soul\'s journey...',
    author: 'Christopher',
    publishedAt: '2025-01-08',
    readTime: 6,
    tags: ['life-path', 'destiny', 'purpose'],
    category: 'numerology',
    imageUrl: '/blog-images/numerology-life-path.jpg'
  },
  {
    id: '5',
    title: 'Gene Keys: The Art of Contemplation',
    excerpt: 'Discover how contemplation transforms shadow into gift, and gift into siddhi in the Gene Keys system.',
    content: 'The Gene Keys offer a contemplative approach to personal transformation...',
    author: 'Christopher',
    publishedAt: '2025-01-05',
    readTime: 9,
    tags: ['contemplation', 'transformation', 'shadows'],
    category: 'gene-keys',
    imageUrl: '/blog-images/gene-keys-contemplation.jpg'
  },
  {
    id: '6',
    title: 'Mercury Retrograde Survival Guide 2025',
    excerpt: 'Navigate Mercury retrograde periods with confidence using practical tips and astrological insights.',
    content: 'Mercury retrograde doesn\'t have to be a time of chaos and confusion...',
    author: 'Christopher',
    publishedAt: '2025-01-03',
    readTime: 4,
    tags: ['mercury-retrograde', 'survival-guide', 'communication'],
    category: 'astrology',
    featured: true,
    imageUrl: '/blog-images/mercury-retrograde.jpg'
  },
  {
    id: '7',
    title: 'Saturn Return: Your Cosmic Coming of Age',
    excerpt: 'Understand the transformative power of your Saturn Return and how to work with this profound astrological milestone.',
    content: 'Your Saturn Return marks a pivotal moment in your astrological journey...',
    author: 'Saturn Sage',
    publishedAt: '2025-01-01',
    readTime: 10,
    tags: ['saturn-return', 'transformation', 'life-cycles'],
    category: 'astrology',
    imageUrl: '/blog-images/saturn-return.jpg'
  },
  {
    id: '8',
    title: 'The Four Pillars of Human Design',
    excerpt: 'Explore the fundamental elements of Human Design: Type, Strategy, Authority, and Profile.',
    content: 'Human Design offers a unique blueprint for understanding your energetic makeup...',
    author: 'Design Maven',
    publishedAt: '2024-12-28',
    readTime: 12,
    tags: ['four-pillars', 'type', 'strategy', 'authority'],
    category: 'human-design',
    imageUrl: '/blog-images/human-design-pillars.jpg'
  },
  {
    id: '9',
    title: 'Numerology and Career: Finding Your Path',
    excerpt: 'Discover how your numerological profile can guide you toward your ideal career and life purpose.',
    content: 'Your numbers reveal profound insights about your professional calling...',
    author: 'Numbers Oracle',
    publishedAt: '2024-12-25',
    readTime: 8,
    tags: ['career', 'life-path', 'professional-guidance'],
    category: 'numerology',
    imageUrl: '/blog-images/numerology-career.jpg'
  },
  {
    id: '10',
    title: 'Gene Keys: From Shadow to Siddhi',
    excerpt: 'Learn how to transform your greatest challenges into your highest gifts through the Gene Keys system.',
    content: 'The Gene Keys present a beautiful map of consciousness evolution...',
    author: 'Key Keeper',
    publishedAt: '2024-12-22',
    readTime: 11,
    tags: ['transformation', 'consciousness', 'shadow-work'],
    category: 'gene-keys',
    imageUrl: '/blog-images/gene-keys-transformation.jpg'
  }
];

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

const Blog: React.FC = () => {
  // const navigate = useNavigate(); // not needed currently
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Initialize from URL parameters
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (tagParam) setSelectedTag(tagParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  // Get all unique categories and tags
  const categories = Object.keys(categoryLabels);
  const allTags = useMemo(() => {
    const tags = mockBlogPosts.flatMap(post => post.tags);
    return Array.from(new Set(tags)).sort();
  }, []);

  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    let filtered = mockBlogPosts;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.author.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [searchTerm, selectedCategory, selectedTag]);

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cosmic-gold to-cosmic-purple bg-clip-text text-transparent font-cinzel">
          Cosmic Insights Blog
        </h1>
        <p className="text-xl text-cosmic-silver max-w-3xl mx-auto">
          Explore the depths of astrology, numerology, human design, and cosmic wisdom through expert insights and practical guidance.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-cosmic-blue/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-cosmic-silver/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cosmic-silver/60" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-3 px-4 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50"
              title="Filter posts by category"
              aria-label="Filter posts by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cosmic-silver/10">
            <h3 className="text-sm font-semibold text-cosmic-gold mb-3">Popular Tags:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  !selectedTag
                    ? 'bg-cosmic-purple/30 text-cosmic-gold border border-cosmic-purple/50'
                    : 'bg-cosmic-silver/10 text-cosmic-silver/80 hover:bg-cosmic-silver/20'
                }`}
              >
                All Tags
              </button>
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-cosmic-purple/30 text-cosmic-gold border border-cosmic-purple/50'
                      : 'bg-cosmic-silver/10 text-cosmic-silver/80 hover:bg-cosmic-silver/20'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cosmic-gold mb-6 font-cinzel">Featured Posts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map(post => (
              <article key={post.id} className="group relative">
                <Link 
                  to={`/blog/${post.id}`}
                  className="block bg-gradient-to-br from-cosmic-blue/20 to-cosmic-purple/20 rounded-2xl overflow-hidden border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cosmic-purple/20"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[post.category]} shadow-lg`}>
                      {categoryLabels[post.category]}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2 py-1 rounded-full text-xs font-bold text-cosmic-dark bg-cosmic-gold shadow-lg">
                      FEATURED
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-cosmic-silver mb-3 group-hover:text-cosmic-gold transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-cosmic-silver/80 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-cosmic-silver/60 mb-4">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          <span>{post.readTime} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-cosmic-silver/10 text-cosmic-silver/80 text-xs rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-cosmic-gold mb-6 font-cinzel">Latest Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map(post => (
              <article key={post.id} className="group">
                <Link 
                  to={`/blog/${post.id}`}
                  className="block bg-cosmic-blue/10 rounded-xl overflow-hidden border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-cosmic-purple/10"
                >
                  {/* Category Badge */}
                  <div className="relative p-4 pb-0">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                  </div>

                  <div className="p-4 pt-2">
                    <h3 className="text-lg font-bold text-cosmic-silver mb-2 group-hover:text-cosmic-gold transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-cosmic-silver/80 text-sm mb-3 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-2">
                        <FaUser className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-cosmic-silver/60">
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          <span>{post.readTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-cosmic-silver/60">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cosmic-gold group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-xs font-medium">Read More</span>
                        <FaArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-cosmic-silver mb-2">No posts found</h3>
          <p className="text-cosmic-silver/80 mb-4">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedTag('');
            }}
            className="px-6 py-2 bg-cosmic-purple/30 text-cosmic-gold rounded-lg hover:bg-cosmic-purple/40 transition-colors duration-200"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Newsletter CTA */}
      <BlogSubscription className="mt-16" />
    </div>
  );
};

export default Blog;
