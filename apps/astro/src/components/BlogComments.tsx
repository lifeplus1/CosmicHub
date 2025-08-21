import React, { useState, useEffect } from 'react';
import { FaComment, FaReply, FaHeart, FaFlag, FaUser, FaClock } from 'react-icons/fa';
import { useAuth } from '@cosmichub/auth';
import { EducationalTooltip } from './EducationalTooltip';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
  postId: string;
}

interface BlogCommentsProps {
  postId: string;
  // postTitle removed (unused)
}

// Mock comments data - in a real app, this would come from your backend
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'This is such an insightful post about Moon signs! I never realized how much my Cancer Moon influences my emotional responses. Thank you for explaining it so clearly, Christopher!',
    author: {
      name: 'Luna Rodriguez',
      email: 'luna@example.com'
    },
    timestamp: '2025-01-16T10:30:00Z',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        content: 'I agree! The part about emotional security really resonated with me as a fellow Cancer Moon.',
        author: {
          name: 'Sarah Chen',
          email: 'sarah@example.com'
        },
        timestamp: '2025-01-16T11:15:00Z',
        likes: 2,
        isLiked: false,
        replies: [],
        postId: '1'
      }
    ],
    postId: '1'
  },
  {
    id: '2',
    content: 'As a Scorpio Moon, I found the description spot-on. The intensity and need for transformation is so real. Would love to see a follow-up post about Moon signs in relationships!',
    author: {
      name: 'Marcus Johnson',
      email: 'marcus@example.com'
    },
    timestamp: '2025-01-15T16:45:00Z',
    likes: 8,
    isLiked: true,
    replies: [],
    postId: '1'
  }
];

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading comments from API
    setComments(mockComments.filter(c => c.postId === postId));
  }, [postId]);

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
  name: user.email?.split('@')[0] ?? 'Anonymous',
  email: user.email ?? 'anonymous@example.com'
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
      postId
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setLoading(false);
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim() || !user) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reply: Comment = {
      id: `${commentId}-${Date.now()}`,
      content: replyText,
      author: {
  name: user.email?.split('@')[0] ?? 'Anonymous',
  email: user.email ?? 'anonymous@example.com'
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
      postId
    };

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [reply, ...comment.replies] }
        : comment
    ));
    
    setReplyText('');
    setReplyingTo(null);
    setLoading(false);
  };

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (!user) return;

    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? { 
                      ...reply, 
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                      isLiked: !reply.isLiked 
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(prev => prev.map(comment => 
        comment.id === commentId
          ? { 
              ...comment, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked 
            }
          : comment
      ));
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean; parentId?: string }> = ({ 
    comment, 
    isReply = false, 
    parentId 
  }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-cosmic-silver/20 pl-4' : ''} mb-6`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-cosmic-silver/20 flex items-center justify-center flex-shrink-0">
          <FaUser className="text-cosmic-silver/60 w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-cosmic-gold">{comment.author.name}</span>
            <span className="text-xs text-cosmic-silver/60 flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              {formatRelativeTime(comment.timestamp)}
            </span>
          </div>
          
          <p className="text-cosmic-silver/90 mb-3 leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                comment.isLiked 
                  ? 'text-red-400 bg-red-400/10' 
                  : 'text-cosmic-silver/60 hover:text-red-400 hover:bg-red-400/10'
              }`}
              disabled={!user}
            >
              <FaHeart className="w-3 h-3" />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>
            
            {!isReply && user && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 px-2 py-1 text-cosmic-silver/60 hover:text-cosmic-gold hover:bg-cosmic-gold/10 rounded transition-colors"
              >
                <FaReply className="w-3 h-3" />
                Reply
              </button>
            )}
            
            <button className="flex items-center gap-1 px-2 py-1 text-cosmic-silver/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
              <FaFlag className="w-3 h-3" />
              Report
            </button>
          </div>
          
          {replyingTo === comment.id && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmitReply(comment.id);
              }}
              className="mt-4 space-y-3"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50 resize-none"
                rows={3}
                disabled={loading}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!replyText.trim() || loading}
                  className="px-4 py-2 bg-cosmic-purple/30 text-cosmic-gold rounded-lg hover:bg-cosmic-purple/40 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Posting...' : 'Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-cosmic-silver/60 hover:text-cosmic-silver rounded-lg transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {comment.replies.length > 0 && (
            <div className="mt-4">
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

  return (
    <div className="mt-12 pt-8 border-t border-cosmic-silver/20">
      <div className="flex items-center gap-2 mb-6">
        <FaComment className="text-cosmic-gold" />
        <h3 className="text-xl font-bold text-cosmic-gold font-cinzel">
          Comments ({comments.length})
        </h3>
      </div>
      
      {user ? (
  <form onSubmit={(e) => { void handleSubmitComment(e); }} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cosmic-silver/20 flex items-center justify-center flex-shrink-0">
              <FaUser className="text-cosmic-silver/60 w-4 h-4" />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this cosmic insight..."
                className="w-full px-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50 resize-none"
                rows={4}
                disabled={loading}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-cosmic-silver/60">
                  Be respectful and constructive in your cosmic discussions.
                </p>
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading}
                  className="px-6 py-2 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-cosmic-blue/10 rounded-lg border border-cosmic-silver/10">
          <p className="text-cosmic-silver/80 mb-3">
            Join the cosmic conversation! Sign in to share your thoughts and connect with fellow seekers.
          </p>
          <EducationalTooltip
            title="Join the Community"
            description="Sign in to comment, like posts, and connect with other cosmic explorers."
          >
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-cosmic-purple/30 text-cosmic-gold rounded-lg hover:bg-cosmic-purple/40 transition-colors duration-200"
            >
              Sign In to Comment
            </button>
          </EducationalTooltip>
        </div>
      )}
      
      {comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaComment className="text-cosmic-silver/40 text-3xl mx-auto mb-3" />
          <p className="text-cosmic-silver/60">
            Be the first to share your cosmic insights on this post!
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogComments;
