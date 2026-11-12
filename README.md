Aryan Raval's portfolio

A responsive React portfolio covering full stack development, machine learning,
software engineering experience, and undergraduate research.

Local development:

    npm ci
    npm start

Production build:

    npm run build

Interaction checks:

    npm test -- --watchAll=false --runInBand

Content is maintained in src/data/portfolio.js. The biography and education
summary are in src/components/About.js. Replace the PDF at
src/assets/resume/ResumeTemp.pdf to update all resume links.

The home page uses the original purple background and animated butterfly, with
a soft fade into the charcoal background below and a subtle purple glow behind
the top of About.
The main butterfly swoops, banks, flutters its wings, and tilts toward the mouse.
As you scroll, it bursts into 10 butterflies below 768px, 15 from 768–1599px,
or 20 on displays 1600px and wider. Most burst rays reach farther across the
screen, while retaining an inset from the scrollbar. Each butterfly
wanders independently, choosing fresh destinations even when scrolling stops.
On larger screens, about three quarters of destinations favor the outer area, with a safe
inset from the scrollbar; the rest visit visible headings, the portrait, company
logos, and project artwork. Outer flights usually stay near their closest edge.
Their flight area stays inside the screen, away from the scrollbar and above
the footer. On phones, smaller 21–24px butterflies wander through clear spaces
across the viewport and around dates, technology chips, portraits, and project
images. They stay fully on screen and avoid the actual text and chip bounds,
leaving empty card space available for flight. If scrolling brings text over a
phone butterfly, it fades back in at a safe waypoint instead of staying hidden.
Text panels remain obstacles; butterflies fade when no clear passage exists.
Scrolling back to the top
draws the flock inward in a reverse burst,
then restores the original hero butterfly with a brief purple pulse.
The animation pauses in hidden tabs, and reduced-motion preferences keep the
original butterfly in the hero. Motion calculations are in
src/utils/butterflyMotion.js and the animation is in
src/components/ButterflyFollower.js.
All sections below it share the same charcoal background, with purple cards and
accents providing contrast.
About pairs the original photo with a layered frame. The degree, university logo,
honors, GPA, and resume sit together
below the copy; that strip stacks on phones. Photo hover and small decorative
motion respect reduced-motion preferences. Butterfly routes also keep the face
and academic details clear.
Mobile experience cards group each company logo, role, date, and location into
one summary, with a two-line preview and a clear Read experience action. Full
resume bullets and technology chips expand below; readers can also close a long
entry from its bottom. The three entries start collapsed. Desktop retains the
logo timeline and expanded details.
Mobile projects use a compact list with the first four priority projects visible
and a View all control for the remaining projects. Projects and Skills use matching
white and purple filter dropdowns with full category names, a selected checkmark,
keyboard navigation, and outside dismissal. Tapping a project opens a bottom sheet
with a framed preview, complete description, technologies, and a fixed footer
for the project links. Its reading area scrolls independently. The sheet supports
Escape, a close button, backdrop dismissal, and a downward swipe on its header.
Body scrolling and focus are restored on close or when resizing to desktop.
Desktop keeps its carousel, category buttons, arrows, and numbered navigation.
The selected category persists across the breakpoint.
Mobile skills show the selected category's grid immediately. Keyboard users can
navigate the dropdown with arrows, Home, and End, select with Enter, and dismiss
it with Escape.
Desktop shows all four groups. Responsive reveal targets are registered when
new sections mount, so rotating or resizing cannot leave content invisible.
Projects appear before Skills, with the navbar and scroll tracking following
the same order. Butterflies continue through the main sections and stop above
the footer. Desktop cards share one grid row sized to the tallest project in
the current filter, so swiping keeps the footer steady. The mobile list and sheet
use natural content height and do not measure a carousel with ResizeObserver.
Image areas reserve their space before screenshots load. The site uses real
screenshots where available, including src/assets/img/nanoafm.png. Other projects
use the locally served technology icons. Degree Planner links to the resume
because no public repository or live URL was provided.

The footer contains a direct email link and a 2026 copyright notice. The address is maintained in
src/components/Footer.js. On phones the email uses compact type in a shorter
touch target, with a small back-to-top control and bottom safe-area padding.

The navbar speaker controls sound effects only; there is no background music
or audio element. Each load or refresh starts silent and shows a clickable
message bubble below the speaker. Clicking the message or speaker enables
effects. The close button (or Escape while focused on the message) dismisses it
and keeps audio muted until the navbar speaker is used. The bubble does not
block scrolling, navigation, or keyboard focus.
The prompt does not persist a choice across reloads. Ordinary clicks, typing,
and mouse movement cannot override a decision to continue silently. After
activation, interaction or returning to the tab can retry an interrupted context.
Sounds are never
queued while audio is suspended. When the browser requires interaction, the
slashed speaker shows "Click for sound" and its first click enables audio.
Once sound is enabled, clicks or taps elsewhere can retry playback. The purple speaker
appears only when the audio context is running. Once the speaker button is used,
its setting takes priority over automatic retries. A manual
mute stays in place while navigating between sections. Code cannot guarantee audible autoplay on
a first visit or refresh when the browser blocks it.

On browsers supporting the Audio Session API (including recent iPhone Safari),
enabling effects selects the `playback` session before creating or resuming Web
Audio. This avoids iOS treating the effects as ambient audio muted by Silent
Mode while still reporting a running audio context. Muting restores the previous
session type. Older browsers fall back to normal Web Audio; their device Silent
Mode and media volume settings can still affect audibility.

Butterfly bursts and reunions have a soft whoosh and chime; project navigation
and touch swipes have a short swish. Navbar links (including GitHub and LinkedIn)
use a rising chirp. Resume, Let's Connect, and Back to top share a separate
two-note chime; other buttons and links have a short click.
Reaching a different experience entry while scrolling plays a light two-note cue.
Skills keep their scroll animations and reveal silently.
The home-page role animation plays a short keyboard tap as letters are typed or
deleted, skipping spaces, pauses, hidden tabs, and text outside the viewport.
Scrolling past Home or moving the role behind the navbar immediately cancels
any remaining typing taps without interrupting other effects.
Short effects have fuller envelopes and increased volume, balanced against the
butterfly effects through the same master output (gain 0.715, increased by 30%
from 0.55).
Effects are synthesized locally with Web Audio, with cooldowns to avoid repeated
sounds during scrolling. Muting also cancels scheduled effects. The shared
sound engine is in src/utils/interfaceSounds.js.

Skill icons are served locally from public/icons. Source, pinned Devicon version,
and license are recorded in public/icons/NOTICE.txt and LICENSE.devicon.txt.

Company marks are served locally from public/logos; their original sources are
recorded in public/logos/NOTICE.txt. Experience uses the C-lock C mark, CAT logo,
and South Dakota Mines M mark instead of generic timeline icons.

Sections reveal once as they enter the viewport, and project details animate
when changing slides. Motion respects prefers-reduced-motion, and content stays
visible when scroll observers are unavailable. The shared reveal behavior is in
src/hooks/useScrollReveal.js.

No .env file is required.
