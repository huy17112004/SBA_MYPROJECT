const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/components/ui');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let fixed = 0;
for (const file of files) {
  const p = path.join(dir, file);
  let text = fs.readFileSync(p, 'utf8');
  const orig = text;
  text = text.replace(/import \* as React from "@radix-ui\/(react-[^"]+)";/g, (m, pkg) => {
    const base = pkg.replace(/^react-/, '');
    const name = base.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Primitive';
    return `import * as ${name} from "@radix-ui/${pkg}";`;
  });
  if (file === 'toast.jsx') {
    text = text.replace(/export \{[\s\S]*?ToastAction\s*\};/, 'export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };');
  }
  if (text !== orig) {
    fs.writeFileSync(p, text, 'utf8');
    fixed++;
    console.log('updated', file);
  }
}
console.log('completed', fixed, 'file updates');
