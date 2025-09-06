import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportTableAsCSV, downloadFile, formatDataForExport } from '../exportUtils';

// Mock DOM APIs that don't exist in the test environment
global.URL = {
  createObjectURL: vi.fn(() => 'mock-blob-url'),
  revokeObjectURL: vi.fn()
} as any;

global.Blob = vi.fn((content, options) => ({
  content,
  options,
  type: options?.type
})) as any;

// Mock document.createElement
const mockLink = {
  href: '',
  download: '',
  click: vi.fn()
};

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockLink)
  },
  writable: true
});

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('formatDataForExport', () => {
    describe('CSV format', () => {
      it('formats simple data correctly', () => {
        const data = [
          { name: 'John', age: 30, city: 'New York' },
          { name: 'Jane', age: 25, city: 'Los Angeles' }
        ];

        const result = formatDataForExport(data, 'csv');
        const expected = 'name,age,city\n"John","30","New York"\n"Jane","25","Los Angeles"';
        
        expect(result).toBe(expected);
      });

      it('handles empty arrays', () => {
        const result = formatDataForExport([], 'csv');
        expect(result).toBe('');
      });

      it('handles arrays with undefined first element', () => {
        const data = [undefined, { name: 'John' }] as any[];
        const result = formatDataForExport(data, 'csv');
        expect(result).toBe('');
      });

      it('escapes quotes in CSV values', () => {
        const data = [
          { quote: 'He said "Hello"', message: 'This has "multiple" quotes' }
        ];

        const result = formatDataForExport(data, 'csv');
        expect(result).toContain('"He said ""Hello"""');
        expect(result).toContain('"This has ""multiple"" quotes"');
      });

      it('handles null and undefined values', () => {
        const data = [
          { name: 'John', spouse: null, children: undefined }
        ];

        const result = formatDataForExport(data, 'csv');
        expect(result).toBe('name,spouse,children\n"John","",""');
      });

      it('handles boolean values', () => {
        const data = [
          { name: 'John', active: true, verified: false }
        ];

        const result = formatDataForExport(data, 'csv');
        expect(result).toBe('name,active,verified\n"John","true","false"');
      });

      it('handles nested objects by stringifying them', () => {
        const data = [
          { 
            name: 'John', 
            address: { street: '123 Main St', city: 'NYC' },
            tags: ['developer', 'javascript']
          }
        ];

        const result = formatDataForExport(data, 'csv');
        expect(result).toContain('"{""street"":""123 Main St"",""city"":""NYC""}"');
        expect(result).toContain('"[""developer"",""javascript""]"');
      });

      it('handles circular references gracefully', () => {
        const obj: any = { name: 'John' };
        obj.self = obj; // circular reference
        const data = [obj];

        const result = formatDataForExport(data, 'csv');
        expect(result).toContain('"[object]"'); // should fallback to [object]
      });

      it('handles unknown value types', () => {
        const data = [
          { name: 'John', func: () => 'test', symbol: Symbol('test') }
        ];

        const result = formatDataForExport(data, 'csv');
        expect(result).toContain('"[unknown]"');
      });
    });

    describe('JSON format', () => {
      it('formats data as pretty JSON', () => {
        const data = [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ];

        const result = formatDataForExport(data, 'json');
        const parsed = JSON.parse(result);
        
        expect(parsed).toEqual(data);
        expect(result).toContain('  '); // should be pretty-printed with 2 spaces
      });

      it('handles empty arrays', () => {
        const result = formatDataForExport([], 'json');
        expect(result).toBe('[]');
      });

      it('preserves complex nested structures', () => {
        const data = [
          {
            name: 'John',
            address: { street: '123 Main St', city: 'NYC' },
            tags: ['developer', 'javascript']
          }
        ];

        const result = formatDataForExport(data, 'json');
        const parsed = JSON.parse(result);
        
        expect(parsed).toEqual(data);
        expect(parsed[0].address.street).toBe('123 Main St');
        expect(parsed[0].tags).toEqual(['developer', 'javascript']);
      });
    });

    it('defaults to CSV format when no type specified', () => {
      const data = [{ name: 'John', age: 30 }];
      const result = formatDataForExport(data);
      expect(result).toBe('name,age\n"John","30"');
    });
  });

  describe('exportTableAsCSV', () => {
    it('creates and downloads CSV file', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      exportTableAsCSV(data, 'test.csv');

      expect(global.Blob).toHaveBeenCalledWith(
        ['name,age\n"John","30"\n"Jane","25"'],
        { type: 'text/csv;charset=utf-8;' }
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('mock-blob-url');
      expect(mockLink.download).toBe('test.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('handles empty data arrays gracefully', () => {
      exportTableAsCSV([], 'empty.csv');

      // Should not create blob or trigger download
      expect(global.Blob).not.toHaveBeenCalled();
      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('handles arrays with undefined first element', () => {
      const data = [undefined, { name: 'John' }] as any[];
      exportTableAsCSV(data, 'test.csv');

      // Should not create blob or trigger download
      expect(global.Blob).not.toHaveBeenCalled();
      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('properly escapes quotes in exported CSV', () => {
      const data = [
        { message: 'He said "Hello world"' }
      ];

      exportTableAsCSV(data, 'quotes.csv');

      expect(global.Blob).toHaveBeenCalledWith(
        ['message\n"He said ""Hello world"""'],
        { type: 'text/csv;charset=utf-8;' }
      );
    });
  });

  describe('downloadFile', () => {
    it('downloads file with default mime type', () => {
      const content = 'Hello, world!';
      const filename = 'hello.txt';

      downloadFile(content, filename);

      expect(global.Blob).toHaveBeenCalledWith(
        [content],
        { type: 'text/plain' }
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.href).toBe('mock-blob-url');
      expect(mockLink.download).toBe(filename);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('downloads file with custom mime type', () => {
      const content = '{"name": "John"}';
      const filename = 'data.json';
      const mimeType = 'application/json';

      downloadFile(content, filename, mimeType);

      expect(global.Blob).toHaveBeenCalledWith(
        [content],
        { type: mimeType }
      );
      expect(mockLink.download).toBe(filename);
    });

    it('handles empty content', () => {
      downloadFile('', 'empty.txt');

      expect(global.Blob).toHaveBeenCalledWith([''], { type: 'text/plain' });
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('handles special characters in content', () => {
      const content = 'Special chars: àáâã ñ 中文 🚀';
      downloadFile(content, 'special.txt');

      expect(global.Blob).toHaveBeenCalledWith([content], { type: 'text/plain' });
    });
  });

  describe('integration scenarios', () => {
    it('handles complex astrological data export', () => {
      const astroData = [
        {
          planet: 'Sun',
          position: 15.5,
          sign: 'Leo',
          house: 1,
          aspects: [
            { type: 'trine', planet: 'Mars', orb: 2.5 }
          ],
          metadata: {
            dignity: 'domicile',
            element: 'fire'
          }
        }
      ];

      const csvResult = formatDataForExport(astroData, 'csv');
      expect(csvResult).toContain('planet,position,sign,house,aspects,metadata');
      expect(csvResult).toContain('"Sun"');
      expect(csvResult).toContain('"15.5"');
      expect(csvResult).toContain('"Leo"');

      const jsonResult = formatDataForExport(astroData, 'json');
      const parsed = JSON.parse(jsonResult);
      expect(parsed[0].aspects[0].type).toBe('trine');
      expect(parsed[0].metadata.dignity).toBe('domicile');
    });

    it('handles large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        score: Math.random() * 100,
        active: i % 2 === 0
      }));

      const result = formatDataForExport(largeData, 'csv');
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(1001); // header + 1000 data rows
      expect(lines[0]).toBe('id,name,score,active');
      expect(lines[1]).toContain('"User 0"');
      expect(lines[1000]).toContain('"User 999"');
    });

    it('preserves data integrity through export-import cycle', () => {
      const originalData = [
        { 
          name: 'Test User',
          age: 30,
          active: true,
          score: 85.5,
          tags: ['important', 'verified'],
          profile: { bio: 'Software developer', location: 'NYC' }
        }
      ];

      // Export to JSON and parse back
      const jsonExport = formatDataForExport(originalData, 'json');
      const parsedBack = JSON.parse(jsonExport);
      
      expect(parsedBack).toEqual(originalData);
      expect(parsedBack[0].profile.bio).toBe('Software developer');
      expect(parsedBack[0].tags).toEqual(['important', 'verified']);
    });
  });
});
