# The runner behind every screenshot in screenshots/

Two files, no dependencies beyond Node 24 and Google Chrome.

    "C:\Program Files\Google\Chrome\Application\chrome.exe" --new-window ^
      --user-data-dir=%TEMP%\p12profile --remote-debugging-port=9222 ^
      --no-first-run --window-size=1500,960 http://localhost:5173/

    node cdp_matrix_runner.js --out=T1.png --scenario=T1 --width=1440 --height=900
    node cdp_matrix_runner.js --out=T1_narrow.png --scenario=T1 --width=390 --height=1400 --mobile=1

`cdp_matrix_runner.js` attaches to that Chrome over the DevTools protocol, pins the layout viewport with
`Emulation.setDeviceMetricsOverride`, runs `runScenario()` from `matrix_driver.js` inside the page, waits for
React to render, then captures the screenshot and writes the observed verdict next to it as `<name>.json`.
`matrix_driver.js` fills the real inputs through the native value setter plus an `input` event, which is what
a keyboard does, so the app cannot tell the difference between this runner and a person.

The Chrome profile in `%TEMP%\p12profile` is created by these commands and contains only this project. No
signed-in account, no bookmarks and no other tab is ever in a frame.

The scenario table in `matrix_driver.js` holds the eight rows of docs/01_contract.md: room, start, end and the
pinned 09:00 clock. Nothing else is hard-coded, so the same rows can be replayed against a rebuilt app.
