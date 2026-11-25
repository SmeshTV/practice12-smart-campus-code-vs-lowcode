// Minimal Chrome DevTools Protocol driver used for the Practice #12 screenshots.
// node cdp_shot.js --out=<file.png> --width=1440 --height=900 --scenario=<name> [--log=<file.json>]
const fs = require('fs');
const path = require('path');

const argv = {};
for (const a of process.argv.slice(2)) {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) argv[m[1]] = m[2] === undefined ? true : m[2];
}
const PORT = argv.port || '9222';
const URL_TARGET = argv.url || 'http://localhost:5173/';
const WIDTH = parseInt(argv.width || '1440', 10);
const HEIGHT = parseInt(argv.height || '900', 10);
const OUT = argv.out;
const SCENARIO = argv.scenario || 'shot';
const LOG = argv.log;
if (!OUT) { console.log('missing --out'); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DRIVERS = fs.readFileSync(path.join(__dirname, 'drivers.js'), 'utf8');

async function getTargets() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  return res.json();
}

async function main() {
  let target = (await getTargets()).find((t) => t.type === 'page');
  if (!target) throw new Error('no page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pend = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pend.has(msg.id)) { pend.get(msg.id)(msg); pend.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const mid = ++id;
    pend.set(mid, (m) => res(m.result || m.error || {}));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 500 });
  if (argv.mobile) {
    await send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36',
    });
  }
  await send('Page.navigate', { url: URL_TARGET });
  await sleep(4000);

  const scenario = (argv.scenarios && fs.readFileSync(argv.scenarios, 'utf8')) || '';
  const expr = `(() => {
    ${DRIVERS}
    return Promise.resolve(runScenario(${JSON.stringify(SCENARIO)})).then((o) => JSON.stringify(o, null, 2));
  })()`;
  const evaluated = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  const observed = evaluated.result && evaluated.result.value !== undefined ? evaluated.result.value : evaluated;
  const text = typeof observed === 'string' ? observed : JSON.stringify(observed, null, 2);
  console.log('SCENARIO ' + SCENARIO);
  console.log(text);
  fs.writeFileSync(OUT.replace(/\.png$/, '.json'), text);

  await sleep(600);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot.data) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
    console.log('SAVED ' + OUT + ' ' + WIDTH + 'x' + HEIGHT);
  } else {
    console.log('SCREENSHOT FAILED ' + JSON.stringify(shot).slice(0, 300));
  }
  if (LOG) fs.appendFileSync(LOG, JSON.stringify({ scenario: SCENARIO, width: WIDTH, height: HEIGHT, at: new Date().toISOString(), out: path.basename(OUT) }) + '\n');
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.log('ERR ' + e.message); process.exit(1); });
