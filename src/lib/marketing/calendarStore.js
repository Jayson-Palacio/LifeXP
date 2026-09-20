'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_ANCHOR_ISO } from './calendarData';

const STORAGE_KEY = 'kaeluma-marketing-calendar-v1';
const SERVER_STATE = Object.freeze({
  anchorISO: DEFAULT_ANCHOR_ISO,
  statusMap: Object.freeze({}),
});

let memory = { ...SERVER_STATE, statusMap: {} };
let listeners = new Set();
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { anchorISO: DEFAULT_ANCHOR_ISO, statusMap: {} };
    const parsed = JSON.parse(raw);
    return {
      anchorISO: parsed.anchorISO || DEFAULT_ANCHOR_ISO,
      statusMap: parsed.statusMap || {},
    };
  } catch {
    return { anchorISO: DEFAULT_ANCHOR_ISO, statusMap: {} };
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === 'undefined') return;
  memory = readStorage();
  hydrated = true;
}

function subscribe(listener) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureHydrated();
  return memory;
}

function getServerSnapshot() {
  return SERVER_STATE;
}

function persist(next) {
  memory = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        anchorISO: next.anchorISO,
        statusMap: next.statusMap,
        updatedAt: new Date().toISOString(),
      })
    );
  }
  emit();
}

export function useMarketingCalendarState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAnchorISO = useCallback((anchorISO) => {
    persist({ ...memory, anchorISO });
  }, []);

  const patchItem = useCallback((id, patch) => {
    persist({
      ...memory,
      statusMap: {
        ...memory.statusMap,
        [id]: {
          ...(memory.statusMap[id] || {}),
          ...patch,
        },
      },
    });
  }, []);

  return { ...state, setAnchorISO, patchItem };
}
