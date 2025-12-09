#!/usr/bin/env node

/**
 * Generate favicon files from cubby-ui-logo-favicon.svg
 * Creates:
 * - favicon-16x16.png (16x16 - optimized for Firefox)
 * - favicon-32x32.png (32x32 - standard size)
 * - favicon-48x48.png (48x48 - for high-DPI displays)
 * - favicon.ico (multi-size ICO with 16x16, 32x32, 48x48)
 * - apple-icon.png (180x180 - for iOS)
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import { imagesToIco } from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Use the favicon-specific SVG with white logo on black rounded background
const svgPath = join(publicDir, 'cubby-ui-logo-favicon.svg');
const svgBuffer = readFileSync(svgPath);

/**
 * Convert a PNG buffer to a PNG object for ico generation
 */
function bufferToPNG(buffer) {
  return PNG.sync.read(buffer);
}

async function generateFavicons() {
  console.log('Generating favicons from cubby-ui-logo-favicon.svg...\n');

  try {
    // Generate 16x16 PNG (optimized for Firefox)
    console.log('Creating favicon-16x16.png...');
    const png16Buffer = await sharp(svgBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'favicon-16x16.png'), png16Buffer);
    console.log('✓ favicon-16x16.png created\n');

    // Generate 32x32 PNG
    console.log('Creating favicon-32x32.png...');
    const png32Buffer = await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'favicon-32x32.png'), png32Buffer);
    console.log('✓ favicon-32x32.png created\n');

    // Generate 48x48 PNG
    console.log('Creating favicon-48x48.png...');
    const png48Buffer = await sharp(svgBuffer)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'favicon-48x48.png'), png48Buffer);
    console.log('✓ favicon-48x48.png created\n');

    // Generate multi-size favicon.ico (16x16, 32x32, 48x48)
    console.log('Creating favicon.ico (multi-size: 16x16, 32x32, 48x48)...');
    const png16 = bufferToPNG(png16Buffer);
    const png32 = bufferToPNG(png32Buffer);
    const png48 = bufferToPNG(png48Buffer);
    const icoBuffer = imagesToIco([png16, png32, png48]);
    writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✓ favicon.ico created\n');

    // Generate apple-icon.png (180x180)
    console.log('Creating apple-icon.png (180x180)...');
    await sharp(svgBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(publicDir, 'apple-icon.png'));
    console.log('✓ apple-icon.png created\n');

    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
