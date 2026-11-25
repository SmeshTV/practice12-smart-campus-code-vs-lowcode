// Practice #12, Task #05: run the eight shared rows against the published low-code app.
// node lc_run.js --row=T1 --out=<png> --password=<site password> [--reload] [--url=<app url>]
const fs = require('fs');
const path = require('path');

const argv = {};
for (const a of process.argv.slice(2)) { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); if (m) argv[m[1]] = m[2] === undefined ? true : m[2]; }
const PORT = argv.port || '9222';
const URL_APP = argv.url || 'https://blaring-defensive-otter-8iwe1a.teleporthq.app/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R101 = 'Room 101 (Seminar Wing)';
const R102 = 'Room 102 (Maintenance Blocked)';
const ROWS = {
  T1: { room: R101, day: 1, time: '13:00', duration: 60 },
  T2: { room: R101, day: 1, time: '09:30', duration: 60 },
  T3: { room: R102, day: 1, time: '10:00', duration: 60 },
  T4: { room: R101, day: 1, time: '14:00', duration: 0 },
  T5: { room: R101, day: 1, time: '14:00', duration: 121 },
  T6: { room: R101, day: -1, time: '08:00', duration: 60 },
  T7: { room: R101, day: 1, time: '10:00', duration: 60 },
  T8: { room: R101, day: 1, time: '13:00', duration: 60 },
};

const pageDriver = (spec, name) => `
(async () => {
  const setV = (el, v) => {
    const proto = el instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const d = new Date(Date.now() + ${JSON.stringify(spec.day)} * 86400000);
  const day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const sel = document.querySelector('#room-select') || document.querySelector('select');
  const start = document.querySelector('#start-datetime') || [...document.querySelectorAll('input[type=datetime-local]')][0];
  const dur = document.querySelector('#duration-minutes') || [...document.querySelectorAll('input[type=number]')][0];
  const before = document.body.innerText;
  const steps = [];
  if (sel) {
    const opt = [...sel.options].find((o) => o.value === ${JSON.stringify(spec.room)} || o.textContent.trim() === ${JSON.stringify(spec.room)});
    if (opt) { setV(sel, opt.value); steps.push('room=' + opt.textContent.trim()); } else steps.push('ROOM OPTION NOT FOUND: ' + ${JSON.stringify(spec.room)});
  } else steps.push('NO ROOM SELECT');
  if (start) { setV(start, day + 'T' + ${JSON.stringify(spec.time)}); steps.push('start=' + start.value); } else steps.push('NO START INPUT');
  if (dur) { setV(dur, String(${JSON.stringify(spec.duration)})); steps.push('duration=' + dur.value); } else steps.push('NO DURATION INPUT');
  const btn = document.querySelector('#check-availability-button') || [...document.querySelectorAll('button')].find((b) => /Check Availability/i.test(b.textContent || ''));
  if (btn) { btn.click(); steps.push('clicked ' + btn.tagName + ' "' + (btn.id || btn.textContent.trim()) + '"'); } else steps.push('NO CHECK CONTROL');
  await new Promise((r) => setTimeout(r, 1500));
  const txt = document.body.innerText;
  const i = txt.search(/Verified Status|RULE:/i);
  const seg = (i >= 0 ? txt.slice(i, i + 420) : txt.slice(0, 420)).replace(/\\n+/g, ' | ');
  const code = (seg.match(/E_[A-Z_]+|ROOM_CLEAR|OK/) || [null])[0];
  const verdict = /Unavailable/.test(seg) ? 'Unavailable' : (/Available/.test(seg) ? 'Available' : null);
  return JSON.stringify({
    row: ${JSON.stringify(name)}, steps, verdict, code, status: seg,
    buttons_on_page: document.querySelectorAll('button').length,
    page_text_changed: before !== txt,
  }, null, 2);
})()`;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const target = list.find((t) => t.type === 'page' && t.url.includes('teleporthq'));
  if (!target) throw new Error('no teleporthq tab open');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pend.set(mid, (mm) => res(mm.result !== undefined ? mm.result : mm.error)); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  if (argv.reload) { await send('Page.navigate', { url: URL_APP }); await sleep(8000); }

  const gate = await send('Runtime.evaluate', { expression: '!!document.querySelector("input[type=password]")', returnByValue: true });
  if (gate.result && gate.result.value === true) {
    await send('Runtime.evaluate', {
      expression: `(() => { const i=document.querySelector('input[type=password]'); const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(i, ${JSON.stringify(argv.password || '')}); i.dispatchEvent(new Event('input',{bubbles:true})); (i.form||i.closest('form')).requestSubmit(); return 'pw sent'; })()`,
      returnByValue: true,
    });
    await sleep(8000);
  }

  const name = argv.row || 'T1';
  await send('Runtime.evaluate', {
    expression: '(() => { const b=[...document.querySelectorAll("button,a")].find(x=>/^Accept$/.test(x.textContent.trim())); if(b){b.click(); return "cookies accepted";} return "no cookie banner"; })()',
    returnByValue: true,
  });
  await sleep(1500);
  if (argv.shotonly) {
    const info = await send('Runtime.evaluate', { expression: 'JSON.stringify({url: location.href, text: document.body.innerText.slice(0, 1200)})', returnByValue: true });
    const v = info.result && info.result.value !== undefined ? info.result.value : info;
    console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
    if (argv.out) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (shot.data) { fs.mkdirSync(path.dirname(argv.out), { recursive: true }); fs.writeFileSync(argv.out, Buffer.from(shot.data, 'base64')); }
      fs.writeFileSync(argv.out.replace(/\.png$/, '.txt'), typeof v === 'string' ? v : JSON.stringify(v));
      console.log('SAVED ' + argv.out);
    }
    ws.close();
    process.exit(0);
  }
  const spec = { ...ROWS[name], ...(argv.room ? { room: argv.room } : {}), ...(argv.duration !== undefined ? { duration: parseInt(argv.duration, 10) } : {}) };
  const out = await send('Runtime.evaluate', { expression: pageDriver(spec, name), returnByValue: true, awaitPromise: true });
  const val = out.result && out.result.value !== undefined ? out.result.value : out;
  const text = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  console.log(text);

  if (argv.out) {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: argv.full !== undefined });
    if (shot.data) { fs.mkdirSync(path.dirname(argv.out), { recursive: true }); fs.writeFileSync(argv.out, Buffer.from(shot.data, 'base64')); }
    fs.writeFileSync(argv.out.replace(/\.png$/, '.json'), text);
    console.log('SAVED ' + argv.out);
  }
  ws.close();
  process.exit(0);
}
main().catch((e) => { console.log('ERR ' + e.message); process.exit(1); });
