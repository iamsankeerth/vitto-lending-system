const fs = require('fs');
const md = fs.readFileSync('docs/ARCHITECTURE_WRITEUP.md', 'utf8');

let html = md
  .replace(/^# (.*$)/gim, '<h1 style="color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px;margin-bottom:24px;">$1</h1>')
  .replace(/^## (.*$)/gim, '<h2 style="color:#202124;margin-top:32px;margin-bottom:16px;">$1</h2>')
  .replace(/^### (.*$)/gim, '<h3 style="color:#202124;margin-top:24px;margin-bottom:12px;">$1</h3>')
  .replace(/^- (.*$)/gim, '<li style="margin-bottom:6px;">$1</li>')
  .replace(/```text([\s\S]*?)```/gim, '<pre style="background:#f8f9fa;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.5;"><code>$1</code></pre>')
  .replace(/```json([\s\S]*?)```/gim, '<pre style="background:#f8f9fa;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.5;"><code>$1</code></pre>')
  .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/gim, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color:#1a73e8;">$1</a>')
  .replace(/\n/gim, '<br>');

const template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #202124; font-size: 14px; line-height: 1.6; }
h1 { font-size: 28px; }
h2 { font-size: 20px; }
h3 { font-size: 16px; }
pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.5; }
li { margin-bottom: 6px; }
</style>
</head>
<body>
${html}
</body>
</html>`;

fs.writeFileSync('docs/Architecture_Writeup.html', template);
console.log('HTML generated');
