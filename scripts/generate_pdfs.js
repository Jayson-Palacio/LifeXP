const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MARKETING_DIR = path.join(__dirname, '..', 'marketing');
const PDF_DIR = path.join(MARKETING_DIR, 'pdf');
const TEMP_DIR = path.join(__dirname, 'temp_html');

// Create directories if they don't exist
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}
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

// Configure marked to handle clean formatting
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
  margin-top: 15mm;
  margin-bottom: 15mm;
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
  page-break-inside: auto;
}

thead {
  display: table-header-group;
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

/* Ensure checklists don't print checkboxes weirdly */
input[type="checkbox"] {
  margin-right: 6px;
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

// Main compilation process
function compileMarkdownToPdf() {
  const files = fs.readdirSync(MARKETING_DIR)
    .filter(file => file.endsWith('.md') && file !== 'README.md'); // Convert specific guides first, README last
  
  // Always include README.md at the end
  if (fs.existsSync(path.join(MARKETING_DIR, 'README.md'))) {
    files.push('README.md');
  }

  const msEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  if (!fs.existsSync(msEdgePath)) {
    console.error("Microsoft Edge was not found at standard path: ", msEdgePath);
    console.log("Abort PDF generation. Please verify Edge is installed.");
    process.exit(1);
  }

  console.log(`\n🚀 Starting Kaeluma PDF Compilation Loop...\n`);

  for (const file of files) {
    const mdPath = path.join(MARKETING_DIR, file);
    const pdfName = file.replace('.md', '.pdf');
    const pdfPath = path.join(PDF_DIR, pdfName);
    const tempHtmlPath = path.join(TEMP_DIR, file.replace('.md', '.html'));
    
    console.log(`📄 Processing: ${file} -> ${pdfName}`);
    
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Parse Markdown to HTML
    let bodyHtml = marked.parse(mdContent);
    
    // Convert custom GitHub alert syntax to styled HTML callouts
    bodyHtml = parseAlerts(bodyHtml);
    
    // Wrap in standard layout template
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kaeluma Marketing - ${file.replace('.md', '')}</title>
  <style>${CSS_STYLE}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
    
    // Write temporary HTML file
    fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');
    
    // Run Microsoft Edge headless to print to PDF
    try {
      const edgeCmd = `"${msEdgePath}" --headless --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --user-data-dir="${path.join(TEMP_DIR, 'EdgeProfile_' + file.replace('.md', ''))}" --print-to-pdf="${pdfPath}" "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
      execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
      console.log(`✅ Success: Generated ${pdfName}`);
    } catch (err) {
      console.error(`❌ Failed printing ${file} to PDF:`, err.message);
    }
  }

  // Cleanup temporary HTML folder
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n🧹 Temporary HTML build folder cleaned up.');
  } catch (err) {
    console.error('Failed to cleanup temp HTML files:', err.message);
  }

  console.log(`\n🎉 PDF Generation Complete! Files are saved in: ${PDF_DIR}\n`);
}

compileMarkdownToPdf();
