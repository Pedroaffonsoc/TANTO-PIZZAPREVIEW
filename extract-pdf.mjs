import { createCanvas } from 'canvas';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamically import pdfjs
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const pdfPath = join(__dirname, 'cardapio.pdf');
const outDir  = join(__dirname, 'images', 'cardapio');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(await readFile(pdfPath));
const pdf  = await pdfjsLib.getDocument({ data }).promise;

console.log(`Total de páginas: ${pdf.numPages}`);

for (let i = 1; i <= pdf.numPages; i++) {
  const page    = await pdf.getPage(i);
  const scale   = 2.0;
  const viewport = page.getViewport({ scale });

  const canvas  = createCanvas(viewport.width, viewport.height);
  const ctx     = canvas.getContext('2d');

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const outPath = join(outDir, `pagina-${String(i).padStart(2,'0')}.png`);
  writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`  ✓ Página ${i} → ${outPath}`);
}

console.log('\nPronto! Todas as páginas foram extraídas.');
