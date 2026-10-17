// Thin fetch wrapper. All calls go to /api/* which Next.js hands to Express.
import { setExpiresAt } from './session';

export class ApiError extends Error {
  constructor(status, message, reason) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  // Every authenticated response carries the new idle-timeout deadline.
  const exp = Number(res.headers.get('X-Session-Expires'));
  if (exp > 0) setExpiresAt(exp);

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      const reason = data?.reason === 'revoked' ? 'revoked' : 'expired';
      window.location.href = `/login?message=${reason}`;
    }
    throw new ApiError(res.status, (data && data.message) || 'Something went wrong. Please try again.', data?.reason);
  }
  return data;
}

// Turns a <form> into a plain object (like request.getParameter in the servlets).
export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}
