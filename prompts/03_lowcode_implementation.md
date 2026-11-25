# Prompt 03 - Low-code implementation, TeleportHQ generator

Platform: TeleportHQ, workspace "My workspace", Trial plan, started from the "New Project → Bookings" path.
Started 25 November 2026 at 15:10:07 +0500. Free trial, no card, no subscription purchased. The account was
created with a Google login; nothing about the account is reproduced here.

The brief's own slide "Suggested AI prompt - implementation" is what this step follows: one description, given
to the platform, which then assembles the screens. The description below is the contract sheet of
`docs/01_contract.md` spoken in the platform's language, and it is the only instruction the platform got.

```
Smart Campus Room Availability Checker. A single page tool for students. One fictional campus room is
selected per check from a dropdown of five rooms (Room 101, Room 102, Room 201, Room 202, Auditorium A;
Room 102 is blocked). The student enters a start time and a duration in minutes, presses Check Availability,
and the page answers Available or Unavailable with one reason code and one human message. Rules: start time
must be in the future; duration must be greater than 0 and at most 120 minutes; a request overlapping an
existing booking is unavailable; a blocked room is unavailable; the decision must never change the stored
bookings; invalid input gets an understandable message. Fictional bookings: Calculus Lecture 09:00-10:00 and
Physics Lab 12:00-13:00 in Room 101, Chemistry Seminar 10:00-11:00 and Faculty Meeting 15:00-16:00 in
Room 201, Morning Tutorial 08:00-09:00 in Room 202, Guest Lecture 11:00-12:00 and Symposium 14:00-15:30 in
Auditorium A. No login, no payment, no personal data, no production database. Clean functional layout,
readable on a narrow phone screen.
```

Length as submitted: 1089 characters, pasted into the description field in one action, no follow-up prompts
before the first result.

What is recorded afterwards, in `docs/04_lowcode_notes.md`: what the generator produced, what I had to change
by hand in the visual editor, what the platform could not express at all, and the token cost it charged.
