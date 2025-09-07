/**
 * Research Dashboard - Academic Research Platform Entry Point
 * 
 * This component serves as the main hub for research activities, partnerships,
 * and academic collaboration within the CosmicHub platform.
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@cosmichub/ui';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Database,
  Microscope,
  Brain,
  Target,
  FileText,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

interface ResearchProject {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'completed' | 'published';
  institution: string;
  principalInvestigator: string;
  startDate: string;
  endDate?: string;
  progress: number;
  participants: number;
  dataPoints: number;
  publications?: string[];
  tags: string[];
}

interface AcademicPartner {
  id: string;
  name: string;
  institution: string;
  department: string;
  specialization: string[];
  collaborationLevel: 'exploratory' | 'active' | 'strategic';
  joinDate: string;
  projects: string[];
}

interface ResearchMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: 'consciousness-geometry-001',
    title: 'Sacred Geometry Patterns in Consciousness States',
    status: 'active',
    institution: 'UC Santa Barbara - Institute for Interdisciplinary Studies',
    principalInvestigator: 'Dr. Sarah Chen',
    startDate: '2025-08-15',
    progress: 35,
    participants: 127,
    dataPoints: 3420,
    tags: ['consciousness', 'eeg', 'sacred-geometry', 'meditation']
  },
  {
    id: 'biometric-response-002',
    title: 'Biometric Responses to Geometric Visualizations',
    status: 'planning',
    institution: 'California Institute of Integral Studies (CIIS)',
    principalInvestigator: 'Dr. Michael Rodriguez',
    startDate: '2025-10-01',
    progress: 15,
    participants: 0,
    dataPoints: 0,
    tags: ['hrv', 'biometrics', 'visualization', 'wellness']
  },
  {
    id: 'frequency-healing-003',
    title: 'Frequency-Based Healing Validation Study',
    status: 'active',
    institution: 'Institute of Noetic Sciences (IONS)',
    principalInvestigator: 'Dr. Elena Vasquez',
    startDate: '2025-07-01',
    progress: 68,
    participants: 89,
    dataPoints: 2156,
    tags: ['frequency', 'healing', 'clinical-trial', 'sound-therapy']
  }
];

const ACADEMIC_PARTNERS: AcademicPartner[] = [
  {
    id: 'chen-ucsb',
    name: 'Dr. Sarah Chen',
    institution: 'UC Santa Barbara',
    department: 'Institute for Interdisciplinary Studies',
    specialization: ['consciousness studies', 'neuroscience', 'meditation research'],
    collaborationLevel: 'strategic',
    joinDate: '2025-06-15',
    projects: ['consciousness-geometry-001']
  },
  {
    id: 'rodriguez-ciis',
    name: 'Dr. Michael Rodriguez',
    institution: 'California Institute of Integral Studies',
    department: 'Psychology Department',
    specialization: ['biometric analysis', 'visualization therapy', 'wellness research'],
    collaborationLevel: 'active',
    joinDate: '2025-07-20',
    projects: ['biometric-response-002']
  },
  {
    id: 'vasquez-ions',
    name: 'Dr. Elena Vasquez',
    institution: 'Institute of Noetic Sciences',
    department: 'Consciousness Research',
    specialization: ['frequency healing', 'sound therapy', 'clinical research'],
    collaborationLevel: 'strategic',
    joinDate: '2025-05-10',
    projects: ['frequency-healing-003']
  },
  {
    id: 'haramein-rsf',
    name: 'Dr. Nassim Haramein',
    institution: 'Resonance Science Foundation',
    department: 'Unified Physics',
    specialization: ['sacred geometry', 'unified field theory', 'consciousness physics'],
    collaborationLevel: 'exploratory',
    joinDate: '2025-08-01',
    projects: []
  }
];

const RESEARCH_METRICS: ResearchMetric[] = [
  {
    name: 'Active Participants',
    value: 216,
    unit: 'users',
    trend: 'up',
    description: 'Users actively participating in research studies'
  },
  {
    name: 'Data Points Collected',
    value: 5576,
    unit: 'measurements',
    trend: 'up',
    description: 'Total biometric and behavioral data points'
  },
  {
    name: 'Research Papers',
    value: 3,
    unit: 'publications',
    trend: 'stable',
    description: 'Published research papers citing CosmicHub data'
  },
  {
    name: 'Academic Partners',
    value: 4,
    unit: 'institutions',
    trend: 'up',
    description: 'University and research institute partnerships'
  }
];

export default function ResearchDashboard() {
  const [_selectedProject, _setSelectedProject] = useState<string | null>(null);
  const { toast } = useToast();

  const handleJoinResearch = (_projectId: string) => {
    toast({
      title: "Research Participation",
      description: "Thank you for your interest! Our research team will contact you within 24 hours.",
      status: "info",
    });
  };

  const handleContactPartner = (partnerId: string) => {
    const partner = ACADEMIC_PARTNERS.find(p => p.id === partnerId);
    toast({
      title: "Contact Request Sent", 
      description: `A collaboration request has been sent to ${partner?.name}.`,
      status: "success",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Research Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Bridging ancient wisdom with modern consciousness research through 
          academic partnerships and scientific validation.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {RESEARCH_METRICS.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.name}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{metric.unit}</p>
                </div>
                <div className={`text-${metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}-500`}>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Active Projects</TabsTrigger>
          <TabsTrigger value="partners">Academic Partners</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Research Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Current Research Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Consciousness Studies</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    EEG analysis during sacred geometry meditation sessions
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Biometric Responses</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    HRV and stress markers during frequency therapy
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Pattern Recognition</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI analysis of geometric pattern preferences and outcomes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Research Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Publication in Journal of Consciousness Studies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    &ldquo;Sacred Geometry Visualizations and Altered States of Consciousness&rdquo; - September 2025
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Partnership with UC Santa Barbara</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Strategic collaboration established for consciousness research initiatives
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                  <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Open Dataset Release</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    First anonymized dataset of biometric responses to geometric patterns published
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6">
            {RESEARCH_PROJECTS.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.institution} • PI: {project.principalInvestigator}
                      </p>
                    </div>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 
                               project.status === 'completed' ? 'secondary' : 'outline'}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Participants:</span>
                      <span className="ml-1 font-semibold">{project.participants}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Points:</span>
                      <span className="ml-1 font-semibold">{project.dataPoints.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <span className="ml-1 font-semibold">{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinResearch(project.id)}
                      disabled={project.status !== 'active'}
                    >
                      Join Research
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="grid gap-6">
            {ACADEMIC_PARTNERS.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partner.institution} • {partner.department}
                      </p>
                    </div>
                    <Badge 
                      variant={partner.collaborationLevel === 'strategic' ? 'default' : 
                               partner.collaborationLevel === 'active' ? 'secondary' : 'outline'}
                    >
                      {partner.collaborationLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.specialization.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Active Projects</h4>
                    {partner.projects.length > 0 ? (
                      <div className="space-y-1">
                        {partner.projects.map((projectId) => {
                          const project = RESEARCH_PROJECTS.find(p => p.id === projectId);
                          return (
                            <p key={projectId} className="text-sm text-gray-600 dark:text-gray-400">
                              • {project?.title ?? projectId}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No active projects</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleContactPartner(partner.id)}
                    >
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Certification Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Sacred Geometry Wellness Practitioner</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Comprehensive certification program for using sacred geometry in therapeutic settings.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>16 weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credits:</span>
                      <span>32 CEUs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Cohort:</span>
                      <span>October 15, 2025</span>
                    </div>
                  </div>
                  <Button>Apply Now</Button>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Consciousness Research Methods</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Research methodology certification for studying consciousness and sacred geometry.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>12 weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credits:</span>
                      <span>24 CEUs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Cohort:</span>
                      <span>November 1, 2025</span>
                    </div>
                  </div>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
