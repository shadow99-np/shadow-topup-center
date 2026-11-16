const fs = require('fs');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

async function buildCSS() {
  console.log('Building Tailwind CSS bundle...');
  if (!fs.existsSync('src/app/globals.css')) {
    console.log('src/app/globals.css does not exist yet. Skipping CSS build.');
    return;
  }
  const inputCSS = fs.readFileSync('src/app/globals.css', 'utf8');
  const result = await postcss([tailwind]).process(inputCSS, {
    from: 'src/app/globals.css',
    to: 'src/app/tailwind.css'
  });
  fs.writeFileSync('src/app/tailwind.css', result.css);
  console.log(`✓ Tailwind CSS compiled successfully! Size: ${result.css.length} bytes`);
}

buildCSS().catch(err => {
  console.error(err);
  process.exit(1);
});
