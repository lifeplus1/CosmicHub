/**
 * Adaptive UI Components for Spiritual AI
 * These components adapt their presentation based on user's spiritual level and learning progress
 */

import React from 'react';
import type { SpiritualLevel, LearningPath } from '../types/spiritual-types';
import {
  useSpiritualProfile,
  useLearningPath,
} from '../hooks/spiritual-ai-hooks';
import '../styles/adaptive-ui.css';

interface AdaptiveDashboardProps {
  userId: string;
  complexity?: 'minimal' | 'standard' | 'detailed';
}

interface PersonalizedWidgetProps {
  title: string;
  icon: string;
  content: React.ReactNode;
  spiritualLevel: SpiritualLevel;
  priority?: 'high' | 'medium' | 'low';
}

interface LearningProgressTrackerProps {
  learningPath: LearningPath;
  currentProgress: number;
}

interface SpiritualLevelBadgeProps {
  level: SpiritualLevel;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Adaptive Dashboard that changes layout and complexity based on user's spiritual level
 */
export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  userId,
  complexity = 'standard',
}) => {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useSpiritualProfile(userId);
  const { learningPath } = useLearningPath(userId);

  if (profileLoading) {
    return (
      <div className='adaptive-dashboard'>
        <div className='dashboard-header'>
          <div className='skeleton-text wide loading-shimmer'></div>
          <div className='skeleton-text medium loading-shimmer'></div>
        </div>
        <div className={`widgets-grid ${complexity}`}>
          {[1, 2, 3].map(i => (
            <div key={i} className='personalized-widget loading-shimmer'>
              <div className='skeleton-text wide'></div>
              <div className='skeleton-text medium'></div>
              <div className='skeleton-text narrow'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className='adaptive-dashboard'>
        <div className='error-message'>
          <span className='error-icon'>⚠️</span>
          Unable to load your spiritual profile. Please try again later.
        </div>
      </div>
    );
  }

  const getDashboardTitle = () => {
    switch (profile.spiritualLevel) {
      case 'beginner':
        return 'Welcome to Your Spiritual Journey';
      case 'intermediate':
        return 'Continuing Your Path of Growth';
      case 'advanced':
        return 'Deepening Your Practice';
      case 'master':
        return 'Sharing Divine Understanding';
      default:
        return 'Your Spiritual Dashboard';
    }
  };

  const getWidgets = () => {
    const widgets = [];

    // Daily practice widget (always shown)
    widgets.push(
      <PersonalizedWidget
        key='daily-practice'
        title="Today's Practice"
        icon='🧘'
        spiritualLevel={profile.spiritualLevel}
        content={
          <div>
            <p>Your personalized spiritual practice is ready</p>
            <ul>
              <li>Morning meditation (15 min)</li>
              <li>Mindfulness check-in</li>
              {complexity !== 'minimal' && <li>Evening reflection</li>}
              {complexity === 'detailed' && <li>Gratitude journaling</li>}
            </ul>
          </div>
        }
        priority='high'
      />
    );

    // Learning progress (shown for standard and detailed)
    if (complexity !== 'minimal' && learningPath) {
      widgets.push(
        <LearningProgressTracker
          key='progress'
          learningPath={learningPath}
          currentProgress={0.6} // Mock progress for now
        />
      );
    }

    // Spiritual insights (shown for detailed)
    if (complexity === 'detailed') {
      widgets.push(
        <PersonalizedWidget
          key='insights'
          title='Recent Insights'
          icon='💡'
          spiritualLevel={profile.spiritualLevel}
          content={
            <div>
              <p>Your inner wisdom is growing stronger each day.</p>
              <p>Practice patience - it opens doorways to understanding.</p>
              <p>Connection with nature enhances your spiritual awareness.</p>
            </div>
          }
          priority='medium'
        />
      );
    }

    // Recommended practices
    widgets.push(
      <PersonalizedWidget
        key='recommendations'
        title='Recommended for You'
        icon='⭐'
        spiritualLevel={profile.spiritualLevel}
        content={
          <ul>
            <li>Guided breathing meditation</li>
            <li>Walking meditation in nature</li>
            {complexity !== 'minimal' && <li>Chakra balancing exercise</li>}
            {complexity === 'detailed' && <li>Energy healing practice</li>}
          </ul>
        }
        priority='medium'
      />
    );

    return widgets;
  };

  return (
    <div className='adaptive-dashboard'>
      <div className='dashboard-header'>
        <h1 className='dashboard-title'>{getDashboardTitle()}</h1>
        <p className='dashboard-subtitle'>
          <SpiritualLevelBadge level={profile.spiritualLevel} showIcon />
          {profile.learningStage &&
            ` • ${profile.learningStage.replace('_', ' ')}`}
        </p>
      </div>

      <div className={`widgets-grid ${complexity}`}>{getWidgets()}</div>
    </div>
  );
};

/**
 * Personalized widget that adapts its presentation based on spiritual level
 */
export const PersonalizedWidget: React.FC<PersonalizedWidgetProps> = ({
  title,
  icon,
  content,
  priority = 'medium',
}) => {
  return (
    <div className={`personalized-widget priority-${priority}`}>
      <div className='widget-header'>
        <span className='widget-icon'>{icon}</span>
        <h3 className='widget-title'>{title}</h3>
      </div>
      <div className='widget-content'>{content}</div>
    </div>
  );
};

/**
 * Learning progress tracker with visual progress indicators
 */
export const LearningProgressTracker: React.FC<
  LearningProgressTrackerProps
> = ({ learningPath, currentProgress }) => {
  const progressPercentage = Math.round(currentProgress * 100);

  const getStageStatus = (index: number) => {
    const stageProgress = (index + 1) / learningPath.modules.length;
    if (currentProgress > stageProgress) return 'completed';
    if (currentProgress >= stageProgress - 0.1) return 'current';
    return 'upcoming';
  };

  return (
    <div className='learning-progress'>
      <div className='progress-header'>
        <h3 className='progress-title'>Learning Progress</h3>
        <span className='progress-percentage'>{progressPercentage}%</span>
      </div>

      <div className='progress-bar-container'>
        <div className='progress-bar' data-width={progressPercentage} />
      </div>

      <div className='progress-stages'>
        {learningPath.modules.slice(0, 4).map((module, index) => (
          <div
            key={module}
            className={`progress-stage ${getStageStatus(index)}`}
          >
            {module}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Spiritual level badge with appropriate styling
 */
export const SpiritualLevelBadge: React.FC<SpiritualLevelBadgeProps> = ({
  level,
  showIcon = true,
  size = 'medium',
}) => {
  const getIcon = () => {
    switch (level) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🌿';
      case 'advanced':
        return '🌳';
      case 'master':
        return '⭐';
      default:
        return '✨';
    }
  };

  const getDisplayName = () => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <span className={`spiritual-level-badge level-${level} size-${size}`}>
      {showIcon && <span className='badge-icon'>{getIcon()}</span>}
      {getDisplayName()}
    </span>
  );
};
