export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(env) });
    }

    const origin = request.headers.get('Origin') || '';
    if (!origin.startsWith(env.ALLOWED_ORIGIN)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': env.ALLOWED_ORIGIN,
          'X-Title': 'Acronym Chain Game',
        },
        body: JSON.stringify(body),
      });

      const responseBody = await resp.text();
      return new Response(responseBody, {
        status: resp.status,
        headers: { ...corsHeaders(env), 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders(env), 'Content-Type': 'application/json' },
      });
    }
  },
};

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
