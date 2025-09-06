import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaComment,
  FaReply,
  FaHeart,
  FaFlag,
  FaUser,
  FaClock,
} from 'react-icons/fa';
import { useAuth } from '@cosmichub/auth';
import { EducationalTooltip } from './EducationalTooltip';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorBoundary
} from '@cosmichub/ui';

// Enhanced type definitions with descriptive annotations
interface CommentAuthor {
  /** The display name of the comment author */
  name: string;
  /** The email address of the comment author */
  email: string;
  /** Optional avatar URL for the author */
  avatar?: string;
}

interface Comment {
  /** Unique identifier for the comment */
  id: string;
  /** The text content of the comment */
  content: string;
  /** Author information for the comment */
  author: CommentAuthor;
  /** ISO timestamp when the comment was created */
  timestamp: string;
  /** Number of likes the comment has received */
  likes: number;
  /** Array of reply comments */
  replies: Comment[];
  /** Whether the current user has liked this comment */
  isLiked: boolean;
  /** ID of the post this comment belongs to */
  postId: string;
}

interface BlogCommentsProps {
  /** The unique identifier of the blog post */
  postId: string;
}

// Type for comment submission state
type CommentSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// Mock comments data - in a real app, this would come from your backend
const mockComments: Comment[] = [
  {
    id: '1',
    content:
      'This is such an insightful post about Moon signs! I never realized how much my Cancer Moon influences my emotional responses. Thank you for explaining it so clearly, Christopher!',
    author: {
      name: 'Luna Rodriguez',
      email: 'luna@example.com',
    },
    timestamp: '2025-01-16T10:30:00Z',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        content:
          'I agree! The part about emotional security really resonated with me as a fellow Cancer Moon.',
        author: {
          name: 'Sarah Chen',
          email: 'sarah@example.com',
        },
        timestamp: '2025-01-16T11:15:00Z',
        likes: 2,
        isLiked: false,
        replies: [],
        postId: '1',
      },
    ],
    postId: '1',
  },
  {
    id: '2',
    content:
      'As a Scorpio Moon, I found the description spot-on. The intensity and need for transformation is so real. Would love to see a follow-up post about Moon signs in relationships!',
    author: {
      name: 'Marcus Johnson',
      email: 'marcus@example.com',
    },
    timestamp: '2025-01-15T16:45:00Z',
    likes: 8,
    isLiked: true,
    replies: [],
    postId: '1',
  },
];

