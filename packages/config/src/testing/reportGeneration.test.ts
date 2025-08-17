import { describe, it, expect } from 'vitest';
import { TestSuiteRunner } from './testRunner';
import { EventBus, MemorySink, ReportGeneratedEvent } from './testEvents';
import { promises as fs } from 'fs';

// Lightweight suite function
async function passingSuite(): Promise<void> {
  // Simulate small async operation
  await new Promise(r => setTimeout(r, 5));
}

describe('Report Generation', () => {
  it('emits report:generated events and writes files', async () => {
    const sink = new MemorySink();
    const bus = new EventBus([sink]);
    const runner = new TestSuiteRunner({
      reports: { generateHtml: true, generateJson: true, uploadResults: false, outputDir: 'test-results-temp' }
    }, bus);

    await runner.runAllSuites({ alpha: passingSuite });

    const reports = sink.find('report:generated');
    expect(reports.length).toBeGreaterThanOrEqual(1);

    const jsonEvent = reports.find(r => r.format === 'json') as ReportGeneratedEvent | undefined;
    const htmlEvent = reports.find(r => r.format === 'html') as ReportGeneratedEvent | undefined;

  if (jsonEvent !== undefined && jsonEvent.location !== undefined && jsonEvent.location !== null) {
      const jsonStat = await fs.stat(jsonEvent.location);
      expect(jsonStat.isFile()).toBe(true);
    }
  if (htmlEvent !== undefined && htmlEvent.location !== undefined && htmlEvent.location !== null) {
      const htmlStat = await fs.stat(htmlEvent.location);
      expect(htmlStat.isFile()).toBe(true);
    }
  });
});
