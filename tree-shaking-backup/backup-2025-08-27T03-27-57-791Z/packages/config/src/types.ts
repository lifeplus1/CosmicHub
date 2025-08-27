  name: string;
  price: number;
  features: string[];
  limits: {
    chartsPerMonth: number;
    healwaveMinutes: number;
  };
}

  defaultChartStyle: 'western' | 'vedic';
  notifications: {
    email: boolean;
    push: boolean;
  };
}
