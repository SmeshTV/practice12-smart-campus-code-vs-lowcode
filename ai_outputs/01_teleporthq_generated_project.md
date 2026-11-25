Output 01 - what the TeleportHQ project generator produced from one prompt

Input: `prompts/03_lowcode_implementation.md`, 1089 characters, submitted to the "New Project" generator at
15:10:07, category "Bookings". The platform named the project CampusCue and gave it the id
`blaring-defensive-otter-8iwe1a`. Generation finished around 15:17.

This is not a chat reply. On this platform the first output of a prompt is the project itself, so the output is
recorded as the structure the platform created, read from the editor's own tree
(`evidence/11_lowcode_editor_snapshot.txt`, captured 15:38):

Pages and components the platform built, verbatim from the tree:

    admin-panel
    authentication
    bookings
      Custom Page ADMIN
      Homepage
      Terms & Conditions
    Components: admin-panel, bookings, email-templates
      Footer, invoice-template, Logo, Navigation
    Layer tree of Homepage:
      Homepage > Navigation
                 > RoomCheckerSection  (.room-checker-section)
                 > PseudoStyles
                 > Footer
                 > Cookie Consent

Also switched on by the generator, without being asked:

    Bookings module           the workspace card reads "Bookings | Web App"
    CMS Webhook button        present in the publish panel
    email-templates and an invoice-template component
    a Stripe/PayPal/invoice onboarding tour ("Let customers pay online with Stripe, PayPal and others")

What the checker section actually did on first load, from `evidence/matrix_lowcode/initial_lowcode.txt` taken
later on the published site:

    select#room-select      five rooms, correct captions
    input#start-datetime    datetime-local
    input#duration-minutes  number, max 120
    "Check Availability"    an anchor, not a button; no rule evaluated
    Verified Status         always "Available / ROOM_CLEAR"

So the generator reproduced the interface and the timetable faithfully, and produced no behaviour at all. The
inline scripts on the page were searched for `overlap`, `blocked` and `INTERVAL` and carried no rules. That is
the honest baseline for the low-code track: seven minutes of waiting after one prompt buys the shell, and the
acceptance criteria are not in it.

Nothing here is a defect of the platform's making alone: the prompt asked for the rules, and the generator
delivered a layout instead. It is recorded because the comparison is about what a visual builder gives you for
one prompt and what it does not.
