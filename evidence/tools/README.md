# The runners behind every screenshot in screenshots/

Five files, no dependencies beyond Node 24 and Google Chrome.

    "C:\Program Files\Google\Chrome\Application\chrome.exe" --new-window ^
      --user-data-dir=%TEMP%\p12profile --remote-debugging-port=9222 ^
      --no-first-run --window-size=1500,960 http://localhost:5173/

    node cdp_matrix_runner.js --out=T1.png --scenario=T1 --width=1440 --height=900
    node cdp_matrix_runner.js --out=T1_narrow.png --scenario=T1 --width=390 --height=1400 --mobile=1

`cdp_matrix_runner.js` attaches to that Chrome over the DevTools protocol, pins the layout viewport with
`Emulation.setDeviceMetricsOverride`, runs `runScenario()` from `matrix_driver.js` inside the page, waits for
React to render, then captures the screenshot and writes the observed verdict next to it as `<name>.json`.
`matrix_driver.js` fills the real inputs through the native value setter plus an `input` event, which is what
a keyboard does, so the app cannot tell the difference between this runner and a person. `cdp_shot.js`,
`cdp_eval.js` and `drivers.js` are the same plumbing with the security probes and the layout measurements
attached; they produced `evidence/security_probes/` and the narrow-screen frames.

The Chrome profile in `%TEMP%\p12profile` is created by these commands and contains only this project. No
signed-in account, no bookmarks and no other tab is ever in a frame.

The scenario table in `matrix_driver.js` holds the eight rows of docs/01_contract.md: room, start, end and the
pinned 09:00 clock. Nothing else is hard-coded, so the same rows can be replayed against a rebuilt app.

## The same rows against the low-code app

    node lc_run.js --row=T1 --reload --full=1 --password=<the site password> ^
      --out=../screenshots/lowcode/T1_lowcode.png

`lc_run.js` attaches to the already-open tab of the published TeleportHQ deployment, enters the site password
through the page's own field, accepts the platform's cookie banner, then sets the room, the start datetime and
the duration with the same native-setter technique and clicks the platform's own button. It reads the verdict
out of the rendered text, not out of any internal state, and writes the row record as JSON. The date is
computed as today plus one day for T1-T5 and T7, and minus one day for T6, because the platform app has no
clock override, so the pinned 09:00 of the contract cannot be reproduced there.

    node lc_sec.js --mode=probe     --out=../evidence/security_probes_lowcode/P1_injection.json
    node lc_sec.js --mode=keeper    --out=../evidence/security_probes_lowcode/P2_url_secret_keeper.json
    node lc_sec.js --mode=responsive --mobile --out=../evidence/responsive_lowcode_390.json

`lc_sec.js` is the read-only side: it enumerates the input controls, offers an XSS payload to every
text-capable one and reports whether it survived into the DOM, dumps the storage and cookie state, lists the
hosts the page can reach, follows a `?key=` parameter to see where the platform's injected script puts it, and
measures overflow and tap-target size at 390x844. It changes nothing on the platform and stores nothing.

Neither script contains a credential. The password arrives as a command-line argument and is not written into
any output file.
