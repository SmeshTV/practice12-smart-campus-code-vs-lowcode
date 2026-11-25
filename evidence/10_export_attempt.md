Code export attempt, TeleportHQ track, 25 November 2026.

The brief asks how changes are "reviewed/exported/version-controlled", so the goal was to put the project's own
source into `lowcode/` next to the code track. Four routes were tried; none delivered an editable export.


## 1. The editor will not open its building tools in the available window

Navigating the authenticated session to `https://play.teleporthq.io/projects/blaring-defensive-otter-8iwe1a`
redirects to `/projects/blaring-defensive-otter-8iwe1a/preview/TQ_0GJaR--dLH`, and the page body collapses to
62 characters:

    /projects/blaring-defensive-otter-8iwe1a/preview/TQ_0GJaR--dLH

The workspace screen states the rule in its own words, and this is what the export panel would sit behind:

    Your browser window is too narrow. Building capabilities are disabled.
    For the best experience, please use a device with a larger screen or resize your browser window to at
    least 767px wide.

The editor session lives in the in-app browser, whose surface is 718 px wide and cannot be resized from here,
so the Export control was never reachable. Moving the session to a full-size window would mean signing in again
in another browser, which the account-access rule puts back on the student.


## 2. The platform's own copy says a data source removes code export

Pulled out of the editor's delivered JavaScript (43 chunks, `lcsec/chunks_all` in the session folder, fetched
anonymously from `play.teleporthq.io`; this is reading the code the platform serves to every visitor, not
probing its infrastructure). The strings are what the editor renders in its export dialog:

    "Once a data source is added to your project, the project becomes a dynamic application that requires
     server-side rendering."
    "Code export and download will be limited to " <strong>Next.js</strong> " framework only."
    "Other frameworks (React, Vue, Angular, etc.) will not be available for export."
    "In exchange, " <strong>code download is no longer available</strong> " (deployment from TeleportHQ still
     works), the choice is " <strong>permanent</strong> ", and the project needs its own " <subscription>

The framework list present in the same bundle is React, Next, Vue, Nuxt, Angular, HTML and ZIP, and one render
branch carries `disabled:!0` next to the Next card, so at least one grid state ships the buttons greyed out.

The project card in the workspace reads `Bookings | Web App | Single language | Owner`, and the app was built
with the platform's Workflows and a records collection, so this project is on the dynamic side of that rule.
Export is therefore not merely hard to reach for a trial account; the platform documents it as switched off.


## 3. The authenticated page refuses cross-origin calls

From inside the signed-in editor tab, `fetch` against the platform API host
`https://playground-api-production-v5.services.teleporthq.io` (the host named in the same bundles) failed for
every plausible path:

    /api/v1/projects/blaring-defensive-otter-8iwe1a -> Failed to fetch
    /project/blaring-defensive-otter-8iwe1a          -> Failed to fetch
    /api/project/blaring-defensive-otter-8iwe1a      -> Failed to fetch
    /projects/blaring-defensive-otter-8iwe1a         -> Failed to fetch

That is the browser's CORS check refusing the request, and reconstructing the private endpoint with a hand-built
client is the kind of unauthorised interaction with a third-party service the brief rules out. Stopped here.


## 4. Direct API guesses on the web host

    GET https://play.teleporthq.io/api/v1/projects?limit=50      404
    GET https://play.teleporthq.io/api/v1/projects/<id>/export   404
    GET https://play.teleporthq.io/api/projects/<id>/export      404
    GET https://play.teleporthq.io/api/v1/projects/<id>/code-export  404
    GET https://play.teleporthq.io/api/v1/projects/<id>          404


## 5. What the published site does give up

    GET https://blaring-defensive-otter-8iwe1a.teleporthq.app/    200, 233936 bytes
    <script id="__NEXT_DATA__" ...> inside it                     207 bytes, no UIDL, no component tree
    occurrences of "uidl" / "componentName" in the document        0

So a visitor holding the URL and the site password gets the rendered HTML, one stylesheet
`/_next/static/css/d65a6c78f829dcef.css`, and the Next.js chunk list. They do not get the project model, and
nothing in that output can be reopened in the editor. `lowcode/export_from_site/` holds exactly that: the
rendered page and its stylesheet, which is the whole portable artefact this platform allows from outside.


## 6. No route to the publish or export panel from outside the editor

    GET https://play.teleporthq.io/projects/blaring-defensive-otter-8iwe1a/publish
    -> "Something's missing... We can't seem to find the page you are looking for. Teleport back to dashboard"

Inside the editor at 718 px the whole toolbar is three viewport buttons and nothing else:

    [...document.querySelectorAll('button')].map(b => b.textContent.trim())  -> ["", "", ""]

so the panel that holds Password Protection, Remove, Export and the framework cards is not rendered at all in
this surface. The claims about those controls in `docs/04_lowcode_notes.md` come from the earlier session when
the editor did load, and the disabled state of Remove was read from the panel then; they are not reproducible
from a narrow window, which is itself the finding.


## Conclusion recorded in the matrix

Version control on the low-code track is the platform's own project history: no diff a student can read, no
export to a repository, no local copy that can be reopened. If the trial lapses on 2 December 2026 the project
is archived and the deployment removed, and the only surviving artefacts are the screenshots and the rendered
HTML in this pack. The code track is the opposite on every one of those points.
