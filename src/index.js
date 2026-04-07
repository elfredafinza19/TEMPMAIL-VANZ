// Cloudflare Workers main handler for TEMPMAIL-VANZ

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ── Email handlers ────────────────────────────────────────────────────────────

async function generateEmail(env) {
  const local = randomString(10);

  // Pick a random available domain from DB, fall back to a default
  let domain = 'tempmail.vanz';
  try {
    const row = await env.DB.prepare(
      'SELECT domain_name FROM domains ORDER BY RANDOM() LIMIT 1'
    ).first();
    if (row) domain = row.domain_name;
  } catch (_) {
    // DB may not be initialised yet; use default domain
  }

  const address = `${local}@${domain}`;

  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO temp_addresses (address, created_at) VALUES (?, ?)'
    )
      .bind(address, new Date().toISOString())
      .run();
  } catch (_) {
    // Table may not exist yet; still return the generated address
  }

  return jsonResponse({ address });
}

async function getEmails(env, address) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, sender, subject, body, received_at FROM emails WHERE recipient = ? ORDER BY received_at DESC'
    )
      .bind(address)
      .all();
    return jsonResponse(results || []);
  } catch (_) {
    return jsonResponse([]);
  }
}

// ── Domain handlers ───────────────────────────────────────────────────────────

async function listDomains(env) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, domain_name, created_at FROM domains ORDER BY created_at DESC'
    ).all();
    return jsonResponse(results || []);
  } catch (_) {
    return jsonResponse([]);
  }
}

async function addDomain(env, request) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { domain } = body || {};
  if (!domain || typeof domain !== 'string' || !domain.includes('.')) {
    return jsonResponse({ error: 'A valid domain name is required' }, 400);
  }

  const name = domain.toLowerCase().trim();
  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO domains (domain_name, created_at) VALUES (?, ?)'
    )
      .bind(name, new Date().toISOString())
      .run();
  } catch (_) {
    return jsonResponse({ error: 'Failed to add domain' }, 500);
  }

  return jsonResponse({ message: 'Domain added', domain: name }, 201);
}

async function deleteDomain(env, domainName) {
  try {
    await env.DB.prepare('DELETE FROM domains WHERE domain_name = ?')
      .bind(domainName)
      .run();
  } catch (_) {
    return jsonResponse({ error: 'Failed to delete domain' }, 500);
  }
  return jsonResponse({ message: 'Domain removed', domain: domainName });
}

// ── Auth handlers ─────────────────────────────────────────────────────────────

async function generateApiKey(env, request) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { userId } = body || {};
  if (!userId) {
    return jsonResponse({ error: 'User ID is required' }, 400);
  }

  // Generate a random 40-char hex key using Web Crypto
  const buf = new Uint8Array(20);
  crypto.getRandomValues(buf);
  const apiKey = Array.from(buf)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const uid = String(userId);
  try {
    // Check for an existing key first to avoid silent overwrites
    const existing = await env.DB.prepare(
      'SELECT api_key FROM api_keys WHERE user_id = ?'
    )
      .bind(uid)
      .first();

    if (existing) {
      return jsonResponse(
        { error: 'API key already exists for this user. Revoke it first.' },
        409
      );
    }

    await env.DB.prepare(
      'INSERT INTO api_keys (user_id, api_key, created_at) VALUES (?, ?, ?)'
    )
      .bind(uid, apiKey, new Date().toISOString())
      .run();
  } catch (_) {
    // Proceed even if DB insert fails – still return the key
  }

  return jsonResponse({ apiKey }, 201);
}

async function authApiKey(env, request) {
  const apiKey = request.headers.get('X-Api-Key') || request.headers.get('x-api-key');
  if (!apiKey) {
    return jsonResponse({ error: 'API key required' }, 401);
  }

  try {
    const row = await env.DB.prepare(
      'SELECT user_id FROM api_keys WHERE api_key = ?'
    )
      .bind(apiKey)
      .first();

    if (row) {
      return jsonResponse({ message: 'Authentication successful', userId: row.user_id });
    }
  } catch (_) {
    // Fall through to 401
  }

  return jsonResponse({ error: 'Invalid API key' }, 401);
}

// ── Frontend HTML ─────────────────────────────────────────────────────────────

async function serveFrontend(request, env) {
  // Serve index.html from the Workers Assets binding
  const assetRequest = new Request(new URL('/index.html', request.url).toString(), request);
  return env.ASSETS.fetch(assetRequest);
}

// ── Main router ───────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Email routes
    if (pathname === '/api/emails/generate' && method === 'POST') {
      return generateEmail(env);
    }
    if (pathname.startsWith('/api/emails/') && method === 'GET') {
      const address = decodeURIComponent(pathname.slice('/api/emails/'.length));
      return getEmails(env, address);
    }

    // Domain routes
    if (pathname === '/api/domains' && method === 'GET') {
      return listDomains(env);
    }
    if (pathname === '/api/domains' && method === 'POST') {
      return addDomain(env, request);
    }
    if (pathname.startsWith('/api/domains/') && method === 'DELETE') {
      const domainName = decodeURIComponent(pathname.slice('/api/domains/'.length));
      return deleteDomain(env, domainName);
    }

    // Auth routes
    if (pathname === '/api/auth/generate-api-key' && method === 'POST') {
      return generateApiKey(env, request);
    }
    if (pathname === '/api/auth/auth-api-key' && method === 'GET') {
      return authApiKey(env, request);
    }

    // Frontend – serve static assets for all other paths
    return serveFrontend(request, env);
  },
};

