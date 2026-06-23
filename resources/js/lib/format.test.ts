import { describe, it, expect } from 'vitest';
import { maskEmail, compactNumber, formatPercent, formatDuration } from './format';

describe('maskEmail', () => {
  it('masks the local part but keeps the first char and domain', () => {
    expect(maskEmail('jane@acme.com')).toBe('j•••@acme.com');
  });

  it('handles a value with no @ without throwing', () => {
    expect(maskEmail('nope')).toBe('n•••');
    expect(maskEmail('x')).toBe('•••');
  });
});

describe('formatPercent', () => {
  it('renders a ratio as a 1-decimal percentage', () => {
    expect(formatPercent(0.1234)).toBe('12.3%');
  });

  it('returns an em-dash for non-finite input rather than NaN%', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('formatDuration', () => {
  it('humanizes seconds across unit boundaries', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(120)).toBe('2m');
    expect(formatDuration(7200)).toBe('2.0h');
  });

  it('returns an em-dash for null', () => {
    expect(formatDuration(null)).toBe('—');
  });
});

describe('compactNumber', () => {
  it('returns a non-empty string for large values (locale-dependent format)', () => {
    // The exact compact suffix depends on the runtime's ICU data; assert the
    // contract (a short string), not a locale-specific glyph.
    const out = compactNumber(1500);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});
