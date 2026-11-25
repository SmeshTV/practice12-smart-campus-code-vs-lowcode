What a stranger can take away from the published low-code app, 25 November 2026.

Two files, obtained with the site password only:

  published_index.html   233992 bytes  GET / with the tq_wall cookie
  published_styles.css    53245 bytes  GET /_next/static/css/d65a6c78f829dcef.css

This is not an export. It is the rendered output. The editable project model stays on the platform's servers;
the delivered page contains 207 bytes of __NEXT_DATA__ and no UIDL, no component tree and no source maps, and
the reasons are recorded in ../evidence/10_export_attempt.md.

What the stylesheet reveals about the dependency surface: its first block is

  /*!
   * Quill Editor v2.0.3
   * https://quilljs.com
   * Copyright (c) 2017-2024, Slab
   * Copyright (c) 2014, Jason Chen
   * Copyright (c) 2013, salesforce.com
   */

a rich-text editor this student never configured, shipped inside the single CSS file of the published app,
alongside the two unpkg scripts and the Next.js/Vercel runtime named in docs/05_security.md. Every one of those
versions is chosen and updated by the vendor, and none of them is visible or editable from the visual builder.

One edit was made to these two files before they were committed. The published HTML carries the owner's real
email address inside a JSON-LD Organization block that the platform generated from the account, which is
personal data on a page about fictional rooms, and the requirement sheet forbids that. The address is replaced
by REDACTED-PERSONAL-EMAIL; the original file was 233992 bytes with sha256
cec21fb82945826e926bdab6c60b4d4750cafa8875dd2c5ddb3d44ceeaaa6982, recorded in
../../evidence/REDACTIONS.json. The live page was left untouched.
