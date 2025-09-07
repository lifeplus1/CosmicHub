/**
 * CERTIFICATION CENTER
 * 
 * Digital credentials and certification framework for spiritual systems.
 * Implements AI #5 requirements for certification frameworks and digital credentials.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  FaCertificate, 
  FaMedal, 
  FaTrophy, 
  FaGraduationCap,
  FaLock,
  FaCheckCircle,
  FaCrown,
  FaStar,
  FaDownload,
  FaShare,
  FaCalendar,
  FaBookOpen
} from 'react-icons/fa';

interface CertificationCenterProps {
  userId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  earnedAt: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  points: number;
}

interface Certification {
  id: string;
  title: string;
  description: string;
  level: 'foundation' | 'practitioner' | 'advanced' | 'master';
  requirements: string[];
  benefits: string[];
  credentialType: 'completion' | 'assessment' | 'project' | 'teaching';
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  progress?: number;
  issuedAt?: string;
  credentialId?: string;
  verificationUrl?: string;
  category: string;
  estimatedHours: number;
}

interface _DigitalBadge {
  id: string;
  name: string;
  image: string;
  issuedDate: string;
  verificationCode: string;
  skills: string[];
  issuer: string;
}

const CertificationCenter: React.FC<CertificationCenterProps> = ({ userId: _userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - would come from backend
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first spiritual lesson',
      icon: FaStar,
      earnedAt: '2024-01-15',
      category: 'Learning',
      rarity: 'common',
      points: 10
    },
    {
      id: '2',
      title: 'Tarot Explorer',
      description: 'Learned all 22 Major Arcana cards',
      icon: FaMedal,
      earnedAt: '2024-02-03',
      category: 'Tarot',
      rarity: 'uncommon',
      points: 50
    },
    {
      id: '3',
      title: 'Community Helper',
      description: 'Helped 10 community members with questions',
      icon: FaTrophy,
      earnedAt: '2024-02-20',
      category: 'Community',
      rarity: 'rare',
      points: 100
    }
  ];

  const certifications: Certification[] = [
    {
      id: '1',
      title: 'Tarot Foundations Certificate',
      description: 'Master the fundamentals of Tarot reading with traditional card meanings, basic spreads, and ethical reading practices.',
      level: 'foundation',
      requirements: [
        'Complete all Major Arcana lessons',
        'Complete all Minor Arcana lessons',
        'Pass foundation assessment (80%+)',
        'Complete 10 practice readings'
      ],
      benefits: [
        'Official Certificate of Completion',
        'Digital badge for LinkedIn/portfolio',
        'Access to intermediate courses',
        'Community recognition'
      ],
      credentialType: 'assessment',
      status: 'completed',
      progress: 100,
      issuedAt: '2024-02-25',
      credentialId: 'TF-2024-001234',
      verificationUrl: 'https://cosmichub.com/verify/TF-2024-001234',
      category: 'Tarot',
      estimatedHours: 25
    },
    {
      id: '2',
      title: 'Kabbalah Tree of Life Practitioner',
      description: 'Advanced understanding of the Tree of Life structure, correspondences, and safe pathworking practices.',
      level: 'practitioner',
      requirements: [
        'Complete Tarot Foundations',
        'Study all 10 Sephirot in depth',
        'Learn Hebrew letter correspondences',
        'Complete guided pathworking sessions',
        'Submit reflective journal (minimum 20 entries)'
      ],
      benefits: [
        'Practitioner-level certification',
        'Access to advanced pathworking',
        'Mentorship opportunities',
        'Teaching preparation materials'
      ],
      credentialType: 'project',
      status: 'in_progress',
      progress: 65,
      category: 'Kabbalah',
      estimatedHours: 40
    },
    {
      id: '3',
      title: 'Human Design Consultant Certificate',
      description: 'Comprehensive training in Human Design system for professional consultation and personal guidance.',
      level: 'advanced',
      requirements: [
        'Complete Human Design Foundations',
        'Master all 9 Centers and their functions',
        'Understand all 4 Types and their strategies',
        'Complete 25 practice chart readings',
        'Pass comprehensive examination'
      ],
      benefits: [
        'Professional consultant certification',
        'Business guidance materials',
        'Continuing education credits',
        'Professional network access'
      ],
      credentialType: 'teaching',
      status: 'available',
      category: 'Human Design',
      estimatedHours: 60
    },
    {
      id: '4',
      title: 'Spiritual Education Master',
      description: 'Elite certification for teaching and mentoring others in spiritual development systems.',
      level: 'master',
      requirements: [
        'Complete 3 practitioner-level certifications',
        'Demonstrate teaching ability',
        'Mentor 5 students successfully',
        'Create original educational content',
        'Peer review and recommendation'
      ],
      benefits: [
        'Master teacher recognition',
        'Revenue sharing opportunities',
        'Platform partnership benefits',
        'Legacy builder status'
      ],
      credentialType: 'teaching',
      status: 'locked',
      category: 'Teaching',
      estimatedHours: 120
    }
  ];

  const handleDownloadCertificate = useCallback((certId: string) => {
    console.log('Downloading certificate:', certId);
    // Would generate and download PDF certificate
  }, []);

  const handleShareCredential = useCallback((certId: string) => {
    console.log('Sharing credential:', certId);
    // Would open sharing options
  }, []);

  const handleStartCertification = useCallback((certId: string) => {
    console.log('Starting certification:', certId);
    // Would navigate to certification requirements
  }, []);

  const handleKeyDown = useCallback((action: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  // Memoized expensive calculations
  const statsData = useMemo(() => {
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    const completedCertifications = certifications.filter(cert => cert.status === 'completed').length;
    const masterCertifications = certifications.filter(c => c.level === 'master').length;
    
    return {
      totalPoints,
      completedCertifications,
      masterCertifications,
      totalAchievements: achievements.length
    };
  }, [achievements, certifications]);

  const filteredCertifications = useMemo(() => {
    return certifications.filter(cert => 
      selectedCategory === 'all' || cert.category === selectedCategory
    );
  }, [certifications, selectedCategory]);

  const inProgressCertifications = useMemo(() => {
    return certifications.filter(cert => cert.status === 'in_progress');
  }, [certifications]);

  const availableCertifications = useMemo(() => {
    return certifications.filter(cert => cert.status === 'available').slice(0, 2);
  }, [certifications]);

  const latestAchievement = useMemo(() => {
    return achievements.length > 0 ? achievements[achievements.length - 1] : null;
  }, [achievements]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-cosmic-silver';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'foundation': return 'text-green-500';
      case 'practitioner': return 'text-blue-500';
      case 'advanced': return 'text-purple-500';
      case 'master': return 'text-golden-500';
      default: return 'text-cosmic-silver';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'available': return 'bg-cosmic-gold/20 text-cosmic-gold';
      case 'locked': return 'bg-cosmic-silver/20 text-cosmic-silver/50';
      default: return 'bg-cosmic-silver/20 text-cosmic-silver';
    }
  };

  const totalPoints = statsData.totalPoints;
  const completedCertifications = statsData.completedCertifications;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cosmic-gold mb-4">Certification Center</h1>
        <p className="text-cosmic-silver/80 max-w-2xl mx-auto">
          Earn recognized credentials for your spiritual expertise and showcase 
          your achievements to the community and beyond.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <FaTrophy className="text-2xl text-cosmic-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-cosmic-silver mb-1">{totalPoints}</div>
            <div className="text-sm text-cosmic-silver/70">Achievement Points</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <FaCertificate className="text-2xl text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-cosmic-silver mb-1">{completedCertifications}</div>
            <div className="text-sm text-cosmic-silver/70">Certificates</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <FaMedal className="text-2xl text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-cosmic-silver mb-1">{statsData.totalAchievements}</div>
            <div className="text-sm text-cosmic-silver/70">Achievements</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <FaCrown className="text-2xl text-golden-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-cosmic-silver mb-1">{statsData.masterCertifications}</div>
            <div className="text-sm text-cosmic-silver/70">Master Level</div>
          </div>
        </Card>
      </div>

      {/* Certification Navigation */}
      <Tabs.Root 
        value={activeTab} 
        onValueChange={(value: string) => setActiveTab(value)}
      >
        <Tabs.List className="flex flex-wrap gap-2 p-2 bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl">
          <Tabs.Trigger 
            value="overview"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaGraduationCap /> Overview
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="certifications"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'certifications' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaCertificate /> Certifications
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="achievements"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'achievements' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaTrophy /> Achievements
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="badges"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'badges' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaMedal /> Digital Badges
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview">
          <div className="space-y-6">
            
            {/* Progress Summary */}
            <Card title="Your Certification Journey">
              <div className="p-6 space-y-6">
                
                {/* Latest Achievement */}
                <div>
                  <h3 className="font-semibold text-cosmic-silver mb-4">Latest Achievement</h3>
                  {latestAchievement && (() => {
                    const IconComponent = latestAchievement.icon;
                    return (
                      <div className="flex items-center gap-4 p-4 bg-cosmic-purple/10 rounded-lg">
                        <div className="w-12 h-12 bg-cosmic-gold/20 rounded-full flex items-center justify-center">
                          <IconComponent className="text-cosmic-gold" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-cosmic-silver">
                            {latestAchievement.title}
                          </h4>
                          <p className="text-sm text-cosmic-silver/70">
                            {latestAchievement.description}
                          </p>
                          <p className="text-xs text-cosmic-gold mt-1">
                            Earned {latestAchievement.earnedAt}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* In Progress Certifications */}
                <div>
                  <h3 className="font-semibold text-cosmic-silver mb-4">Current Progress</h3>
                  {inProgressCertifications.map((cert) => (
                      <div key={cert.id} className="p-4 bg-cosmic-dark/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-cosmic-silver">{cert.title}</h4>
                          <span className="text-sm text-cosmic-gold">
                            {cert.progress}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-cosmic-dark/50 rounded-full h-2 mb-3">
                          <div 
                            className="bg-cosmic-gold h-2 rounded-full transition-all duration-300"
                            data-width={`${cert.progress}%`}
                          />
                        </div>
                        <p className="text-sm text-cosmic-silver/70">{cert.description}</p>
                      </div>
                    ))}
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold text-cosmic-silver mb-4">Recommended Next Steps</h3>
                  <div className="space-y-3">
                    {availableCertifications.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 bg-cosmic-purple/10 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-cosmic-silver text-sm">{cert.title}</h4>
                            <p className="text-xs text-cosmic-silver/70">{cert.estimatedHours} hours estimated</p>
                          </div>
                          <Button onClick={() => handleStartCertification(cert.id)}>
                            Start
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.Content>

        {/* Certifications Tab */}
        <Tabs.Content value="certifications">
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cosmic-gold">Available Certifications</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-cosmic-dark/30 border border-cosmic-silver/20 rounded-lg text-cosmic-silver focus:outline-none focus:border-cosmic-gold"
                aria-label="Filter certifications by category"
              >
                <option value="all">All Categories</option>
                <option value="Tarot">Tarot</option>
                <option value="Kabbalah">Kabbalah</option>
                <option value="Human Design">Human Design</option>
                <option value="Teaching">Teaching</option>
              </select>
            </div>

            <div className="space-y-6">
              {filteredCertifications.map((cert) => (
                  <Card key={cert.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-cosmic-purple/20 rounded-full flex items-center justify-center">
                            <FaCertificate className="text-2xl text-cosmic-gold" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-cosmic-silver">{cert.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-sm font-semibold ${getLevelColor(cert.level)}`}>
                                {cert.level.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(cert.status)}`}>
                                {cert.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {cert.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary"
                              onClick={() => handleDownloadCertificate(cert.id)}
                            >
                              <FaDownload className="mr-2" /> Download
                            </Button>
                            <Button 
                              variant="secondary"
                              onClick={() => handleShareCredential(cert.id)}
                            >
                              <FaShare className="mr-2" /> Share
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-cosmic-silver/70 mb-4">{cert.description}</p>
                      
                      {cert.status === 'in_progress' && cert.progress && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-cosmic-silver/70 mb-2">
                            <span>Progress</span>
                            <span>{cert.progress}%</span>
                          </div>
                          <div className="w-full bg-cosmic-dark/50 rounded-full h-2">
                            <div 
                              className="bg-cosmic-gold h-2 rounded-full transition-all duration-300"
                              data-width={`${cert.progress}%`}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-cosmic-silver mb-3">Requirements</h4>
                          <ul className="space-y-2">
                            {cert.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-cosmic-silver/70">
                                <FaCheckCircle className="text-cosmic-gold flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-cosmic-silver mb-3">Benefits</h4>
                          <ul className="space-y-2">
                            {cert.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-cosmic-silver/70">
                                <FaStar className="text-cosmic-gold flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-cosmic-silver/10">
                        <div className="flex items-center gap-4 text-sm text-cosmic-silver/70">
                          <span className="flex items-center gap-1">
                            <FaCalendar /> {cert.estimatedHours} hours
                          </span>
                          <span className="flex items-center gap-1">
                            <FaBookOpen /> {cert.credentialType}
                          </span>
                        </div>
                        
                        {cert.status === 'available' && (
                          <Button 
                            onClick={() => handleStartCertification(cert.id)}
                            onKeyDown={handleKeyDown(() => handleStartCertification(cert.id))}
                          >
                            Start Certification
                          </Button>
                        )}
                        
                        {cert.status === 'in_progress' && (
                          <Button 
                            onClick={() => handleStartCertification(cert.id)}
                            onKeyDown={handleKeyDown(() => handleStartCertification(cert.id))}
                          >
                            Continue
                          </Button>
                        )}
                        
                        {cert.status === 'locked' && (
                          <Button disabled>
                            <FaLock className="mr-2" /> Prerequisites Required
                          </Button>
                        )}
                        
                        {cert.status === 'completed' && (
                          <div className="text-sm text-green-400 flex items-center gap-2">
                            <FaCheckCircle />
                            Completed {cert.issuedAt}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </Tabs.Content>

        {/* Achievements Tab */}
        <Tabs.Content value="achievements">
          <div className="space-y-6">
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-cosmic-gold mb-2">Your Achievements</h2>
              <p className="text-cosmic-silver/70">
                Celebrate your progress and milestones in your spiritual journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={achievement.id}>
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="text-2xl text-cosmic-gold" />
                      </div>
                      
                      <h3 className="font-semibold text-cosmic-silver mb-2">{achievement.title}</h3>
                      <p className="text-sm text-cosmic-silver/70 mb-4">{achievement.description}</p>
                      
                      <div className="flex items-center justify-center gap-4 text-xs text-cosmic-silver/70">
                        <span className={`font-semibold ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity.toUpperCase()}
                        </span>
                        <span>•</span>
                        <span>{achievement.points} points</span>
                        <span>•</span>
                        <span>{achievement.earnedAt}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Tabs.Content>

        {/* Digital Badges Tab */}
        <Tabs.Content value="badges">
          <div className="text-center py-12">
            <FaMedal className="text-6xl text-cosmic-gold/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cosmic-silver mb-2">
              Digital Badge System
            </h3>
            <p className="text-cosmic-silver/70 mb-6">
              Verifiable digital credentials for your professional portfolio coming soon.
            </p>
            <Button>Learn More</Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

CertificationCenter.displayName = 'CertificationCenter';

export default React.memo(CertificationCenter);
