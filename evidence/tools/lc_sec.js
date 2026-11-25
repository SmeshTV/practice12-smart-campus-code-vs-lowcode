// Practice #12, Task #07: runtime security probes against the published low-code app.
// node lc_sec.js --mode=probe [--url=<app url>] [--password=<site password>] [--out=<json>]
// node lc_sec.js --mode=keeper --password=<site password> --out=<json>
// Runs inside the throwaway Chrome profile that already serves the screenshots, so nothing here touches the
// user's real browser state. Read-only apart from what the page's own scripts do.
const fs = require('fs');
const path = require('path');

const argv = {};
for (const a of process.argv.slice(2)) { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); if (m) argv[m[1]] = m[2] === undefined ? true : m[2]; }
const PORT = argv.port || '9222';
const BASE = (argv.url || 'https://blaring-defensive-otter-8iwe1a.teleporthq.app/').replace(/\/?$/, '/');
const MODE = argv.mode || 'probe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = '<img src=x onerror=window.__xss=1>';

const probeExpr = () => `
(async () => {
  const setV = (el, v) => {
    const proto = el instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const out = { url: location.href, checks: {} };
  // P1 input surface: what kinds of fields does the app actually expose?
  out.checks.fields = [...document.querySelectorAll('input,select,textarea')].map((el) => ({
    tag: el.tagName, type: el.type || null, id: el.id || null, name: el.name || null,
  }));
  // P2 injection attempt: the payload is offered to every text-ish control that exists.
  const before = document.body.innerHTML.length;
  const victims = [...document.querySelectorAll('input[type=text],input:not([type]),input[type=number],textarea')];
  out.checks.targets = victims.length;
  out.checks.accepted = [];
  for (const el of victims) {
    const id = el.id || el.type;
    setV(el, ${JSON.stringify(PROBE)});
    await new Promise((r) => setTimeout(r, 150));
    out.checks.accepted.push({ id, kept: el.value });
  }
  const btn = [...document.querySelectorAll('button')].find((b) => /Check Availability/i.test(b.textContent || ''));
  if (btn) btn.click();
  await new Promise((r) => setTimeout(r, 2000));
  out.checks.payload_in_dom = document.body.innerHTML.includes(${JSON.stringify(PROBE)});
  out.checks.handler_fired = window.__xss === 1;
  out.checks.img_elements = document.querySelectorAll('img[src="x"]').length;
  out.checks.dom_length_before = before;
  out.checks.dom_length_after = document.body.innerHTML.length;
  // P3 what the origin holds about the visitor
  out.checks.cookies = document.cookie || '(none readable)';
  out.checks.localStorage = Object.keys(localStorage).map((k) => ({ k, v: String(localStorage.getItem(k)).slice(0, 80) }));
  out.checks.sessionStorage = Object.keys(sessionStorage).map((k) => ({ k, v: String(sessionStorage.getItem(k)).slice(0, 80) }));
  // P4 external origins reachable from the rendered page
  const hosts = new Set();
  [...document.querySelectorAll('script[src],link[href],img[src],a[href]')].forEach((el) => {
    try { const u = new URL(el.getAttribute('src') || el.getAttribute('href'), location.href); if (u.host !== location.host) hosts.add(u.host); } catch (e) {}
  });
  out.checks.external_hosts = [...hosts];
  out.checks.forms = [...document.querySelectorAll('form')].length;
  out.checks.links_to_auth = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /login|auth|reset|password|admin/i.test(h || ''));
  return JSON.stringify(out, null, 2);
})()`;

const responsiveExpr = () => `
(() => {
  const vw = document.documentElement.clientWidth;
  const over = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
      over.push(el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : '') + ' right=' + Math.round(r.right) + ' w=' + Math.round(r.width));
    }
  });
  const ctrls = [...document.querySelectorAll('input,select,button')].map((el) => {
    const r = el.getBoundingClientRect();
    return { label: el.id || (el.textContent || '').trim().slice(0, 26), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), tap_h_under_40: r.height > 0 && r.height < 40 };
  });
  return JSON.stringify({
    viewport: vw + 'x' + window.innerHeight,
    user_js_scroll_width: document.documentElement.scrollWidth,
    horizontal_scroll: document.documentElement.scrollWidth > vw + 1,
    overflowing: over.slice(0, 12),
    overflowing_count: over.length,
    controls: ctrls,
  }, null, 2);
})()`;

const keeperExpr = () => `(async () => {
  await new Promise((r) => setTimeout(r, 1200));
  return JSON.stringify({
    landing_url: location.href,
    search: location.search,
    hash: location.hash,
    session: Object.keys(sessionStorage).map((k) => ({ k, v: sessionStorage.getItem(k) })),
    local: Object.keys(localStorage).map((k) => ({ k, v: localStorage.getItem(k) })),
    cookies: document.cookie,
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
  if (argv.mobile) {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  } else {
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  }

  const nav = argv.doconly
    ? BASE + (argv.path || '')
    : MODE === 'keeper'
    ? BASE + '?key=SECRETPROBE123&ref=BK-ABCDEF12'
    : BASE;
  await send('Page.navigate', { url: nav });
  await sleep(9000);

  const gate = await send('Runtime.evaluate', { expression: '!!document.querySelector("input[type=password]")', returnByValue: true });
  if (gate.result && gate.result.value === true) {
    await send('Runtime.evaluate', {
      expression: `(() => { const i=document.querySelector('input[type=password]'); const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(i, ${JSON.stringify(argv.password || '')}); i.dispatchEvent(new Event('input',{bubbles:true})); (i.form||i.closest('form')).requestSubmit(); return 'pw sent'; })()`,
      returnByValue: true,
    });
    await sleep(9000);
  }
  await send('Runtime.evaluate', {
    expression: '(() => { const b=[...document.querySelectorAll("button,a")].find(x=>/^Accept$/.test(x.textContent.trim())); if(b){b.click(); return 1;} return 0; })()',
    returnByValue: true,
  });
  await sleep(1000);

  const expr = MODE === 'keeper' ? keeperExpr() : MODE === 'responsive' ? responsiveExpr() : probeExpr();
  const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  const val = res.result && res.result.value !== undefined ? res.result.value : res;
  const text = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  console.log(text);
  if (argv.out) {
    fs.mkdirSync(path.dirname(argv.out), { recursive: true });
    fs.writeFileSync(argv.out, text);
    console.log('SAVED ' + argv.out);
  }
  if (argv.shot) {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    if (shot.data) fs.writeFileSync(argv.shot, Buffer.from(shot.data, 'base64'));
    console.log('SAVED ' + argv.shot);
  }
  ws.close();
  process.exit(0);
}
main().catch((e) => { console.log('ERR ' + e.message); process.exit(1); });
