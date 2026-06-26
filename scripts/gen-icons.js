// Generates solid-color PNG icons using only Node.js built-ins (no deps).
// Produces public/icon.png (512x512) and public/apple-touch-icon.png (180x180).
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n, 0); return b; }
function pngChunk(type, data) {
  const t = Buffer.from(type);
  return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]);
}

function solidPNG(size, r, g, b) {
  const ihdr = Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])]);
  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(size * rowSize);
  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < size; x++) {
      raw[y * rowSize + 1 + x * 3]     = r;
      raw[y * rowSize + 1 + x * 3 + 1] = g;
      raw[y * rowSize + 1 + x * 3 + 2] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Brand green: #1f8a5b = rgb(31, 138, 91)
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'icon.png'), solidPNG(512, 31, 138, 91));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), solidPNG(180, 31, 138, 91));
console.log('Icons written to public/');
