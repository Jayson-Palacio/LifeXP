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

// Premium Light/Executive Style CSS for Kaeluma Brand Documents PDF
const CSS_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');

@page {
  size: letter;
  margin: 20mm 15mm 20mm 15mm;
  @bottom-right {
    content: counter(page);
    font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
    font-size: 8pt;
    color: #9CA3AF;
  }
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif;
  background-color: #FFFFFF;
  color: #111827; /* Dark Charcoal */
  line-height: 1.6;
  font-size: 10pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Elegant Cover Page */
.cover-page {
  height: 9.0in; /* Safe height to prevent letter overflow */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  border: 1px solid #E5E7EB;
  background-color: #F9FAFB;
  border-radius: 12px;
  padding: 40px;
  page-break-after: always;
  margin-bottom: 40px;
}

.cover-border-line {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border: 1px dashed #A855F7;
  border-radius: 8px;
  pointer-events: none;
}

.cover-logo-icon {
  font-size: 48pt;
  margin-bottom: 15px;
}

.cover-title {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-size: 38pt;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #1E1B4B, #A855F7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}

.cover-divider {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #A855F7, #3B82F6);
  margin: 20px 0;
  border-radius: 2px;
}

.cover-subtitle {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-size: 15pt;
  font-weight: 700;
  color: #4B5563;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cover-meta {
  font-size: 10.5pt;
  color: #6B7280;
  margin: 0 0 30px 0;
}

.cover-version {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  font-size: 8.5pt;
  font-weight: 600;
  color: #A855F7;
  border: 1px solid rgba(168,85,247,0.2);
  padding: 5px 14px;
  border-radius: 9999px;
  background: rgba(168,85,247,0.04);
}

.page-break {
  page-break-after: always;
}

h1, h2, h3, h4 {
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  color: #1E1B4B;
  font-weight: 800;
  page-break-after: avoid;
}

h1 {
  font-size: 18pt;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 6px;
  page-break-before: always;
}

.cover-page + h1 {
  page-break-before: avoid; /* No page break immediately after cover */
}

h2 {
  font-size: 13.5pt;
  color: #A855F7; /* Purple */
  margin-top: 1.8rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 4px;
}

h3 {
  font-size: 11pt;
  color: #3B82F6; /* Blue */
  margin-top: 1.4rem;
  margin-bottom: 0.6rem;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #374151; /* Dark Grey body copy */
}

a {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 1.2rem;
  padding-left: 20px;
  color: #374151;
}

li {
  margin-bottom: 0.4rem;
}

code {
  font-family: 'Consolas', 'Courier New', monospace;
  background-color: #F3F4F6;
  color: #B45309; /* Dark Amber Code */
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 8.5pt;
  border: 1px solid #E5E7EB;
}

pre {
  background-color: #1F2937;
  color: #F9FAFB;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.2rem 0;
  border: 1px solid #E5E7EB;
  page-break-inside: avoid;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  font-size: 8pt;
  border: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  page-break-inside: avoid;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
}

th, td {
  padding: 8px 10px;
  text-align: left;
  font-size: 9pt;
  border-bottom: 1px solid #E5E7EB;
}

th {
  background-color: #1E1B4B;
  color: #FFFFFF;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 8pt;
  letter-spacing: 0.05em;
}

tr {
  background-color: #FFFFFF;
}

tr:nth-child(even) {
  background-color: #F9FAFB;
}

/* Callout Box / Alert Styling */
.alert {
  padding: 12px 16px;
  margin: 1.5rem 0;
  border-radius: 8px;
  border-left: 4px solid;
  page-break-inside: avoid;
  background-color: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  border-right: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
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
  border-left-color: #A855F7;
  color: #581C87;
  background-color: #FAF5FF;
}

.alert-warning {
  border-left-color: #F59E0B;
  color: #78350F;
  background-color: #FFFBEB;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-size: 8pt;
  letter-spacing: 0.05em;
  color: #111827;
}

blockquote {
  border-left: 4px solid #A855F7;
  background-color: #FAF5FF;
  padding: 10px 16px;
  margin: 1.2rem 0;
  border-radius: 0 8px 8px 0;
}

blockquote p {
  margin: 0;
  font-style: italic;
  color: #4B5563;
}

hr {
  border: 0;
  border-top: 1px solid #E5E7EB;
  margin: 2rem 0;
}

/* Render Mermaid properly */
.mermaid {
  background-color: #F9FAFB;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
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
    },
    {
      md: 'brand_messaging_playbook.md',
      pdf: 'brand_messaging_playbook.pdf',
      title: 'Kaeluma - Brand Messaging Playbook',
      subtitle: 'Brand Messaging & Copywriting Playbook',
      meta: 'Crafting a Consistent Voice across Parent Sanctuaries and Kid Guilds',
      version: 'Messaging Core Spec'
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
      <div class="cover-border-line"></div>
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
        theme: 'default',
        themeVariables: {
          background: '#F9FAFB',
          primaryColor: '#FAF5FF',
          primaryTextColor: '#1E1B4B',
          lineColor: '#CBD5E1'
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
