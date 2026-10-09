import sharp from "sharp";
import { writeFileSync } from "fs";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#146C3B"/>
  <g transform="translate(96 96) scale(13.333)" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 10a5 5 0 0 1-4-8 4 4 0 0 0 4 4h10a4 4 0 0 0 4-4 5 5 0 0 1-4 8"/>
    <path d="M6.4 15c-.3-.6-.4-1.3-.4-2 0-4 3-3 3-7"/>
    <path d="M10 12.5v1.6"/>
    <path d="M17.6 15c.3-.6.4-1.3.4-2 0-4-3-3-3-7"/>
    <path d="M14 12.5v1.6"/>
    <path d="M15 22a4 4 0 1 0-3-6.7A4 4 0 1 0 9 22Z"/>
    <path d="M9 18h.01"/>
    <path d="M15 18h.01"/>
  </g>
</svg>`;

writeFileSync("public/icons/icon.svg", svg);
const buf = Buffer.from(svg);

for (const size of [192, 512, 180]) {
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await sharp(buf).resize(size, size).png().toFile(`public/icons/${name}`);
}

console.log("icons ok");
