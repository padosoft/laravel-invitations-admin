import axios, { AxiosError } from 'axios';

/**
 * Same-origin axios client. The Blade shell injects the API base + CSRF token
 * onto window so the package needs no build-time config. Session-cookie auth is
 * the host's job (withCredentials carries it); we add the XSRF header Laravel
 * expects for state-changing requests.
 */
declare global {
  interface Window {
    InvitationsAdmin?: {
      apiBase?: string;
      csrfToken?: string;
      tenantLabel?: string;
    };
  }
}

const cfg = typeof window !== 'undefined' ? window.InvitationsAdmin : undefined;

export const api = axios.create({
  baseURL: (cfg?.apiBase ?? '/api/admin/invitations').replace(/\/+$/, ''),
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(cfg?.csrfToken ? { 'X-CSRF-TOKEN': cfg.csrfToken } : {}),
  },
});

export const tenantLabel = cfg?.tenantLabel ?? 'default';

/**
 * Normalize any thrown error to a human-readable string AND a field-error map
 * so the UI can render both a banner (R14: errors visible in the DOM) and
 * per-field validation messages (R11: `{field}-error`).
 */
export interface NormalizedError {
  message: string;
  status: number | null;
  fields: Record<string, string>;
}

export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    const status = ax.response?.status ?? null;
    const body = ax.response?.data;
    const fields: Record<string, string> = {};
    if (body?.errors) {
      for (const [key, msgs] of Object.entries(body.errors)) {
        fields[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
    }
    const message =
      body?.message ??
      (status === 422
        ? 'The submitted data was invalid.'
        : status === 403
          ? 'You are not authorized to perform this action.'
          : status === 404
            ? 'The requested resource was not found.'
            : ax.message || 'Request failed.');
    return { message, status, fields };
  }
  return { message: err instanceof Error ? err.message : 'Unexpected error.', status: null, fields: {} };
}
