import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTags, FaClock, FaArrowLeft } from 'react-icons/fa';
import SocialShare from '../components/SocialShare';
import BlogComments from '../components/BlogComments';
import RelatedPosts from '../components/RelatedPosts';
import BlogSubscription from '../components/BlogSubscription';
import '../styles/blog.css';

// Mock blog data - in a real app, this would come from an API or CMS
interface BlogPostData {
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

const mockBlogPosts: BlogPostData[] = [
  {
    id: '1',
    title: 'Understanding Your Moon Sign: The Key to Emotional Intelligence',
    excerpt: 'Discover how your Moon sign influences your emotional patterns, reactions, and inner world. Learn to harness this cosmic wisdom for better self-understanding.',
    content: `# Understanding Your Moon Sign: The Key to Emotional Intelligence

Your Moon sign represents your emotional core, subconscious patterns, and instinctive reactions. While your Sun sign shows how you express yourself outwardly, your Moon sign reveals your inner emotional landscape—the part of you that responds automatically to life's experiences.

## What Is Your Moon Sign?

Your Moon sign is determined by the position of the Moon at the exact time and place of your birth. The Moon moves quickly through the zodiac, spending approximately 2.5 days in each sign, which is why knowing your exact birth time is crucial for accuracy.

## The Emotional Blueprint

Each Moon sign carries its own emotional signature:

### Fire Moon Signs (Aries, Leo, Sagittarius)
- **Aries Moon**: Quick to react, needs independence in emotional expression
- **Leo Moon**: Craves recognition and appreciation, dramatic emotional responses
- **Sagittarius Moon**: Seeks freedom and adventure, philosophical approach to feelings

### Earth Moon Signs (Taurus, Virgo, Capricorn)
- **Taurus Moon**: Needs security and stability, slow to process emotions
- **Virgo Moon**: Analytical about feelings, perfectionist tendencies in relationships
- **Capricorn Moon**: Reserved emotionally, needs structure and achievement

### Air Moon Signs (Gemini, Libra, Aquarius)
- **Gemini Moon**: Intellectualizes emotions, needs variety and communication
- **Libra Moon**: Seeks harmony and balance, avoids emotional conflict
- **Aquarius Moon**: Detached from emotions, values independence and uniqueness

### Water Moon Signs (Cancer, Scorpio, Pisces)
- **Cancer Moon**: Deeply intuitive, needs nurturing and emotional security
- **Scorpio Moon**: Intense emotional depths, needs transformation and truth
- **Pisces Moon**: Empathic and psychic, needs creative and spiritual expression

## Working With Your Moon Sign

Understanding your Moon sign helps you:

1. **Recognize your emotional patterns** - Why do you react the way you do?
2. **Improve self-care practices** - What do you need to feel emotionally balanced?
3. **Enhance relationships** - How do you give and receive emotional support?
4. **Navigate stress** - What triggers your emotional responses and how can you manage them?

## Moon Sign vs. Sun Sign

While your Sun sign represents your conscious identity and life purpose, your Moon sign governs:
- Your emotional needs and responses
- How you process feelings
- What makes you feel secure
- Your relationship with your mother or maternal figures
- Your intuitive abilities

## Practical Applications

### For Self-Understanding
- Journal about your emotional patterns during different Moon phases
- Notice how you react under stress and what helps you feel better
- Identify your core emotional needs and communicate them clearly

### For Relationships
- Share your Moon sign needs with partners and close friends
- Understand that others may process emotions differently
- Create emotional safety based on your Moon sign requirements

### For Personal Growth
- Use Moon sign wisdom to develop emotional intelligence
- Work with your natural emotional rhythms rather than against them
- Practice self-compassion when your Moon sign needs aren't met

## The Moon's Phases and Your Emotions

Your emotional experiences may also fluctuate with the actual Moon's phases:
- **New Moon**: Time for emotional renewal and setting intentions
- **Waxing Moon**: Building emotional energy and taking action
- **Full Moon**: Peak emotional intensity and revelation
- **Waning Moon**: Release and letting go of emotional patterns

## Conclusion

Your Moon sign is a powerful tool for emotional intelligence and self-awareness. By understanding and honoring your lunar nature, you can create more authentic relationships, better self-care practices, and a deeper connection to your emotional wisdom.

Remember, there's no "best" Moon sign—each has its gifts and challenges. The key is learning to work with your emotional nature rather than against it.`,
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
    content: `# The Power of Venus Return: Love Cycles in Astrology

Every 19 months, Venus completes a full cycle and returns to the exact position it occupied at the time of your birth. This celestial event, known as a Venus Return, marks a powerful period of renewal in the areas of love, relationships, values, and personal worth.

## Understanding Venus Returns

Unlike the more commonly known Solar Return (birthday), Venus Returns happen approximately every 584 days or 19 months. These periods offer profound opportunities for:

- Reassessing your values and priorities
- Renewing romantic relationships or attracting new love
- Evaluating your self-worth and financial situation
- Artistic and creative inspiration

## The Venus Return Chart

A Venus Return chart is cast for the exact moment Venus returns to its natal position. This chart provides insights into the themes and experiences you'll encounter during the upcoming 19-month cycle.

### Key Areas to Examine:

1. **The House Venus Occupies**: Shows where love and harmony will be most prominent
2. **Aspects to Venus**: Reveals the ease or challenges in love matters
3. **Venus Sign**: Indicates how you'll express and receive love during this cycle

## Phases of the Venus Return Cycle

### Phase 1: Renewal (Months 1-3)
- Fresh perspective on relationships
- New attractions or relationship beginnings
- Reevaluation of personal values

### Phase 2: Growth (Months 4-12)
- Development of relationships initiated during renewal
- Creative projects come to fruition
- Financial opportunities may arise

### Phase 3: Integration (Months 13-19)
- Lessons learned become integrated
- Relationship patterns become clear
- Preparation for the next Venus Return

## Venus Retrograde and Returns

When Venus is retrograde during your Venus Return, expect:
- Past lovers or relationships to resurface
- Internal reflection on love patterns
- Delayed but meaningful romantic developments
- Artistic inspiration from revisiting past creative works

## Working With Venus Return Energy

### For Singles:
- Be open to new romantic possibilities
- Focus on self-love and personal values
- Engage in activities that bring you joy
- Consider what you truly want in a partner

### For Couples:
- Renew your commitment to each other
- Try new experiences together
- Address any underlying relationship issues
- Celebrate what you value about your partnership

### For Everyone:
- Reassess your relationship with money
- Invest in things that bring lasting joy
- Express your creativity freely
- Cultivate beauty in your environment

## Venus Return Themes by Sign

### Fire Signs (Aries, Leo, Sagittarius)
- Passionate new beginnings
- Adventure in relationships
- Creative self-expression
- Bold romantic gestures

### Earth Signs (Taurus, Virgo, Capricorn)
- Practical approach to love
- Financial stability focus
- Long-term relationship building
- Appreciation of natural beauty

### Air Signs (Gemini, Libra, Aquarius)
- Communication in relationships
- Social connections and friendships
- Intellectual attraction
- Artistic collaboration

### Water Signs (Cancer, Scorpio, Pisces)
- Deep emotional connections
- Intuitive understanding of others
- Spiritual approach to love
- Healing through relationships

## Preparing for Your Venus Return

1. **Calculate Your Venus Return Date**: Use astrological software or consult an astrologer
2. **Reflect on the Past Cycle**: What love lessons have you learned?
3. **Set Intentions**: What do you want to create in love and relationships?
4. **Create Beauty**: Surround yourself with things that uplift your spirit
5. **Practice Self-Love**: Honor your worth and treat yourself with kindness

## Common Venus Return Experiences

- Meeting significant romantic partners
- Artistic breakthroughs and creative inspiration
- Financial windfalls or improved money management
- Renewed appreciation for life's pleasures
- Healing of past relationship wounds
- Discovery of new values and priorities

## Maximizing Your Venus Return

To make the most of this cosmic opportunity:

- Stay open to unexpected forms of love and beauty
- Trust your instincts about what truly matters to you
- Invest in relationships that align with your values
- Practice gratitude for the love already in your life
- Express your authentic self in all relationships

## Conclusion

Venus Returns offer cyclical opportunities for love, growth, and the cultivation of beauty in our lives. By understanding and working with these cosmic rhythms, we can align more deeply with our heart's desires and create more fulfilling relationships.

Whether you're single, partnered, or somewhere in between, your Venus Return is a time to honor the goddess of love within yourself and to attract experiences that truly nourish your soul.`,
    author: 'Christopher',
    publishedAt: '2025-01-12',
    readTime: 5,
    tags: ['venus', 'relationships', 'cycles'],
    category: 'astrology',
    imageUrl: '/blog-images/venus-return.jpg'
  }
  // Add more blog posts as needed...
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

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const post = mockBlogPosts.find(p => p.id === id);
  
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🌟</div>
        <h1 className="text-3xl font-bold text-cosmic-silver mb-4">Post Not Found</h1>
        <p className="text-cosmic-silver/80 mb-8">
          The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cosmic-purple/30 text-cosmic-gold rounded-lg hover:bg-cosmic-purple/40 transition-colors duration-200"
        >
          <FaArrowLeft />
          Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple markdown-like processing for content
  const processContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Headers
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold text-cosmic-gold mb-6 mt-8 first:mt-0 font-cinzel">
              {paragraph.substring(2)}
            </h1>
          );
        }
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-cosmic-gold mb-4 mt-6 font-cinzel">
              {paragraph.substring(3)}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-bold text-cosmic-silver mb-3 mt-4">
              {paragraph.substring(4)}
            </h3>
          );
        }
        
        // Lists
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n- ').map((item, i) => {
            if (i === 0) return item;
            return item;
          });
          
          return (
            <div key={index} className="mb-4">
              {items[0] && <p className="text-cosmic-silver/90 mb-2">{items[0]}</p>}
              <ul className="list-disc list-inside space-y-2 ml-4">
                {items.slice(1).map((item, i) => (
                  <li key={i} className="text-cosmic-silver/90">{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        
        // Numbered lists
        if (/^\d+\./.test(paragraph)) {
          const items = paragraph.split(/\n\d+\.\s/);
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 ml-4 mb-4">
              {items.map((item, i) => (
                <li key={i} className="text-cosmic-silver/90">{item.replace(/^\d+\.\s/, '')}</li>
              ))}
            </ol>
          );
        }
        
        // Bold text
        const processedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cosmic-gold font-semibold">$1</strong>');
        
        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="text-cosmic-silver/90 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedParagraph }}
          />
        );
      });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Floating Social Share */}
      <SocialShare
        url={window.location.href}
        title={post.title}
        description={post.excerpt}
        author={post.author}
        tags={post.tags}
        variant="floating"
      />

      {/* Back button */}
      <div className="mb-8">
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 text-cosmic-gold hover:text-cosmic-gold/80 transition-colors duration-200"
        >
          <FaArrowLeft />
          Back to Blog
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        {/* Category */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${categoryColors[post.category]} shadow-lg`}>
            {categoryLabels[post.category]}
          </span>
          {post.featured && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold text-cosmic-dark bg-cosmic-gold shadow-lg">
              FEATURED
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-cosmic-silver mb-4 font-cinzel leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-cosmic-silver/80 mb-6 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-cosmic-silver/20">
          <div className="flex items-center gap-6 text-sm text-cosmic-silver/70">
            <div className="flex items-center gap-2">
              <FaUser className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          {/* Actions */}
          <SocialShare
            url={window.location.href}
            title={post.title}
            description={post.excerpt}
            author={post.author}
            tags={post.tags}
            variant="compact"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1 px-3 py-1 bg-cosmic-silver/10 text-cosmic-silver/80 rounded-md hover:bg-cosmic-silver/20 transition-colors duration-200"
            >
              <FaTags className="w-3 h-3" />
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <div className="bg-gradient-to-br from-cosmic-blue/5 to-cosmic-purple/5 rounded-2xl p-8 border border-cosmic-silver/10 blog-content">
          {processContent(post.content)}
        </div>
      </div>

      {/* Comments */}
  <BlogComments postId={post.id} />

      {/* Newsletter Subscription */}
      <BlogSubscription variant="inline" className="mt-12" />

      {/* Related Posts */}
      <RelatedPosts 
        currentPostId={post.id}
        currentCategory={post.category}
        currentTags={post.tags}
        posts={mockBlogPosts}
        maxPosts={3}
      />

      {/* Social Share Expanded */}
      <SocialShare
        url={window.location.href}
        title={post.title}
        description={post.excerpt}
        author={post.author}
        tags={post.tags}
        variant="expanded"
      />

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-cosmic-silver/20">
        <div className="text-center">
          <p className="text-cosmic-silver/80 mb-4">
            Enjoyed this post? Explore more cosmic wisdom on our blog.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Explore More Posts
            <FaArrowLeft className="rotate-180" />
          </Link>
        </div>
      </footer>

      {/* Related posts would go here in a real app */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-cosmic-gold mb-6 font-cinzel">Continue Reading</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {mockBlogPosts
            .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(tag => post.tags.includes(tag))))
            .slice(0, 2)
            .map(relatedPost => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.id}`}
                className="block bg-cosmic-blue/10 rounded-xl p-6 border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[relatedPost.category]}`}>
                    {categoryLabels[relatedPost.category]}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-cosmic-silver mb-2 hover:text-cosmic-gold transition-colors duration-300">
                  {relatedPost.title}
                </h4>
                <p className="text-cosmic-silver/80 text-sm mb-3 line-clamp-2">
                  {relatedPost.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-cosmic-silver/60">
                  <span>{relatedPost.author}</span>
                  <span>{relatedPost.readTime} min read</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
