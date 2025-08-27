/**
 * Production Deployment Configuration
 * Comprehensive production setup with monitoring, security, and optimization
 */

import { getEnvVar } from './env';

// Deployment environment types
  url: string;
  apiUrl: string;
  cdn: string;
  database: DatabaseConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  errorTracking: ErrorTrackingConfig;
  analytics: AnalyticsConfig;
}

  port: number;
  database: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  queryTimeout: number;
  backup: BackupConfig;
}

  schedule: string;
  retention: number;
  storage: 'local' | 's3' | 'gcs';
  encryption: boolean;
}

  endpoint: string;
  apiKey: string;
  alerts: AlertConfig[];
  dashboards: DashboardConfig[];
  healthCheck: HealthCheckConfig;
}

  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  cooldown: number;
}

  metrics: string[];
  refreshInterval: number;
  timeRange: string;
}

  interval: number;
  timeout: number;
  endpoints: string[];
  criticalServices: string[];
}

  hsts: boolean;
  csp: ContentSecurityPolicyConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  firewall: FirewallConfig;
  secrets: SecretsConfig;
}

  directives: Record<string, string[]>;
  reportOnly: boolean;
  reportUri?: string;
}

  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

  allowedIPs: string[];
  blockedIPs: string[];
  geoBlocking: string[];
  ddosProtection: boolean;
}

  endpoint?: string;
  rotation: boolean;
  encryption: boolean;
}

  caching: CacheConfig;
  cdn: CDNConfig;
  optimization: OptimizationConfig;
  monitoring: PerformanceMonitoringConfig;
}

  redis: RedisConfig;
  strategies: CacheStrategyConfig[];
}

  port: number;
  password: string;
  database: number;
  maxRetries: number;
  retryDelay: number;
}

  ttl: number;
  invalidation: string[];
}

  provider: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'azure-cdn';
  endpoint: string;
  zones: CDNZoneConfig[];
}

  domains: string[];
  caching: {
    browser: number;
    edge: number;
  };
  compression: boolean;
  minification: boolean;
}

  treeshaking: boolean;
  codesplitting: boolean;
  lazyLoading: boolean;
  prefetching: boolean;
  serviceWorker: boolean;
}

  syntheticMonitoring: boolean;
  coreWebVitals: boolean;
  customMetrics: string[];
  budgets: PerformanceBudgetConfig[];
}

  threshold: number;
  action: 'warn' | 'error' | 'fail-build';
}

  provider: 'sentry' | 'bugsnag' | 'rollbar' | 'custom';
  dsn: string;
  environment: string;
  release: string;
  sampling: number;
  filters: ErrorFilterConfig[];
}

  pattern: string;
  action: string;
}

  providers: AnalyticsProviderConfig[];
  consent: ConsentConfig;
  privacy: PrivacyConfig;
}

export interface AnalyticsProviderConfig {
  name: string;
  id: string;
  config: Record<string, unknown>;
  events: string[];
}

  banner: boolean;
  categories: string[];
  storage: 'localStorage' | 'cookie' | 'session';
}

  doNotTrack: boolean;
  dataRetention: number;
  gdprCompliant: boolean;
}

// Production deployment manager

// Deployment interfaces
  skipMigrations?: boolean;
  skipTests?: boolean;
  rollback?: boolean;
  hotDeploy?: boolean;
}

  timestamp: Date;
  status: 'in-progress' | 'success' | 'failed';
  steps: DeploymentStep[];
  duration: number;
  error?: string;
  artifacts: string[];
}

  status: 'running' | 'success' | 'failed';
  startTime: number;
  endTime?: number;
  error?: string;
}

