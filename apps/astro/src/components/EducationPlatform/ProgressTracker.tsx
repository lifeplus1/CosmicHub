/**
 * PROGRESS TRACKER
 * 
 * Comprehensive tracking of user learning progress across all spiritual systems.
 * Implements AI #5 requirements for progressive disclosure and achievement tracking.
 */

import React, { useState } from 'react';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  FaChartLine, 
  FaCalendar, 
  FaTrophy, 
  FaFire,
  FaBookOpen,
  FaOm,
  FaStar,
  FaBullseye,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaClock,
  FaGraduationCap
} from 'react-icons/fa';
import { ProgressBar } from '../ui/ProgressBar';

// Types for progress tracking
interface LearningActivity {
  id: string;
  type: 'lesson' | 'practice' | 'assessment' | 'reflection';
  title: string;
  systemType: 'astrology' | 'tarot' | 'chakras' | 'myers_briggs' | 'enneagram' | 'tcm' | 'meridians' | 'spiritual_development';
  completedAt: string;
  score?: number;
  timeSpent: number; // in minutes
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  points: number;
}

interface LearningStreak {
  current: number;
  longest: number;
  lastActivity: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  type: 'skill' | 'knowledge' | 'practice' | 'certification';
  systemType: string;
}

interface SystemProgress {
  systemType: string;
  systemName: string;
  totalLessons: number;
  completedLessons: number;
  practiceHours: number;
  mastery: number; // 0-100
  lastActivity: string;
}

// Mock data for demonstration
const mockRecentActivities: LearningActivity[] = [
  {
    id: '1',
    type: 'lesson',
    title: 'Introduction to Natal Chart Houses',
    systemType: 'astrology',
    completedAt: '2024-01-15T10:30:00Z',
    score: 92,
    timeSpent: 45
  },
  {
    id: '2',
    type: 'practice',
    title: 'Daily Chakra Meditation',
    systemType: 'chakras',
    completedAt: '2024-01-15T09:15:00Z',
    timeSpent: 20
  },
  {
    id: '3',
    type: 'assessment',
    title: 'Myers-Briggs Personality Deep Dive',
    systemType: 'myers_briggs',
    completedAt: '2024-01-14T16:45:00Z',
    score: 87,
    timeSpent: 60
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌟',
    earnedAt: '2024-01-10T12:00:00Z',
    rarity: 'common',
    points: 10
  },
  {
    id: '2',
    title: 'Meditation Master',
    description: 'Complete 30 days of meditation practice',
    icon: '🧘',
    earnedAt: '2024-01-15T08:00:00Z',
    rarity: 'uncommon',
    points: 50
  },
  {
    id: '3',
    title: 'Astrology Adept',
    description: 'Master the basics of astrology',
    icon: '⭐',
    earnedAt: '2024-01-12T14:30:00Z',
    rarity: 'rare',
    points: 100
  }
];

const mockStreak: LearningStreak = {
  current: 7,
  longest: 15,
  lastActivity: '2024-01-15T10:30:00Z'
};

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete Astrology Foundations',
    description: 'Master all basic astrology concepts and chart reading',
    targetDate: '2024-03-01',
    progress: 65,
    type: 'certification',
    systemType: 'astrology'
  },
  {
    id: '2',
    title: 'Daily Meditation Practice',
    description: 'Maintain consistent daily meditation for 90 days',
    targetDate: '2024-04-15',
    progress: 23,
    type: 'practice',
    systemType: 'spiritual_development'
  }
];

const mockSystemProgress: SystemProgress[] = [
  {
    systemType: 'astrology',
    systemName: 'Western Astrology',
    totalLessons: 25,
    completedLessons: 16,
    practiceHours: 12.5,
    mastery: 64,
    lastActivity: '2024-01-15T10:30:00Z'
  },
  {
    systemType: 'chakras',
    systemName: 'Chakra System',
    totalLessons: 15,
    completedLessons: 8,
    practiceHours: 8.2,
    mastery: 53,
    lastActivity: '2024-01-15T09:15:00Z'
  },
  {
    systemType: 'myers_briggs',
    systemName: 'MBTI Personality',
    totalLessons: 20,
    completedLessons: 12,
    practiceHours: 6.7,
    mastery: 60,
    lastActivity: '2024-01-14T16:45:00Z'
  }
];

const ProgressTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-green-400';
      case 'uncommon': return 'text-blue-400';
      case 'rare': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-cosmic-silver';
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-cosmic-blue/20 via-cosmic-purple/10 to-cosmic-dark/30 backdrop-blur-xl border border-cosmic-silver/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cosmic-gold mb-2">Learning Progress</h2>
        <p className="text-cosmic-silver">Track your spiritual development journey</p>
      </div>

      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
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
            <FaChartLine /> Overview
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="activities"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'activities' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaHistory /> Activities
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
            value="goals"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'goals' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaBullseye /> Goals
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="systems"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'systems' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            <FaOm /> Systems
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 backdrop-blur-lg border border-cosmic-silver/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cosmic-gold/20 rounded-lg">
                  <FaFire className="text-cosmic-gold text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cosmic-gold">{mockStreak.current}</div>
                  <div className="text-sm text-cosmic-silver">Day Streak</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-cosmic-blue/20 to-cosmic-purple/20 backdrop-blur-lg border border-cosmic-silver/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FaBookOpen className="text-blue-400 text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cosmic-gold">
                    {mockSystemProgress.reduce((sum, system) => sum + system.completedLessons, 0)}
                  </div>
                  <div className="text-sm text-cosmic-silver">Lessons Complete</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-pink/20 backdrop-blur-lg border border-cosmic-silver/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FaTrophy className="text-purple-400 text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cosmic-gold">{mockAchievements.length}</div>
                  <div className="text-sm text-cosmic-silver">Achievements</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-cosmic-gold/20 to-cosmic-yellow/20 backdrop-blur-lg border border-cosmic-silver/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cosmic-gold/20 rounded-lg">
                  <FaClock className="text-cosmic-gold text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cosmic-gold">
                    {Math.round(mockSystemProgress.reduce((sum, system) => sum + system.practiceHours, 0))}h
                  </div>
                  <div className="text-sm text-cosmic-silver">Practice Time</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities Preview */}
          <Card className="p-6 bg-cosmic-blue/10 backdrop-blur-lg border border-cosmic-silver/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cosmic-gold">Recent Activities</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveTab('activities')}
                className="text-cosmic-silver hover:text-cosmic-gold"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockRecentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-cosmic-purple/10 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                    activity.type === 'practice' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'assessment' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cosmic-silver/20 text-cosmic-silver'
                  }`}>
                    {activity.type === 'lesson' && <FaBookOpen />}
                    {activity.type === 'practice' && <FaOm />}
                    {activity.type === 'assessment' && <FaGraduationCap />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-cosmic-silver font-medium">{activity.title}</div>
                    <div className="text-sm text-cosmic-silver/70">
                      {formatDate(activity.completedAt)} • {formatTimeSpent(activity.timeSpent)}
                      {activity.score && ` • ${activity.score}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Tabs.Content>

        {/* Activities Tab */}
        <Tabs.Content value="activities" className="mt-6">
          <Card className="p-6 bg-cosmic-blue/10 backdrop-blur-lg border border-cosmic-silver/10">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Learning Activities</h3>
            
            <div className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-cosmic-purple/10 rounded-lg">
                  <div className={`p-3 rounded-full ${
                    activity.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                    activity.type === 'practice' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'assessment' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cosmic-silver/20 text-cosmic-silver'
                  }`}>
                    {activity.type === 'lesson' && <FaBookOpen className="text-lg" />}
                    {activity.type === 'practice' && <FaOm className="text-lg" />}
                    {activity.type === 'assessment' && <FaGraduationCap className="text-lg" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-cosmic-silver font-semibold text-lg">{activity.title}</div>
                    <div className="text-cosmic-silver/80 capitalize">{activity.systemType.replace('_', ' ')}</div>
                    <div className="text-sm text-cosmic-silver/70 mt-1">
                      {formatDate(activity.completedAt)} • {formatTimeSpent(activity.timeSpent)}
                    </div>
                  </div>
                  
                  {activity.score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cosmic-gold">{activity.score}%</div>
                      <div className="text-sm text-cosmic-silver/70">Score</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Tabs.Content>

        {/* Achievements Tab */}
        <Tabs.Content value="achievements" className="mt-6">
          <Card className="p-6 bg-cosmic-blue/10 backdrop-blur-lg border border-cosmic-silver/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cosmic-gold">Achievements</h3>
              <div className="text-cosmic-silver">
                Total Points: <span className="text-cosmic-gold font-bold">
                  {mockAchievements.reduce((sum, achievement) => sum + achievement.points, 0)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAchievements.map((achievement) => (
                <Card key={achievement.id} className="p-4 bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 backdrop-blur-lg border border-cosmic-silver/10">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-cosmic-silver">{achievement.title}</div>
                      <div className="text-sm text-cosmic-silver/80 mt-1">{achievement.description}</div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-sm font-medium ${getRarityColor(achievement.rarity)} capitalize`}>
                          {achievement.rarity}
                        </span>
                        <span className="text-cosmic-gold font-bold">{achievement.points} pts</span>
                      </div>
                      <div className="text-xs text-cosmic-silver/60 mt-1">
                        Earned {formatDate(achievement.earnedAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Tabs.Content>

        {/* Goals Tab */}
        <Tabs.Content value="goals" className="mt-6">
          <Card className="p-6 bg-cosmic-blue/10 backdrop-blur-lg border border-cosmic-silver/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cosmic-gold">Learning Goals</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-cosmic-dark"
              >
                Add Goal
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockGoals.map((goal) => (
                <Card key={goal.id} className="p-4 bg-cosmic-purple/10 backdrop-blur-lg border border-cosmic-silver/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-cosmic-silver text-lg">{goal.title}</div>
                      <div className="text-cosmic-silver/80 mt-1">{goal.description}</div>
                      <div className="text-sm text-cosmic-silver/70 mt-2">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cosmic-gold">{goal.progress}%</div>
                      <div className="text-sm text-cosmic-silver/70 capitalize">{goal.type}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <ProgressBar 
                      progress={goal.progress} 
                      color="bg-cosmic-gold" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cosmic-silver/80 capitalize">
                      {goal.systemType.replace('_', ' ')}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-cosmic-silver hover:text-cosmic-gold">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-cosmic-silver hover:text-cosmic-gold">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Tabs.Content>

        {/* Systems Tab */}
        <Tabs.Content value="systems" className="mt-6">
          <Card className="p-6 bg-cosmic-blue/10 backdrop-blur-lg border border-cosmic-silver/10">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">System Mastery Progress</h3>
            
            <div className="space-y-4">
              {mockSystemProgress.map((system) => (
                <Card key={system.systemType} className="p-4 bg-cosmic-purple/10 backdrop-blur-lg border border-cosmic-silver/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-cosmic-silver text-lg">{system.systemName}</div>
                      <div className="text-cosmic-silver/70 text-sm">
                        {system.completedLessons} of {system.totalLessons} lessons • {system.practiceHours}h practice
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cosmic-gold">{system.mastery}%</div>
                      <div className="text-sm text-cosmic-silver/70">Mastery</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-cosmic-silver">Lessons Progress</span>
                        <span className="text-sm text-cosmic-silver">
                          {system.completedLessons}/{system.totalLessons}
                        </span>
                      </div>
                      <ProgressBar 
                        progress={(system.completedLessons / system.totalLessons) * 100}
                        color="bg-cosmic-blue"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-cosmic-silver">Overall Mastery</span>
                        <span className="text-sm text-cosmic-silver">{system.mastery}%</span>
                      </div>
                      <ProgressBar 
                        progress={system.mastery}
                        color="bg-cosmic-gold"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-cosmic-silver/10">
                    <div className="text-sm text-cosmic-silver/70">
                      Last activity: {formatDate(system.lastActivity)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-cosmic-silver/30 text-cosmic-silver hover:bg-cosmic-silver/10"
                    >
                      Continue Learning
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </Card>
  );
};

export default ProgressTracker;
