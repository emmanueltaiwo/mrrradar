import { getCoordsForCountry } from '../countryCoords';

describe('getCoordsForCountry', () => {
  it('returns coordinates for valid country codes', () => {
    const usCoords = getCoordsForCountry('US');
    expect(usCoords).toEqual([38, -97]);

    const gbCoords = getCoordsForCountry('GB');
    expect(gbCoords).toEqual([54, -2]);
  });

  it('handles lowercase country codes', () => {
    const coords = getCoordsForCountry('us');
    expect(coords).toEqual([38, -97]);
  });

  it('returns fallback for unknown country codes', () => {
    const coords = getCoordsForCountry('XX');
    expect(coords).toEqual([20, 0]);
  });

  it('returns fallback for null/undefined', () => {
    expect(getCoordsForCountry(null)).toEqual([20, 0]);
    expect(getCoordsForCountry(undefined)).toEqual([20, 0]);
  });

  it('returns fallback for empty string', () => {
    const coords = getCoordsForCountry('');
    expect(coords).toEqual([20, 0]);
  });
});