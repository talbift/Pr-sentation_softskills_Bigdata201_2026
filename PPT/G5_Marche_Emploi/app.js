'use strict';
/* ============================================================
   CARRIÈRE PRO — app.js  (Slide Deck Edition)
   ============================================================ */

/* ── THEME ─────────────────────────────────────────────────── */
(function () {
  const stored = localStorage.getItem('theme');
  const preferred = window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', stored || preferred);
})();

document.getElementById('themeToggle').addEventListener('click', () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setTimeout(drawRadar, 50);
});

/* ── SLIDE ENGINE ───────────────────────────────────────────── */
const slides = Array.from(document.querySelectorAll('.slide'));
const TOTAL = slides.length;
let current = 0;
let isAnimating = false;

const progressBar = document.getElementById('progressBar');
const slideNum = document.getElementById('slideNum');
const slideTotal = document.getElementById('slideTotal');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
slideTotal.textContent = TOTAL;


function updateProgress(idx) {
  const pct = ((idx + 1) / TOTAL) * 100;
  progressBar.style.width = pct + '%';
}

function buildDotNav() {
  const nav = document.getElementById('dotNav');
  nav.innerHTML = '';
  slides.forEach((sl, i) => {
    const btn = document.createElement('button');
    let colorClass = 'c1';
    if (i >= 3 && i < 6) colorClass = 'c2';
    else if (i >= 6 && i < 9) colorClass = 'c3';
    else if (i >= 9) colorClass = 'c4';

    btn.className = 'dot ' + colorClass;
    btn.setAttribute('aria-label', 'Aller à la slide ' + (i + 1));
    btn.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);
  });
  updateDots(0);
}

function updateDots(idx) {
  document.querySelectorAll('#dotNav .dot').forEach((d, i) => {
    let colorClass = 'c1';
    if (i >= 3 && i < 6) colorClass = 'c2';
    else if (i >= 6 && i < 9) colorClass = 'c3';
    else if (i >= 9) colorClass = 'c4';

    d.className = 'dot ' + colorClass + (i === idx ? ' active' : '');
    d.setAttribute('aria-current', i === idx ? 'true' : 'false');
  });
}

function goTo(next, dir) {
  if (isAnimating || next === current || next < 0 || next >= TOTAL) return;
  isAnimating = true;

  const direction = dir !== undefined ? dir : (next > current ? 1 : -1);
  const leaving = slides[current];
  const entering = slides[next];

  leaving.classList.remove('active');
  leaving.classList.add(direction > 0 ? 'exit-left' : 'exit-right');

  entering.classList.remove('exit-left', 'exit-right');
  entering.classList.add(direction > 0 ? 'enter-right' : 'enter-left');
  // force reflow
  entering.getBoundingClientRect();

  entering.classList.remove('enter-right', 'enter-left');
  entering.classList.add('active');
  entering.scrollTop = 0;

  current = next;
  slideNum.textContent = current + 1;
  updateProgress(current);
  updateDots(current);
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === TOTAL - 1;

  setTimeout(() => {
    leaving.classList.remove('exit-left', 'exit-right');
    isAnimating = false;
  }, 420);
}

prevBtn.addEventListener('click', () => goTo(current - 1, -1));
nextBtn.addEventListener('click', () => goTo(current + 1, 1));

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1, 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1, -1);
});

// back to start (slide 12)
document.getElementById('backToStart').addEventListener('click', () => goTo(0));

buildDotNav();
prevBtn.disabled = true;

/* ── FULLSCREEN ─────────────────────────────────────────────── */
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen();
  }
});

/* ── PDF MODAL ──────────────────────────────────────────────── */
const pdfModal = document.getElementById('pdfModal');
document.getElementById('downloadPdf').addEventListener('click', () => {
  pdfModal.removeAttribute('hidden');
  document.getElementById('closePdfModal').focus();
});
document.getElementById('closePdfModal').addEventListener('click', () => pdfModal.setAttribute('hidden', ''));
document.getElementById('pdfBackdrop').addEventListener('click', () => pdfModal.setAttribute('hidden', ''));

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ── RADAR CHART ────────────────────────────────────────────── */
const radarAxes = [
  { label: 'Compétences tech.', value: 6 },
  { label: 'Communication', value: 7 },
  { label: 'Gestion projet', value: 5 },
  { label: 'Données / IA', value: 4 },
  { label: 'Travail équipe', value: 8 },
  { label: 'Leadership', value: 5 },
];

const radarCanvas = document.getElementById('radarCanvas');
const radarCtx = radarCanvas ? radarCanvas.getContext('2d') : null;