const BlogComments: React.FC<BlogCommentsProps> = React.memo(function BlogComments({ postId }) {
  const { user } = useAuth();

  // Enhanced state management with descriptive types
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [submissionState, setSubmissionState] = useState<CommentSubmissionState>('idle');

  // New state for reply form with enhanced typing
  const [replyFormState, setReplyFormState] = useState<{
    isOpen: boolean;
    parentId: string | null;
    content: string;
  }>({
    isOpen: false,
    parentId: null,
    content: '',
  });

  // Load comments effect with better error handling
  useEffect(() => {
    const loadComments = (): void => {
      try {
        // Simulate API call with proper typing
        const filteredComments = mockComments.filter((comment: Comment) => comment.postId === postId);
        setComments(filteredComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
        // In a real app, you might want to show an error state
      }
    };

    loadComments();
  }, [postId]);

  // Memoized utility function for performance
  const formatRelativeTime = useMemo(() => (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  }, []);

  // Enhanced event handlers with better type annotations
  const handleSubmitComment = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmissionState('submitting');

    try {
      // Simulate API call with proper error handling
      await new Promise(resolve => setTimeout(resolve, 1000));

      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          name: user.email?.split('@')[0] ?? 'Anonymous',
          email: user.email ?? 'anonymous@example.com',
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: [],
        postId,
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setSubmissionState('success');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setSubmissionState('error');
    }
  }, [newComment, user, postId]);

  const handleSubmitReply = useCallback(async (commentId: string): Promise<void> => {
    if (!replyFormState.content.trim() || !user) return;

    setReplyFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const reply: Comment = {
        id: `${commentId}-${Date.now()}`,
        content: replyFormState.content.trim(),
        author: {
          name: user.email?.split('@')[0] ?? 'Anonymous',
          email: user.email ?? 'anonymous@example.com',
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: [],
        postId,
      };

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [reply, ...comment.replies] }
            : comment
        )
      );

      setReplyFormState({ isOpen: false, parentId: null, content: '' });
    } catch (error) {
      console.error('Failed to submit reply:', error);
      setReplyFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [replyFormState.content, user, postId]);

  const handleLikeComment = useCallback((
    commentId: string,
    isReply = false,
    parentId?: string
  ) => {
    if (!user) return;

    if (isReply && parentId) {
      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        likes: reply.isLiked
                          ? reply.likes - 1
                          : reply.likes + 1,
                        isLiked: !reply.isLiked,
                      }
                    : reply
                ),
              }
            : comment
        )
      );
    } else {
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked,
              }
            : comment
        )
      );
    }
  }, [user]);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  const CommentItem: React.FC<{
    comment: Comment;
    isReply?: boolean;
    parentId?: string;
  }> = React.memo(function CommentItem({ comment, isReply = false, parentId }) {
    return (
    <div
      className={`${isReply ? 'ml-8 border-l-2 border-cosmic-silver/20 pl-4' : ''} mb-6`}
    >
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 rounded-full bg-cosmic-silver/20 flex items-center justify-center flex-shrink-0'>
          <FaUser className='text-cosmic-silver/60 w-4 h-4' />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='font-medium text-cosmic-gold'>
              {comment.author.name}
            </span>
            <span className='text-xs text-cosmic-silver/60 flex items-center gap-1'>
              <FaClock className='w-3 h-3' />
              {formatRelativeTime(comment.timestamp)}
            </span>
          </div>

          <p className='text-cosmic-silver/90 mb-3 leading-relaxed'>
            {comment.content}
          </p>

          <div className='flex items-center gap-4 text-sm'>
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              onKeyDown={(e) => handleKeyDown(e, () => handleLikeComment(comment.id, isReply, parentId))}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                comment.isLiked
                  ? 'text-red-400 bg-red-400/10'
                  : 'text-cosmic-silver/60 hover:text-red-400 hover:bg-red-400/10'
              }`}
              disabled={!user}
              aria-label={`${comment.isLiked ? 'Unlike' : 'Like'} comment by ${comment.author.name}`}
              tabIndex={0}
            >
              <FaHeart className='w-3 h-3' />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && user && (
              <button
                onClick={() =>
                  setReplyFormState(prev => ({
                    ...prev,
                    isOpen: prev.parentId === comment.id ? false : true,
                    parentId: prev.parentId === comment.id ? null : comment.id,
                    content: prev.parentId === comment.id ? '' : prev.content,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, () => setReplyFormState(prev => ({
                  ...prev,
                  isOpen: prev.parentId === comment.id ? false : true,
                  parentId: prev.parentId === comment.id ? null : comment.id,
                  content: prev.parentId === comment.id ? '' : prev.content,
                })))}
                className='flex items-center gap-1 px-2 py-1 text-cosmic-silver/60 hover:text-cosmic-gold hover:bg-cosmic-gold/10 rounded transition-colors'
                aria-label={`Reply to ${comment.author.name}'s comment`}
                tabIndex={0}
              >
                <FaReply className='w-3 h-3' />
                Reply
              </button>
            )}

            <button className='flex items-center gap-1 px-2 py-1 text-cosmic-silver/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors'>
              <FaFlag className='w-3 h-3' />
              Report
            </button>
          </div>

          {replyFormState.isOpen && replyFormState.parentId === comment.id && (
            <form
              onSubmit={e => {
                e.preventDefault();
                void handleSubmitReply(comment.id);
              }}
              className='mt-4 space-y-3'
            >
                            <textarea
                value={replyFormState.content}
                onChange={e => setReplyFormState(prev => ({ ...prev, content: e.target.value }))}
                placeholder='Share your cosmic wisdom in response...'
                className='w-full px-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50 resize-none'
                rows={3}
                disabled={submissionState === 'submitting'}
              />
              <div className='flex items-center justify-between mt-3'>
                <button
                  type='button'
                  onClick={() => setReplyFormState({ isOpen: false, parentId: null, content: '' })}
                  className='px-4 py-2 text-cosmic-silver/60 hover:text-cosmic-silver transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={!replyFormState.content.trim() || submissionState === 'submitting'}
                  className='px-6 py-2 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                >
                  {submissionState === 'submitting' ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}

          {comment.replies.length > 0 && (
            <div className='mt-4'>
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    );
  });

  return (
    <ErrorBoundary>
      <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20 mt-12">
        <CardHeader className="border-b border-cosmic-gold/10">
          <CardTitle className="text-2xl font-bold text-cosmic-gold font-cinzel flex items-center gap-3">
            <FaComment className="text-cosmic-gold" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {user ? (
            <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/30">
              <CardContent className="p-6">
                <form
                  onSubmit={e => {
                    void handleSubmitComment(e);
                  }}
                  className='space-y-4'
                >
                  <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center flex-shrink-0 shadow-lg'>
                      <FaUser className='text-cosmic-gold w-5 h-5' />
                    </div>
                    <div className='flex-1 space-y-4'>
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder='Share your thoughts on this cosmic insight...'
                        className='w-full px-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50 resize-none transition-all'
                        rows={4}
                        disabled={submissionState === 'submitting'}
                      />
                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-cosmic-silver/60'>
                          ✨ Be respectful and constructive in your cosmic discussions
                        </p>
                        <Button
                          type='submit'
                          disabled={!newComment.trim() || submissionState === 'submitting'}
                          variant="cosmic"
                          size="lg"
                          className="px-8 py-3 font-semibold"
                        >
                          {submissionState === 'submitting' ? '✨ Posting...' : '🚀 Post Comment'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-cosmic-blue/30 bg-cosmic-blue/10">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <FaComment className="text-cosmic-blue text-4xl mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-cosmic-gold mb-2">Join the Cosmic Conversation</h4>
                  <p className='text-cosmic-silver/80'>
                    Sign in to share your thoughts and connect with fellow cosmic explorers.
                  </p>
                </div>
                <EducationalTooltip
                  title='Join the Community'
                  description='Sign in to comment, like posts, and connect with other cosmic explorers.'
                >
                  <Button
                    onClick={() => (window.location.href = '/login')}
                    variant="outline"
                    className="px-6 py-3"
                  >
                    🌟 Sign In to Comment
                  </Button>
                </EducationalTooltip>
              </CardContent>
            </Card>
          )}

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <Card className="border-cosmic-silver/20 bg-cosmic-dark/20">
              <CardContent className="p-8 text-center">
                <FaComment className='text-cosmic-silver/40 text-4xl mx-auto mb-4' />
                <h4 className="text-lg font-semibold text-cosmic-gold mb-2">No Comments Yet</h4>
                <p className='text-cosmic-silver/60'>
                  Be the first to share your cosmic insights on this post!
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
});

export default BlogComments;
