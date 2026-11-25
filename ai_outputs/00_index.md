# AI outputs, index

Two different assistants were used on this practice, and they are kept apart on purpose.

| File | Producer | Kind | Where it came from |
| --- | --- | --- | --- |
| `01_teleporthq_generated_project.md` | TeleportHQ project generator | the app itself, as built | editor tree and published DOM, `evidence/11_lowcode_editor_snapshot.txt`, `evidence/matrix_lowcode/initial_lowcode.txt` |
| `02_teleporthq_wiring_reply.txt` | TeleportHQ in-editor AI assistant | chat message, verbatim | accessibility snapshot at 15:38, element `uid=1_181` |
| `03_teleporthq_defect_refusal.txt` | TeleportHQ in-editor AI assistant | chat messages and offered buttons, verbatim | same snapshot, elements `uid=1_196` to `uid=1_206` |
| `04_teleporthq_publish_panel.txt` | TeleportHQ, not an AI answer | panel text, verbatim | same snapshot, elements `uid=1_216` to `uid=1_272` |

The prompts that produced them are in `prompts/03_lowcode_implementation.md`,
`prompts/04_lowcode_workflow.md` and `prompts/05_lowcode_defect.md`.

The other assistant on this practice is the coding agent that wrote the code track, and its output is not a chat
log: it is the repository. `docs/03_code_changes.md` lists the change set line by line, `evidence/06_code_change_set.txt`
is the diff, `evidence/07_breaking_run.txt` shows the rules being proved by breaking them, and every number in
`docs/` was read out of a file that this session produced. The reflection on that tool is `docs/08_ai_reflection.md`.
