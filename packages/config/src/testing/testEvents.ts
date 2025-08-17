/**
 * Minimal test event system for structured logging and future extensibility.
 * Provides:
 *  - Typed TestEvent union
 *  - EventSink interface
 *  - ConsoleSink implementation (isolates console usage)
 *  - EventBus to dispatch events to sinks
 */
/* eslint-disable no-console */
import { TestResult, TestRunSummary } from './testTypes';


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

export interface SuiteResultEvent extends BaseEvent { type: 'suite:result'; result: TestResult; }

export interface RunSummaryEvent extends BaseEvent { type: 'run:summary'; summary: TestRunSummary; }

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
        const suffix = typeof count === 'number' && count > 0 ? ` (${count} suites)` : '';
        console.log(`🚀 Test run started${suffix}`);
        break; }
      case 'suite:start':
        console.log(`🧪 Suite start: ${event.suite}`);
        break;
      case 'suite:result': {
        const r = event.result;
        const icon = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
        console.log(`${icon} ${r.suite}: ${r.status} (${r.duration.toFixed(2)}ms)`);
  if (r.errors.length > 0) {
          r.errors.forEach(e => console.log(`   Error: ${e}`));
        }
        break; }
      case 'warning':
        console.warn(`⚠️  ${event.message}${event.suite !== undefined ? ` [${event.suite}]` : ''}`);
        break;
      case 'error':
        console.error(`❌ ${event.message}${event.suite !== undefined ? ` [${event.suite}]` : ''}`);
  if (typeof event.error === 'string' && event.error.length > 0) console.error(event.error);
        break;
      case 'recommendation':
        console.log(`📋 Recommendation: ${event.recommendation}`);
        break;
      case 'run:summary': {
        const summary = event.summary;
        console.log('\n📊 Test Run Summary');
        console.log('='.repeat(50));
        console.log(`Tests: ${summary.passed}/${summary.total} passed (${(summary.passed / summary.total * 100).toFixed(1)}%)`);
        console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
        console.log(`Coverage: ${summary.coverage.overall.toFixed(1)}%`);
        console.log(`Performance: ${summary.performance.averageRenderTime.toFixed(2)}ms avg render`);
        console.log(`Accessibility: ${summary.accessibility.totalViolations} violations`);
        console.log(`Quality Score: ${summary.quality.score}/100 (${summary.quality.grade})`);
        console.log('='.repeat(50));
        break; }
      case 'report:generated':
  console.log(`📄 Report generated (${event.format})${event.location !== null && event.location !== undefined ? ` -> ${event.location}` : ''}`);
        break;
      default:
        console.log('ℹ️ Event', event);
    }
  }
}

export class EventBus {
  private sinks: EventSink[] = [];
  constructor(sinks: EventSink[] = []) { this.sinks = sinks; }
  addSink(sink: EventSink): void { this.sinks.push(sink); }
  emit(event: Omit<TestEvent, 'ts'>): void {
    const evt: TestEvent = { ...event, ts: new Date().toISOString() } as TestEvent;
    const isThenable = (v: unknown): v is Promise<unknown> => typeof (v as { then?: unknown }).then === 'function';
    for (const sink of this.sinks) {
      try {
        const ret = sink.handle(evt);
        if (isThenable(ret)) {
          void ret.catch(() => { /* swallow sink rejection */ });
        }
      } catch { /* ignore sink errors */ }
    }
  }
}

export const createDefaultEventBus = (): EventBus => new EventBus([new ConsoleSink()]);

export type TestEventBus = EventBus;

// In-memory sink useful for assertions in unit tests
export class MemorySink implements EventSink {
  public events: TestEvent[] = [];
  handle(event: TestEvent): void { this.events.push(event); }
  find<T extends TestEvent['type']>(type: T): Extract<TestEvent, { type: T }>[] {
    return this.events.filter(e => e.type === type) as Extract<TestEvent, { type: T }>[];
  }
}
