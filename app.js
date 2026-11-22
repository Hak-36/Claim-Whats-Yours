// app.js
import { householdPlan, shareText } from './rules.js';

const QUESTIONS = [
  { key: 'name', label: 'Who are we planning for?', type: 'text', placeholder: 'Name or nickname',
    help: 'Used only on this device. Nothing is uploaded.' },
  { key: 'age', label: 'How old are they?', type: 'number', min: 0, max: 110 },
  { key: 'gender', label: 'Gender', type: 'choice',
    options: [['female', 'Female'], ['male', 'Male'], ['other', 'Other']] },
  { key: 'location', label: 'Where do they live?', type: 'choice',
    options: [['rural', 'Village / rural'], ['urban', 'Town / city']] },
  { key: 'occupation', label: 'Main work', type: 'choice',
    options: [['farmer', 'Farmer'], ['labourer', 'Daily-wage labourer'], ['student', 'Student'],
              ['salaried', 'Salaried job'], ['self', 'Self-employed / shop'], ['homemaker', 'Homemaker'],
              ['unemployed', 'Looking for work'], ['retired', 'Retired']] },
  { key: 'incomeBand', label: 'Household income per year', type: 'choice',
    options: [['lt1', 'Under ₹1 lakh'], ['1to2_5', '₹1–2.5 lakh'],
              ['2_5to5', '₹2.5–5 lakh'], ['gt5', 'Above ₹5 lakh']] },
  { key: 'ownsLand', label: 'Do they own farm land?', type: 'choice',
    options: [['yes', 'Yes'], ['no', 'No']] },
  { key: 'ownsHouse', label: 'Do they own a pucca house?', type: 'choice',
    options: [['yes', 'Yes'], ['no', 'No / kutcha house']] },
  { key: 'rationCard', label: 'Ration card type', type: 'choice',
    options: [['aay', 'Antyodaya (AAY)'], ['phh', 'Priority household (PHH)'],
              ['none', 'None'], ['unsure', 'Not sure']] },
  { key: 'hasBankAccount', label: 'Bank account in their own name?', type: 'choice',
    options: [['yes', 'Yes'], ['no', 'No']] }
];

const state = { household: [], draft: {}, step: 0 };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function show(screen) {
  ['start', 'wizard', 'results'].forEach((s) => $('screen-' + s).classList.toggle('hidden', s !== screen));
}

/* ---------- wizard ---------- */
function renderStep() {
  const q = QUESTIONS[state.step];
  $('progress').style.width = `${(state.step / QUESTIONS.length) * 100}%`;
  $('step-label').textContent = `Step ${state.step + 1} of ${QUESTIONS.length}`;
  $('q-label').textContent = q.label;

  if (q.type === 'text') {
    $('q-body').innerHTML = `
      <input id="answer" type="text" inputmode="text" autocomplete="off"
        placeholder="${esc(q.placeholder || '')}"
        class="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg outline-none focus:border-emerald-500"
        value="${esc(state.draft[q.key] || '')}" />
      <p class="mt-2 text-xs text-slate-500">${esc(q.help || '')}</p>`;
    $('answer').addEventListener('input', (e) => { state.draft[q.key] = e.target.value; refreshNext(); });
    setTimeout(() => $('answer')?.focus(), 50);
  } else if (q.type === 'number') {
    $('q-body').innerHTML = `
      <input id="answer" type="number" inputmode="numeric" min="${q.min}" max="${q.max}"
        class="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg outline-none focus:border-emerald-500"
        value="${esc(state.draft[q.key] ?? '')}" />`;
    $('answer').addEventListener('input', (e) => { state.draft[q.key] = e.target.value; refreshNext(); });
    setTimeout(() => $('answer')?.focus(), 50);
  } else {
    $('q-body').innerHTML = `<div class="space-y-3">${q.options.map(([v, t]) => `
      <button data-value="${esc(v)}"
        class="w-full rounded-2xl border px-5 py-4 text-left text-lg font-medium active:scale-[.99]
        ${state.draft[q.key] === v ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-800'}">
        ${esc(t)}
      </button>`).join('')}</div>`;
    $('q-body').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        state.draft[q.key] = b.dataset.value;
        next();
      }));
  }
  refreshNext();
}

function valid() {
  const q = QUESTIONS[state.step];
  const v = state.draft[q.key];
  if (q.type === 'number') {
    const n = Number(v);
    return v !== '' && v !== undefined && !Number.isNaN(n) && n >= q.min && n <= q.max;
  }
  return typeof v === 'string' && v.trim() !== '';
}

function refreshNext() {
  const q = QUESTIONS[state.step];
  $('btn-next').disabled = q.type === 'choice' ? false : !valid();
  $('btn-next').textContent = state.step === QUESTIONS.length - 1 ? 'See the plan' : 'Next';
}

