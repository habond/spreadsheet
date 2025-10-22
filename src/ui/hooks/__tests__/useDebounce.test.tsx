import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });

    // Value should still be initial immediately after change
    expect(result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 }
    );
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'v1', delay: 100 },
    });

    // Rapid changes
    rerender({ value: 'v2', delay: 100 });
    rerender({ value: 'v3', delay: 100 });
    rerender({ value: 'v4', delay: 100 });

    // Should still be initial
    expect(result.current).toBe('v1');

    // Wait for debounce with longer timeout to ensure state updates
    await waitFor(
      () => {
        expect(result.current).toBe('v4');
      },
      { timeout: 300, interval: 50 }
    );

    // Should skip intermediate values
    expect(result.current).toBe('v4');
  });

  it('should handle different delay times', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 50 },
    });

    rerender({ value: 'updated', delay: 50 });

    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 150 }
    );
  });
});
