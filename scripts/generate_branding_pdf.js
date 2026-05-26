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

// Premium Dark Mode CSS for Kaeluma Brand Documents PDF (Screen/Digital reading layout)
const CSS_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');

@page {
  size: letter;
  margin: 15mm;
  @bottom-right {
    content: counter(page);
    font-family: 'Outfit', sans-serif;
    font-size: 8pt;
    color: #94a3b8;
  }
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: #0d0d14; /* Deep Space Canvas */
  color: #f8fafc; /* Bright Text */
  line-height: 1.6;
  font-size: 10.5pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Beautiful Title Page */
.cover-page {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  border: 1px solid rgba(255,255,255,0.08);
  background: radial-gradient(circle at center, #1e1b4b 0%, #0d0d14 70%);
  border-radius: 16px;
  padding: 40px;
  page-break-after: always;
  margin-bottom: 40px;
}

.cover-logo-icon {
  font-size: 56pt;
  margin-bottom: 10px;
}

.cover-title {
  font-family: 'Outfit', sans-serif;
  font-size: 42pt;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #a855f7, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}

.cover-divider {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #facc15, #f59e0b);
  margin: 24px 0;
  border-radius: 2px;
}

.cover-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 18pt;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cover-meta {
  font-size: 11pt;
  color: #94a3b8;
  margin: 0 0 40px 0;
}

.cover-version {
  font-family: 'Outfit', sans-serif;
  font-size: 9pt;
  font-weight: 600;
  color: #a855f7;
  border: 1px solid rgba(168,85,247,0.3);
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(168,85,247,0.1);
}

.page-break {
  page-break-after: always;
}

h1, h2, h3, h4 {
  font-family: 'Outfit', sans-serif;
  color: #f8fafc;
  font-weight: 800;
  page-break-after: avoid;
}

h1 {
  font-size: 20pt;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(255,255,255,0.08);
  padding-bottom: 8px;
}

h2 {
  font-size: 14pt;
  color: #a855f7; /* Brand Purple */
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 4px;
}

h3 {
  font-size: 11.5pt;
  color: #38bdf8; /* Ocean Blue */
  margin-top: 1.5rem;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #cbd5e1; /* Text muted */
}

a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 1.2rem;
  padding-left: 20px;
  color: #cbd5e1;
}

li {
  margin-bottom: 0.4rem;
}

code {
  font-family: 'Consolas', 'Courier New', monospace;
  background-color: #171723;
  color: #f472b6;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 9pt;
  border: 1px solid rgba(255,255,255,0.05);
}

pre {
  background-color: #171723;
  color: #f8fafc;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.2rem 0;
  border: 1px solid rgba(255,255,255,0.08);
  page-break-inside: avoid;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  font-size: 8.5pt;
  border: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  page-break-inside: avoid;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}

th, td {
  padding: 10px 12px;
  text-align: left;
  font-size: 9.5pt;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

th {
  background-color: #171723;
  color: #f8fafc;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 8.5pt;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

tr {
  background-color: #0d0d14;
}

tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.02);
}

/* Callout Box / Alert Styling */
.alert {
  padding: 12px 16px;
  margin: 1.5rem 0;
  border-radius: 8px;
  border-left: 4px solid;
  page-break-inside: avoid;
  background-color: #171723;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-right: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.alert-note {
  border-left-color: #38bdf8;
  color: #cbd5e1;
}

.alert-tip {
  border-left-color: #4ade80;
  color: #cbd5e1;
}

.alert-important {
  border-left-color: #a855f7;
  color: #cbd5e1;
}

.alert-warning {
  border-left-color: #fbbf24;
  color: #cbd5e1;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-size: 8.5pt;
  letter-spacing: 0.05em;
  color: #f8fafc;
}

blockquote {
  border-left: 4px solid #a855f7;
  background-color: rgba(168, 85, 247, 0.06);
  padding: 10px 16px;
  margin: 1.2rem 0;
  border-radius: 0 8px 8px 0;
}

blockquote p {
  margin: 0;
  font-style: italic;
  color: #e2e8f0;
}

hr {
  border: 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 2rem 0;
}

/* Keep page breaks clean before main section headers */
h1 {
  page-break-before: always;
}
.cover-page + h1 {
  page-break-before: avoid; /* Don't page break immediately after cover */
}

/* Render Mermaid properly */
.mermaid {
  background-color: #171723;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  margin: 1.5rem 0;
  text-align: center;
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
      <div class="cover-logo-icon">☀️</div>
      <h1 class="cover-title">Kaeluma</h1>
      <div class="cover-divider"></div>
      <div class="cover-subtitle">${doc.subtitle}</div>
      <p class="cover-meta">${doc.meta}</p>
      <div class="cover-version">${doc.version}</div>
    </div>
    `;

    // Create full HTML string
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>${CSS_STYLE}</style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        themeVariables: {
          background: '#171723',
          primaryColor: '#a855f7',
          primaryTextColor: '#f8fafc',
          lineColor: '#cbd5e1'
        }
      });
    });
  </script>
</head>
<body>
  ${coverHtml}
  ${bodyHtml}
</body>
</html>`;

    fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

    try {
      const edgeCmd = `"${msEdgePath}" --headless --disable-gpu --no-pdf-header-footer --user-data-dir="${path.join(TEMP_DIR, doc.md.replace('.md', '_EdgeProfile'))}" --print-to-pdf="${pdfPath}" "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
      execSync(edgeCmd, { stdio: 'pipe' });
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
