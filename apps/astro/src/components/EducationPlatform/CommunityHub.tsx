/**
 * COMMUNITY HUB
 * 
 * Central hub for spiritual community features including forums,
 * mentorship connections, study groups, and peer networking.
 * Implements AI #5 requirements for community features.
 */

import React, { useState, useCallback } from 'react';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  FaUsers, 
  FaComments, 
  FaUserFriends, 
  FaGraduationCap,
  FaHeart,
  FaCrown,
  FaStar,
  FaCalendar,
  FaMapMarkerAlt,
  FaVideo,
  FaPlus,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

interface CommunityHubProps {
  userId: string;
}

interface ForumPost {
  id: string;
  title: string;
  author: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'teacher';
    avatar?: string;
  };
  category: string;
  replies: number;
  lastActivity: string;
  excerpt: string;
  tags: string[];
  isSticky?: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  level: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  nextSession: string;
  facilitator: {
    name: string;
    level: string;
  };
  isJoined: boolean;
}

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  reviews: number;
  bio: string;
  availability: 'available' | 'limited' | 'unavailable';
  priceRange: string;
  specialties: string[];
}

const CommunityHub: React.FC<CommunityHubProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('forums');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Mock data - would come from backend
  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Understanding the Tower card in difficult times',
      author: { name: 'Sarah M.', level: 'intermediate' },
      category: 'Tarot',
      replies: 12,
      lastActivity: '2 hours ago',
      excerpt: 'I keep drawing the Tower card lately and would love perspectives on how to work with this energy constructively...',
      tags: ['tower', 'major-arcana', 'guidance'],
      isSticky: false
    },
    {
      id: '2',
      title: 'Weekly Kabbalah Study Group - Join Us!',
      author: { name: 'Rabbi David', level: 'teacher' },
      category: 'Study Groups',
      replies: 28,
      lastActivity: '5 hours ago',
      excerpt: 'We meet every Tuesday to explore the Tree of Life. Beginners welcome!',
      tags: ['kabbalah', 'study-group', 'tree-of-life'],
      isSticky: true
    },
    {
      id: '3',
      title: 'Human Design Generator - Authority confusion',
      author: { name: 'Michael R.', level: 'beginner' },
      category: 'Human Design',
      replies: 8,
      lastActivity: '1 day ago',
      excerpt: 'I\'m a Generator with Sacral Authority but keep second-guessing my gut responses...',
      tags: ['generator', 'authority', 'sacral'],
      isSticky: false
    }
  ];

  const studyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Tarot for Beginners',
      topic: 'Major Arcana Deep Dive',
      level: 'Beginner',
      members: 8,
      maxMembers: 12,
      meetingTime: 'Saturdays 2pm PST',
      nextSession: 'Tomorrow at 2:00 PM',
      facilitator: { name: 'Emma Johnson', level: 'Advanced' },
      isJoined: false
    },
    {
      id: '2',
      name: 'Kabbalah Study Circle',
      topic: 'Sefer Yetzirah Exploration',
      level: 'Intermediate',
      members: 6,
      maxMembers: 8,
      meetingTime: 'Tuesdays 7pm EST',
      nextSession: 'Tuesday at 7:00 PM',
      facilitator: { name: 'Rabbi David Cohen', level: 'Teacher' },
      isJoined: true
    },
    {
      id: '3',
      name: 'Gene Keys Contemplation',
      topic: 'Golden Path Integration',
      level: 'Advanced',
      members: 4,
      maxMembers: 6,
      meetingTime: 'Thursdays 6pm GMT',
      nextSession: 'Thursday at 6:00 PM',
      facilitator: { name: 'Luna Rodriguez', level: 'Advanced' },
      isJoined: false
    }
  ];

  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Master Elena Starweaver',
      expertise: ['Tarot', 'Kabbalah', 'Meditation'],
      rating: 4.9,
      reviews: 147,
      bio: '25+ years of spiritual practice and teaching. Specializes in traditional Golden Dawn methods.',
      availability: 'available',
      priceRange: '$80-120/session',
      specialties: ['Traditional Tarot', 'Tree of Life', 'Pathworking']
    },
    {
      id: '2',
      name: 'Dr. James Cosmos',
      expertise: ['Human Design', 'Gene Keys', 'Psychology'],
      rating: 4.8,
      reviews: 89,
      bio: 'Licensed psychologist integrating spiritual systems with therapeutic practice.',
      availability: 'limited',
      priceRange: '$100-150/session',
      specialties: ['Type Analysis', 'Authority Work', 'Profile Integration']
    },
    {
      id: '3',
      name: 'Sophia Moonchild',
      expertise: ['Astrology', 'Numerology', 'Crystals'],
      rating: 4.7,
      reviews: 203,
      bio: 'Intuitive guide helping souls find their cosmic purpose through multiple modalities.',
      availability: 'available',
      priceRange: '$60-90/session',
      specialties: ['Birth Chart', 'Life Path', 'Soul Purpose']
    }
  ];

  const handleJoinGroup = useCallback((groupId: string) => {
    console.log('Joining group:', groupId);
    // Would make API call to join group
  }, []);

  const handleContactMentor = useCallback((mentorId: string) => {
    console.log('Contacting mentor:', mentorId);
    // Would open messaging interface
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      case 'teacher': return 'text-purple-500';
      default: return 'text-cosmic-silver';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return FaStar;
      case 'intermediate': return FaGraduationCap;
      case 'advanced': return FaCrown;
      case 'teacher': return FaHeart;
      default: return FaStar;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cosmic-gold mb-4">Community Hub</h1>
        <p className="text-cosmic-silver/80 max-w-2xl mx-auto">
          Connect with fellow seekers, join study groups, find mentors, and participate 
          in meaningful discussions about spiritual development.
        </p>
      </div>

      {/* Community Navigation */}
      <Tabs.Root 
        value={activeTab} 
        onValueChange={(value: string) => setActiveTab(value)}
      >
        <Tabs.List className="flex flex-wrap gap-2 p-2 bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl">
          <Tabs.Trigger 
            value="forums"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'forums' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaComments /> Forums
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="groups"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'groups' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaUsers /> Study Groups
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="mentors"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'mentors' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaGraduationCap /> Mentors
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="connections"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'connections' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaUserFriends /> My Connections
          </Tabs.Trigger>
        </Tabs.List>

        {/* Forums Tab */}
        <Tabs.Content value="forums">
          <div className="space-y-6">
            
            {/* Search and Filter */}
            <Card>
              <div className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cosmic-silver/50" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-cosmic-dark/30 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:outline-none focus:border-cosmic-gold"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-cosmic-dark/30 border border-cosmic-silver/20 rounded-lg text-cosmic-silver focus:outline-none focus:border-cosmic-gold"
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    <option value="tarot">Tarot</option>
                    <option value="kabbalah">Kabbalah</option>
                    <option value="astrology">Astrology</option>
                    <option value="human-design">Human Design</option>
                    <option value="gene-keys">Gene Keys</option>
                  </select>
                  
                  <Button onClick={() => setShowNewPostModal(true)}>
                    <FaPlus className="mr-2" /> New Discussion
                  </Button>
                </div>
              </div>
            </Card>

            {/* Forum Posts */}
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="cursor-pointer hover:bg-cosmic-purple/5 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cosmic-gold font-semibold">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isSticky && (
                            <span className="bg-cosmic-gold text-cosmic-dark text-xs px-2 py-1 rounded-full font-semibold">
                              PINNED
                            </span>
                          )}
                          <span className="bg-cosmic-purple/20 text-cosmic-silver text-xs px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-cosmic-silver mb-2 truncate">
                          {post.title}
                        </h3>
                        
                        <p className="text-cosmic-silver/70 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-cosmic-silver/70">
                            <span>By {post.author.name}</span>
                            <span className={getLevelColor(post.author.level)}>
                              {post.author.level}
                            </span>
                            <span>{post.replies} replies</span>
                            <span>{post.lastActivity}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            {post.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="text-xs text-cosmic-gold/70 bg-cosmic-dark/30 px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Tabs.Content>

        {/* Study Groups Tab */}
        <Tabs.Content value="groups">
          <div className="space-y-6">
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-cosmic-gold mb-2">Join a Study Group</h2>
              <p className="text-cosmic-silver/70">
                Learn together with like-minded spiritual seekers in structured group sessions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGroups.map((group) => (
                <Card key={group.id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-cosmic-silver">{group.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        group.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        group.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {group.level}
                      </span>
                    </div>
                    
                    <p className="text-cosmic-silver/70 text-sm mb-4">{group.topic}</p>
                    
                    <div className="space-y-2 text-sm text-cosmic-silver/70 mb-4">
                      <div className="flex items-center gap-2">
                        <FaUsers />
                        <span>{group.members}/{group.maxMembers} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>{group.meetingTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaVideo />
                        <span>Next: {group.nextSession}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-cosmic-silver/10 pt-4">
                      <div className="flex items-center justify-between text-xs text-cosmic-silver/70 mb-3">
                        <span>Facilitated by:</span>
                        <span className="text-cosmic-gold">{group.facilitator.name}</span>
                      </div>
                      
                      {group.isJoined ? (
                        <Button className="w-full" disabled>
                          Joined ✓
                        </Button>
                      ) : group.members >= group.maxMembers ? (
                        <Button className="w-full" disabled>
                          Full - Join Waitlist
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          Join Group
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Tabs.Content>

        {/* Mentors Tab */}
        <Tabs.Content value="mentors">
          <div className="space-y-6">
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-cosmic-gold mb-2">Find Your Mentor</h2>
              <p className="text-cosmic-silver/70">
                Connect with experienced practitioners for personalized guidance and teachings
              </p>
            </div>

            <div className="space-y-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-24 h-24 bg-cosmic-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl text-cosmic-gold font-semibold">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-cosmic-silver">{mentor.name}</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            mentor.availability === 'available' ? 'bg-green-500/20 text-green-400' :
                            mentor.availability === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {mentor.availability}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-cosmic-gold" />
                            <span className="text-cosmic-silver">{mentor.rating}</span>
                            <span className="text-cosmic-silver/50">({mentor.reviews} reviews)</span>
                          </div>
                          <span className="text-cosmic-silver/50">•</span>
                          <span className="text-cosmic-silver/70">{mentor.priceRange}</span>
                        </div>
                        
                        <p className="text-cosmic-silver/70 text-sm mb-4">{mentor.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {mentor.specialties.map((specialty) => (
                            <span 
                              key={specialty}
                              className="bg-cosmic-purple/20 text-cosmic-silver text-xs px-3 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleContactMentor(mentor.id)}
                            disabled={mentor.availability === 'unavailable'}
                          >
                            Contact Mentor
                          </Button>
                          <Button variant="secondary">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Tabs.Content>

        {/* Connections Tab */}
        <Tabs.Content value="connections">
          <div className="text-center py-12">
            <FaUserFriends className="text-6xl text-cosmic-gold/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cosmic-silver mb-2">
              Your Spiritual Network
            </h3>
            <p className="text-cosmic-silver/70 mb-6">
              Connect with fellow seekers to build your spiritual community.
            </p>
            <Button>Discover New Connections</Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* New Post Modal */}
      <Dialog.Root open={showNewPostModal} onOpenChange={setShowNewPostModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cosmic-dark border border-cosmic-silver/20 rounded-xl p-6 max-w-md w-full mx-4 z-50">
            <Dialog.Title className="text-xl font-semibold text-cosmic-gold mb-4">
              Start New Discussion
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cosmic-silver mb-2">
                  Discussion Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your discussion topic..."
                  className="w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:outline-none focus:border-cosmic-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cosmic-silver mb-2">
                  Category
                </label>
                <select 
                  className="w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver focus:outline-none focus:border-cosmic-gold"
                  aria-label="Discussion category"
                >
                  <option value="">Select category...</option>
                  <option value="tarot">Tarot</option>
                  <option value="kabbalah">Kabbalah</option>
                  <option value="astrology">Astrology</option>
                  <option value="human-design">Human Design</option>
                  <option value="gene-keys">Gene Keys</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cosmic-silver mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your question or topic for discussion..."
                  className="w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:outline-none focus:border-cosmic-gold resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewPostModal(false)}>
                Create Discussion
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default CommunityHub;