function drawRadar() {
  if (!radarCtx) return;
  const W = radarCanvas.width, H = radarCanvas.height;
  const cx = W / 2, cy = H / 2;
  const maxR = Math.min(cx, cy) - 26;
  const n = radarAxes.length;
  const step = (Math.PI * 2) / n;
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridC = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const labelC = dark ? '#8b949e' : '#656d76';
  const fillC = dark ? 'rgba(88,166,255,0.18)' : 'rgba(9,105,218,0.14)';
  const strokeC = dark ? '#58a6ff' : '#0969da';

  radarCtx.clearRect(0, 0, W, H);
  for (let r = 2; r <= 10; r += 2) {
    radarCtx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = step * i - Math.PI / 2;
      const rv = (r / 10) * maxR;
      const x = cx + Math.cos(a) * rv, y = cy + Math.sin(a) * rv;
      i === 0 ? radarCtx.moveTo(x, y) : radarCtx.lineTo(x, y);
    }
    radarCtx.closePath();
    radarCtx.strokeStyle = gridC; radarCtx.lineWidth = 1; radarCtx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const a = step * i - Math.PI / 2;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    radarCtx.strokeStyle = gridC; radarCtx.lineWidth = 1; radarCtx.stroke();
  }
  radarCtx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = step * i - Math.PI / 2;
    const rv = (radarAxes[i].value / 10) * maxR;
    const x = cx + Math.cos(a) * rv, y = cy + Math.sin(a) * rv;
    i === 0 ? radarCtx.moveTo(x, y) : radarCtx.lineTo(x, y);
  }
  radarCtx.closePath();
  radarCtx.fillStyle = fillC; radarCtx.fill();
  radarCtx.strokeStyle = strokeC; radarCtx.lineWidth = 2; radarCtx.stroke();
  for (let i = 0; i < n; i++) {
    const a = step * i - Math.PI / 2;
    const rv = (radarAxes[i].value / 10) * maxR;
    radarCtx.beginPath();
    radarCtx.arc(cx + Math.cos(a) * rv, cy + Math.sin(a) * rv, 4, 0, Math.PI * 2);
    radarCtx.fillStyle = strokeC; radarCtx.fill();
  }
  radarCtx.fillStyle = labelC; radarCtx.font = '10.5px Inter,system-ui,sans-serif';
  radarCtx.textAlign = 'center'; radarCtx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const a = step * i - Math.PI / 2;
    const rv = maxR + 18;
    radarCtx.fillText(radarAxes[i].label, cx + Math.cos(a) * rv, cy + Math.sin(a) * rv);
  }
}

(function buildRadarControls() {
  const c = document.getElementById('radarControls');
  if (!c) return;
  radarAxes.forEach((ax, i) => {
    const row = document.createElement('div');
    row.className = 'radar-item';
    row.innerHTML = `
      <label for="radar-${i}">${ax.label}</label>
      <input type="range" id="radar-${i}" min="0" max="10" value="${ax.value}" aria-label="${ax.label} ${ax.value}/10"/>
      <span class="radar-val" id="rv-${i}">${ax.value}</span>`;
    row.querySelector('input').addEventListener('input', function () {
      radarAxes[i].value = +this.value;
      document.getElementById('rv-' + i).textContent = this.value;
      drawRadar();
    });
    c.appendChild(row);
  });
  drawRadar();
})();

/* ── SKILLS MATRIX ──────────────────────────────────────────── */
const skills = [
  { name: 'Python / SQL', type: 'tech', level: 3 },
  { name: 'Analyse de données', type: 'tech', level: 2 },
  { name: 'Communication', type: 'soft', level: 4 },
  { name: 'Gestion de projet', type: 'soft', level: 3 },
  { name: 'Machine Learning', type: 'tech', level: 1 },
  { name: 'Leadership', type: 'soft', level: 2 },
];
const lvlLbls = ['', 'Débutant', 'Notions', 'Confirmé', 'Expert'];

