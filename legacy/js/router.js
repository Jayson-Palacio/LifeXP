// ============================================
// HASH-BASED SPA ROUTER
// ============================================

const routes = {};
let currentCleanup = null;

/**
 * Register a route handler.
 * @param {string} pattern - Route pattern like '/kid/:id' 
 * @param {Function} handler - Function(params) that renders the page. May return a cleanup function.
 */
export function route(pattern, handler) {
  routes[pattern] = handler;
}

/**
 * Navigate to a hash route.
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Match a URL hash against registered routes.
 */
function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';

  for (const pattern of Object.keys(routes)) {
    const params = matchPattern(pattern, path);
    if (params !== null) {
      return { handler: routes[pattern], params };
    }
  }
  return null;
}

function matchPattern(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Resolve the current hash and call the matched route handler.
 */
export function resolve() {
  // Cleanup previous page
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const hash = window.location.hash;
  const match = matchRoute(hash);

  const app = document.getElementById('app');

  if (match) {
    app.innerHTML = '';
    const result = match.handler(match.params);
    if (result instanceof Promise) {
      result.then(cleanup => {
        if (typeof cleanup === 'function') currentCleanup = cleanup;
      }).catch(err => console.error('Route error:', err));
    } else if (typeof result === 'function') {
      currentCleanup = result;
    }
  } else {
    // Default: go to root
    navigate('/');
  }
}

/**
 * Initialize the router.
 */
export function initRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
