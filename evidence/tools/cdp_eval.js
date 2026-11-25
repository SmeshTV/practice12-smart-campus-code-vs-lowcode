// node cdp_eval.js --urlmatch=<substring> --expr=<javascript>
const argv = {};
for (const a of process.argv.slice(2)) { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); if (m) argv[m[1]] = m[2] === undefined ? true : m[2]; }
const PORT = argv.port || '9222';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const target = list.filter((t) => t.type === 'page').find((t) => !argv.urlmatch || t.url.includes(argv.urlmatch));
  if (!target) { console.log('NO TARGET'); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pend.set(mid, (mm) => res(mm.result !== undefined ? mm.result : mm.error)); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  const r = await send('Runtime.evaluate', { expression: argv.expr, returnByValue: true, awaitPromise: true });
  console.log(typeof r.result === 'string' ? r.result : JSON.stringify(r.result, null, 2));
  ws.close(); process.exit(0);
}
main().catch((e) => { console.log('ERR ' + e.message); process.exit(1); });
