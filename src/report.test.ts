import { generateReport, ReportOptions } from './report';
import { DiffResult } from './diff';

const sampleDiff: DiffResult = {
  added: [
    { method: 'GET', path: '/api/users' },
    { method: 'POST', path: '/api/users' },
  ],
  removed: [
    { method: 'DELETE', path: '/api/legacy' },
  ],
  modified: [
    {
      before: { method: 'GET', path: '/api/items', description: 'List items' },
      after: { method: 'GET', path: '/api/items', description: 'List all items' },
    },
  ],
};

describe('generateReport', () => {
  describe('text format', () => {
    it('includes summary counts', () => {
      const result = generateReport(sampleDiff, { format: 'text' });
      expect(result).toContain('Added:    2');
      expect(result).toContain('Removed:  1');
      expect(result).toContain('Modified: 1');
    });

    it('lists added routes with + prefix', () => {
      const result = generateReport(sampleDiff, { format: 'text' });
      expect(result).toContain('+ [GET] /api/users');
      expect(result).toContain('+ [POST] /api/users');
    });

    it('lists removed routes with - prefix', () => {
      const result = generateReport(sampleDiff, { format: 'text' });
      expect(result).toContain('- [DELETE] /api/legacy');
    });

    it('lists modified routes with ~ prefix', () => {
      const result = generateReport(sampleDiff, { format: 'text' });
      expect(result).toContain('~ [GET] /api/items');
    });

    it('shows description change for modified routes', () => {
      const result = generateReport(sampleDiff, { format: 'text' });
      expect(result).toContain('List items');
      expect(result).toContain('List all items');
    });
  });

  describe('json format', () => {
    it('returns valid JSON', () => {
      const result = generateReport(sampleDiff, { format: 'json' });
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('contains all diff data', () => {
      const result = generateReport(sampleDiff, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.added).toHaveLength(2);
      expect(parsed.removed).toHaveLength(1);
      expect(parsed.modified).toHaveLength(1);
    });
  });

  describe('markdown format', () => {
    it('includes markdown heading', () => {
      const result = generateReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('# Route Diff Report');
    });

    it('includes a summary table', () => {
      const result = generateReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('| Added | 2 |');
      expect(result).toContain('| Removed | 1 |');
    });

    it('formats routes as markdown list items', () => {
      const result = generateReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('- `[GET]` /api/users');
      expect(result).toContain('- `[DELETE]` /api/legacy');
    });
  });
});
