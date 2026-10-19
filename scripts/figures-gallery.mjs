// Gera páginas para conferir os bonequinhos com os quadros calculados pelo próprio app
// (packages/core-ui/src/figure). Os quadros vêm de dist/figure-frames.json.
//   dist/figures-gallery.html  todos os movimentos animados, com seletor de equipamento
//   dist/figures-poses.html    início e meio da repetição lado a lado (para revisão)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const frames = readFileSync(fileURLToPath(new URL('dist/figure-frames.json', root)), 'utf8');

const page = (mode) => `<!doctype html><meta charset="utf-8"><title>Bonequinhos FitPro</title>
<style>
body{margin:0;padding:16px;background:#03131A;color:#EEF5F3;font:14px system-ui}
h1{font-size:20px;margin:0 0 12px} .bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
button{background:#112A33;color:#EEF5F3;border:1px solid #1B3B45;border-radius:999px;padding:6px 12px;cursor:pointer}
button.on{border-color:#3BEA62;background:#0C3A1E}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(${mode === 'static' ? 240 : 200}px,1fr));gap:12px}
.card{background:#0A1F27;border:1px solid #1B3B45;border-radius:16px;padding:8px}
.card b{display:block;padding:4px 6px} svg{width:100%;display:block}
</style>
<h1>Movimentos do FitPro</h1>
<div class="bar" id="equip"></div>
<div class="grid" id="grid"></div>
<script>
const SCENES = ${frames};
const MODE = '${mode}';
const W = '#EEF5F3', G = '#3BEA62', M = '#86A3A8';
const pt = (p) => p[0] + ',' + p[1];
const poly = (pts, extra = '') => '<polyline points="' + pts.map(pt).join(' ') + '" fill="none" stroke="' + W + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" ' + extra + '/>';
const scenery = (s) => s.kind === 'bench'
  ? '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.width + '" height="5" rx="2" fill="' + M + '"/><line x1="' + (s.x + 6) + '" y1="' + s.y + '" x2="' + (s.x + 6) + '" y2="150" stroke="' + M + '" stroke-width="3"/><line x1="' + (s.x + s.width - 6) + '" y1="' + s.y + '" x2="' + (s.x + s.width - 6) + '" y2="150" stroke="' + M + '" stroke-width="3"/>'
  : s.kind === 'seat' ? '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.width + '" height="6" rx="2" fill="' + M + '"/><line x1="' + (s.x + s.width / 2) + '" y1="' + s.y + '" x2="' + (s.x + s.width / 2) + '" y2="150" stroke="' + M + '" stroke-width="3"/>' : '';
const load = (kind, j, scene) => {
  const at = scene.load === 'ankle' ? j.ankle : j.hand;
  const cable = (kind === 'cabo' || kind === 'maquina' || kind === 'elastico')
    ? '<circle cx="' + scene.anchor[0] + '" cy="' + scene.anchor[1] + '" r="5" fill="' + M + '"/><line x1="' + scene.anchor[0] + '" y1="' + scene.anchor[1] + '" x2="' + at[0] + '" y2="' + at[1] + '" stroke="' + G + '" stroke-width="' + (kind === 'elastico' ? 3 : 2) + '"' + (kind === 'elastico' ? ' stroke-dasharray="4 3"' : '') + '/>' : '';
  if (scene.load === 'ankle') return cable + '<rect x="' + (at[0] - 6) + '" y="' + (at[1] - 6) + '" width="12" height="12" rx="4" fill="' + G + '"/>';
  if (kind === 'barra') return cable + '<circle cx="' + at[0] + '" cy="' + at[1] + '" r="10" fill="none" stroke="' + G + '" stroke-width="5"/>';
  if (kind === 'halteres') return cable + '<circle cx="' + at[0] + '" cy="' + at[1] + '" r="6" fill="' + G + '"/>';
  if (kind === 'kettlebell') return cable + '<circle cx="' + at[0] + '" cy="' + (at[1] + 8) + '" r="7" fill="' + G + '"/>';
  if (kind === 'cabo' || kind === 'maquina') return cable + '<rect x="' + (at[0] - 5) + '" y="' + (at[1] - 2) + '" width="10" height="4" rx="2" fill="' + G + '"/>';
  return cable;
};
const draw = (scene, j, kind) => '<svg viewBox="0 0 240 160"><line x1="10" y1="150" x2="230" y2="150" stroke="#1B3B45" stroke-width="2"/>' + scenery(scene.scenery)
  + poly([j.hip, j.knee2, j.ankle2, j.toe2], 'opacity="0.45"') + poly([j.hip, j.shoulder])
  + '<circle cx="' + j.head[0] + '" cy="' + j.head[1] + '" r="9" fill="#112A33" stroke="' + W + '" stroke-width="4"/>'
  + poly([j.hip, j.knee, j.ankle, j.toe]) + poly([j.shoulder, j.elbow, j.hand]) + load(kind, j, scene) + '</svg>';
let kind = 'barra';
const KINDS = ['barra', 'halteres', 'kettlebell', 'cabo', 'maquina', 'elastico', 'peso_corporal'];
const bar = document.getElementById('equip');
bar.innerHTML = KINDS.map((k) => '<button data-k="' + k + '">' + k + '</button>').join('');
const marks = () => bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
bar.onclick = (e) => { if (e.target.dataset.k) { kind = e.target.dataset.k; marks(); if (MODE === 'static') render(0); } };
marks();
const names = Object.keys(SCENES);
const render = (frame) => {
  document.getElementById('grid').innerHTML = names.map((n) => {
    const s = SCENES[n];
    const body = MODE === 'static'
      ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' + draw(s, s.frames[0], kind) + draw(s, s.frames[Math.floor(s.frames.length / 2)], kind) + '</div>'
      : draw(s, s.frames[frame % (s.frames.length - 1)], kind);
    return '<div class="card"><b>' + n + '</b>' + body + '</div>';
  }).join('');
};
if (MODE === 'static') render(0);
else { let f = 0; setInterval(() => render(f++), 1100 * 2 / 24); }
</script>`;

writeFileSync(fileURLToPath(new URL('dist/figures-gallery.html', root)), page('animated'));
writeFileSync(fileURLToPath(new URL('dist/figures-poses.html', root)), page('static'));
console.log('dist/figures-gallery.html e dist/figures-poses.html gerados');