function buildSkillRow(s, idx) {
  const row = document.createElement('div');
  row.className = 'skill-row';
  row.innerHTML = `
    <div class="skill-row-left">
      <span class="skill-name">${s.name}</span>
      <span class="sbadge sbadge-${s.type}">${s.type === 'tech' ? 'Tech' : 'Soft'}</span>
    </div>
    <div class="skill-dots" role="group" aria-label="Niveau ${s.name}">
      ${[1, 2, 3, 4].map(l => `<button class="sdot ${s.level >= l ? 'filled' : ''}" title="${lvlLbls[l]}" aria-label="Niveau ${l}" data-l="${l}" data-i="${idx}"></button>`).join('')}
    </div>`;
  row.querySelectorAll('.sdot').forEach(d => d.addEventListener('click', function () {
    skills[+this.dataset.i].level = +this.dataset.l;
    renderSkillsMatrix();
    showToast('Niveau : ' + lvlLbls[+this.dataset.l]);
  }));
  return row;
}
function renderSkillsMatrix() {
  const c = document.getElementById('skillsMatrix');
  if (!c) return;
  c.innerHTML = '';
  skills.forEach((s, i) => c.appendChild(buildSkillRow(s, i)));
}
renderSkillsMatrix();
document.getElementById('addSkillBtn').addEventListener('click', () => {
  const name = prompt('Nom de la compétence :'); if (!name?.trim()) return;
  const type = confirm('Compétence technique ?\n(OK = Tech, Annuler = Soft)') ? 'tech' : 'soft';
  skills.push({ name: name.trim(), type, level: 1 });
  renderSkillsMatrix();
});

/* ── CHECKLIST ──────────────────────────────────────────────── */
const checkItems = [
  'Lister mes 5 réalisations les plus significatives',
  'Chiffrer chaque réalisation (€, %, délai, volume)',
  'Identifier mes 3 compétences différenciantes',
  'Recueillir 2–3 témoignages (managers, pairs)',
  'Compiler mon portfolio de projets',
  'Comparer mon profil à 5 offres cibles récentes',
];
(function buildChecklist() {
  const c = document.getElementById('diagChecklist'); if (!c) return;
  checkItems.forEach(item => {
    const d = document.createElement('div');
    d.className = 'check-item';
    d.setAttribute('role', 'checkbox'); d.setAttribute('aria-checked', 'false'); d.setAttribute('tabindex', '0');
    d.innerHTML = `
      <div class="check-box" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div><span>${item}</span>`;
    const toggle = () => { const ok = d.classList.toggle('checked'); d.setAttribute('aria-checked', ok); };
    d.addEventListener('click', toggle);
    d.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    c.appendChild(d);
  });
})();

/* ── AXIS SELECTOR ──────────────────────────────────────────── */
const axisData = {
  expertise: 'Devenez la référence technique de votre domaine. Priorité : certifications, projets complexes, publications dans votre spécialité.',
  management: 'Développez leadership et gestion d\'équipe. Priorité : mentoring, gestion de projet, communication et coaching.',
  produit: 'Orientez-vous vers la stratégie produit. Priorité : UX, roadmap, OKR, relation stakeholders et go-to-market.',
  data: 'Spécialisez-vous en données et IA. Priorité : SQL, Python, ML, storytelling data et décision data-driven.',
  entrepreneuriat: 'Créez votre activité ou rejoignez une startup. Priorité : networking fondateurs, lean startup, validation marché.',
};
const axisDesc = document.getElementById('axisDesc');
function setAxis(a) {
  axisDesc.textContent = axisData[a] || '';
  document.querySelectorAll('.axis-btn').forEach(b => b.classList.toggle('active', b.dataset.axis === a));
}
document.querySelectorAll('.axis-btn').forEach(b => b.addEventListener('click', () => setAxis(b.dataset.axis)));
setAxis('expertise');

