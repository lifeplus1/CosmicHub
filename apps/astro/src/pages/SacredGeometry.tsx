import React, { useCallback, useMemo } from 'react';
import { SacredGeometryDemo } from '../components/demos/SacredGeometryDemo';
import DomainPageFrame from '../components/layout/DomainPageFrame';
import { safeParseDomainPageFrameProps, type DomainPageFramePropsType } from '../schemas';
import { logger } from '@cosmichub/config';

/**
 * Sacred Geometry page props interface with enhanced type validation
 */
interface SacredGeometryPageProps {
  /** Optional class name for custom styling */
  className?: string;
  /** Test ID for component testing */
  'data-testid'?: string;
}

/**
 * Sacred Geometry visualization page component
 * Implements unified type validation strategy with Zod schemas
 * 
 * @component
 * @example
 * ```tsx
 * <SacredGeometryPage data-testid="sacred-geometry-page" />
 * ```
 */
const SacredGeometryPage: React.FC<SacredGeometryPageProps> = ({ 
  className, 
  'data-testid': testId 
}) => {
  // Optimized refresh handler with useCallback
  const handleRefresh = useCallback(() => {
    logger.info('Sacred Geometry page refresh triggered', { source: 'user' });
    window.location.reload();
  }, []);

  // Memoized and validated DomainPageFrame props
  const domainPageFrameProps = useMemo<DomainPageFramePropsType>(() => {
    const props = {
      title: 'Sacred Geometry Visualization',
      onRefresh: handleRefresh,
      isRefreshing: false,
      error: null,
      className,
      'data-testid': testId,
      'aria-label': 'Sacred Geometry Visualization Interface',
      children: null, // Will be overridden with actual content
    };

    // Validate props using Zod schema
    const validation = safeParseDomainPageFrameProps(props);
    
    if (!validation.success) {
      logger.error('DomainPageFrame props validation failed', {
        errors: validation.error.errors,
        props,
      });
      // Return safe defaults if validation fails
      return {
        title: 'Sacred Geometry Visualization',
        onRefresh: handleRefresh,
        isRefreshing: false,
        error: null,
        children: null,
      };
    }

    return validation.data;
  }, [handleRefresh, className, testId]);

  return (
    <DomainPageFrame {...domainPageFrameProps}>
      <div 
        className="min-h-screen bg-gray-950"
        role="main"
        aria-label="Sacred Geometry Visualization Interface"
      >
        <SacredGeometryDemo />
      </div>
    </DomainPageFrame>
  );
};

// Apply React.memo for performance optimization
const MemoizedSacredGeometryPage = React.memo(SacredGeometryPage);
MemoizedSacredGeometryPage.displayName = 'SacredGeometryPage';

export default MemoizedSacredGeometryPage;
