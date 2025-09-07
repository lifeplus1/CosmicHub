import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@cosmichub/ui';
import { 
  Award,
  BookOpen,
  CheckCircle,
  Users,
  Star,
  Play,
  FileText,
  Calendar,
  Target,
  TrendingUp,
  Briefcase,
  Video,
  PenTool
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { 
  CertificationProgram,
  StudentProgress,
  CertificationPortalProps
} from '../../types/certification.types';

const CERTIFICATION_PROGRAMS: CertificationProgram[] = [
  {
    id: 'sgwp-foundation',
    title: 'Sacred Geometry Wellness Practitioner - Foundation',
    level: 'foundation',
    category: 'practitioner',
    duration: '16 weeks',
    credits: 32,
    price: 1299,
    description: 'Comprehensive introduction to using sacred geometry in therapeutic and wellness settings. Learn the fundamental principles, practical applications, and ethical considerations.',
    prerequisites: [],
    learningOutcomes: [
      'Understand fundamental sacred geometry principles',
      'Apply geometric patterns for stress reduction and wellness',
      'Recognize cultural contexts and ethical considerations',
      'Design basic geometric meditation practices',
      'Interpret client responses to geometric visualizations'
    ],
    modules: [
      {
        id: 'sg-history',
        title: 'History and Cultural Context of Sacred Geometry',
        duration: '2 weeks',
        type: 'video',
        description: 'Explore the origins and cultural significance of sacred geometric patterns across civilizations.'
      },
      {
        id: 'sg-mathematics',
        title: 'Mathematical Foundations',
        duration: '2 weeks',
        type: 'video',
        description: 'Learn the mathematical principles underlying sacred geometric patterns.'
      },
      {
        id: 'sg-psychology',
        title: 'Psychology of Geometric Perception',
        duration: '2 weeks',
        type: 'reading',
        description: 'Understand how the human brain processes and responds to geometric patterns.'
      },
      {
        id: 'sg-wellness-apps',
        title: 'Wellness Applications',
        duration: '3 weeks',
        type: 'video',
        description: 'Practical methods for integrating sacred geometry into wellness practices.'
      },
      {
        id: 'sg-ethics',
        title: 'Cultural Sensitivity and Ethics',
        duration: '2 weeks',
        type: 'reading',
        description: 'Navigate cultural appropriation concerns and establish ethical practice guidelines.'
      },
      {
        id: 'sg-practicum',
        title: 'Guided Practice Sessions',
        duration: '3 weeks',
        type: 'practicum',
        description: 'Hands-on experience conducting geometric wellness sessions with supervision.'
      },
      {
        id: 'sg-assessment',
        title: 'Final Assessment',
        duration: '2 weeks',
        type: 'assignment',
        description: 'Comprehensive evaluation of knowledge and practical skills.'
      }
    ],
    instructors: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Prof. Lisa Martinez'],
    nextCohort: '2025-10-15',
    enrollmentDeadline: '2025-10-01',
    format: 'online',
    accreditation: ['International Association of Wellness Practitioners', 'American Holistic Health Association'],
    testimonials: [
      {
        id: 'test-1',
        name: 'Jennifer Walsh',
        title: 'Wellness Coach',
        organization: 'Mindful Healing Center',
        content: 'This certification transformed my practice. My clients are experiencing deeper relaxation and stress relief than ever before.',
        rating: 5,
        date: '2025-08-15'
      }
    ]
  },
  {
    id: 'crm-advanced',
    title: 'Consciousness Research Methods - Advanced',
    level: 'advanced',
    category: 'researcher',
    duration: '12 weeks',
    credits: 24,
    price: 1899,
    description: 'Advanced research methodology certification for studying consciousness and sacred geometry interactions. Includes statistical analysis, experimental design, and publication preparation.',
    prerequisites: ['Basic research methodology', 'Statistics knowledge', 'IRB certification'],
    learningOutcomes: [
      'Design rigorous consciousness research studies',
      'Analyze EEG and biometric data from geometric meditation',
      'Apply appropriate statistical methods to consciousness data',
      'Prepare research for academic publication',
      'Navigate ethical considerations in consciousness research'
    ],
    modules: [
      {
        id: 'cr-design',
        title: 'Experimental Design for Consciousness Studies',
        duration: '2 weeks',
        type: 'video',
        description: 'Learn to design controlled studies of consciousness phenomena.'
      },
      {
        id: 'cr-biometrics',
        title: 'Biometric Data Collection and Analysis',
        duration: '3 weeks',
        type: 'video',
        description: 'Master EEG, HRV, and other biometric measurement techniques.'
      },
      {
        id: 'cr-statistics',
        title: 'Statistical Analysis for Consciousness Research',
        duration: '3 weeks',
        type: 'assignment',
        description: 'Apply specialized statistical methods to consciousness research data.'
      },
      {
        id: 'cr-publication',
        title: 'Academic Publication and Peer Review',
        duration: '2 weeks',
        type: 'reading',
        description: 'Navigate the academic publication process for consciousness research.'
      },
      {
        id: 'cr-project',
        title: 'Independent Research Project',
        duration: '2 weeks',
        type: 'practicum',
        description: 'Complete an original research study under faculty supervision.'
      }
    ],
    instructors: ['Dr. Elena Vasquez', 'Dr. Sarah Chen', 'Prof. David Kim'],
    nextCohort: '2025-11-01',
    enrollmentDeadline: '2025-10-15',
    format: 'hybrid',
    accreditation: ['Association for Consciousness Research', 'International Consciousness Research Consortium'],
    testimonials: [
      {
        id: 'test-2',
        name: 'Dr. James Patterson',
        title: 'Research Scientist',
        organization: 'University of Oregon',
        content: 'The research methods I learned here directly contributed to my successful NIH grant application.',
        rating: 5,
        date: '2025-07-20'
      }
    ]
  },
  {
    id: 'gfe-master',
    title: 'Geometric Frequency Educator - Master Level',
    level: 'master',
    category: 'educator',
    duration: '20 weeks',
    credits: 40,
    price: 2499,
    description: 'Master-level certification for training other practitioners and educators in sacred geometry and frequency healing methodologies.',
    prerequisites: ['SGWP Foundation Certification', '2+ years practice experience'],
    learningOutcomes: [
      'Train and certify other practitioners',
      'Develop curriculum and educational materials',
      'Establish practice standards and ethical guidelines',
      'Lead community education programs',
      'Conduct advanced research and publish findings'
    ],
    modules: [
      {
        id: 'ge-pedagogy',
        title: 'Adult Learning and Sacred Geometry Pedagogy',
        duration: '3 weeks',
        type: 'video',
        description: 'Master effective teaching methods for sacred geometry principles.'
      },
      {
        id: 'ge-curriculum',
        title: 'Curriculum Development',
        duration: '4 weeks',
        type: 'assignment',
        description: 'Create comprehensive educational programs for various audiences.'
      },
      {
        id: 'ge-supervision',
        title: 'Practitioner Supervision and Mentoring',
        duration: '3 weeks',
        type: 'practicum',
        description: 'Learn to effectively supervise and mentor developing practitioners.'
      },
      {
        id: 'ge-business',
        title: 'Practice Management and Business Development',
        duration: '3 weeks',
        type: 'reading',
        description: 'Establish and manage successful sacred geometry practices.'
      },
      {
        id: 'ge-research',
        title: 'Advanced Research and Innovation',
        duration: '4 weeks',
        type: 'practicum',
        description: 'Conduct original research and develop innovative applications.'
      },
      {
        id: 'ge-capstone',
        title: 'Master Practitioner Capstone',
        duration: '3 weeks',
        type: 'assignment',
        description: 'Comprehensive demonstration of master-level competencies.'
      }
    ],
    instructors: ['Dr. Sarah Chen', 'Prof. Lisa Martinez', 'Dr. Michael Rodriguez'],
    nextCohort: '2025-12-01',
    enrollmentDeadline: '2025-11-15',
    format: 'hybrid',
    accreditation: ['International Sacred Geometry Institute', 'Global Wellness Education Alliance'],
    testimonials: []
  }
];

const SAMPLE_PROGRESS: StudentProgress = {
  programId: 'sgwp-foundation',
  enrollmentDate: '2025-08-01',
  completionPercentage: 65,
  modulesCompleted: 4,
  totalModules: 7,
  currentModule: 'sg-ethics',
  estimatedCompletion: '2025-11-15',
  grades: [
    { moduleId: 'sg-history', score: 95, maxScore: 100, feedback: 'Excellent understanding of cultural contexts' },
    { moduleId: 'sg-mathematics', score: 88, maxScore: 100, feedback: 'Strong grasp of mathematical principles' },
    { moduleId: 'sg-psychology', score: 92, maxScore: 100, feedback: 'Insightful analysis of perceptual processes' },
    { moduleId: 'sg-wellness-apps', score: 89, maxScore: 100, feedback: 'Creative application ideas' }
  ]
};

export default function CertificationPortal({ 
  initialPrograms = CERTIFICATION_PROGRAMS,
  studentProgress: initialStudentProgress = SAMPLE_PROGRESS 
}: CertificationPortalProps = {}) {
  const [_selectedProgram, _setSelectedProgram] = useState<string | null>(null);
  const [_activeTab, _setActiveTab] = useState('programs');
  const [studentProgress, _setStudentProgress] = useState<StudentProgress | null>(initialStudentProgress);
  const { toast } = useToast();

  const handleEnroll = (programId: string) => {
    const program = initialPrograms.find(p => p.id === programId);
    toast({
      title: "Enrollment Initiated",
      description: `Starting enrollment process for ${program?.title}`,
      status: "info"
    });
  };

  const handleModuleAccess = (_moduleId: string) => {
    toast({
      title: "Module Access",
      description: "Opening module content in learning platform",
      status: "info"
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'foundation': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'master': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'practitioner': return <Briefcase className="w-4 h-4" />;
      case 'researcher': return <BookOpen className="w-4 h-4" />;
      case 'educator': return <Users className="w-4 h-4" />;
      case 'clinical': return <Target className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'assignment': return <PenTool className="w-4 h-4" />;
      case 'quiz': return <FileText className="w-4 h-4" />;
      case 'practicum': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="container p-6 mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Professional Certification Portal
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
          Advance your career with research-backed certifications in sacred geometry 
          wellness and consciousness research methodologies.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{initialPrograms.length}</div>
            <div className="text-sm text-gray-600">Programs Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-gray-600">Certified Practitioners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Student Progress (if enrolled) */}
      {studentProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Current Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sacred Geometry Wellness Practitioner - Foundation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enrolled: {new Date(studentProgress.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <Badge className="text-blue-800 bg-blue-100">
                {studentProgress.completionPercentage}% Complete
              </Badge>
            </div>

            <Progress value={studentProgress.completionPercentage} className="h-3" />

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="text-gray-500">Modules Completed:</span>
                <span className="ml-1 font-semibold">
                  {studentProgress.modulesCompleted}/{studentProgress.totalModules}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Current Module:</span>
                <span className="ml-1 font-semibold">{studentProgress.currentModule}</span>
              </div>
              <div>
                <span className="text-gray-500">Expected Completion:</span>
                <span className="ml-1 font-semibold">
                  {new Date(studentProgress.estimatedCompletion).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleModuleAccess(studentProgress.currentModule)}>
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Study Time
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certification Programs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Certification Programs
        </h2>
        
        <div className="grid gap-6">
          {initialPrograms.map((program) => (
            <Card key={program.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                      {getCategoryIcon(program.category)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{program.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getLevelColor(program.level)}>
                          {program.level}
                        </Badge>
                        <Badge variant="outline">{program.category}</Badge>
                        <Badge variant="outline">{program.format}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${program.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {program.credits} CEUs
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {program.description}
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Program Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Next Cohort:</span>
                        <span>{new Date(program.nextCohort).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Enrollment Deadline:</span>
                        <span>{new Date(program.enrollmentDeadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Modules:</span>
                        <span>{program.modules.length}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold">Prerequisites</h4>
                    {program.prerequisites.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {program.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No prerequisites required</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Learning Outcomes</h4>
                  <ul className="space-y-1 text-sm">
                    {program.learningOutcomes.slice(0, 3).map((outcome, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-blue-500" />
                        {outcome}
                      </li>
                    ))}
                    {program.learningOutcomes.length > 3 && (
                      <li className="pl-5 text-xs text-gray-500">
                        +{program.learningOutcomes.length - 3} more outcomes
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Course Modules</h4>
                  <div className="grid gap-2">
                    {program.modules.slice(0, 4).map((module) => (
                      <div key={module.id} className="flex items-center gap-3 p-2 border rounded">
                        {getModuleIcon(module.type)}
                        <div className="flex-1">
                          <span className="text-sm font-medium">{module.title}</span>
                          <span className="ml-2 text-xs text-gray-500">({module.duration})</span>
                        </div>
                      </div>
                    ))}
                    {program.modules.length > 4 && (
                      <p className="pt-2 text-xs text-center text-gray-500">
                        +{program.modules.length - 4} more modules
                      </p>
                    )}
                  </div>
                </div>

                {program.accreditation.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Accreditation</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.accreditation.map((accred, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {accred}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {program.testimonials.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Student Testimonial</h4>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < (program.testimonials[0]?.rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="mb-2 text-sm italic">&ldquo;{program.testimonials[0]?.content}&rdquo;</p>
                      <p className="text-xs text-gray-600">
                        — {program.testimonials[0]?.name}, {program.testimonials[0]?.title} at {program.testimonials[0]?.organization}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => handleEnroll(program.id)}>
                    Enroll Now
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Syllabus
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Info Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
