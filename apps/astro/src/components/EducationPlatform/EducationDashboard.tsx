/**
 * EDUCATION PLATFORM DASHBOARD
 * 
 * Comprehensive learning management system for spiritual development
 * Implements AI #5 requirements: educational curricula, onboarding flows,
 * community features, certification frameworks, and progressive disclosure
 */

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaCertificate, 
  FaBookOpen,
  FaChartLine,
  FaMedal,
  FaComments,
  FaHeart
} from 'react-icons/fa';
import { useAuth } from '@cosmichub/auth';
// Educational Platform Components
import LearningPathViewer from './LearningPathViewer';
import CommunityHub from './CommunityHub';
import CertificationCenter from './CertificationCenter';
import OnboardingFlow from './OnboardingFlow';
import ProgressTracker from './ProgressTracker';

interface EducationDashboardProps {
  userId: string;
  initialTab?: 'overview' | 'learning' | 'community' | 'certifications' | 'progress';
}

const EducationDashboard: React.FC<EducationDashboardProps> = ({ 
  userId, 
  initialTab = 'overview' 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Mock data for now - would integrate with spiritual education service
  const userProgress = {
    completedLessons: 24,
    hasCompletedOnboarding: true,
    certifications: ['Tarot Foundations', 'Kabbalah Basics']
  };
  
  const currentCourse = {
    title: 'Intermediate Tarot & Kabbalah Integration',
    progress: 0.65
  };
  
  const achievements = [
    'First Week Complete',
    'Tarot Master',
    'Community Helper'
  ];
  
  const communityActivity = {
    connections: 12
  };
  
  const isLoading = false;
  const error = null;

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !userProgress?.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, userProgress]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl text-cosmic-gold mb-4">🌟</div>
          <p className="text-cosmic-silver">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Education Platform">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading education platform</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        userId={userId}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-dark via-cosmic-blue/20 to-cosmic-purple/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
            Spiritual Education Platform
          </h1>
          <p className="text-xl text-cosmic-silver/80 max-w-2xl mx-auto font-playfair">
            Your comprehensive journey through consciousness development and spiritual mastery
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="p-4">
              <FaChartLine className="text-2xl text-cosmic-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-cosmic-silver mb-1">
                {userProgress?.completedLessons || 0}
              </div>
              <div className="text-sm text-cosmic-silver/70">Lessons Complete</div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <FaMedal className="text-2xl text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cosmic-silver mb-1">
                {achievements?.length || 0}
              </div>
              <div className="text-sm text-cosmic-silver/70">Achievements</div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cosmic-silver mb-1">
                {communityActivity?.connections || 0}
              </div>
              <div className="text-sm text-cosmic-silver/70">Community</div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <FaCertificate className="text-2xl text-golden-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cosmic-silver mb-1">
                {userProgress?.certifications?.length || 0}
              </div>
              <div className="text-sm text-cosmic-silver/70">Certificates</div>
            </div>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(value: string) => {
            setActiveTab(value as typeof activeTab);
          }}
        >
          <Tabs.List className="flex flex-wrap gap-2 p-2 bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl mb-8">
            <Tabs.Trigger 
              value="overview"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-cosmic-gold text-cosmic-dark' 
                  : 'text-cosmic-silver hover:bg-cosmic-purple/20'
              }`}
            >
              <FaBookOpen /> Overview
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="learning"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'learning' 
                  ? 'bg-cosmic-gold text-cosmic-dark' 
                  : 'text-cosmic-silver hover:bg-cosmic-purple/20'
              }`}
            >
              <FaGraduationCap /> Learning Paths
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="community"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'community' 
                  ? 'bg-cosmic-gold text-cosmic-dark' 
                  : 'text-cosmic-silver hover:bg-cosmic-purple/20'
              }`}
            >
              <FaUsers /> Community
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
              value="progress"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'progress' 
                  ? 'bg-cosmic-gold text-cosmic-dark' 
                  : 'text-cosmic-silver hover:bg-cosmic-purple/20'
              }`}
            >
              <FaChartLine /> Progress
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content value="overview">
            <div className="space-y-8">
              
              {/* Welcome Section */}
              <Card title="Welcome to Your Spiritual Education Journey">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cosmic-gold/20 rounded-full flex items-center justify-center">
                      <FaHeart className="text-2xl text-cosmic-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cosmic-silver mb-2">
                        Welcome back, {user?.displayName || 'Spiritual Seeker'}!
                      </h3>
                      <p className="text-cosmic-silver/70">
                        Continue your journey of consciousness development and spiritual mastery
                      </p>
                    </div>
                  </div>
                  
                  {/* Current Course Progress */}
                  {currentCourse && (
                    <div className="bg-cosmic-purple/20 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-cosmic-silver">
                          Current: {currentCourse.title}
                        </h4>
                        <span className="text-sm text-cosmic-gold">
                          {Math.round(currentCourse.progress * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-cosmic-dark/50 rounded-full h-2 mb-3">
                        <div 
                          className="bg-cosmic-gold h-2 rounded-full transition-all duration-300"
                          data-width={`${currentCourse.progress * 100}%`}
                        />
                      </div>
                      <Button 
                        onClick={() => setActiveTab('learning')}
                        className="w-full"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Access */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Learning Paths" className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                  <div className="p-4 text-center" onClick={() => setActiveTab('learning')}>
                    <FaGraduationCap className="text-3xl text-cosmic-gold mx-auto mb-3" />
                    <p className="text-cosmic-silver/70 text-sm">
                      Explore structured curricula for spiritual systems
                    </p>
                  </div>
                </Card>
                
                <Card title="Community Hub" className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                  <div className="p-4 text-center" onClick={() => setActiveTab('community')}>
                    <FaUsers className="text-3xl text-blue-500 mx-auto mb-3" />
                    <p className="text-cosmic-silver/70 text-sm">
                      Connect with fellow seekers and mentors
                    </p>
                  </div>
                </Card>
                
                <Card title="Certifications" className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                  <div className="p-4 text-center" onClick={() => setActiveTab('certifications')}>
                    <FaCertificate className="text-3xl text-golden-500 mx-auto mb-3" />
                    <p className="text-cosmic-silver/70 text-sm">
                      Earn credentials for your spiritual expertise
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="learning">
            <LearningPathViewer userId={userId} />
          </Tabs.Content>

          <Tabs.Content value="community">
            <CommunityHub userId={userId} />
          </Tabs.Content>

          <Tabs.Content value="certifications">
            <CertificationCenter userId={userId} />
          </Tabs.Content>

          <Tabs.Content value="progress">
            <ProgressTracker />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default EducationDashboard;