/* ── TIMELINE ───────────────────────────────────────────────── */
let tlItems = [
  { h: '3m', hl: '3 mois', text: 'Compléter une certification Python / SQL' },
  { h: '12m', hl: '12 mois', text: 'Décrocher un poste de Data Analyst confirmé' },
  { h: '3y', hl: '3 ans', text: 'Évoluer vers un rôle de Data Lead ou Manager' },
];
const hCycle = ['3m', '12m', '3y'], hLabel = { '3m': '3 mois', '12m': '12 mois', '3y': '3 ans' };
let nextH = 0;
function renderTimeline() {
  const c = document.getElementById('timelineEditor'); if (!c) return;
  c.innerHTML = '';
  tlItems.forEach((it, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="tl-dot d${it.h}"></div>
      <div class="tl-body">
        <div class="tl-header">
          <span class="tl-horizon h${it.h}">${it.hl}</span>
          <button class="tl-del" aria-label="Supprimer" data-i="${i}">✕</button>
        </div>
        <input class="tl-input" type="text" value="${it.text}" placeholder="Votre objectif…" data-i="${i}" aria-label="Objectif ${it.hl}"/>
      </div>`;
    el.querySelector('.tl-del').addEventListener('click', function () { tlItems.splice(+this.dataset.i, 1); renderTimeline(); });
    el.querySelector('.tl-input').addEventListener('input', function () { tlItems[+this.dataset.i].text = this.value; });
    c.appendChild(el);
  });
}
renderTimeline();
document.getElementById('addTimelineItem').addEventListener('click', () => {
  const h = hCycle[nextH % 3]; nextH++;
  tlItems.push({ h, hl: hLabel[h], text: '' });
  renderTimeline();
  const ins = document.querySelectorAll('.tl-input'); if (ins.length) ins[ins.length - 1].focus();
});

/* ── ACTION TABLE ───────────────────────────────────────────── */
let actions = [
  { action: 'Passer la certification AWS Cloud Practitioner', pillar: 'Compétences', deadline: '2025-06-30', status: 'todo' },
  { action: 'Contribuer à un projet open source (GitHub)', pillar: 'Projets', deadline: '2025-07-15', status: 'wip' },
  { action: 'Contacter 5 personnes sur LinkedIn', pillar: 'Réseau', deadline: '2025-05-31', status: 'done' },
  { action: 'Publier un article LinkedIn sur mon expertise', pillar: 'Visibilité', deadline: '2025-06-10', status: 'todo' },
];
const pillars = ['Compétences', 'Projets', 'Réseau', 'Visibilité'];
function renderActionTable() {
  const tb = document.getElementById('actionTableBody'); if (!tb) return;
  tb.innerHTML = '';
  actions.forEach((a, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" value="${a.action}" aria-label="Action" data-f="action" data-i="${i}"/></td>
      <td><select aria-label="Pilier" data-f="pillar" data-i="${i}">${pillars.map(p => `<option ${a.pillar === p ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
      <td><input type="date" value="${a.deadline}" aria-label="Échéance" data-f="deadline" data-i="${i}"/></td>
      <td><select aria-label="Statut" data-f="status" data-i="${i}">
        <option value="todo" ${a.status === 'todo' ? 'selected' : ''}>À faire</option>
        <option value="wip"  ${a.status === 'wip' ? 'selected' : ''}>En cours</option>
        <option value="done" ${a.status === 'done' ? 'selected' : ''}>Fait</option>
      </select></td>
      <td><button class="del-btn" aria-label="Supprimer" data-i="${i}">✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(el => el.addEventListener('change', function () { actions[+this.dataset.i][this.dataset.f] = this.value; }));
    tr.querySelector('.del-btn').addEventListener('click', function () { actions.splice(+this.dataset.i, 1); renderActionTable(); });
    tb.appendChild(tr);
  });
}
renderActionTable();
document.getElementById('addActionBtn').addEventListener('click', () => {
  actions.push({ action: '', pillar: 'Compétences', deadline: '', status: 'todo' });
  renderActionTable();
  const ins = document.querySelectorAll('#actionTableBody input[type=text]'); if (ins.length) ins[ins.length - 1].focus();
});

/* ── FLASHCARDS ─────────────────────────────────────────────── */
const cards = [
  { q: '"Parlez-moi de vous."', a: 'Passé (parcours clés) → Présent (projet actuel) → Futur (pourquoi ce poste). Max 90 secondes. Terminez par le lien explicite avec l\'offre.' },
  { q: '"Votre plus grande faiblesse ?"', a: 'Vraie limitation non critique pour le poste + prise de conscience + actions correctrices concrètes. Ex : "J\'avais du mal à déléguer, j\'ai suivi une formation management."' },
  { q: '"Pourquoi notre entreprise ?"', a: 'Citez 3 éléments concrets : un produit/service, une valeur + exemple, une actualité. Montrez que vous avez fait vos devoirs — jamais de "bonne réputation".' },
  { q: '"Décrivez une situation difficile."', a: 'STAR : Situation (contexte bref) → Tâche (votre rôle) → Action (ce que VOUS avez fait) → Résultat (chiffré si possible).' },
  { q: '"Où vous voyez-vous dans 5 ans ?"', a: 'Alignez sur le poste : "Développer mes compétences en [domaine], évoluer vers [rôle], contribuer à [mission]." Montrez ambition + réalisme.' },
  { q: '"Pourquoi quittez-vous votre poste ?"', a: 'Restez positif. Parlez de nouvelles responsabilités recherchées. Ne critiquez jamais l\'ancien employeur. Pivot vers ce que VOUS cherchez.' },
  { q: '"Avez-vous des questions pour nous ?"', a: 'Toujours oui ! Posez 2–3 questions : défis du poste, attendus à 3 mois, culture d\'équipe, opportunités de croissance. Évitez salaire en premier entretien.' },
  { q: '"Vos prétentions salariales ?"', a: 'Donnez une fourchette 10–15% au-dessus de votre cible, basée sur la grille du marché. "Je vise X–Y€ selon les responsabilités et le package global."' },
];
let curFlash = 0, flipped = false;
const flashcard = document.getElementById('flashcard');
const flashFront = document.getElementById('flashFront');
const flashBack = document.getElementById('flashBack');
const flashCtr = document.getElementById('flashCounter');

function renderFlash() {
  if (!flashFront) return;
  const c = cards[curFlash];
  flashFront.innerHTML = `<h4>${c.q}</h4><p>Cliquez pour la réponse modèle</p>`;
  flashBack.innerHTML = `<p>${c.a}</p>`;
  flashcard.classList.remove('flipped'); flipped = false;
  if (flashCtr) flashCtr.textContent = `${curFlash + 1} / ${cards.length}`;
}
if (flashcard) {
  flashcard.addEventListener('click', () => { flipped = !flipped; flashcard.classList.toggle('flipped', flipped); });
  flashcard.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipped = !flipped; flashcard.classList.toggle('flipped', flipped); }
  });
}
const nf = document.getElementById('nextFlash'), pf = document.getElementById('prevFlash');
if (nf) nf.addEventListener('click', () => { curFlash = (curFlash + 1) % cards.length; renderFlash(); });
if (pf) pf.addEventListener('click', () => { curFlash = (curFlash - 1 + cards.length) % cards.length; renderFlash(); });
renderFlash();


