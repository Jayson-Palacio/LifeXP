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

// Custom CSS for premium, print-friendly PDFs
const CSS_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

@page {
  size: letter;
  margin: 20mm 15mm 20mm 15mm;
  @bottom-right {
    content: counter(page);
    font-family: 'Inter', sans-serif;
    font-size: 8pt;
    color: #9CA3AF;
  }
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1F2937;
  line-height: 1.6;
  font-size: 10.5pt;
  background-color: #FFFFFF;
}

h1, h2, h3, h4 {
  font-family: 'Outfit', sans-serif;
  color: #1E1B4B; /* Deep Navy */
  font-weight: 800;
  margin-top: 1.8rem;
  margin-bottom: 0.8rem;
  page-break-after: avoid;
}

h1 {
  font-size: 24pt;
  border-bottom: 3px solid #A855F7; /* Glowing Purple */
  padding-bottom: 6px;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 16pt;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 4px;
  color: #312E81;
}

h3 {
  font-size: 12.5pt;
  color: #4F46E5;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}

a {
  color: #4F46E5;
  text-decoration: none;
  font-weight: 500;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 1.2rem;
  padding-left: 20px;
}

li {
  margin-bottom: 0.4rem;
}

code {
  font-family: 'Consolas', 'Courier New', monospace;
  background-color: #F3F4F6;
  color: #D946EF; /* Vibrant Magenta/Pink for inline code */
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 9pt;
}

pre {
  background-color: #1F2937;
  color: #F9FAFB;
  padding: 14px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.2rem 0;
  page-break-inside: avoid;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  font-size: 8.5pt;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid #E5E7EB;
  padding: 10px 12px;
  text-align: left;
  font-size: 9.5pt;
}

th {
  background-color: #312E81;
  color: #FFFFFF;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 8.5pt;
  letter-spacing: 0.05em;
}

tr:nth-child(even) {
  background-color: rgba(168, 85, 247, 0.03);
}

/* Callout Box / Alert Styling */
.alert {
  padding: 12px 16px;
  margin: 1.5rem 0;
  border-radius: 6px;
  border-left: 5px solid;
  page-break-inside: avoid;
}

.alert-note {
  background-color: #EFF6FF;
  border-left-color: #3B82F6; /* Vivid Blue */
  color: #1E3A8A;
}

.alert-tip {
  background-color: #F0FDF4;
  border-left-color: #22C55E; /* Vibrant Green */
  color: #14532D;
}

.alert-important {
  background-color: #FAF5FF;
  border-left-color: #A855F7; /* Glowing Purple */
  color: #581C87;
}

.alert-warning {
  background-color: #FFFBEB;
  border-left-color: #F59E0B; /* Gold */
  color: #78350F;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-size: 8.5pt;
  letter-spacing: 0.05em;
}

blockquote {
  border-left: 4px solid #A855F7;
  background-color: rgba(168, 85, 247, 0.04);
  padding: 10px 16px;
  margin: 1.2rem 0;
  border-radius: 0 6px 6px 0;
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

/* Ensure checklists don't print checkboxes weirdly */
input[type="checkbox"] {
  margin-right: 8px;
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
<html>
<head>
  <meta charset="utf-8">
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
      const edgeCmd = `"${msEdgePath}" --headless --disable-gpu --no-pdf-header-footer --user-data-dir="${path.join(TEMP_DIR, 'EdgeProfile')}" --print-to-pdf="${pdfPath}" "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
      execSync(edgeCmd, { stdio: 'pipe' });
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
