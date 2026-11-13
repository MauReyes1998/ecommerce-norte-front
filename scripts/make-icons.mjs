// Genera los íconos de la PWA sin dependencias: PNG a mano (zlib de Node) con una "N" en pixel art.
// Uso: node scripts/make-icons.mjs   → public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const BG = [17, 17, 17]; // #111111, igual que theme-color
const FG = [255, 255, 255];

// "N" en una retícula 5x7 (1 = píxel encendido).
const N = [
  '10001',
  '11001',
  '10101',
  '10101',
  '10101',
  '10011',
  '10001',
];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** PNG RGB de size×size con la N centrada; `padding` es la fracción de margen (más para maskable). */
function icon(size, padding) {
  const inner = Math.floor(size * (1 - padding * 2));
  const cell = Math.floor(inner / 8); // 5 columnas + aire, 7 filas
  const glyphW = cell * 5, glyphH = cell * 7;
  const x0 = Math.floor((size - glyphW) / 2), y0 = Math.floor((size - glyphH) / 2);

  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filtro 0
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - x0) / cell), gy = Math.floor((y - y0) / cell);
      const on = gx >= 0 && gx < 5 && gy >= 0 && gy < 7 && N[gy][gx] === '1';
      const [r, g, b] = on ? FG : BG;
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8 bits, RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', icon(192, 0.15));
writeFileSync('public/icon-512.png', icon(512, 0.15));
writeFileSync('public/icon-maskable-512.png', icon(512, 0.26)); // zona segura del 80 %
writeFileSync('public/apple-touch-icon.png', icon(180, 0.15));
console.log('Íconos generados en public/. Sustitúyelos por el logo real cuando lo tengas.');