/* ── SCORECARD ──────────────────────────────────────────────── */
const scoreCriteria = [
  { label: 'Rémunération & avantages', value: 7 },
  { label: 'Missions & responsabilités', value: 6 },
  { label: 'Progression & évolution', value: 8 },
  { label: 'Culture & environnement', value: 7 },
  { label: 'Apprentissage & formation', value: 9 },
];
function computeScore() {
  const t = scoreCriteria.reduce((s, c) => s + Math.min(10, Math.max(0, c.value)), 0);
  const el = document.getElementById('scorecardTotal'); if (el) el.textContent = t;
}
(function buildScorecard() {
  const c = document.getElementById('scorecard'); if (!c) return;
  scoreCriteria.forEach((sc, i) => {
    const row = document.createElement('div'); row.className = 'score-row';
    row.innerHTML = `
      <span class="score-label">${sc.label}</span>
      <div class="score-input-wrap">
        <input class="score-input" type="number" min="0" max="10" value="${sc.value}" aria-label="${sc.label} /10" data-i="${i}"/>
        <span class="score-max">/ 10</span>
      </div>`;
    row.querySelector('input').addEventListener('input', function () { scoreCriteria[+this.dataset.i].value = +this.value || 0; computeScore(); });
    c.appendChild(row);
  });
  computeScore();
})();

/* ── WEEK PLAN ──────────────────────────────────────────────── */
const weekData = [
  { day: 'Jour 1', title: 'Cartographier', tasks: ['10 offres cibles', '5 compétences clés', '2–3 intitulés précis'] },
  { day: 'Jour 2', title: 'Se diagnostiquer', tasks: ['Matrice compétences', 'Chiffrer 5 réalisations', '3 forces différenciantes'] },
  { day: 'Jour 3', title: 'Outils', tasks: ['CV format impact', 'Titre LinkedIn', 'Projets & publications'] },
  { day: 'Jour 4', title: 'Réseau', tasks: ['10 contacts cibles', '5 messages envoyés', '2 cafés planifiés'] },
  { day: 'Jour 5', title: 'Candidatures', tasks: ['3 offres prioritaires', '1 lettre personnalisée chacune', 'Tableau de suivi'] },
  { day: 'Jour 6', title: 'Entretiens', tasks: ['Réviser flashcards', 'Rechercher entreprises', '5 questions à poser'] },
  { day: 'Jour 7', title: 'Bilan', tasks: ['Actions accomplies', 'Ajuster le plan', '3 priorités semaine 2'] },
];
(function buildWeekPlan() {
  const c = document.getElementById('weekPlan'); if (!c) return;
  weekData.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'day-card d' + (i + 1); el.setAttribute('role', 'listitem');
    el.innerHTML = `<div class="day-num">${d.day}</div><div class="day-title">${d.title}</div><ul class="day-tasks">${d.tasks.map(t => `<li>${t}</li>`).join('')}</ul>`;
    c.appendChild(el);
  });
})();

/* ── EXPORT JSON ────────────────────────────────────────────── */
document.getElementById('exportJson').addEventListener('click', () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: document.documentElement.getAttribute('data-theme'),
    radar: radarAxes, competences: skills, objectifs: tlItems,
    planCarriere: actions, kanban, scorecard: scoreCriteria, plan7jours: weekData,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'plan-carriere.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Plan exporté avec succès !');
});