// Default production configurations
    },
    monitoring: {
      enabled: true,
      endpoint: 'https://monitoring.cosmichub.com',
      apiKey: getEnvVar('MONITORING_API_KEY', ''),
      alerts: [
        {
          name: 'High Error Rate',
          condition: 'error_rate > 5%',
          threshold: 5,
          severity: 'high',
          channels: ['slack', 'email'],
          cooldown: 300,
        },
      ],
      dashboards: [],
      healthCheck: {
        enabled: true,
        interval: 60,
        timeout: 10,
        endpoints: ['/health', '/api/status'],
        criticalServices: ['database', 'cache', 'api'],
      },
    },
    security: {
      https: true,
      hsts: true,
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", 'cdn-staging.cosmichub.com'],
          'style-src': ["'self'", 'cdn-staging.cosmichub.com'],
          'img-src': ["'self'", 'data:', 'cdn-staging.cosmichub.com'],
          'connect-src': ["'self'", 'api-staging.cosmichub.com'],
        },
        reportOnly: false,
        reportUri: '/csp-report',
      },
      cors: {
        enabled: true,
        origins: ['https://staging.cosmichub.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400,
      },
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      },
      firewall: {
        enabled: true,
        allowedIPs: [],
        blockedIPs: [],
        geoBlocking: [],
        ddosProtection: true,
      },
      secrets: {
        provider: 'env',
        rotation: false,
        encryption: true,
      },
    },
    performance: {
      compression: true,
      caching: {
        enabled: true,
        redis: {
          host: 'redis-staging.cosmichub.com',
          port: 6379,
          password: getEnvVar('REDIS_PASSWORD', ''),
          database: 0,
          maxRetries: 3,
          retryDelay: 1000,
        },
        strategies: [
          {
            pattern: '/api/v1/.*',
            ttl: 300,
            invalidation: ['POST', 'PUT', 'DELETE'],
          },
        ],
      },
      cdn: {
        enabled: true,
        provider: 'cloudflare',
        endpoint: 'https://cdn-staging.cosmichub.com',
        zones: [
          {
            name: 'staging',
            domains: ['staging.cosmichub.com'],
            caching: {
              browser: 86400,
              edge: 604800,
            },
            compression: true,
            minification: true,
          },
        ],
      },
      optimization: {
        bundleAnalysis: true,
        treeshaking: true,
        codesplitting: true,
        lazyLoading: true,
        prefetching: true,
        serviceWorker: true,
      },
      monitoring: {
        realUserMonitoring: true,
        syntheticMonitoring: true,
        coreWebVitals: true,
        customMetrics: ['api-latency', 'render-time'],
        budgets: [
          {
            metric: 'LCP',
            threshold: 2500,
            action: 'warn',
          },
        ],
      },
    },
    errorTracking: {
      enabled: true,
      provider: 'sentry',
      dsn: getEnvVar('SENTRY_DSN', ''),
      environment: 'staging',
      release: 'v1.0.0',
      sampling: 0.8,
      filters: [
        {
          type: 'ignore',
          pattern: 'Network request failed',
          action: 'ignore',
        },
      ],
    },
    analytics: {
      enabled: true,
      providers: [
        {
          name: 'Google Analytics',
          id: getEnvVar('GA_TRACKING_ID', ''),
          config: {
            anonymizeIp: true,
          },
          events: ['pageview', 'conversion', 'engagement'],
        },
      ],
      consent: {
        required: true,
        banner: true,
        categories: ['necessary', 'analytics', 'marketing'],
        storage: 'localStorage',
      },
      privacy: {
        anonymizeIPs: true,
        doNotTrack: true,
        dataRetention: 90,
        gdprCompliant: true,
      },
    },
  } as DeploymentEnvironment,

  production: {
    // Production-specific values
    name: 'production',
    url: 'https://cosmichub.com',
    apiUrl: 'https://api.cosmichub.com',
    cdn: 'https://cdn.cosmichub.com',
    database: {
      host: 'db.cosmichub.com',
      port: 5432,
      database: 'cosmichub_production',
      ssl: true,
      poolSize: 25,
      connectionTimeout: 30000,
      queryTimeout: 60000,
      backup: {
        enabled: true,
        schedule: '0 1 * * *',
        retention: 30,
        storage: 's3',
        encryption: true,
      },
    },
    monitoring: {
      enabled: true,
      endpoint: 'https://monitoring.cosmichub.com',
      apiKey: getEnvVar('MONITORING_API_KEY_PROD', ''),
      alerts: [
        {
          name: 'Critical Error Rate',
          condition: 'error_rate > 1%',
          threshold: 1,
          severity: 'critical',
          channels: ['slack', 'email', 'pager'],
          cooldown: 300,
        },
      ],
      dashboards: [],
      healthCheck: {
        enabled: true,
        interval: 30,
        timeout: 5,
        endpoints: ['/health', '/api/status'],
        criticalServices: ['database', 'cache', 'api', 'auth'],
      },
    },
    security: {
      https: true,
      hsts: true,
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", 'cdn.cosmichub.com'],
          'style-src': ["'self'", 'cdn.cosmichub.com'],
          'img-src': ["'self'", 'data:', 'cdn.cosmichub.com'],
          'connect-src': ["'self'", 'api.cosmichub.com'],
        },
        reportOnly: false,
        reportUri: '/csp-report',
      },
      cors: {
        enabled: true,
        origins: ['https://cosmichub.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400,
      },
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      },
      firewall: {
        enabled: true,
        allowedIPs: [],
        blockedIPs: [],
        geoBlocking: [],
        ddosProtection: true,
      },
      secrets: {
        provider: 'vault',
        endpoint: getEnvVar('VAULT_ENDPOINT', ''),
        rotation: true,
        encryption: true,
      },
    },
    performance: {
      compression: true,
      caching: {
        enabled: true,
        redis: {
          host: 'redis.cosmichub.com',
          port: 6379,
          password: getEnvVar('REDIS_PASSWORD_PROD', ''),
          database: 0,
          maxRetries: 3,
          retryDelay: 1000,
        },
        strategies: [
          {
            pattern: '/api/v1/.*',
            ttl: 300,
            invalidation: ['POST', 'PUT', 'DELETE'],
          },
        ],
      },
      cdn: {
        enabled: true,
        provider: 'cloudflare',
        endpoint: 'https://cdn.cosmichub.com',
        zones: [
          {
            name: 'production',
            domains: ['cosmichub.com'],
            caching: {
              browser: 86400,
              edge: 604800,
            },
            compression: true,
            minification: true,
          },
        ],
      },
      optimization: {
        bundleAnalysis: true,
        treeshaking: true,
        codesplitting: true,
        lazyLoading: true,
        prefetching: true,
        serviceWorker: true,
      },
      monitoring: {
        realUserMonitoring: true,
        syntheticMonitoring: true,
        coreWebVitals: true,
        customMetrics: ['api-latency', 'render-time', 'conversion-rate'],
        budgets: [
          {
            metric: 'LCP',
            threshold: 2500,
            action: 'error',
          },
        ],
      },
    },
    errorTracking: {
      enabled: true,
      provider: 'sentry',
      dsn: getEnvVar('SENTRY_DSN_PROD', ''),
      environment: 'production',
      release: getEnvVar('APP_VERSION', 'v1.0.0'),
      sampling: 0.5,
      filters: [
        {
          type: 'ignore',
          pattern: 'Network request failed',
          action: 'ignore',
        },
      ],
    },
    analytics: {
      enabled: true,
      providers: [
        {
          name: 'Google Analytics',
          id: getEnvVar('GA_TRACKING_ID_PROD', ''),
          config: {
            anonymizeIp: true,
          },
          events: ['pageview', 'conversion', 'engagement'],
        },
      ],
      consent: {
        required: true,
        banner: true,
        categories: ['necessary', 'analytics', 'marketing'],
        storage: 'localStorage',
      },
      privacy: {
        anonymizeIPs: true,
        doNotTrack: true,
        dataRetention: 90,
        gdprCompliant: true,
      },
    },
  } as DeploymentEnvironment,
};

// Export utilities
