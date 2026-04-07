// Cloudflare Worker script to handle routing for API endpoints and frontend

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Define routes
  switch (url.pathname) {
    case '/api/data':
      return getData();
    case '/api/user':
      return getUser();
    case '/':
      return getFrontend();
    default:
      return new Response('Not found', { status: 404 });
  }
}

async function getData() {
  // Handle your API data request here
  return new Response(JSON.stringify({ message: 'Data response' }), { 
    headers: { 'Content-Type': 'application/json' } 
  });
}

async function getUser() {
  // Handle your user request here
  return new Response(JSON.stringify({ message: 'User response' }), { 
    headers: { 'Content-Type': 'application/json' } 
  });
}

async function getFrontend() {
  // Serve your frontend files here
  return new Response('<html><body><h1>Welcome to Frontend</h1></body></html>', { 
    headers: { 'Content-Type': 'text/html' } 
  });
}