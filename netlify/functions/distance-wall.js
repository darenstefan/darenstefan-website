const { getStore } = require('@netlify/blobs');

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://darenstefan.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

function clean(value, max) {
  return String(value || '')
    .trim()
    .replace(/<[^>]*>/g, '')   // strip tags
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const store = getStore('distance-wall');

  // ── GET ──────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const raw = await store.get('stories');
    const data = raw ? JSON.parse(raw) : { stories: [] };
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let input;
    try {
      input = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const storyText = clean(input.story ?? '', 1200);
    if (!storyText) {
      return { statusCode: 422, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Story is required' }) };
    }

    const email = clean(input.email ?? '', 160);
    if (email && !validEmail(email)) {
      return { statusCode: 422, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const newStory = {
      name:     clean(input.name ?? 'Anonymous', 80) || 'Anonymous',
      distance: clean(input.distance ?? '', 120),
      status:   clean(input.status ?? '', 120),
      story:    storyText,
      shoutout: Boolean(input.shoutout),
      created_at: new Date().toISOString(),
    };

    const raw = await store.get('stories');
    const data = raw ? JSON.parse(raw) : { stories: [] };
    data.stories.unshift(newStory);
    data.stories = data.stories.slice(0, 100);
    await store.set('stories', JSON.stringify(data));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, story: newStory }),
    };
  }

  return {
    statusCode: 405,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
