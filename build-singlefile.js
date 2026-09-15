import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'dist', 'assets');
const cssFile = fs.readdirSync(assetsDir).find((f) => f.endsWith('.css'));
const jsFile = fs.readdirSync(assetsDir).find((f) => f.endsWith('.js'));

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TransitMate — 100% Offline Single File Edition</title>
    <style>
${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>`;

fs.writeFileSync('transitmate-singlefile.html', html, 'utf-8');
console.log('✅ Generated 100% Standalone Offline File: transitmate-singlefile.html (' + (html.length / 1024).toFixed(1) + ' KB)');
