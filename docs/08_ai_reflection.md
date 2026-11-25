# AI-use reflection, Practice work #12

## What was used

| Tool | Version | Model | Where it was used |
| --- | --- | --- | --- |
| Qoder Desktop, agent mode | 0.4.11 stable, commit `d9996760e3d4f61dedf1589a76f87d7001618ebf`, Electron 43.1.1, build 2026-10-23 | the client reports its routing as `auto` and `qfmodel`, no model name is exposed to the user | the whole code track: contract sheet, reason codes, validation layer, matrix test, harness, security probes, all documents in `docs/` |
| TeleportHQ project generator | cloud, Trial plan, no version string shown | not disclosed by the platform | the low-code app in one prompt, 15:10:07 to 15:17 |
| TeleportHQ in-editor AI assistant | same workspace | not disclosed | the Workflow and the refused repair, 15:26 and 15:36 |

No other tool produced a deliverable. The screenshots, the CSV seeds and the platform access log came from the
same session.

## What the AI was allowed to decide, and what it was not

The AI wrote code and documents. It did not choose the requirements. The reason-code table, the precedence order,
the eight test rows and the frozen fixtures were written down first, in `docs/01_contract.md`, and then
implemented, which is the order the brief asks for and the reason both tracks could be tested with one sheet.

Three decisions were made against what the AI proposed, and they are worth naming:

- The AI inherited a project whose test labels numbered the acceptance criteria one way and the Lesson #12 slide
  numbered them the other. Renaming the old labels would have rewritten history for tidiness, so the new
  numbering was applied to the new documents and the old labels were kept with a note. That was the human call.
- The AI wanted to run `npm audit fix` to clear 25 findings. It was refused: the fix moves a major version under
  a build that has not been re-verified, which is the rule Lesson #07 established and Practice #10 applied.
- The AI wanted to answer TeleportHQ's "I'll share a failing example" prompt to get LC-1 fixed. The editor
  surface made that impossible, and the honest option was chosen: record the refusal and leave the defect open
  rather than describe the app as working.

## Where the AI was wrong, in this session

Twice, both caught by verification rather than by reading.

The first matrix run reported `verdict: null` on all eight rows. The driver had read the page before React
finished rendering, and the AI's first instinct was to assume the app was broken. It was the harness. Ten minutes
of the 35 measured minutes went on that, and the fix was `awaitPromise` plus a wait, not a change to the app.

The second was a file reference. `docs/04_lowcode_notes.md` cited four screenshots that had never been taken,
because those two sessions ran in a browser surface that could not return a frame at the time. The claim was
plausible, the evidence did not exist, and the paths were replaced with the structural captures that do exist.
An AI that writes a document will write a citation that reads correctly, and only checking the filesystem finds
out.

## What the AI could not do

It could not get a free account into Appsmith, Budibase or Glide, and it could not start a container on this
laptop. Twenty-one measured minutes produced four login screens and no builder. That is not a capability the AI
was missing so much as a wall the platforms put up, and the practice report treats it as a finding rather than as
a detour to hide.

It also could not fix the low-code app. Once the rule lived inside a platform Workflow, there was no file to
open, no test to run and no diff to review, so the only route was to ask the platform's assistant, and the
platform's assistant said the rule was already correct and had not been tested. The comparison in
`docs/07_comparison_matrix.md` is built on that asymmetry.

## Verification, because the brief asks for it explicitly

Every claim in this pack is tied to something a machine printed: `evidence/01` to `07` for the code track,
`evidence/matrix_lowcode/` for the eight rows on the published low-code app,
`evidence/security_probes_lowcode/P1` to `P4` for the runtime probes, `evidence/08` to `11` for platform access,
trial terms, the export attempt and the editor snapshot. `docs/03_code_changes.md` shows the code track's rules
being proved by deliberately breaking them and restoring them by checksum. Where something could not be verified,
the document says so in the same sentence that makes the claim, and T8 on the low-code track is marked
display-level only for exactly that reason.

## What was kept back

The site password for the low-code demo is written into `docs/04_lowcode_notes.md` and
`ai_outputs/04_teleporthq_publish_panel.txt`, because without it the demo link in the submission is unusable and
the platform gives no way to remove the gate. It is a preview wall around fictional data, not a credential to
anything the student owns. No account password, no API key and no personal data appear anywhere in this pack, and
no email provider credential was added to the low-code project even though the platform asked for one.
