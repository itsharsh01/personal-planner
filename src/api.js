/**
 * API client for personal-planner-be REST API
 * @see API_PROMPT.txt
 */

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://personal-planner-be.onrender.com');

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** GET /api/data - fetch full planner state */
export async function getData() {
  return request('/api/data');
}

/** PATCH /api/goals/:index - update goal text */
export async function updateGoalText(index, text) {
  return request(`/api/goals/${index}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
}

/** PATCH /api/goals/:index/check - toggle/update six-month checkbox */
export async function updateGoalCheck(index, checked) {
  const body = checked === undefined ? {} : { checked };
  return request(`/api/goals/${index}/check`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** PATCH /api/monthly/:monthId/:itemIndex - toggle monthly plan checkbox */
export async function updateMonthlyCheck(monthId, itemIndex, checked) {
  const body = checked === undefined ? {} : { checked };
  return request(`/api/monthly/${monthId}/${itemIndex}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** PATCH /api/daily/:monthId/:day - toggle daily checkbox */
export async function updateDailyCheck(monthId, day, checked) {
  const body = checked === undefined ? {} : { checked };
  return request(`/api/daily/${monthId}/${day}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
