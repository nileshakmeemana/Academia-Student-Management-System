// Thin fetch wrapper. All calls go to /api/* which Next.js proxies to Express.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      window.location.href = '/login';
    }
    throw new ApiError(res.status, (data && data.message) || 'Something went wrong. Please try again.');
  }
  return data;
}

// Turns a <form> into a plain object (like request.getParameter in the servlets).
export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}
