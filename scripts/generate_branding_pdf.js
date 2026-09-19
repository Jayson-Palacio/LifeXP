const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BRANDING_DIR = path.join(__dirname, '..', 'branding');
const TEMP_DIR = path.join(__dirname, 'temp_branding_html');

// Create temp directory
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Check for marked package
try {
  require.resolve('marked');
} catch (e) {
  console.log('Installing "marked" markdown parser locally...');
  execSync('npm install --no-save marked', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

const { marked } = require('marked');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Premium Print-Optimized CSS for Kaeluma Brand Documents
// Engineered for clean, overlap-free, professional PDF output
const CSS_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');

@page {
  size: letter;
  margin: 18mm 14mm 16mm 14mm;
  @bottom-right {
    content: counter(page);
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 7.5pt;
    color: #B0B7C3;
  }
}

@page :first {
  margin-top: 0;
  margin-bottom: 0;
  @bottom-right { content: none; }
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #FFFFFF;
  color: #1F2937;
  line-height: 1.55;
  font-size: 9.5pt;
  orphans: 3;
  widows: 3;
}

/* ═══════════════════════════════════════════
   COVER PAGE — full first page, no overflow
   ═══════════════════════════════════════════ */
.cover-page {
  page-break-after: always;
  page-break-inside: avoid;
  width: 100%;
  min-height: 8in;
  padding: 60px 48px;
  text-align: center;
  background: linear-gradient(165deg, #FAFBFC 0%, #F3F0FF 40%, #EDE9FE 100%);
  border: 1px solid #E2E0F0;
  border-radius: 0;
  position: relative;
  overflow: hidden;
}

.cover-page::before {
  content: '';
  position: absolute;
  top: 12px; left: 12px; right: 12px; bottom: 12px;
  border: 1.5px solid rgba(168,85,247,0.18);
  border-radius: 6px;
  pointer-events: none;
}

/* Decorative corner accents */
.cover-page::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 220px; height: 220px;
  background: radial-gradient(circle at 100% 100%, rgba(168,85,247,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.cover-spacer { height: 100px; }

.cover-border-line { display: none; /* Replaced by ::before pseudo */ }

.cover-logo-icon {
  font-size: 42pt;
  margin-bottom: 12px;
  display: block;
}

.cover-title {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-size: 36pt;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #1E1B4B 20%, #7C3AED 60%, #A855F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.025em;
}

.cover-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #A855F7, #6366F1);
  margin: 16px auto;
  border-radius: 2px;
}

.cover-subtitle {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-size: 13pt;
  font-weight: 700;
  color: #4B5563;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cover-meta {
  font-size: 9.5pt;
  color: #6B7280;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.cover-version {
  display: inline-block;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 7.5pt;
  font-weight: 600;
  color: #7C3AED;
  border: 1px solid rgba(124,58,237,0.22);
  padding: 4px 14px;
  border-radius: 100px;
  background: rgba(124,58,237,0.04);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════════
   TYPOGRAPHY
   ═══════════════════════════════════════════ */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  color: #1E1B4B;
  font-weight: 800;
  page-break-after: avoid;
  orphans: 3;
  widows: 3;
}

h1 {
  font-size: 16pt;
  margin: 0 0 10px 0;
  padding: 14px 0 6px 0;
  border-bottom: 2px solid #E5E7EB;
  page-break-before: always;
  line-height: 1.25;
}

/* First h1 after cover should NOT create extra blank page */
.cover-page + h1,
body > h1:first-of-type {
  page-break-before: avoid;
  margin-top: 0;
  padding-top: 0;
}

h2 {
  font-size: 12.5pt;
  color: #7C3AED;
  margin: 16px 0 6px 0;
  padding-bottom: 3px;
  border-bottom: 1px solid #F0EDF8;
  line-height: 1.3;
}

h3 {
  font-size: 10.5pt;
  color: #4F46E5;
  margin: 12px 0 4px 0;
  line-height: 1.3;
}

h4 {
  font-size: 9.5pt;
  color: #6366F1;
  margin: 10px 0 3px 0;
}

p {
  margin: 0 0 8px 0;
  color: #374151;
  line-height: 1.55;
}

a {
  color: #4F46E5;
  text-decoration: none;
  font-weight: 500;
}

strong { color: #111827; }

/* ═══════════════════════════════════════════
   LISTS — compact, no runaway spacing
   ═══════════════════════════════════════════ */
ul, ol {
  margin: 0 0 8px 0;
  padding-left: 18px;
  color: #374151;
}

li {
  margin-bottom: 2px;
  line-height: 1.5;
}

li > ul, li > ol {
  margin-top: 2px;
  margin-bottom: 2px;
}

/* ═══════════════════════════════════════════
   CODE — inline & blocks
   ═══════════════════════════════════════════ */
code {
  font-family: 'Consolas', 'Cascadia Code', 'Courier New', monospace;
  background-color: #F3F4F6;
  color: #92400E;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8pt;
  border: 1px solid #E5E7EB;
  word-break: break-word;
}

pre {
  background-color: #1E1B2E;
  color: #E8E6F0;
  padding: 10px 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid #312E4A;
  page-break-inside: avoid;
  line-height: 1.45;
}

pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 7.5pt;
  border: none;
}

/* ═══════════════════════════════════════════
   TABLES — tight rows, no overlap
   ═══════════════════════════════════════════ */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 10px 0;
  font-size: 8.5pt;
  line-height: 1.35;
  border: 1px solid #D1D5DB;
  /* Allow long tables to break across pages */
  page-break-inside: auto;
}

thead {
  display: table-header-group; /* Repeat header on page breaks */
}

tr {
  page-break-inside: avoid;
  background-color: #FFFFFF;
}

tr:nth-child(even) {
  background-color: #FAFAFE;
}

th {
  background-color: #1E1B4B;
  color: #FFFFFF;
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 7pt;
  letter-spacing: 0.06em;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 2px solid #312E5A;
}

td {
  padding: 5px 8px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
  vertical-align: top;
  word-wrap: break-word;
}

/* ═══════════════════════════════════════════
   ALERTS / CALLOUT BOXES
   ═══════════════════════════════════════════ */
.alert {
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 6px;
  border-left: 3px solid;
  page-break-inside: avoid;
  font-size: 8.5pt;
  line-height: 1.45;
}

.alert-note {
  border-left-color: #3B82F6;
  color: #1E3A8A;
  background-color: #EFF6FF;
}

.alert-tip {
  border-left-color: #10B981;
  color: #065F46;
  background-color: #ECFDF5;
}

.alert-important {
  border-left-color: #7C3AED;
  color: #4C1D95;
  background-color: #F5F3FF;
}

.alert-warning {
  border-left-color: #F59E0B;
  color: #78350F;
  background-color: #FFFBEB;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 2px;
  text-transform: uppercase;
  font-size: 7pt;
  letter-spacing: 0.06em;
}

/* ═══════════════════════════════════════════
   BLOCKQUOTES
   ═══════════════════════════════════════════ */
blockquote {
  border-left: 3px solid #A855F7;
  background-color: #FAF5FF;
  padding: 8px 14px;
  margin: 8px 0;
  border-radius: 0 6px 6px 0;
  page-break-inside: avoid;
}

blockquote p {
  margin: 0;
  font-style: italic;
  color: #4B5563;
  font-size: 9pt;
}

/* ═══════════════════════════════════════════
   HORIZONTAL RULES
   ═══════════════════════════════════════════ */
hr {
  border: 0;
  border-top: 1px solid #E5E7EB;
  margin: 14px 0;
}

/* ═══════════════════════════════════════════
   MERMAID DIAGRAMS
   ═══════════════════════════════════════════ */
.mermaid {
  background-color: #FAFAFE;
  padding: 14px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  margin: 8px 0;
  text-align: center;
  page-break-inside: avoid;
}

/* ═══════════════════════════════════════════
   IMAGES — prevent overflow
   ═══════════════════════════════════════════ */
img {
  max-width: 100%;
  height: auto;
  page-break-inside: avoid;
}

/* ═══════════════════════════════════════════
   PRINT SAFETY — prevent awkward breaks
   ═══════════════════════════════════════════ */
h1 + *, h2 + *, h3 + *, h4 + * {
  page-break-before: avoid;
}

li, dt, dd {
  page-break-inside: avoid;
}
`;

// Helper to convert Markdown Alerts to styled HTML Alert Divs
function parseAlerts(html) {
  const alertRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi;
  return html.replace(alertRegex, (match, type, content) => {
    let alertClass = 'alert-note';
    let title = 'NOTE';
    
    switch (type.toUpperCase()) {
      case 'TIP':
        alertClass = 'alert-tip';
        title = '💡 TIP';
        break;
      case 'IMPORTANT':
        alertClass = 'alert-important';
        title = '⚡ IMPORTANT';
        break;
      case 'WARNING':
      case 'CAUTION':
        alertClass = 'alert-warning';
        title = '⚠️ WARNING';
        break;
    }
    
    return `<div class="alert ${alertClass}">
      <div class="alert-title">${title}</div>
      <div>${content.trim()}</div>
    </div>`;
  });
}

function generatePdfs() {
  const filesToCompile = [
    {
      md: 'brand_guide.md',
      pdf: 'brand_guide.pdf',
      title: 'Kaeluma - Brand Style Guide',
      subtitle: 'Brand Style & Design System',
      meta: 'A Gamified Quest Dashboard for Family Chores',
      version: 'Version 1.0 (Official Guide)'
    },
    {
      md: 'brand_deck.md',
      pdf: 'brand_deck.pdf',
      title: 'Kaeluma - Pitch Deck',
      subtitle: 'Creative Vision & Market Pitch',
      meta: 'Turning Real Life Duties Into RPG Quests',
      version: 'Interactive Partner Presentation'
    },
    {
      md: 'parent_launch_kit.md',
      pdf: 'parent_launch_kit.pdf',
      title: 'Kaeluma - Parent Sharing & Community Toolkit',
      subtitle: 'Parent Sharing & Community Toolkit',
      meta: 'Empower Families to Turn Routines into Adventures',
      version: 'Community Growth Pack'
    },
    {
      md: 'app_store_metadata.md',
      pdf: 'app_store_metadata.pdf',
      title: 'Kaeluma - App Store Optimization (ASO) Pack',
      subtitle: 'App Store Optimization & Metadata Spec',
      meta: 'Maximize Organic Downloads and Parenting Engagement',
      version: 'ASO Release Package'
    },
    {
      md: 'brand_messaging_playbook.md',
      pdf: 'brand_messaging_playbook.pdf',
      title: 'Kaeluma - Brand Messaging Playbook',
      subtitle: 'Brand Messaging & Copywriting Playbook',
      meta: 'Crafting a Consistent Voice across Parent Sanctuaries and Kid Guilds',
      version: 'Messaging Core Spec'
    },
    {
      md: 'adobe_assets_guide.md',
      pdf: 'adobe_assets_guide.pdf',
      title: 'Kaeluma - Adobe Creative Suite Guide',
      subtitle: 'Adobe Asset Production Workflows',
      meta: 'Photoshop, Illustrator, Premiere Pro & After Effects Templates',
      version: 'Creative Production Spec'
    }
  ];

  const msEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  if (!fs.existsSync(msEdgePath)) {
    console.error("Microsoft Edge was not found at: ", msEdgePath);
    process.exit(1);
  }

  console.log(`\n🚀 Starting Kaeluma PDF Export Loop...\n`);

  for (const doc of filesToCompile) {
    const mdPath = path.join(BRANDING_DIR, doc.md);
    const pdfPath = path.join(BRANDING_DIR, doc.pdf);
    const tempHtmlPath = path.join(TEMP_DIR, doc.md.replace('.md', '.html'));
    
    if (!fs.existsSync(mdPath)) {
      console.log(`⚠️ Skipping ${doc.md} (file not found)`);
      continue;
    }

    console.log(`📖 Compiling: ${doc.md} -> ${doc.pdf}`);
    const mdContent = fs.readFileSync(mdPath, 'utf8');

    // Convert Markdown to HTML
    let bodyHtml = marked.parse(mdContent);
    bodyHtml = parseAlerts(bodyHtml);

    // Inject beautiful Cover Page
    const coverHtml = `
    <div class="cover-page">
      <div class="cover-spacer"></div>
      <div class="cover-logo-icon">☀️</div>
      <h1 class="cover-title">Kaeluma</h1>
      <div class="cover-divider"></div>
      <div class="cover-subtitle">${doc.subtitle}</div>
      <p class="cover-meta">${doc.meta}</p>
      <div class="cover-version">${doc.version}</div>
    </div>
    `;

    // Remove the first H1 from body — the cover page already has the title
    bodyHtml = bodyHtml.replace(/^\s*<h1[^>]*>.*?<\/h1>/i, '');

    // Create full HTML string
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>${CSS_STYLE}</style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"><\/script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        themeVariables: {
          background: '#FAFAFE',
          primaryColor: '#F5F3FF',
          primaryTextColor: '#1E1B4B',
          lineColor: '#A78BFA',
          primaryBorderColor: '#C4B5FD',
          secondaryColor: '#EDE9FE',
          tertiaryColor: '#F3F4F6'
        }
      });
    });
  <\/script>
</head>
<body>
  ${coverHtml}
  ${bodyHtml}
</body>
</html>`;

    fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

    try {
      const edgeCmd = `"${msEdgePath}" --headless --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --user-data-dir="${path.join(TEMP_DIR, doc.md.replace('.md', '_EdgeProfile'))}" --print-to-pdf="${pdfPath}" "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
      execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
      console.log(`  ✅ Successfully printed ${doc.pdf}`);
    } catch (err) {
      console.error(`  ❌ Failed to export ${doc.md}:`, err.message);
    }
  }

  // Cleanup temp files
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n🧹 Cleaned up temporary directory.');
  } catch (err) {
    console.error('Temp directory cleanup failed:', err.message);
  }

  console.log('\n🎉 All PDF exports completed!');
}

generatePdfs();
