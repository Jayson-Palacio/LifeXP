const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(PROJECT_ROOT, 'branding', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Check and install puppeteer-core if missing
try {
  require.resolve('puppeteer-core');
} catch (e) {
  console.log('Installing "puppeteer-core" locally for browser automation...');
  execSync('npm install --no-save puppeteer-core', { stdio: 'inherit', cwd: PROJECT_ROOT });
}

const puppeteer = require('puppeteer-core');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
if (!fs.existsSync(EDGE_PATH)) {
  console.error("Microsoft Edge was not found at standard path:", EDGE_PATH);
  console.log("Cannot take screenshots. Please verify Edge path.");
  process.exit(1);
}

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Screenshot Configurations ──────────────────────────────────
const SCREENSHOTS = [
  // Public pages
  { name: 'landing_page',  url: '/',        viewport: { width: 1280, height: 800 }, waitMs: 2000 },
  { name: 'login_page',    url: '/login',   viewport: { width: 1280, height: 800 }, waitMs: 1000 },
  { name: 'signup_page',   url: '/signup',  viewport: { width: 1280, height: 800 }, waitMs: 1000 },

  // In-app demo pages (Kid Dashboard) — multiple device sizes
  { name: 'kid_dashboard_desktop',  url: '/demo-screenshots', viewport: { width: 1280, height: 800 },  waitMs: 3000, clickSelector: null },
  { name: 'kid_dashboard_iphone',   url: '/demo-screenshots', viewport: { width: 430,  height: 932, isMobile: true, deviceScaleFactor: 3 },  waitMs: 3000 },
  { name: 'kid_dashboard_ipad',     url: '/demo-screenshots', viewport: { width: 820,  height: 1180, isMobile: true, deviceScaleFactor: 2 }, waitMs: 3000 },

  // In-app demo pages (Parent Dashboard)
  { name: 'parent_dashboard_desktop', url: '/demo-screenshots', viewport: { width: 1280, height: 800 },  waitMs: 3000, switchTo: 'parent' },
  { name: 'parent_dashboard_iphone',  url: '/demo-screenshots', viewport: { width: 430,  height: 932, isMobile: true, deviceScaleFactor: 3 },  waitMs: 3000, switchTo: 'parent' },
  { name: 'parent_dashboard_ipad',    url: '/demo-screenshots', viewport: { width: 820,  height: 1180, isMobile: true, deviceScaleFactor: 2 }, waitMs: 3000, switchTo: 'parent' },
];

async function main() {
  console.log('🚀 Starting local Next.js development server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    shell: true,
    stdio: 'pipe'
  });

  // Log server output to console
  devServer.stdout.on('data', (data) => {
    console.log(`[Next.js]: ${data.toString().trim()}`);
  });
  devServer.stderr.on('data', (data) => {
    console.error(`[Next.js Error]: ${data.toString().trim()}`);
  });

  // Wait for the dev server to boot up
  console.log('⏰ Waiting 8 seconds for Next.js to start on http://localhost:3000 ...');
  await wait(8000);

  console.log('🌐 Launching headless Microsoft Edge...');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      defaultViewport: null, // We'll set per-screenshot
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const shot of SCREENSHOTS) {
      console.log(`\n📸 Capturing: ${shot.name} (${shot.viewport.width}x${shot.viewport.height})`);

      const page = await browser.newPage();
      await page.setViewport({
        width: shot.viewport.width,
        height: shot.viewport.height,
        isMobile: shot.viewport.isMobile || false,
        deviceScaleFactor: shot.viewport.deviceScaleFactor || 1,
      });

      await page.goto(`http://localhost:3000${shot.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(shot.waitMs);

      // If we need to switch dashboard view (e.g., to 'parent')
      if (shot.switchTo === 'parent') {
        try {
          const buttons = await page.$$('[data-screenshot-hide] button');
          for (const btn of buttons) {
            const text = await btn.evaluate(el => el.textContent);
            if (text.includes('Parent')) {
              await btn.click();
              await wait(2000);
              break;
            }
          }
        } catch (e) {
          console.log(`  ⚠️ Could not switch to parent view: ${e.message}`);
        }
      }

      // Hide the screenshot selector bar
      await page.evaluate(() => {
        const bar = document.querySelector('[data-screenshot-hide]');
        if (bar) bar.style.display = 'none';
      });
      await wait(500);

      const filePath = path.join(SCREENSHOT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`  ✅ Saved: ${shot.name}.png`);

      await page.close();
    }

  } catch (err) {
    console.error('❌ Error during browser automation:', err);
  } finally {
    if (browser) {
      console.log('\n🔌 Closing browser...');
      await browser.close();
    }

    console.log('🛑 Shutting down Next.js development server...');
    if (process.platform === 'win32') {
      // Force kill task trees on Windows to clean up child cmd/node processes
      try {
        execSync(`taskkill /pid ${devServer.pid} /f /t`, { stdio: 'ignore' });
      } catch (e) {
        // Fallback
        devServer.kill();
      }
    } else {
      devServer.kill();
    }
    console.log('🎉 Done! Screenshots are saved in branding/screenshots/');
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
