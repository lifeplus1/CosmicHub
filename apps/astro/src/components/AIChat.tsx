import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@cosmichub/auth';
import { getAuthToken } from '../services/api';
import { useToast } from './ToastProvider';
import { apiConfig } from '../config/environment';
import { AI001Service } from '../services/ai-001-enhanced';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  ErrorBoundary,
} from '@cosmichub/ui';

interface ChatResponse {
  choices: { message: { content: string } }[];
}

interface ErrorResponseData {
  detail: string;
}

interface ErrorResponseWrapper {
  data: ErrorResponseData;
}

interface ErrorResponse {
  response: ErrorResponseWrapper;
}

interface AIFeatureOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const AIChat = React.memo(function AIChat(): React.ReactElement {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'chat' | 'ai001'>('chat');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { toast } = useToast();

  const ai001Features: AIFeatureOption[] = [
    {
      id: 'transits',
      name: 'Transit Predictions',
      description: 'AI-powered timing recommendations',
      icon: '🌟',
      enabled: true,
    },
    {
      id: 'growth',
      name: 'Growth Coaching',
      description: 'Personal development insights',
      icon: '🌱',
      enabled: true,
    },
    {
      id: 'synthesis',
      name: 'Multi-System Analysis',
      description: 'Cross-cultural astrological insights',
      icon: '🌍',
      enabled: true,
    },
    {
      id: 'patterns',
      name: 'Pattern Recognition',
      description: 'Advanced chart pattern analysis',
      icon: '🔮',
      enabled: true,
    },
  ];

  // Memoized event handlers for performance
  const handleChatModeClick = useCallback(() => {
    setAiMode('chat');
  }, []);

  const handleAI001ModeClick = useCallback(() => {
    setAiMode('ai001');
  }, []);

  const handleFeatureToggle = useCallback((featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  }, []);

  const handleFeatureKeyDown = useCallback((event: React.KeyboardEvent, featureId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFeatureToggle(featureId);
    }
  }, [handleFeatureToggle]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setError(null);

    if (
      message === null ||
      message === undefined ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      return;
    }

    try {
      const token = await getAuthToken();

      if (token === null || token === undefined || token.length === 0) {
        throw new Error('Authentication token is missing');
      }

      let chatResponse: ChatResponse;

      if (aiMode === 'ai001') {
        // Enhanced AI-001 processing
        const enhancedResponse =
          await AI001Service.generateComprehensiveAnalysis({
            chartData: {}, // Would need chart data from context
            userId: user?.uid ?? '',
            analysisType: 'comprehensive',
            preferences: {
              focusAreas: selectedFeatures,
            },
          });

        // Convert AI-001 response to chat format
        chatResponse = {
          choices: [
            {
              message: {
                content: `🚀 **AI-001 Enhanced Analysis**\n\n${enhancedResponse.summary}\n\n**Key Insights:**\n• ${enhancedResponse.transits.length} upcoming transits identified\n• ${enhancedResponse.growth.length} growth opportunities found\n• Multi-system synthesis: ${enhancedResponse.synthesis.commonThemes.join(', ')}\n• ${enhancedResponse.patterns.length} significant patterns detected`,
              },
            },
          ],
        };
      } else {
        // Standard chat processing
        const res = await axios.post(
          `${apiConfig.baseUrl}/chat`,
          { text: message },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          res?.data === null ||
          res?.data === undefined ||
          typeof res?.data !== 'object'
        ) {
          throw new Error('No response data received');
        }

        chatResponse = res.data as ChatResponse;
      }

      if (
        chatResponse === null ||
        chatResponse === undefined ||
        !Array.isArray(chatResponse.choices) ||
        chatResponse.choices.length === 0 ||
        chatResponse.choices[0] === null ||
        chatResponse.choices[0] === undefined ||
        typeof chatResponse.choices[0].message?.content !== 'string' ||
        chatResponse.choices[0].message.content.length === 0
      ) {
        throw new Error('Invalid response format');
      }

      setResponse(chatResponse);
      toast({
        title:
          aiMode === 'ai001' ? 'AI-001 Analysis Complete' : 'Response Received',
        description:
          aiMode === 'ai001'
            ? 'Advanced AI analysis has been generated successfully'
            : 'Your AI response has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Partial<ErrorResponse>;
      const errorMessage =
        err.response?.data?.detail ?? 'Failed to get response';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [message, aiMode, selectedFeatures, user?.uid, toast]);

  if (loading === true) {
    return (
      <div
        className='text-white'
        role='status'
        aria-label='Loading authentication'
      >
        Loading...
      </div>
    );
  }

  if (user === undefined || user === null || typeof user !== 'object') {
    return <Navigate to='/login' replace aria-label='Redirecting to login' />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark via-cosmic-purple/10 to-cosmic-blue/10 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20">
            <CardHeader className="text-center border-b border-cosmic-gold/10">
              <CardTitle className="text-3xl font-bold text-cosmic-gold font-cinzel mb-2">
                AI Astrology Chat
              </CardTitle>
              <p className="text-cosmic-silver/80 text-lg">
                Connect with advanced AI for personalized astrological insights
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* AI Mode Toggle */}
              <div className='flex justify-center gap-4 mb-6'>
                <Button
                  onClick={handleChatModeClick}
                  variant={aiMode === 'chat' ? 'cosmic' : 'outline'}
                  size="lg"
                  className="px-8 py-3"
                >
                  💬 Standard Chat
                </Button>
                <Button
                  onClick={handleAI001ModeClick}
                  variant={aiMode === 'ai001' ? 'cosmic' : 'outline'}
                  size="lg"
                  className="px-8 py-3"
                >
                  🚀 AI-001 Enhanced
                </Button>
              </div>

              {/* AI-001 Feature Selection */}
              {aiMode === 'ai001' && (
                <Card className='cosmic-glass border-cosmic-purple/30 mb-6'>
                  <CardHeader>
                    <CardTitle className='text-lg text-cosmic-gold'>
                      🚀 AI-001 Features
                    </CardTitle>
                    <p className='text-cosmic-silver/80 text-sm'>
                      Select advanced AI capabilities to include in your analysis
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {ai001Features.map(feature => (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureToggle(feature.id)}
                          onKeyDown={(e) => handleFeatureKeyDown(e, feature.id)}
                          aria-label={`${feature.name}: ${feature.description}`}
                          tabIndex={0}
                          className={`p-4 rounded-lg border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 group ${
                            selectedFeatures.includes(feature.id)
                              ? 'border-cosmic-gold bg-cosmic-gold/10 text-cosmic-gold shadow-lg shadow-cosmic-gold/20'
                              : 'border-cosmic-purple/30 bg-cosmic-purple/5 text-cosmic-silver hover:border-cosmic-purple/50 hover:bg-cosmic-purple/10'
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <span className='text-2xl group-hover:scale-110 transition-transform'>{feature.icon}</span>
                            <div>
                              <div className='font-semibold text-sm mb-1 group-hover:text-cosmic-gold transition-colors'>
                                {feature.name}
                              </div>
                              <div className='text-xs opacity-80'>
                                {feature.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className='text-center mb-6'>
                <p className='text-cosmic-silver/70 text-sm'>
                  {aiMode === 'chat'
                    ? 'Ask questions about your astrological chart'
                    : 'Get comprehensive AI-001 enhanced analysis with predictive insights'}
                </p>
              </div>

              {/* Input Section */}
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='ai-message-input'
                    className='block mb-3 text-cosmic-gold font-semibold'
                  >
                    Your {aiMode === 'ai001' ? 'Analysis Request' : 'Message'}
                  </label>
                  <textarea
                    id='ai-message-input'
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void =>
                      setMessage(e.target.value)
                    }
                    placeholder={
                      aiMode === 'ai001'
                        ? 'Request AI-001 enhanced analysis (e.g., "Analyze my upcoming year for growth opportunities")...'
                        : 'Ask about your chart...'
                    }
                    className='w-full p-4 text-white border rounded-lg resize-none bg-cosmic-dark/50 border-cosmic-gold/30 placeholder-cosmic-silver/60 focus:border-cosmic-gold focus:outline-none focus:ring-2 focus:ring-cosmic-gold/20 transition-all'
                    rows={4}
                    aria-describedby='ai-message-help'
                  />
                  <div
                    id='ai-message-help'
                    className='mt-2 text-sm text-cosmic-silver/70'
                  >
                    {aiMode === 'ai001'
                      ? 'Request comprehensive AI-001 analysis with predictive timing, growth coaching, and pattern recognition'
                      : 'Ask questions about your astrological chart or request interpretations'}
                  </div>
                </div>

                <Button
                  onClick={(): void => {
                    void handleSubmit();
                  }}
                  disabled={
                    message === null ||
                    message === undefined ||
                    typeof message !== 'string' ||
                    message.trim().length === 0
                  }
                  variant={aiMode === 'ai001' ? 'cosmic' : 'default'}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold"
                  aria-label={`Send message to ${aiMode === 'ai001' ? 'AI-001 enhanced' : 'AI'} chat`}
                >
                  {aiMode === 'ai001' ? '🚀 Generate AI-001 Analysis' : '💬 Send Message'}
                </Button>
              </div>

              {/* Error Display */}
              {error !== null &&
                error !== undefined &&
                typeof error === 'string' &&
                error.length > 0 && (
                  <Card className='border-red-500/30 bg-red-900/10'>
                    <CardContent className='p-4'>
                      <div className='text-red-400 font-medium' role='alert'>
                        ⚠️ {error}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Response Display */}
              {response !== null &&
                response !== undefined &&
                typeof response === 'object' &&
                Array.isArray(response.choices) &&
                response.choices.length > 0 &&
                response.choices[0] !== null &&
                response.choices[0] !== undefined &&
                typeof response.choices[0].message?.content === 'string' &&
                response.choices[0].message.content.length > 0 && (
                  <Card className='cosmic-glass border-cosmic-purple/30 shadow-lg shadow-cosmic-purple/20'>
                    <CardHeader>
                      <CardTitle className='text-lg text-cosmic-gold flex items-center gap-2'>
                        {aiMode === 'ai001'
                          ? '🚀 AI-001 Enhanced Response'
                          : '🤖 AI Response'}
                        {aiMode === 'ai001' && (
                          <Badge className='bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30'>
                            Next-Gen AI
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='text-cosmic-silver whitespace-pre-wrap leading-relaxed'>
                      {response.choices[0].message.content}
                    </CardContent>
                  </Card>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default AIChat;
