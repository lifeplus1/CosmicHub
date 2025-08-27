/**
 * Minimal test event system for structured logging and future extensibility.
 * Provides:
 *  - Typed TestEvent union
 *  - EventSink interface
 *  - ConsoleSink implementation (isolates console usage)
 *  - EventBus to dispatch events to sinks
 */
import { TestResult, TestRunSummary } from './testTypes';
import { logger } from '../utils/logger';

export interface BaseEvent {
  type: string;
  ts: string; // ISO timestamp
}

export interface RunStartEvent extends BaseEvent {
  type: 'run:start';
  totalSuites?: number;
}

export interface SuiteStartEvent extends BaseEvent {
  type: 'suite:start';
  suite: string;
}

export interface SuiteResultEvent extends BaseEvent {
  type: 'suite:result';
  result: TestResult;
}

export interface RunSummaryEvent extends BaseEvent {
  type: 'run:summary';
  summary: TestRunSummary;
}

export interface WarningEvent extends BaseEvent {
  type: 'warning';
  message: string;
  suite?: string;
  code?: string;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  message: string;
  suite?: string;
  error?: string;
}

export interface RecommendationEvent extends BaseEvent {
  type: 'recommendation';
  recommendation: string;
}

export interface ReportGeneratedEvent extends BaseEvent {
  type: 'report:generated';
  format: 'json' | 'html';
  location?: string;
}

export type TestEvent =
  | RunStartEvent
  | SuiteStartEvent
  | SuiteResultEvent
  | RunSummaryEvent
  | WarningEvent
  | ErrorEvent
  | RecommendationEvent
  | ReportGeneratedEvent;

export interface EventSink {
  handle(event: TestEvent): void | Promise<void>;
}

export class ConsoleSink implements EventSink {
  handle(event: TestEvent): void {
    switch (event.type) {
      case 'run:start': {
        const count = event.totalSuites;
        logger.info('Test run started', { totalSuites: count });
        break;
      }
      case 'suite:start':
        logger.info('Suite start', { suite: event.suite });
        break;
      case 'suite:result': {
        const r = event.result;
        logger.info('Suite result', {
          suite: r.suite,
          status: r.status,
          durationMs: Number(r.duration.toFixed(2)),
          errorCount: r.errors.length,
        });
        if (r.errors.length > 0) {
          r.errors.forEach(e =>
            logger.error('Test error', { suite: r.suite, error: e })
          );
        }
        break;
      }
      case 'warning':
        logger.warn('Test warning', {
          message: event.message,
          suite: event.suite,
        });
        break;
      case 'error':
        logger.error('Test error', {
          message: event.message,
          suite: event.suite,
          error: event.error,
        });
        if (typeof event.error === 'string' && event.error.length > 0)
          logger.error('Test error detail', { error: event.error });
        break;
      case 'recommendation':
        logger.info('Recommendation', { recommendation: event.recommendation });
        break;
      case 'run:summary': {
        const summary = event.summary;
        logger.info('Test run summary', {
          passed: summary.passed,
          total: summary.total,
          passRate: Number(((summary.passed / summary.total) * 100).toFixed(1)),
          durationSec: Number((summary.duration / 1000).toFixed(2)),
          coverage: Number(summary.coverage.overall.toFixed(1)),
          avgRenderMs: Number(summary.performance.averageRenderTime.toFixed(2)),
          accessibilityViolations: summary.accessibility.totalViolations,
          qualityScore: summary.quality.score,
          qualityGrade: summary.quality.grade,
        });
        break;
      }
      case 'report:generated':
        logger.info('Report generated', {
          format: event.format,
          location: event.location,
        });
        break;
      default:
        logger.debug('Unhandled test event', { event });
    }
  }
}

export class EventBus {
  private sinks: EventSink[] = [];
  constructor(sinks: EventSink[] = []) {
    this.sinks = sinks;
  }
  addSink(sink: EventSink): void {
    this.sinks.push(sink);
  }
  emit(event: Omit<TestEvent, 'ts'>): void {
    const evt: TestEvent = {
      ...event,
      ts: new Date().toISOString(),
    } as TestEvent;
    const isThenable = (v: unknown): v is Promise<unknown> =>
      typeof (v as { then?: unknown }).then === 'function';
    for (const sink of this.sinks) {
      try {
        const ret = sink.handle(evt);
        if (isThenable(ret)) {
          void ret.catch(() => {
            /* swallow sink rejection */
          });
        }
      } catch {
        /* ignore sink errors */
      }
    }
  }
}

export const createDefaultEventBus = (): EventBus =>
  new EventBus([new ConsoleSink()]);

export type TestEventBus = EventBus;

// In-memory sink useful for assertions in unit tests
export class MemorySink implements EventSink {
  public events: TestEvent[] = [];
  handle(event: TestEvent): void {
    this.events.push(event);
  }
  find<T extends TestEvent['type']>(
    type: T
  ): Extract<TestEvent, { type: T }>[] {
    return this.events.filter(e => e.type === type) as Extract<
      TestEvent,
      { type: T }
    >[];
  }
}
