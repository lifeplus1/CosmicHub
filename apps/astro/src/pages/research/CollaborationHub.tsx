import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@cosmichub/ui';
import { 
  Users,
  MessageSquare,
  Calendar,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { 
  Institution,
  Researcher,
  Message,
  CollaborationHubProps
} from '../../types/collaboration.types';

const INSTITUTIONS: Institution[] = [
  {
    id: 'ucsb',
    name: 'UC Santa Barbara',
    type: 'university',
    location: 'Santa Barbara, CA',
    website: 'https://www.ucsb.edu',
    collaborationLevel: 'strategic',
    establishedDate: '2025-06-15',
    focus: ['consciousness studies', 'neuroscience', 'interdisciplinary research'],
    activeProjects: 3,
    totalPublications: 12
  },
  {
    id: 'ciis',
    name: 'California Institute of Integral Studies',
    type: 'university',
    location: 'San Francisco, CA',
    website: 'https://www.ciis.edu',
    collaborationLevel: 'active',
    establishedDate: '2025-07-20',
    focus: ['integral psychology', 'consciousness research', 'transformative studies'],
    activeProjects: 2,
    totalPublications: 8
  },
  {
    id: 'ions',
    name: 'Institute of Noetic Sciences',
    type: 'research_institute',
    location: 'Petaluma, CA',
    website: 'https://www.noetic.org',
    collaborationLevel: 'strategic',
    establishedDate: '2025-05-10',
    focus: ['consciousness research', 'extended human capacities', 'worldview transformation'],
    activeProjects: 4,
    totalPublications: 15
  },
  {
    id: 'rsf',
    name: 'Resonance Science Foundation',
    type: 'foundation',
    location: 'Hawaii, HI',
    website: 'https://www.resonancescience.org',
    collaborationLevel: 'discussing',
    focus: ['unified physics', 'sacred geometry', 'consciousness studies'],
    activeProjects: 1,
    totalPublications: 6
  }
];

const RESEARCHERS: Researcher[] = [
  {
    id: 'chen-sarah',
    name: 'Dr. Sarah Chen',
    title: 'Professor of Consciousness Studies',
    institution: 'UC Santa Barbara',
    department: 'Institute for Interdisciplinary Studies',
    email: 'schen@ucsb.edu',
    phone: '+1 (805) 893-2345',
    specializations: ['consciousness neuroscience', 'meditation research', 'EEG analysis'],
    hIndex: 42,
    citationCount: 3240,
    activeProjects: ['consciousness-geometry-001', 'eeg-meditation-study'],
    collaborationStatus: 'lead',
    lastContact: '2025-09-05'
  },
  {
    id: 'rodriguez-michael',
    name: 'Dr. Michael Rodriguez',
    title: 'Associate Professor of Psychology',
    institution: 'California Institute of Integral Studies',
    department: 'Psychology Department',
    email: 'mrodriguez@ciis.edu',
    specializations: ['biometric analysis', 'visualization therapy', 'wellness research'],
    hIndex: 28,
    citationCount: 1890,
    activeProjects: ['biometric-response-002'],
    collaborationStatus: 'active',
    lastContact: '2025-09-04'
  },
  {
    id: 'vasquez-elena',
    name: 'Dr. Elena Vasquez',
    title: 'Senior Research Scientist',
    institution: 'Institute of Noetic Sciences',
    department: 'Consciousness Research Division',
    email: 'evasquez@noetic.org',
    specializations: ['frequency healing', 'sound therapy', 'clinical research'],
    hIndex: 35,
    citationCount: 2750,
    activeProjects: ['frequency-healing-003', 'sound-consciousness-study'],
    collaborationStatus: 'advisor',
    lastContact: '2025-09-06'
  }
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    from: 'Dr. Sarah Chen',
    to: 'CosmicHub Research Team',
    subject: 'EEG Data Analysis Results - Week 12',
    content: 'The latest EEG analysis shows remarkable consistency in theta wave patterns during sacred geometry meditation sessions. Preliminary results suggest a 73% correlation between geometric resonance and meditative depth.',
    timestamp: '2025-09-06T09:30:00Z',
    type: 'update',
    isRead: false
  },
  {
    id: 'msg-002',
    from: 'Dr. Michael Rodriguez',
    to: 'CosmicHub Research Team', 
    subject: 'Biometric Integration Proposal',
    content: 'I would like to propose integrating additional biometric sensors (skin conductance, temperature) into our geometric visualization study. This could provide deeper insights into physiological responses.',
    timestamp: '2025-09-05T14:15:00Z',
    type: 'proposal',
    isRead: true
  },
  {
    id: 'msg-003',
    from: 'Dr. Elena Vasquez',
    to: 'CosmicHub Research Team',
    subject: 'Conference Presentation Opportunity',
    content: 'The International Conference on Consciousness Research has invited us to present our frequency healing validation study. The presentation would be in November 2025.',
    timestamp: '2025-09-04T16:45:00Z',
    type: 'invitation',
    isRead: true
  }
];

