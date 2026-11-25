// In-page driver for the Smart Campus code-based checker (Practice #12, Task #05 identical tests).
// Loaded by cdp_shot.js through Runtime.evaluate, so it must be plain ES2020 with no imports.

function setNativeValue(el, value) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fields() {
  return [...document.querySelectorAll('label, div')].filter((e) => e.querySelector(':scope > input[type=time]'));
}

function timeInputByLabel(text) {
  const holder = fields().find((e) => (e.textContent || '').trim().startsWith(text));
  return holder ? holder.querySelector('input[type=time]') : null;
}

function checkboxLabeled(text) {
  const holder = [...document.querySelectorAll('label')].find((l) => (l.textContent || '').includes(text));
  return holder ? holder.querySelector('input[type=checkbox]') : null;
}

function buttonByText(text) {
  return [...document.querySelectorAll('button')].find((b) => (b.textContent || '').includes(text));
}

function existingBookingTitles() {
  return [...document.querySelectorAll('[title]')]
    .map((e) => e.getAttribute('title'))
    .filter((t) => t && /\(\d{2}:\d{2}\u2013\d{2}:\d{2}\)/.test(t));
}

function verdict() {
  const head = [...document.querySelectorAll('span')].find((s) => s.textContent === 'Available' || s.textContent === 'Unavailable');
  if (!head) return { verdict: null, code: null, message: null, reasons: [] };
  const box = head.closest('div')?.parentElement;
  const reasons = box ? [...box.querySelectorAll('li')].map((li) => li.textContent.trim()) : [];
  const code = box ? (box.querySelector('span.font-mono')?.textContent || null) : null;
  const message = box ? (box.querySelector('p.text-sm')?.textContent || null) : null;
  return { verdict: head.textContent, code, message, reasons };
}

function currentClock() {
  const strong = [...document.querySelectorAll('strong')].map((s) => s.textContent);
  return strong[0] || null;
}

async function apply(spec) {
  const steps = [];
  const snapshots = {};
  if (spec.now) {
    const cb = checkboxLabeled('Override');
    if (cb && !cb.checked) { cb.click(); steps.push('override enabled'); await sleep(150); }
    const ti = timeInputByLabel('Override');
    if (ti) { setNativeValue(ti, spec.now); steps.push('now=' + spec.now); } else steps.push('NOW FIELD NOT FOUND');
    await sleep(150);
  }
  if (spec.room) {
    const b = buttonByText(spec.room);
    if (b) { b.click(); steps.push('room selected: ' + spec.room); } else steps.push('ROOM NOT FOUND: ' + spec.room);
    await sleep(150);
    snapshots.afterRoomSelect = existingBookingTitles();
  }
  if (spec.start) {
    const el = timeInputByLabel('Start time');
    if (el) { setNativeValue(el, spec.start); steps.push('start=' + spec.start); } else steps.push('START INPUT NOT FOUND');
    await sleep(150);
  }
  if (spec.end) {
    const el = timeInputByLabel('End time');
    if (el) { setNativeValue(el, spec.end); steps.push('end=' + spec.end); } else steps.push('END INPUT NOT FOUND');
    await sleep(150);
  }
  if (spec.check) {
    const b = buttonByText('Check Availability');
    if (b) { b.click(); steps.push('checked'); } else steps.push('CHECK BUTTON NOT FOUND');
    await sleep(400);
  }
  return { steps, snapshots };
}

async function runScenario(name) {
  const T = {
    initial: {},
    T1: { room: 'Room 101', now: '09:00', start: '13:00', end: '14:00', check: true },
    T2: { room: 'Room 101', now: '09:00', start: '09:30', end: '10:30', check: true },
    T3: { room: 'Room 102', now: '09:00', start: '10:00', end: '11:00', check: true },
    T4: { room: 'Room 101', now: '09:00', start: '14:00', end: '14:00', check: true },
    T5: { room: 'Room 101', now: '09:00', start: '14:00', end: '16:01', check: true },
    T6: { room: 'Room 101', now: '09:00', start: '08:00', end: '09:00', check: true },
    T7: { room: 'Room 101', now: '09:00', start: '10:00', end: '11:00', check: true },
    T8: { room: 'Room 101', now: '09:00', start: '13:00', end: '14:00', check: true },
  };
  const spec = T[name];
  if (!spec) return { scenario: name, error: 'unknown scenario' };
  const pageBefore = existingBookingTitles();
  const ran = await apply(spec);
  const v = verdict();
  return {
    scenario: name,
    steps: ran.steps,
    clock: currentClock(),
    verdict: v.verdict,
    code: v.code,
    message: v.message,
    reasons: v.reasons,
    bookings_before: ran.snapshots.afterRoomSelect || pageBefore,
    bookings_after: existingBookingTitles(),
    layout: {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    },
  };
}
