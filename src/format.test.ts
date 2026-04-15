import {
  parseFormat,
  formatMethod,
  formatStatusBadge,
  formatMarkdownStatusBadge,
  formatTimestamp,
  formatRouteLabel,
  truncatePath,
  pluralize,
} from './format';

describe('parseFormat', () => {
  it('accepts valid formats', () => {
    expect(parseFormat('text')).toBe('text');
    expect(parseFormat('markdown')).toBe('markdown');
    expect(parseFormat('json')).toBe('json');
  });

  it('normalizes casing', () => {
    expect(parseFormat('TEXT')).toBe('text');
    expect(parseFormat('Markdown')).toBe('markdown');
    expect(parseFormat('JSON')).toBe('json');
  });

  it('throws on invalid format', () => {
    expect(() => parseFormat('xml')).toThrow('Invalid output format');
    expect(() => parseFormat('')).toThrow('Invalid output format');
  });
});

describe('formatMethod', () => {
  it('uppercases and pads method to 7 chars', () => {
    expect(formatMethod('get')).toBe('GET    ');
    expect(formatMethod('delete')).toBe('DELETE ');
    expect(formatMethod('POST')).toBe('POST   ');
  });
});

describe('formatStatusBadge', () => {
  it('returns correct text badges', () => {
    expect(formatStatusBadge('added')).toBe('[+]');
    expect(formatStatusBadge('removed')).toBe('[-]');
    expect(formatStatusBadge('modified')).toBe('[~]');
  });
});

describe('formatMarkdownStatusBadge', () => {
  it('returns emoji badges', () => {
    expect(formatMarkdownStatusBadge('added')).toContain('Added');
    expect(formatMarkdownStatusBadge('removed')).toContain('Removed');
    expect(formatMarkdownStatusBadge('modified')).toContain('Modified');
  });
});

describe('formatTimestamp', () => {
  it('formats a date without T separator', () => {
    const date = new Date('2024-06-15T10:30:00.000Z');
    expect(formatTimestamp(date)).toBe('2024-06-15 10:30:00');
  });
});

describe('formatRouteLabel', () => {
  it('combines padded method and path', () => {
    expect(formatRouteLabel('get', '/users')).toBe('GET     /users');
  });
});

describe('truncatePath', () => {
  it('returns short paths unchanged', () => {
    expect(truncatePath('/short')).toBe('/short');
  });

  it('truncates long paths with ellipsis', () => {
    const long = '/api/' + 'a'.repeat(80);
    const result = truncatePath(long);
    expect(result.length).toBe(60);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('pluralize', () => {
  it('uses singular for count of 1', () => {
    expect(pluralize(1, 'route')).toBe('1 route');
  });

  it('uses plural for other counts', () => {
    expect(pluralize(0, 'route')).toBe('0 routes');
    expect(pluralize(5, 'route')).toBe('5 routes');
  });

  it('accepts custom plural form', () => {
    expect(pluralize(2, 'entry', 'entries')).toBe('2 entries');
  });
});