export default function CollaborationHub({ 
  initialInstitutions = INSTITUTIONS,
  initialResearchers = RESEARCHERS,
  initialMessages = SAMPLE_MESSAGES 
}: CollaborationHubProps = {}) {
  const [_selectedInstitution, _setSelectedInstitution] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [unreadMessages, _setUnreadMessages] = useState(initialMessages.filter(m => !m.isRead).length);
  const { toast } = useToast();

  const filteredInstitutions = initialInstitutions.filter(inst => 
    (filterType === 'all' || inst.collaborationLevel === filterType) &&
    (searchTerm === '' || inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inst.focus.some(f => f.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleContactResearcher = (researcherId: string) => {
    const researcher = initialResearchers.find(r => r.id === researcherId);
    toast({
      title: "Contact Initiated",
      description: `Opening communication channel with ${researcher?.name}`,
      status: "info"
    });
  };

  const handleScheduleMeeting = (institutionId: string) => {
    const institution = initialInstitutions.find(i => i.id === institutionId);
    toast({
      title: "Meeting Scheduled",
      description: `Meeting request sent to ${institution?.name}`,
      status: "success"
    });
  };

  const getCollaborationLevelColor = (level: string) => {
    switch (level) {
      case 'strategic': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'discussing': return 'bg-yellow-100 text-yellow-800';
      case 'prospective': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstitutionTypeIcon = (type: string) => {
    switch (type) {
      case 'university': return <BookOpen className="h-4 w-4" />;
      case 'research_institute': return <Award className="h-4 w-4" />;
      case 'medical_center': return <Briefcase className="h-4 w-4" />;
      case 'foundation': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Collaboration Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage academic partnerships and research collaborations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Partnership
          </Button>
          <Button size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages {unreadMessages > 0 && `(${unreadMessages})`}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{initialInstitutions.length}</div>
            <div className="text-sm text-gray-600">Partner Institutions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{initialResearchers.length}</div>
            <div className="text-sm text-gray-600">Active Researchers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {initialInstitutions.reduce((sum, inst) => sum + inst.activeProjects, 0)}
            </div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {initialInstitutions.reduce((sum, inst) => sum + inst.totalPublications, 0)}
            </div>
            <div className="text-sm text-gray-600">Publications</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search institutions or focus areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
                title="Filter by collaboration level"
              >
                <option value="all">All Levels</option>
                <option value="strategic">Strategic</option>
                <option value="active">Active</option>
                <option value="discussing">Discussing</option>
                <option value="prospective">Prospective</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInstitutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {getInstitutionTypeIcon(institution.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{institution.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {institution.location}
                    </p>
                  </div>
                </div>
                <Badge className={getCollaborationLevelColor(institution.collaborationLevel)}>
                  {institution.collaborationLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Research Focus</h4>
                <div className="flex flex-wrap gap-2">
                  {institution.focus.map((focus) => (
                    <Badge key={focus} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Active Projects:</span>
                  <span className="ml-1 font-semibold">{institution.activeProjects}</span>
                </div>
                <div>
                  <span className="text-gray-500">Publications:</span>
                  <span className="ml-1 font-semibold">{institution.totalPublications}</span>
                </div>
              </div>

              {institution.establishedDate && (
                <div className="text-sm">
                  <span className="text-gray-500">Partnership since:</span>
                  <span className="ml-1 font-semibold">
                    {new Date(institution.establishedDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm"
                  onClick={() => handleScheduleMeeting(institution.id)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Meeting
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit Website
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Researchers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Key Researchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {initialResearchers.map((researcher) => (
              <div key={researcher.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{researcher.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {researcher.title} • {researcher.institution}
                    </p>
                    <p className="text-xs text-gray-500">{researcher.department}</p>
                  </div>
                  <Badge 
                    className={
                      researcher.collaborationStatus === 'lead' ? 'bg-purple-100 text-purple-800' :
                      researcher.collaborationStatus === 'active' ? 'bg-green-100 text-green-800' :
                      researcher.collaborationStatus === 'advisor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {researcher.collaborationStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">H-Index:</span>
                    <span className="ml-1 font-semibold">{researcher.hIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Citations:</span>
                    <span className="ml-1 font-semibold">{researcher.citationCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Projects:</span>
                    <span className="ml-1 font-semibold">{researcher.activeProjects.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Contact:</span>
                    <span className="ml-1 font-semibold">
                      {new Date(researcher.lastContact).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-sm mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {researcher.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleContactResearcher(researcher.id)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  {researcher.phone && (
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                  {researcher.profileUrl && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initialMessages.map((message) => (
              <div 
                key={message.id} 
                className={`border rounded-lg p-4 ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{message.subject}</h4>
                    <p className="text-xs text-gray-500">
                      From: {message.from} • {new Date(message.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant="outline"
                      className={
                        message.type === 'proposal' ? 'border-purple-300 text-purple-700' :
                        message.type === 'update' ? 'border-blue-300 text-blue-700' :
                        message.type === 'invitation' ? 'border-green-300 text-green-700' :
                        'border-gray-300 text-gray-700'
                      }
                    >
                      {message.type}
                    </Badge>
                    {!message.isRead && (
                      <Badge className="bg-red-100 text-red-800">New</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message.content}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm">Reply</Button>
                  <Button size="sm" variant="outline">Mark as Read</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
