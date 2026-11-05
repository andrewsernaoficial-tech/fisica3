/* Unidad III – Ley de Ohm y Circuitos | Física II */
const $ = id => document.getElementById(id);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const fmt = (x, u) => Math.abs(x) >= 1 ? x.toFixed(3) + ' ' + u : (x * 1000).toFixed(2) + ' m' + u;
const MONO = '"IBM Plex Mono",ui-monospace,monospace', SANS = '"IBM Plex Sans",system-ui,sans-serif';
const HS = [[47, 93, 148], [184, 116, 26], [184, 50, 44]];
const heatColor = h => { h = Math.max(0, Math.min(1, h)) * 2; const i = Math.min(1, Math.floor(h)), f = h - i, a = HS[i], b = HS[i + 1]; return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f))})`; };

/* ---------- Pestañas ---------- */
function tab(n) {
  $('p1').hidden = n != 1; $('p2').hidden = n != 2;
  $('t1').classList.toggle('on', n == 1); $('t2').classList.toggle('on', n == 2);
  $('t1').setAttribute('aria-selected', n == 1); $('t2').setAttribute('aria-selected', n == 2);
  n == 1 ? ohm() : circ();
}
$('t1').onclick = () => tab(1); $('t2').onclick = () => tab(2);

/* ---------- Módulo 1: Ley de Ohm ---------- */
const st = { V: 12, R: 100, I: .12, P: 1.44, phase: 0, last: 0 };

function ohm() {
  st.V = +$('V').value; st.R = +$('R').value; st.I = st.V / st.R; st.P = st.V * st.I;
  $('vV').textContent = st.V.toFixed(1) + ' V'; $('vR').textContent = st.R + ' Ω';
  $('oV').textContent = st.V.toFixed(1) + ' V'; $('oR').textContent = st.R + ' Ω';
  $('oI').textContent = fmt(st.I, 'A'); $('oP').textContent = fmt(st.P, 'W');
  $('bV').style.width = st.V / 24 * 100 + '%'; $('bV').style.background = css('--ac');
  $('bI').style.width = Math.min(100, st.I / 2 * 100) + '%'; $('bI').style.background = css('--cI');
  $('bP').style.width = Math.min(100, st.P / 50 * 100) + '%'; $('bP').style.background = css('--ac2');
  chart();
}

function chart() {
  const c = $('cv'), g = c.getContext('2d'), W = c.width, H = c.height, m = 54, Vm = 24;
  const Im = Vm / (st.R / 2) * 1.08;
  const X = v => m + v / Vm * (W - m - 14), Y = i => H - m - i / Im * (H - m - 16);
  g.clearRect(0, 0, W, H); g.font = '13px ' + MONO; g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) {
    const v = k * 6, i = k * Im / 4;
    g.strokeStyle = css('--ln'); g.beginPath(); g.moveTo(X(v), H - m); g.lineTo(X(v), 12); g.moveTo(m, Y(i)); g.lineTo(W - 14, Y(i)); g.stroke();
    g.fillStyle = css('--mut'); g.fillText(v, X(v) - 5, H - m + 16); g.fillText((i * 1000).toFixed(0), 6, Y(i) + 4);
  }
  g.fillText('V (V)', W - 48, H - 10); g.fillText('I (mA)', 6, 12);
  [[st.R / 2, 'R/2'], [st.R * 2, '2R']].forEach(([r, l]) => {
    g.strokeStyle = css('--mut'); g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(Vm), Y(Vm / r)); g.stroke();
    g.setLineDash([]); g.fillStyle = css('--mut'); g.fillText(l, X(Vm) - 26, Y(Vm / r) + 14);
  });
  g.globalAlpha = .08; g.fillStyle = css('--ac'); g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(Vm), Y(Vm / st.R)); g.lineTo(X(Vm), Y(0)); g.fill(); g.globalAlpha = 1;
  g.strokeStyle = css('--ac'); g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(Vm), Y(Vm / st.R)); g.stroke();
  g.setLineDash([4, 4]); g.strokeStyle = css('--tx'); g.lineWidth = 1; g.beginPath();
  g.moveTo(X(st.V), H - m); g.lineTo(X(st.V), Y(st.I)); g.lineTo(m, Y(st.I)); g.stroke(); g.setLineDash([]);
  g.fillStyle = css('--card'); g.beginPath(); g.arc(X(st.V), Y(st.I), 8, 0, 7); g.fill(); g.fillStyle = css('--ac'); g.beginPath(); g.arc(X(st.V), Y(st.I), 5, 0, 7); g.fill();
}

/* Animación: electrones circulando; velocidad ∝ I, brillo del resistor ∝ P */
function flowFrame(t) {
  requestAnimationFrame(flowFrame);
  const dt = Math.min(.05, (t - st.last) / 1000 || 0); st.last = t;
  if ($('p1').hidden) return;
  st.phase = (st.phase + Math.min(.5, st.I * 1.2) * dt) % 1;
  const c = $('fl'), g = c.getContext('2d'), W = c.width, H = c.height, x0 = 50, x1 = W - 50, y0 = 50, y1 = H - 50;
  g.clearRect(0, 0, W, H);
  g.strokeStyle = css('--wire'); g.lineWidth = 5; g.lineJoin = 'round'; g.globalAlpha = .45;
  g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.globalAlpha = 1;
  // resistor (arriba, centro) con brillo térmico
  const h = Math.min(1, st.P / 25), rx = W / 2 - 55;
  g.save(); g.shadowColor = heatColor(h); g.shadowBlur = 4 + 26 * h;
  g.fillStyle = heatColor(h); g.beginPath(); g.roundRect(rx, y0 - 17, 110, 34, 3); g.fill(); g.restore();
  g.fillStyle = '#fff'; g.font = '500 15px ' + MONO; g.textAlign = 'center'; g.fillText('R = ' + st.R + ' Ω', W / 2, y0 + 5);
  // batería (izquierda)
  g.fillStyle = css('--card'); g.fillRect(x0 - 14, H / 2 - 22, 28, 44);
  g.strokeStyle = css('--tx'); g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 18, H / 2 - 8); g.lineTo(x0 + 18, H / 2 - 8); g.stroke();
  g.lineWidth = 7; g.beginPath(); g.moveTo(x0 - 10, H / 2 + 8); g.lineTo(x0 + 10, H / 2 + 8); g.stroke();
  g.fillStyle = css('--tx'); g.textAlign = 'left'; g.fillText('+', x0 + 22, H / 2 - 4); g.fillText(st.V.toFixed(1) + ' V', x0 + 22, H / 2 + 20);
  g.textAlign = 'left'; g.fillText('I = ' + fmt(st.I, 'A'), W / 2 - 40, y1 + 30);
  // electrones recorriendo el perímetro (sentido horario)
  const w = x1 - x0, hh = y1 - y0, per = 2 * (w + hh), n = 34;
  for (let k = 0; k < n; k++) {
    let d = ((k / n + st.phase) % 1) * per, x, y;
    if (d < w) { x = x0 + d; y = y0 } else if ((d -= w) < hh) { x = x1; y = y0 + d } else if ((d -= hh) < w) { x = x1 - d; y = y1 } else { d -= w; x = x0; y = y1 - d }
    g.fillStyle = css('--cI'); g.beginPath(); g.arc(x, y, 4.5, 0, 7); g.fill();
  }
  g.shadowBlur = 0;
}
['V', 'R'].forEach(i => $(i).oninput = ohm);

/* ---------- Módulo 2: Circuitos ---------- */
function solve(mode, V, r) {
  const [a, b, c] = r; let rows, Req, It;
  if (mode == 's') { Req = a + b + c; It = V / Req; rows = r.map((x, i) => ({ n: 'R' + (i + 1), R: x, I: It, V: It * x })); }
  else if (mode == 'p') { Req = 1 / (1 / a + 1 / b + 1 / c); It = V / Req; rows = r.map((x, i) => ({ n: 'R' + (i + 1), R: x, V, I: V / x })); }
  else { const Rp = b * c / (b + c); Req = a + Rp; It = V / Req; const Vp = It * Rp;
    rows = [{ n: 'R1', R: a, I: It, V: It * a }, { n: 'R2', R: b, V: Vp, I: Vp / b }, { n: 'R3', R: c, V: Vp, I: Vp / c }]; }
  rows.forEach(x => x.P = x.V * x.I);
  return { rows, Req, It, Pt: V * It };
}

function diagram(mode, s, V) {
  const pm = Math.max(...s.rows.map(x => x.P)) || 1, dur = I => I > 0 ? Math.min(8, Math.max(.3, .03 / I)) : 0;
  const wire = (d, I) => `<path class="rw" d="${d}"/>` + (dur(I) ? `<path class="flow" d="${d}" style="animation-duration:${(dur(I) / 7).toFixed(2)}s"/>` : '');
  const box = (x, y, w, h, r, lines) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${heatColor(r.P / pm)}"/>` +
    lines.map((t, i) => `<text x="${x + w / 2}" y="${y + 17 + i * 13}" text-anchor="middle" fill="#fff" style="fill:#fff">${t}</text>`).join('') + '</g>';
  const lab = r => [r.n + ' ' + r.R + 'Ω', r.V.toFixed(2) + 'V', (r.I * 1000).toFixed(1) + 'mA'];
  const R = s.rows;
  const bat = `<g stroke="var(--tx)" stroke-width="3"><line x1="26" y1="88" x2="54" y2="88"/><line x1="32" y1="104" x2="48" y2="104" stroke-width="6"/></g>
    <text x="60" y="86">+</text><text x="60" y="112">${V} V</text>`;
  let o = '';
  if (mode == 's') {
    o += wire('M40 88V40H95', s.It) + wire('M165 40H190', s.It) + wire('M260 40H285', s.It) + wire('M355 40H380V170H40V104', s.It)
      + box(95, 18, 70, 44, R[0], lab(R[0])) + box(190, 18, 70, 44, R[1], lab(R[1])) + box(285, 18, 70, 44, R[2], lab(R[2]));
  } else if (mode == 'p') {
    o += wire('M40 88V28H320', s.It) + wire('M40 104V172H320', s.It);
    [130, 225, 320].forEach((x, i) => { o += wire(`M${x} 28V60`, R[i].I) + wire(`M${x} 122V172`, R[i].I) + box(x - 38, 60, 76, 62, R[i], lab(R[i])); });
  } else {
    o += wire('M40 88V40H100', s.It) + wire('M170 40H260', s.It) + wire('M40 104V172H340', s.It)
      + wire('M260 40V60M260 122V172', R[1].I) + wire('M340 40V60M340 122V172', R[2].I) + wire('M260 40H340', R[2].I)
      + box(100, 18, 70, 44, R[0], lab(R[0])) + box(222, 60, 76, 62, R[1], lab(R[1])) + box(302, 60, 76, 62, R[2], lab(R[2]));
  }
  return o + bat;
}

