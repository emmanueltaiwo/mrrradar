import { formatDollars } from '../format';

describe('formatDollars', () => {
  it('formats small numbers correctly', () => {
    const result = formatDollars(500);
    expect(result).toContain('500');
  });

  it('formats thousands with K suffix', () => {
    const result = formatDollars(5000);
    expect(result).toContain('5');
    expect(result).toContain('K');
  });

  it('formats millions with M suffix', () => {
    const result = formatDollars(1500000);
    expect(result).toContain('1.5');
    expect(result).toContain('M');
  });

  it('handles zero', () => {
    const result = formatDollars(0);
    expect(result).toContain('0');
  });

  it('handles negative numbers', () => {
    const result = formatDollars(-1000);
    expect(result).toBeDefined();
  });
});