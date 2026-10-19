// Desenha o ícone do FitPro (bonequinho levantando a barra) sem dependências:
// formas por distância com borda suavizada e PNG gravado com o zlib do Node.
// Uso: node scripts/generate-icons.mjs  →  apps/mobile/assets/*.png
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const SIZE = 1024;
const COLORS = {
  ground: [0x03, 0x13, 0x1a],
  halo: [0x0c, 0x3a, 0x1e],
  body: [0xee, 0xf5, 0xf3],
  plate: [0x3b, 0xea, 0x62],
  white: [0xff, 0xff, 0xff],
};

// ---------- formas (distância com sinal: negativa dentro) ----------
const segment = (ax, ay, bx, by, width) => (x, y) => {
  const px = x - ax;
  const py = y - ay;
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - dx * t, py - dy * t) - width / 2;
};
const disk = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r;
const ring = (cx, cy, r, width) => (x, y) => Math.abs(Math.hypot(x - cx, y - cy) - r) - width / 2;
const roundedBox = (cx, cy, w, h, r) => (x, y) => {
  const qx = Math.abs(x - cx) - w / 2 + r;
  const qy = Math.abs(y - cy) - h / 2 + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

/**
 * Bonequinho de frente fazendo desenvolvimento: barra acima da cabeça,
 * anilhas verdes, pernas abertas. `s` escala em torno do centro (área segura do ícone adaptativo).
 */
const figureLayers = (s, bodyColor, plateColor, headFill) => {
  const c = SIZE / 2;
  const at = (v) => c + (v - c) * s;
  const w = (v) => v * s;
  const limb = 36;
  return [
    { shape: segment(at(300), at(318), at(724), at(318), w(26)), color: bodyColor },
    { shape: roundedBox(at(322), at(318), w(52), w(176), w(18)), color: plateColor },
    { shape: roundedBox(at(702), at(318), w(52), w(176), w(18)), color: plateColor },
    { shape: segment(at(420), at(318), at(400), at(424), w(limb)), color: bodyColor },
    { shape: segment(at(400), at(424), at(466), at(506), w(limb)), color: bodyColor },
    { shape: segment(at(604), at(318), at(624), at(424), w(limb)), color: bodyColor },
    { shape: segment(at(624), at(424), at(558), at(506), w(limb)), color: bodyColor },
    { shape: segment(at(466), at(506), at(558), at(506), w(limb)), color: bodyColor },
    { shape: segment(at(512), at(506), at(512), at(656), w(limb)), color: bodyColor },
    { shape: segment(at(512), at(656), at(446), at(806), w(limb)), color: bodyColor },
    { shape: segment(at(512), at(656), at(578), at(806), w(limb)), color: bodyColor },
    ...(headFill ? [{ shape: disk(at(512), at(432), w(38)), color: headFill }] : []),
    { shape: ring(at(512), at(432), w(38), w(26)), color: bodyColor },
  ];
};

// ---------- rasterização ----------
const render = (layers, background) => {
  const pixels = new Float32Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      let [r, g, b, a] = background ? [background[0] / 255, background[1] / 255, background[2] / 255, 1] : [0, 0, 0, 0];
      for (const layer of layers) {
        const coverage = Math.max(0, Math.min(1, 0.5 - layer.shape(x + 0.5, y + 0.5)));
        if (coverage === 0) continue;
        const [lr, lg, lb] = layer.color.map((v) => v / 255);
        // "over" com alfa pré-multiplicado
        r = lr * coverage + r * (1 - coverage);
        g = lg * coverage + g * (1 - coverage);
        b = lb * coverage + b * (1 - coverage);
        a = coverage + a * (1 - coverage);
      }
      pixels.set([r, g, b, a], i);
    }
  }
  return pixels;
};

// ---------- PNG (RGBA 8 bits) ----------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};
const encodePng = (pixels) => {
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0;
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const a = pixels[i + 3];
      const o = y * (SIZE * 4 + 1) + 1 + x * 4;
      // desfaz o pré-multiplicado para gravar RGBA normal
      raw[o] = a > 0 ? Math.round((pixels[i] / a) * 255) : 0;
      raw[o + 1] = a > 0 ? Math.round((pixels[i + 1] / a) * 255) : 0;
      raw[o + 2] = a > 0 ? Math.round((pixels[i + 2] / a) * 255) : 0;
      raw[o + 3] = Math.round(a * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const outDir = fileURLToPath(new URL('../apps/mobile/assets/', import.meta.url));
mkdirSync(outDir, { recursive: true });
const save = (name, pixels) => {
  writeFileSync(outDir + name, encodePng(pixels));
  console.log(`apps/mobile/assets/${name}`);
};

const halo = { shape: disk(SIZE / 2, SIZE / 2 + 20, 400), color: COLORS.halo };

// Ícone clássico (iOS e Android antigo): quadrado cheio.
save('icon.png', render([halo, ...figureLayers(1, COLORS.body, COLORS.plate, COLORS.ground)], COLORS.ground));
// Ícone adaptativo do Android: só a frente, dentro da área segura (o sistema recorta a borda).
save(
  'adaptive-icon.png',
  render([{ shape: disk(SIZE / 2, SIZE / 2 + 14, 300), color: COLORS.halo }, ...figureLayers(0.72, COLORS.body, COLORS.plate, COLORS.ground)]),
);
// Ícone temático do Android 13+: uma cor só, o sistema pinta.
save('monochrome-icon.png', render(figureLayers(0.72, COLORS.white, COLORS.white, null)));
// Abertura do app.
save('splash-icon.png', render(figureLayers(1, COLORS.body, COLORS.plate, COLORS.ground)));