/* ── ESC closes modals ──────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('pdfModal').setAttribute('hidden', '');
  }
});

/* ── TOUCH SWIPE (mobile navigation) ───────────────────────── */
(function initSwipe() {
  const deck = document.getElementById('deck');
  let startX = 0;
  let startY = 0;

  deck.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    // Ignore si le mouvement est principalement vertical (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return;
    // Ignore les micro-mouvements
    if (Math.abs(dx) < 35) return;

    if (dx < 0) {
      goTo(current + 1, 1);  // swipe gauche → slide suivante
    } else {
      goTo(current - 1, -1); // swipe droite → slide précédente
    }

    // Cache le hint après le premier swipe
    const hint = document.querySelector('.swipe-hint');
    if (hint) hint.style.opacity = '0';
  }, { passive: true });
})();

/* ── QUIZ ─────────────────────────────────────────────────── */
const quizData = [
  {
    question: "Quelle est la principale différence entre une 'Hard Skill' et une 'Soft Skill' ?",
    options: [
      { text: "L'une s'apprend à l'école, l'autre est innée.", correct: false },
      { text: "Les Hard Skills sont techniques/mesurables, les Soft Skills sont comportementales.", correct: true },
      { text: "Il n'y a aucune différence réelle.", correct: false },
      { text: "Les Soft Skills ne s'apprennent qu'en entreprise.", correct: false }
    ],
    feedback: "Les Hard Skills sont vos savoir-faire techniques, tandis que les Soft Skills sont vos savoir-être (empathie, communication).",
    correctMsg: "Exact ! Le combo des deux fait un profil complet."
  },
  {
    question: "Sur le radar de compétences, quelle note indique une expertise totale ?",
    options: [
      { text: "La note de 5", correct: false },
      { text: "La note de 10", correct: true },
      { text: "La note de 100", correct: false },
      { text: "Il n'y a pas de note maximum", correct: false }
    ],
    feedback: "Le radar de compétences utilise généralement une échelle de 0 à 10 pour visualiser l'équilibre de votre profil.",
    correctMsg: "Tout à fait, le curseur va jusqu'à 10."
  },
  {
    question: "Dans la méthode STAR, que signifie la lettre 'R' ?",
    options: [
      { text: "Responsabilité", correct: false },
      { text: "Réseautage", correct: false },
      { text: "Résultat (impact chiffré)", correct: true },
      { text: "Reconnaissance", correct: false }
    ],
    feedback: "C'est l'élément le plus important : prouver l'impact de vos actions par des chiffres ou des faits concrets.",
    correctMsg: "Exactement ! L'impact compte."
  },
  {
    question: "Que signifie l'acronyme SMART pour un objectif ?",
    options: [
      { text: "Simple, Mesurable, Atteignable, Rigoureux, Total", correct: false },
      { text: "Spécifique, Mesurable, Atteignable, Réaliste, Temporel", correct: true },
      { text: "Stratégique, Moderne, Ambitieux, Rapide, Technique", correct: false },
      { text: "Sérieux, Motivant, Accessible, Réel, Tardif", correct: false }
    ],
    feedback: "Un objectif SMART permet de transformer une intention vague en un plan d'action concret.",
    correctMsg: "La base de toute bonne stratégie de carrière."
  },
  {
    question: "Lequel de ces éléments n'est PAS l'un des '4 piliers' du plan de carrière ?",
    options: [
      { text: "Réseau", correct: false },
      { text: "Visibilité", correct: false },
      { text: "Chance", correct: true },
      { text: "Compétences", correct: false }
    ],
    feedback: "La chance se provoque ! Les 4 piliers sont : Compétences, Réseau, Visibilité et Vision.",
    correctMsg: "Bien vu. On ne subit pas sa carrière, on la construit."
  },
  {
    question: "Quel pourcentage des postes ne sont jamais publiés (marché caché) ?",
    options: [
      { text: "Environ 20%", correct: false },
      { text: "Environ 40%", correct: false },
      { text: "Environ 80%", correct: true },
      { text: "Seulement 5%", correct: false }
    ],
    feedback: "D'où l'importance capitale du réseau et du 'Personal Branding' pour accéder aux meilleures opportunités.",
    correctMsg: "C'est énorme, non ? C'est le marché invisible."
  },
  {
    question: "Lors d'une négociation salariale, que signifie le terme 'BATNA' ?",
    options: [
      { text: "Best Alternative To a Negotiated Agreement", correct: true },
      { text: "Business Action Towards New Assets", correct: false },
      { text: "Budget Annuel Total Net Atteint", correct: false },
      { text: "Basic Agreement To Next Action", correct: false }
    ],
    feedback: "C'est votre meilleure alternative en cas d'échec de la négociation actuelle. Plus votre BATNA est fort, plus vous avez de pouvoir.",
    correctMsg: "C'est votre filet de sécurité stratégique."
  },
  {
    question: "Quelle est la règle d'or pour 'Parlez-moi de vous' en entretien ?",
    options: [
      { text: "Raconter toute sa vie depuis l'école.", correct: false },
      { text: "Suivre la structure : Passé -> Présent -> Futur (max 90s).", correct: true },
      { text: "Attendre que le recruteur pose des questions.", correct: false },
      { text: "Parler uniquement de ses hobbies.", correct: false }
    ],
    feedback: "Soyez concis (90 secondes max) et montrez comment votre parcours mène logiquement au poste visé.",
    correctMsg: "C'est votre pitch d'ouverture, soignez-le !"
  },
  {
    question: "Selon vous, quel est l'élément le plus scruté par un recruteur sur LinkedIn ?",
    options: [
      { text: "Le nombre de vos relations (+500)", correct: false },
      { text: "Votre titre de profil (Headline)", correct: true },
      { text: "Votre photo de couverture", correct: false },
      { text: "La liste de vos certifications", correct: false }
    ],
    feedback: "Le titre (Headline) est la première chose indexée par l'algorithme et lue par les recruteurs.",
    correctMsg: "Bien vu ! C'est votre 'accroche' commerciale."
  },
  {
    question: "Quel est le meilleur support pour une 'Proof of Work' interactive ?",
    options: [
      { text: "Un PDF de 40 pages", correct: false },
      { text: "Un portfolio web ou un lien GitHub/Behance", correct: true },
      { text: "Une recommandation orale uniquement", correct: false },
      { text: "Un screenshot de votre bureau", correct: false }
    ],
    feedback: "Les preuves concrètes, visuelles et accessibles en un clic sont les plus persuasives pour un recruteur technique.",
    correctMsg: "Montrez ce que vous savez faire, ne vous contentez pas de le dire."
  },
  {
    question: "Quelle proportion de l'impact en entretien est liée au langage non-verbal ?",
    options: [
      { text: "Environ 10%", correct: false },
      { text: "Plus de 50%", correct: true },
      { text: "Moins de 2%", correct: false },
      { text: "Exactement 100%", correct: false }
    ],
    feedback: "La posture, le regard et le ton comptent énormément selon l'étude de Mehrabian (55/38/7).",
    correctMsg: "Le 'comment' est souvent aussi important que le 'quoi'."
  },
  {
    question: "Que signifie l'effet 'Halo' lors d'un recrutement ?",
    options: [
      { text: "La lumière trop forte dans la salle.", correct: false },
      { text: "Généraliser une seule qualité positive à tout le profil.", correct: true },
      { text: "Un logiciel de gestion de candidatures (ATS).", correct: false },
      { text: "Un type de contrat de travail hybride.", correct: false }
    ],
    feedback: "C'est un biais cognitif où un trait positif (ex: une grande école) occulte le reste des compétences ou défauts.",
    correctMsg: "C'est un piège mental pour les recruteurs (et les candidats)."
  },
  {
    question: "Quelle est la fréquence idéale pour relancer un recruteur après un entretien ?",
    options: [
      { text: "Toutes les 2 heures.", correct: false },
      { text: "Environ 1 semaine après la date prévue de réponse.", correct: true },
      { text: "Jamais, il faut attendre l'appel.", correct: false },
      { text: "Une fois par mois pendant un an.", correct: false }
    ],
    feedback: "Relancer après une semaine montre votre motivation sans paraître désespéré ou agressif.",
    correctMsg: "La persévérance est une soft skill !"
  },
  {
    question: "Quel est le but principal d'un 'Elevator Pitch' ?",
    options: [
      { text: "Vendre son produit final immédiatement.", correct: false },
      { text: "Susciter l'intérêt et obtenir un 2ème RDV en <60s.", correct: true },
      { text: "Expliquer son code ligne par ligne.", correct: false },
      { text: "Se faire des amis dans l'ascenseur.", correct: false }
    ],
    feedback: "Soyez percutant et mémorable en très peu de temps. L'objectif est de décrocher l'étape suivante.",
    correctMsg: "Bref. Clair. Impactant."
  },
  {
    question: "Que signifie 'Reskilling' ?",
    options: [
      { text: "Améliorer ses compétences actuelles.", correct: false },
      { text: "Apprendre un métier différent pour se reconvertir.", correct: true },
      { text: "Supprimer des compétences de son CV.", correct: false },
      { text: "Changer de version de son logiciel.", correct: false }
    ],
    feedback: "Le reskilling est crucial dans un marché en mutation pour s'adapter aux nouveaux métiers technologiques.",
    correctMsg: "C'est la clé de l'adaptabilité au 21ème siècle."
  },
  {
    question: "Quelle est la 'Zone de Génie' selon Gay Hendricks ?",
    options: [
      { text: "Là où vous êtes bon mais vous ennuyez.", correct: false },
      { text: "L'intersection entre vos talents uniques et votre passion.", correct: true },
      { text: "Un espace de coworking célèbre.", correct: false },
      { text: "Le moment de la journée où vous codez le mieux.", correct: false }
    ],
    feedback: "Travailler dans sa zone de génie permet d'apporter le maximum de valeur avec le moins d'effort conscient.",
    correctMsg: "C'est là que vous brillez le plus !"
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

function initQuiz() {
  const container = document.querySelector('.quiz-container');
  const results = document.getElementById('quizResults');
  const nextBtn = document.getElementById('nextQuizQuestion');
  const retryBtn = document.getElementById('retryQuiz');

  if (!container || !results || !nextBtn) return;

  function renderQuestion(index) {
    const data = quizData[index];
    const optionsGrid = container.querySelector('.quiz-options');
    const questionText = document.getElementById('quizQuestionText');
    const counter = document.getElementById('quizCounter');
    const feedback = document.getElementById('quizFeedback');

    // Reset UI
    optionsGrid.classList.remove('answered');
    feedback.setAttribute('hidden', '');
    nextBtn.setAttribute('hidden', '');

    // Update content
    if (counter) counter.textContent = `Question ${index + 1}/${quizData.length}`;
    if (questionText) questionText.textContent = data.question;

    optionsGrid.innerHTML = '';
    data.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.dataset.correct = opt.correct;
      btn.innerHTML = `
        <span class="option-letter">${letter}</span>
        <span class="option-text">${opt.text}</span>
      `;
      btn.addEventListener('click', () => handleOptionClick(btn, data));
      optionsGrid.appendChild(btn);
    });
  }

  function handleOptionClick(selectedBtn, data) {
    const grid = selectedBtn.parentElement;
    if (grid.classList.contains('answered')) return;
    grid.classList.add('answered');

    const isCorrect = selectedBtn.dataset.correct === 'true';
    if (isCorrect) quizScore++;

    const feedback = document.getElementById('quizFeedback');
    const title = feedback.querySelector('.feedback-title');
    const text = feedback.querySelector('.feedback-text');
    const icon = feedback.querySelector('.feedback-icon');

    // Update buttons
    const allButtons = grid.querySelectorAll('.quiz-option');
    allButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === 'true') {
        btn.classList.add('correct');
      } else if (btn === selectedBtn && !isCorrect) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('fade');
      }
    });

    // Show feedback
    feedback.removeAttribute('hidden');
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
    title.textContent = isCorrect ? data.correctMsg : "Pas tout à fait...";
    text.textContent = data.feedback;
    icon.innerHTML = isCorrect
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    // Show Next button
    nextBtn.removeAttribute('hidden');
    if (typeof showToast === 'function') {
      showToast(isCorrect ? 'Bien joué !' : 'Dommage !');
    }
  }

  nextBtn.addEventListener('click', () => {
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
      renderQuestion(currentQuizIndex);
    } else {
      showResults();
    }
  });

  function showResults() {
    container.setAttribute('hidden', '');
    results.removeAttribute('hidden');
    document.getElementById('quizScore').textContent = quizScore;
    document.getElementById('quizTotal').textContent = quizData.length;

    // Custom message based on score
    const msg = document.querySelector('.results-message');
    if (quizScore === quizData.length) msg.textContent = "Parfait ! Vous maîtrisez les fondamentaux. Bonne chance pour votre carrière !";
    else if (quizScore >= 8) msg.textContent = "Très bon score ! Vous avez les clés pour réussir.";
    else if (quizScore >= 1) msg.textContent = "Pas mal ! N'hésitez pas à relire les sections précédentes pour vous perfectionner.";
    else msg.textContent = "Pas d'inquiétude, la préparation est la clé du succès. Recommencez quand vous le souhaitez !";
  }

  retryBtn.addEventListener('click', () => {
    currentQuizIndex = 0;
    quizScore = 0;
    results.setAttribute('hidden', '');
    container.removeAttribute('hidden');
    renderQuestion(0);
  });

  // Start with first question
  renderQuestion(0);
}

// Initialisations supplémentaires
document.addEventListener('DOMContentLoaded', () => {
  initQuiz();
});
