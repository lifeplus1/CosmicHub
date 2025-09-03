import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cosmichub/ui/src/components/ui/Card';
import { Badge } from '@cosmichub/ui/src/components/ui/Badge';
import { Button } from '@cosmichub/ui/src/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cosmichub/ui/src/components/ui/Tabs';
import { Progress } from '@cosmichub/ui/src/components/ui/Progress';
import { Alert, AlertDescription } from '@cosmichub/ui/src/components/ui/Alert';
import { Info, Brain, Heart, Users, Lightbulb } from 'lucide-react';
import type { UIMBTIResult, UIEnneagramResult, UICognitiveFunction } from '@cosmichub/types';

interface PsychologyTabProps {
  birthData: any;
  chartData: any;
}

const PsychologyTab: React.FC<PsychologyTabProps> = ({ birthData, chartData }) => {
  const [mbtiResult, setMbtiResult] = useState<UIMBTIResult | null>(null);
  const [enneagramResult, setEnneagramResult] = useState<UIEnneagramResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chartData) {
      calculatePsychologyProfiles();
    }
  }, [chartData]);

  const calculatePsychologyProfiles = async () => {
    setLoading(true);
    try {
      // This would connect to your backend API
      const response = await fetch('/api/psychology/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData, chartData })
      });
      
      const data = await response.json();
      setMbtiResult(data.mbti);
      setEnneagramResult(data.enneagram);
    } catch (error) {
      console.error('Error calculating psychology profiles:', error);
      // For demo purposes, set mock data
      setMbtiResult(getMockMBTIResult());
      setEnneagramResult(getMockEnneagramResult());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Brain className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-muted-foreground">Analyzing psychological patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cultural Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational Exploration:</strong> This analysis explores correlations between 
          Jungian archetypes, Enneagram wisdom, and astrological patterns. For accurate psychological 
          assessment, consult qualified professionals. This honors both psychological validity and 
          spiritual authenticity.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mbti">MBTI Analysis</TabsTrigger>
          <TabsTrigger value="enneagram">Enneagram</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mbtiResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    MBTI Correlation
                  </CardTitle>
                  <CardDescription>
                    Jungian cognitive functions through astrological lens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {mbtiResult.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(mbtiResult.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <h3 className="font-semibold">{mbtiResult.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mbtiResult.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {mbtiResult.cognitive_functions.map((func, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {func.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {enneagramResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Enneagram Correlation
                  </CardTitle>
                  <CardDescription>
                    Core motivations and fears through cosmic patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        Type {enneagramResult.core_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(enneagramResult.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <h3 className="font-semibold">Core Type {enneagramResult.core_type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {enneagramResult.core_motivation}
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">Core Motivation:</span> {enneagramResult.core_motivation}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Core Fear:</span> {enneagramResult.core_fear}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mbti" className="space-y-4">
          {mbtiResult && <MBTIDetailedView result={mbtiResult} />}
        </TabsContent>

        <TabsContent value="enneagram" className="space-y-4">
          {enneagramResult && <EnneagramDetailedView result={enneagramResult} />}
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          {mbtiResult && enneagramResult && (
            <IntegrationView mbti={mbtiResult} enneagram={enneagramResult} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Detailed MBTI View Component
const MBTIDetailedView: React.FC<{ result: UIMBTIResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{result.type}: {result.title}</CardTitle>
          <CardDescription>{result.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Cognitive Functions</h4>
              <div className="grid grid-cols-2 gap-2">
                {result.cognitive_functions.map((func, idx) => (
                  <Badge key={idx} variant={idx < 2 ? "default" : "secondary"}>
                    {func.name}
                  </Badge>
                ))}
              </div>
              <ul className="mt-3 space-y-2">
                {result.cognitive_functions.map((func: UICognitiveFunction, idx: number) => (
                  <li key={idx} className="mb-2">
                    {idx + 1}. {func.name} {idx < 2 ? "(Dominant)" : "(Supporting)"}
                    {func.description && (
                      <div className="text-sm text-muted-foreground ml-4">
                        {func.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Dimensional Analysis</h4>
              <div className="space-y-3">
                {Object.entries(result.dimension_scores).map(([dimension, score]) => (
                  <div key={dimension} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {dimension === 'extroversion' ? 'E/I' : 
                         dimension === 'intuition' ? 'N/S' :
                         dimension === 'thinking' ? 'T/F' : 'J/P'}: 
                        {score > 0.5 ? 
                          (dimension === 'extroversion' ? ' Extraverted' :
                           dimension === 'intuition' ? ' Intuitive' :
                           dimension === 'thinking' ? ' Thinking' : ' Judging') :
                          (dimension === 'extroversion' ? ' Introverted' :
                           dimension === 'intuition' ? ' Sensing' :
                           dimension === 'thinking' ? ' Feeling' : ' Perceiving')
                        }
                      </span>
                      <span>{(score * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {result.astrological_themes && (
              <div>
                <h4 className="font-semibold mb-2">Astrological Correlations</h4>
                <p className="text-sm text-muted-foreground">
                  {result.astrological_themes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Detailed Enneagram View Component
const EnneagramDetailedView: React.FC<{ result: UIEnneagramResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Type {result.core_type}: {result.type_name}</CardTitle>
          <CardDescription>{result.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Core Motivation</h4>
                <p className="text-sm">{result.core_motivation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Core Fear</h4>
                <p className="text-sm">{result.core_fear}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Type Correlations</h4>
              <div className="space-y-2">
                {result.top_three_types.map(([typeNum, score]: [number, number], idx: number) => (
                  <div key={typeNum} className="flex items-center justify-between">
                    <span className="text-sm">
                      Type {typeNum} {idx === 0 ? "(Primary)" : idx === 1 ? "(Secondary)" : "(Tertiary)"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={score * 100} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground w-12">
                        {(score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Astrological Indicators</h4>
              <ul className="space-y-1">
                {result.astrological_indicators?.map((indicator, idx: number) => (
                  <li key={idx} className="text-sm">
                    {indicator.aspect} {indicator.planet} in {indicator.sign} (House {indicator.house}): {indicator.influence}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Integration View Component
const IntegrationView: React.FC<{ mbti: UIMBTIResult; enneagram: UIEnneagramResult }> = ({ 
  mbti, enneagram 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Integrated Personality Profile
          </CardTitle>
          <CardDescription>
            Synthesis of MBTI cognitive patterns and Enneagram motivational patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Cognitive Pattern</h4>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {mbti.type}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {mbti.title} - {mbti.cognitive_functions.slice(0,2).map(f => f.name).join(", ")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Motivational Pattern</h4>
                <Badge variant="outline" className="text-base px-3 py-1">
                  Type {enneagram.core_type}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {enneagram.type_name}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Integration Insights
              </h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  Your <strong>{mbti.type}</strong> cognitive pattern combined with 
                  <strong> Type {enneagram.core_type}</strong> motivational drives suggests:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>
                    Primary information processing through {mbti.cognitive_functions[0]?.name} 
                    ({getCognitiveFunctionDescription(mbti.cognitive_functions[0]?.name || "")})
                  </li>
                  <li>
                    Core motivation driven by {enneagram.core_motivation.toLowerCase()}
                  </li>
                  <li>
                    Growth opportunities in balancing {mbti.cognitive_functions[2]?.name} and 
                    addressing {enneagram.core_fear.toLowerCase()}
                  </li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> This correlation explores archetypal patterns between 
                psychological systems and astrology. Use this as a starting point for 
                self-reflection, not as definitive personality assessment. Professional 
                guidance recommended for deeper personality work.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for cognitive function descriptions
const getCognitiveFunctionDescription = (func: string): string => {
  const descriptions: { [key: string]: string } = {
    "Ni": "Introverted Intuition - Pattern recognition and future insights",
    "Ne": "Extraverted Intuition - Exploring possibilities and connections", 
    "Si": "Introverted Sensing - Past experience and detailed memory",
    "Se": "Extraverted Sensing - Present moment awareness and adaptability",
    "Ti": "Introverted Thinking - Logical analysis and understanding",
    "Te": "Extraverted Thinking - Organizing and systematizing the external world",
    "Fi": "Introverted Feeling - Personal values and authentic emotions",
    "Fe": "Extraverted Feeling - Harmonizing and connecting with others"
  };
  return descriptions[func] || "Unknown function";
};

// Mock data functions for development
const getMockMBTIResult = (): UIMBTIResult => ({
  type: "INFP",
  title: "The Mediator",
  description: "Poetic, kind and altruistic people, always eager to help a good cause.",
  cognitive_functions: [
    { name: "Fi", description: "Introverted Feeling - Personal values and authentic emotions" },
    { name: "Ne", description: "Extraverted Intuition - Exploring possibilities and connections" },
    { name: "Si", description: "Introverted Sensing - Past experience and detailed memory" },
    { name: "Te", description: "Extraverted Thinking - Organizing and systematizing the external world" }
  ],
  scores: {},
  dimension_scores: {
    extroversion: 0.3,
    intuition: 0.7,
    thinking: 0.4,
    judging: 0.2
  },
  astrological_themes: "Often correlates with Pisces/Cancer emphasis, Venus-Neptune aspects",
  confidence: 0.75
});

const getMockEnneagramResult = (): UIEnneagramResult => ({
  core_type: 4,
  primary_type: {
    number: 4,
    name: "The Individualist",
    description: "Sensitive, withdrawn, expressive, dramatic, self-absorbed, and temperamental.",
    core_motivation: "To find themselves and their significance—to create identity",
    core_fear: "Of having no identity or personal significance",
    healthy_traits: [],
    average_traits: [],
    unhealthy_traits: []
  },
  type_name: "The Individualist",
  description: "Sensitive, withdrawn, expressive, dramatic, self-absorbed, and temperamental.",
  core_motivation: "To find themselves and their significance—to create identity",
  core_fear: "Of having no identity or personal significance",
  scores: {},
  top_three_types: [[4, 0.8], [9, 0.6], [2, 0.4]],
  astrological_indicators: [
    { aspect: "conjunction", planet: "Neptune", sign: "Pisces", house: 12, influence: "Enhanced intuitive and mystical qualities" },
    { aspect: "trine", planet: "Moon", sign: "Cancer", house: 8, influence: "Deep emotional sensitivity" },
    { aspect: "square", planet: "Venus", sign: "Scorpio", house: 8, influence: "Complex relationship with identity and beauty" }
  ],
  confidence: 0.8
});

export default PsychologyTab;
