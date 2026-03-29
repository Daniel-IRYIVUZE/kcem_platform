/**
 * tests/utils/toast.test.ts
 * Unit tests for the lightweight toast notification utility.
 * Verifies that the correct CustomEvents are dispatched to window.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showToast, toast, TOAST_EVENT } from './toast';
import type { ToastMessage } from './toast';

// Spy on window.dispatchEvent so we can inspect dispatched events.
const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

describe('showToast', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  it('dispatches a CustomEvent to window', () => {
    showToast('success', 'All good');
    expect(dispatchSpy).toHaveBeenCalledOnce();
  });

  it('dispatches event with the correct TOAST_EVENT type', () => {
    showToast('info', 'FYI');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.type).toBe(TOAST_EVENT);
  });

  it('includes type, title and generated id in event detail', () => {
    showToast('error', 'Oops', 'Something went wrong');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    const detail = event.detail;
    expect(detail.type).toBe('error');
    expect(detail.title).toBe('Oops');
    expect(detail.message).toBe('Something went wrong');
    expect(detail.id).toMatch(/^toast_/);
  });

  it('includes the message when provided', () => {
    showToast('warning', 'Watch out', 'Low disk space');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.message).toBe('Low disk space');
  });

  it('defaults duration to 4000 ms', () => {
    showToast('success', 'Done');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.duration).toBe(4000);
  });

  it('accepts a custom duration', () => {
    showToast('info', 'Quick', undefined, 1500);
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.duration).toBe(1500);
  });

  it('generates unique ids across successive calls', () => {
    showToast('success', 'First');
    showToast('success', 'Second');
    const ids = dispatchSpy.mock.calls.map(
      c => (c[0] as CustomEvent<ToastMessage>).detail.id,
    );
    expect(ids[0]).not.toBe(ids[1]);
  });
});

// ── toast shorthand helpers ───────────────────────────────────────────────────

describe('toast shorthand helpers', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  it('toast.success dispatches type="success"', () => {
    toast.success('Saved!');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.type).toBe('success');
    expect(event.detail.title).toBe('Saved!');
  });

  it('toast.error dispatches type="error"', () => {
    toast.error('Failed', 'Something broke');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.type).toBe('error');
    expect(event.detail.message).toBe('Something broke');
  });

  it('toast.warning dispatches type="warning"', () => {
    toast.warning('Be careful');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.type).toBe('warning');
  });

  it('toast.info dispatches type="info"', () => {
    toast.info('Did you know?');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.type).toBe('info');
  });

  it('each shorthand passes an optional message through', () => {
    toast.info('Title', 'Body text');
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent<ToastMessage>;
    expect(event.detail.message).toBe('Body text');
  });
});
