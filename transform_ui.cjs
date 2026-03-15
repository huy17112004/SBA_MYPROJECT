const fs = require('fs');
const path = require('path');

const uiDir = 'Frontend/FE/src/components/ui';
const files = fs.readdirSync(uiDir);

files.forEach(file => {
  if (!file.endsWith('.jsx') && !file.endsWith('.js')) return;
  
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove interfaces
  content = content.replace(/export interface \w+[\s\S]*?\{[\s\S]*?\n\}/g, '');
  content = content.replace(/interface \w+[\s\S]*?\{[\s\S]*?\n\}/g, '');
  
  // 2. Remove types
  // This one is more aggressive: match "type Name = " until a semicolon or a blank line
  content = content.replace(/(?:export )?type \w+ = [\s\S]*?(?:;|\n\n)/g, '');

  // 3. Remove generics from function calls
  // e.g., forwardRef<...>(, createContext<...>(, etc.
  content = content.replace(/(\w+)<[^>]+>(?=\()/g, '$1');

  // 4. Remove type annotations in function parameters and variable declarations
  // e.g., (props: Props), (value: string), const x: number = 1
  // We look for : followed by a Type name, but NOT inside a JSX attribute (attr={...})
  // This is hard, so we target common Shadcn patterns.
  content = content.replace(/(\(|\w+| \})\s*:\s*[A-Z]\w*(?:<[^>]*>)?(?:\[\])?(?=[\s,),=])/g, '$1');
  
  // 5. Remove return type annotations
  content = content.replace(/\)\s*:\s*[A-Z]\w*(?:<[^>]*>)?(?:\[\])?(?=\s*(?:=>|\{))/g, ')');

  // 6. Remove type assertions (as ...)
  // Only if NOT preceded by * (for import * as ...)
  content = content.replace(/([^\*])\s+as\s+[A-Z]\w*(?:\.[A-Z]\w*)*(?:<[^>]*>)?/g, '$1');
  content = content.replace(/([^\*])\s+as\s+const\b/g, '$1');
  content = content.replace(/([^\*])\s+as\s+any\b/g, '$1');

  // 7. Remove type-only imports
  content = content.replace(/import type \{[^}]*\} from [^;]+;/g, '');
  content = content.replace(/import \{[^}]*\} from [^;]+;/g, (match) => {
    if (match.includes('type ')) {
        let newMatch = match.replace(/type\s+/g, '');
        if (/import \{[ \t\n,]*\} from/.test(newMatch.trim())) return '';
        return newMatch;
    }
    return match;
  });

  // 8. Specific cleanup for remaining generic types like React.ElementRef
  content = content.replace(/React\.(?:ElementRef|ComponentPropsWithoutRef|ComponentProps)<[^>]+>/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${file}`);
});
