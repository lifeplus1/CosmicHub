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
