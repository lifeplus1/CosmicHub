  birthTime: string;
  birthPlace: string;
}

  chartId: string;
  userId: string;
  type: string; // e.g., 'natal', 'transit', 'synastry', 'composite'
  title: string;
  content: string;
  summary: string;
  tags: string[];
  confidence: number; // 0-1 confidence score
  createdAt: string;
  updatedAt: string;
}

  userId: string;
  type?: string;
  focus?: string[]; // Areas to focus on: planets, houses, aspects
}

  success: boolean;
  message?: string;
}

// AI Service types (inline for now)
  birthTime: string;
  birthLocation: string;
  interpretationType: 'general' | 'personality' | 'career' | 'relationships';
}

}

  code?: string;
  statusCode?: number;
}

// Modal component types
  isOpen: boolean;
  onClose: () => void;
}
