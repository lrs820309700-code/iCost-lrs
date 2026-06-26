import sharp from 'sharp';
import fs from 'fs';

const sizes = [192, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/icons/icon.svg');

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
