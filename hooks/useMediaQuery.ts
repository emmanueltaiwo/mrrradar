'use client';

import { useSyncExternalStore } from 'react';

function getSnapshot(query: string): () => boolean {
  return () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(query: string): (onStoreChange: () => void) => () => void {
  return (onStoreChange) => {
    if (typeof window === 'undefined') return () => {};
    const media = window.matchMedia(query);
    media.addEventListener('change', onStoreChange);
    return () => media.removeEventListener('change', onStoreChange);
  };
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    getSnapshot(query),
    getServerSnapshot,
  );
}
