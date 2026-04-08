// ============================================
// APP ENTRY POINT
// ============================================

import { route, initRouter } from './router.js';
import { renderRoleSelect } from './pages/roleSelect.js';
import { renderSetup } from './pages/setup.js';
import { renderParentDashboard } from './pages/parentDashboard.js';
import { renderChildDashboard } from './pages/childDashboard.js';
import { renderRewardShop } from './pages/rewardShop.js';

// ---- Register Routes ----
route('/', () => renderRoleSelect());
route('/setup', () => renderSetup());
route('/parent', () => renderParentDashboard());
route('/kid/:id', (params) => renderChildDashboard(params));
route('/kid/:id/shop', (params) => renderRewardShop(params));

// ---- Initialize ----
initRouter();

// Clean up old Vite default files
// (counter.js, style.css, javascript.svg, main.js are no longer needed)
