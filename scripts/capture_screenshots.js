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

  // Wait for the dev server to boot up (5 seconds)
  console.log('⏰ Waiting 6 seconds for Next.js to start on http://localhost:3000 ...');
  await wait(6000);

  console.log('🌐 Launching headless Microsoft Edge...');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. Screenshot Landing Page
    console.log('📸 Navigating to Landing Page (http://localhost:3000/)...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000); // Allow animation to settle
    const landingPath = path.join(SCREENSHOT_DIR, 'landing_page.png');
    await page.screenshot({ path: landingPath, fullPage: false });
    console.log(`✅ Saved screenshot: landing_page.png`);

    // 2. Screenshot Login Page
    console.log('📸 Navigating to Login Page (http://localhost:3000/login)...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);
    const loginPath = path.join(SCREENSHOT_DIR, 'login_page.png');
    await page.screenshot({ path: loginPath, fullPage: false });
    console.log(`✅ Saved screenshot: login_page.png`);

    // 3. Screenshot Signup Page
    console.log('📸 Navigating to Signup Page (http://localhost:3000/signup)...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);
    const signupPath = path.join(SCREENSHOT_DIR, 'signup_page.png');
    await page.screenshot({ path: signupPath, fullPage: false });
    console.log(`✅ Saved screenshot: signup_page.png`);

  } catch (err) {
    console.error('❌ Error during browser automation:', err);
  } finally {
    if (browser) {
      console.log('🔌 Closing browser...');
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