function circ() {
  const mode = $('mode').value, V = +$('cV').value, r = [+$('r1').value, +$('r2').value, +$('r3').value];
  if (!(V >= 0) || r.some(x => !(x > 0))) return;
  const s = solve(mode, V, r), pm = Math.max(...s.rows.map(x => x.P)) || 1;
  $('dg').innerHTML = diagram(mode, s, V);
  $('rq').textContent = s.Req.toFixed(2) + ' Ω'; $('it').textContent = fmt(s.It, 'A'); $('pt').textContent = fmt(s.Pt, 'W'); $('vt').textContent = V + ' V';
  $('tb').innerHTML = s.rows.map(x => `<tr><td><span class="dot" style="background:${heatColor(x.P / pm)}"></span>${x.n}</td><td>${x.R}</td><td>${x.V.toFixed(3)}</td><td>${(x.I * 1000).toFixed(3)}</td><td>${(x.P * 1000).toFixed(3)}</td></tr>`).join('');
  const sp = s.rows.reduce((a, x) => a + x.P, 0);
  const kv = mode == 's' ? 'ΣV = ' + s.rows.reduce((a, x) => a + x.V, 0).toFixed(3) + ' V = V fuente (LVK)'
    : mode == 'p' ? 'ΣI = ' + (s.rows.reduce((a, x) => a + x.I, 0) * 1000).toFixed(3) + ' mA = I total (LCK)'
    : 'V1 + V2 = ' + (s.rows[0].V + s.rows[1].V).toFixed(3) + ' V = V fuente; I1 = I2 + I3';
  $('chk').innerHTML = '<b>Verificación</b> · ' + kv + ' · ΣP = ' + (sp * 1000).toFixed(3) + ' mW = P fuente';
}
['mode', 'cV', 'r1', 'r2', 'r3'].forEach(i => $(i).oninput = circ);
const PRE = { a: ['s', 12, 100, 220, 330], b: ['p', 9, 100, 200, 300], c: ['m', 12, 100, 200, 300] };
document.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => {
  const [m, v, a, bb, c] = PRE[b.dataset.pre]; $('mode').value = m; $('cV').value = v; $('r1').value = a; $('r2').value = bb; $('r3').value = c; circ();
});
matchMedia('(prefers-color-scheme:dark)').onchange = () => { ohm(); circ(); };

ohm(); requestAnimationFrame(flowFrame);
