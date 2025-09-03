/**
 * LEARNING PATH VIEWER
 * 
 * Displays comprehensive educational curricula for spiritual systems
 * with progressive disclosure and personalized recommendations.
 * Implements AI #5 requirements for complete educational curricula.
 */

import React, { useState, useCallback } from 'react';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { 
  FaGraduationCap, 
  FaPlay, 
  FaLock, 
  FaCheckCircle,
  FaClock,
  FaStar,
  FaBook,
  FaMedal,
  FaEye,
  FaTree,
  FaGem,
  FaHeart,
  FaSun,
  FaMoon,
  FaChevronDown
} from 'react-icons/fa';

interface LearningPathViewerProps {
  userId: string;
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'reading' | 'practice' | 'assessment';
  isCompleted: boolean;
  isLocked: boolean;
  description?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isCompleted: boolean;
  completedLessons: number;
  totalLessons: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  icon: React.ComponentType<{ className?: string }>;
  modules: Module[];
  prerequisites: string[];
  isRecommended?: boolean;
}

const LearningPathViewer: React.FC<LearningPathViewerProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [expandedModule, setExpandedModule] = useState<string>('');

  // Mock learning paths data - would come from backend
  const learningPaths: LearningPath[] = [
    {
      id: 'tarot-foundations',
      title: 'Tarot Foundations',
      description: 'Complete introduction to Tarot reading with traditional meanings and spreads',
      level: 'beginner',
      estimatedHours: 20,
      icon: FaEye,
      isRecommended: true,
      prerequisites: [],
      modules: [
        {
          id: 'module-1',
          title: 'The Major Arcana',
          description: 'Learn the 22 major cards and their spiritual significance',
          isCompleted: true,
          completedLessons: 8,
          totalLessons: 8,
          lessons: [
            { id: 'lesson-1', title: 'The Fool\'s Journey', duration: 30, type: 'video', isCompleted: true, isLocked: false },
            { id: 'lesson-2', title: 'The Magician & High Priestess', duration: 45, type: 'video', isCompleted: true, isLocked: false },
            { id: 'lesson-3', title: 'The Empress & Emperor', duration: 40, type: 'video', isCompleted: true, isLocked: false },
            { id: 'lesson-4', title: 'Major Arcana Practice', duration: 25, type: 'practice', isCompleted: true, isLocked: false }
          ]
        },
        {
          id: 'module-2',
          title: 'The Minor Arcana',
          description: 'Understanding the four suits and their meanings',
          isCompleted: false,
          completedLessons: 2,
          totalLessons: 6,
          lessons: [
            { id: 'lesson-5', title: 'Wands - Fire Energy', duration: 35, type: 'video', isCompleted: true, isLocked: false },
            { id: 'lesson-6', title: 'Cups - Water Energy', duration: 35, type: 'video', isCompleted: true, isLocked: false },
            { id: 'lesson-7', title: 'Swords - Air Energy', duration: 35, type: 'video', isCompleted: false, isLocked: false },
            { id: 'lesson-8', title: 'Pentacles - Earth Energy', duration: 35, type: 'video', isCompleted: false, isLocked: true }
          ]
        }
      ]
    },
    {
      id: 'kabbalah-tree',
      title: 'Kabbalah & Tree of Life',
      description: 'Sacred geometry and mystical correspondences of the Tree of Life',
      level: 'intermediate',
      estimatedHours: 35,
      icon: FaTree,
      prerequisites: ['tarot-foundations'],
      modules: [
        {
          id: 'kabbalah-1',
          title: 'Tree Structure',
          description: 'Understanding the 10 Sephirot and 22 paths',
          isCompleted: false,
          completedLessons: 0,
          totalLessons: 8,
          lessons: [
            { id: 'k-lesson-1', title: 'The Four Worlds', duration: 45, type: 'reading', isCompleted: false, isLocked: false }
          ]
        }
      ]
    },
    {
      id: 'human-design-intro',
      title: 'Human Design Fundamentals',
      description: 'Your energetic blueprint for authentic living',
      level: 'beginner',
      estimatedHours: 15,
      icon: FaGem,
      prerequisites: [],
      modules: [
        {
          id: 'hd-1',
          title: 'Your Type & Strategy',
          description: 'Discover your Human Design Type and decision-making strategy',
          isCompleted: false,
          completedLessons: 0,
          totalLessons: 5,
          lessons: [
            { id: 'hd-lesson-1', title: 'The Five Types', duration: 30, type: 'video', isCompleted: false, isLocked: false }
          ]
        }
      ]
    }
  ];

  const handleStartLesson = useCallback((lessonId: string) => {
    console.log('Starting lesson:', lessonId);
    // Would navigate to lesson content
  }, []);

  const handleSelectPath = useCallback((path: LearningPath) => {
    setSelectedPath(path);
    setExpandedModule(path.modules[0]?.id || '');
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-cosmic-silver';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return FaPlay;
      case 'reading': return FaBook;
      case 'practice': return FaStar;
      case 'assessment': return FaMedal;
      default: return FaBook;
    }
  };

  if (selectedPath) {
    return (
      <div className="space-y-6">
        
        {/* Back Button & Path Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setSelectedPath(null)}
            variant="secondary"
          >
            ← Back to Paths
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-cosmic-purple/20 rounded-full flex items-center justify-center">
                <selectedPath.icon className="text-2xl text-cosmic-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cosmic-gold">{selectedPath.title}</h1>
                <p className="text-cosmic-silver/70">{selectedPath.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-sm font-semibold ${getLevelColor(selectedPath.level)}`}>
                    {selectedPath.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-cosmic-silver/70 flex items-center gap-1">
                    <FaClock /> {selectedPath.estimatedHours} hours
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="bg-cosmic-dark/30 rounded-lg p-4">
              <div className="flex justify-between text-sm text-cosmic-silver/70 mb-2">
                <span>Overall Progress</span>
                <span>
                  {Math.round(
                    (selectedPath.modules.reduce((acc, module) => acc + module.completedLessons, 0) /
                     selectedPath.modules.reduce((acc, module) => acc + module.totalLessons, 0)) * 100
                  )}%
                </span>
              </div>
              <div className="w-full bg-cosmic-dark/50 rounded-full h-2">
                <div 
                  className="bg-cosmic-gold h-2 rounded-full transition-all duration-300"
                  data-width={`${
                    (selectedPath.modules.reduce((acc, module) => acc + module.completedLessons, 0) /
                     selectedPath.modules.reduce((acc, module) => acc + module.totalLessons, 0)) * 100
                  }%`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Modules */}
        <Card title="Course Modules">
          <div className="p-6">
            <Accordion.Root 
              type="single" 
              value={expandedModule} 
              onValueChange={setExpandedModule}
            >
              {selectedPath.modules.map((module, moduleIndex) => (
                <Accordion.Item key={module.id} value={module.id}>
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-center justify-between p-4 hover:bg-cosmic-purple/10 rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          module.isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-cosmic-purple/20 text-cosmic-silver'
                        }`}>
                          {module.isCompleted ? (
                            <FaCheckCircle />
                          ) : (
                            <span className="text-sm font-bold">{moduleIndex + 1}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-cosmic-silver">{module.title}</h3>
                          <p className="text-sm text-cosmic-silver/70">{module.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-cosmic-gold">
                              {module.completedLessons}/{module.totalLessons} lessons
                            </span>
                            {module.isCompleted && (
                              <FaMedal className="text-xs text-golden-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <FaChevronDown className="text-cosmic-silver/50 transition-transform duration-200" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  
                  <Accordion.Content className="px-4 pb-4">
                    <div className="ml-12 space-y-2">
                      {module.lessons.map((lesson) => {
                        const IconComponent = getTypeIcon(lesson.type);
                        
                        return (
                          <div 
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              lesson.isLocked 
                                ? 'bg-cosmic-dark/20 opacity-50' 
                                : 'bg-cosmic-dark/30 hover:bg-cosmic-dark/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`text-sm ${
                                lesson.isCompleted 
                                  ? 'text-green-500' 
                                  : lesson.isLocked 
                                    ? 'text-cosmic-silver/30'
                                    : 'text-cosmic-gold'
                              }`}>
                                {lesson.isCompleted ? (
                                  <FaCheckCircle />
                                ) : lesson.isLocked ? (
                                  <FaLock />
                                ) : (
                                  <IconComponent />
                                )}
                              </div>
                              <div>
                                <h4 className="text-cosmic-silver font-medium">{lesson.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-cosmic-silver/70">
                                  <FaClock />
                                  <span>{lesson.duration} min</span>
                                  <span className="capitalize">{lesson.type}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!lesson.isLocked && !lesson.isCompleted && (
                                <Button 
                                  onClick={() => handleStartLesson(lesson.id)}
                                >
                                  Start
                                </Button>
                              )}
                              {lesson.isCompleted && (
                                <Button 
                                  variant="secondary"
                                  onClick={() => handleStartLesson(lesson.id)}
                                >
                                  Review
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cosmic-gold mb-4">Learning Paths</h1>
        <p className="text-cosmic-silver/80 max-w-2xl mx-auto">
          Choose your spiritual development journey with structured curricula 
          designed for authentic growth and understanding.
        </p>
      </div>

      {/* Path Categories */}
      <Tabs.Root 
        value={activeTab} 
        onValueChange={(value: string) => setActiveTab(value)}
      >
        <Tabs.List className="flex flex-wrap gap-2 p-2 bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl">
          <Tabs.Trigger 
            value="recommended"
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'recommended' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            Recommended for You
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="beginner"
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'beginner' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            Beginner
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="intermediate"
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'intermediate' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            Intermediate
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="advanced"
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'advanced' 
                ? 'bg-cosmic-gold text-cosmic-dark' 
                : 'text-cosmic-silver hover:bg-cosmic-purple/20'
            }`}
          >
            Advanced
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="recommended">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.filter(path => path.isRecommended).map((path) => (
              <Card key={path.id} className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center">
                      <path.icon className="text-xl text-cosmic-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cosmic-silver">{path.title}</h3>
                      <span className={`text-xs font-semibold ${getLevelColor(path.level)}`}>
                        {path.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-cosmic-silver/70 mb-4 line-clamp-2">
                    {path.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-cosmic-silver/70 mb-4">
                    <span className="flex items-center gap-1">
                      <FaClock /> {path.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBook /> {path.modules.length} modules
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectPath(path)}
                  >
                    Start Learning
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="beginner">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.filter(path => path.level === 'beginner').map((path) => (
              <Card key={path.id} className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center">
                      <path.icon className="text-xl text-cosmic-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cosmic-silver">{path.title}</h3>
                      <span className={`text-xs font-semibold ${getLevelColor(path.level)}`}>
                        {path.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-cosmic-silver/70 mb-4">
                    {path.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-cosmic-silver/70 mb-4">
                    <span className="flex items-center gap-1">
                      <FaClock /> {path.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBook /> {path.modules.length} modules
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectPath(path)}
                  >
                    Start Learning
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="intermediate">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.filter(path => path.level === 'intermediate').map((path) => (
              <Card key={path.id} className="cursor-pointer hover:bg-cosmic-purple/10 transition-colors">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center">
                      <path.icon className="text-xl text-cosmic-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cosmic-silver">{path.title}</h3>
                      <span className={`text-xs font-semibold ${getLevelColor(path.level)}`}>
                        {path.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-cosmic-silver/70 mb-4">
                    {path.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-cosmic-silver/70 mb-4">
                    <span className="flex items-center gap-1">
                      <FaClock /> {path.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBook /> {path.modules.length} modules
                    </span>
                  </div>
                  
                  {path.prerequisites.length > 0 ? (
                    <Button className="w-full" disabled>
                      Prerequisites Required
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleSelectPath(path)}
                    >
                      Start Learning
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="advanced">
          <div className="text-center py-12">
            <FaGraduationCap className="text-6xl text-cosmic-gold/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cosmic-silver mb-2">
              Advanced Paths Coming Soon
            </h3>
            <p className="text-cosmic-silver/70">
              Master-level curricula are being developed for advanced practitioners.
            </p>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default LearningPathViewer;