function next() {
  const q = QUESTIONS[state.step];
  if (q.type === 'number') state.draft[q.key] = Number(state.draft[q.key]);
  if (state.step < QUESTIONS.length - 1) { state.step++; renderStep(); }
  else { commit(); }
}

function commit() {
  state.household.push({ ...state.draft });
  state.draft = {}; state.step = 0;
  renderResults();
  show('results');
}

/* ---------- results ---------- */
function renderResults() {
  const plan = householdPlan(state.household);
  const badge = { likely: 'bg-emerald-100 text-emerald-800', possible: 'bg-amber-100 text-amber-800' };

  const people = plan.people.map(({ person, results }) => `
    <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 class="text-lg font-semibold">${esc(person.name || 'Member')} <span class="text-sm font-normal text-slate-500">· ${esc(person.age)}</span></h3>
      ${results.length === 0 ? '<p class="mt-2 text-sm text-slate-500">No schemes matched these details.</p>' : ''}
      <div class="mt-3 space-y-3">
        ${results.map((r) => `
          <div class="rounded-xl border border-slate-200 p-3">
            <div class="flex items-start justify-between gap-3">
              <p class="font-semibold leading-snug">${esc(r.scheme.name)}</p>
              <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge[r.status]}">${r.status}</span>
            </div>
            <p class="mt-1 text-sm text-slate-700">${esc(r.scheme.benefit)}</p>
            ${r.why.length ? `<ul class="mt-2 space-y-0.5 text-xs text-emerald-800">${r.why.map((w) => `<li>✓ ${esc(w)}</li>`).join('')}</ul>` : ''}
            ${r.blockers.length ? `<ul class="mt-2 space-y-0.5 text-xs text-amber-800">${r.blockers.map((b) => `<li>! ${esc(b)}</li>`).join('')}</ul>` : ''}
            ${r.missing.length ? `<p class="mt-2 text-xs text-amber-800">! Missing detail: ${esc(r.missing.join(', '))}</p>` : ''}
            ${(r.scheme.extraProof || []).length ? `<p class="mt-2 text-xs text-slate-600">Also needed: ${esc(r.scheme.extraProof.join('; '))}</p>` : ''}
            <p class="mt-2 text-xs text-slate-500">Docs: ${esc(r.scheme.docs.join(', '))}</p>
            <a href="${esc(r.scheme.source)}" target="_blank" rel="noopener"
               class="mt-2 inline-block text-xs font-semibold text-emerald-700 underline">Official portal →</a>
          </div>`).join('')}
      </div>
    </div>`).join('');

  const summary = `
    <div class="rounded-2xl bg-slate-900 p-5 text-white">
      <p class="text-xs uppercase tracking-wide text-slate-400">Household snapshot</p>
      <p class="mt-1 text-2xl font-bold">${plan.likely} scheme${plan.likely === 1 ? '' : 's'} you likely qualify for</p>
      ${plan.cashPerYear ? `<p class="mt-1 text-sm text-emerald-300">~₹${plan.cashPerYear.toLocaleString('en-IN')}/year in indicative cash support</p>` : ''}
      <p class="mt-3 text-xs text-slate-400">Excludes insurance covers and one-time benefits. Verify on the official portal.</p>
      <p class="mt-3 text-sm font-semibold">Documents to gather (deduplicated)</p>
      <ul class="mt-1 space-y-0.5 text-sm text-slate-200">${plan.documents.map((d) => `<li>• ${esc(d)}</li>`).join('')}</ul>
    </div>`;

  $('results-body').innerHTML = people + summary;
}

/* ---------- wiring ---------- */
$('btn-start').addEventListener('click', () => { state.step = 0; state.draft = {}; renderStep(); show('wizard'); });
$('btn-next').addEventListener('click', next);
$('btn-back').addEventListener('click', () => {
  if (state.step === 0) { show('start'); return; }
  state.step--; renderStep();
});
$('btn-add').addEventListener('click', () => { state.step = 0; state.draft = {}; renderStep(); show('wizard'); });
$('btn-reset').addEventListener('click', () => {
  state.household = []; state.draft = {}; state.step = 0; show('start');
});
$('btn-share').addEventListener('click', () => {
  const text = shareText(state.household);
  function saveStateToURL() {
  if (state.household.length === 0) return;
  const encoded = btoa(encodeURIComponent(JSON.stringify(state.household)));
  window.history.replaceState(null, null, `#plan=${encoded}`);
}

// Update your `commit()` function to call this:
function commit() {
  state.household.push({ ...state.draft });
  state.draft = {}; state.step = 0;
  saveStateToURL(); // <--- ADD THIS LINE
  renderResults();
  show('results');
}
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

show('start');
