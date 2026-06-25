<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Neuropsychology Clinical Records System
description: A private, compliance-first clinical records management system for neuropsychology practice.
---

# Design System: Neuropsychology Clinical Records System

## 1. Overview

**Creative North Star: "The Precision Instrument"**

This system is a clinical instrument — not a product pitch, not a wellness app, not a dashboard template. It earns trust the way a well-calibrated diagnostic device does: through density, consistency, and visible rigor. Every surface exists to carry clinical data clearly and quickly. The specialist should be able to extract information at a glance, knowing that whatever she sees is accurate, compliant, and legally accountable.

The color palette is anchored in a cool blue-tinted ink — the hue of clinical environments, diagnostic instruments, and formal documentation. Surfaces are neutral and restrained; a single accent color is used sparingly, with purpose. Motion is minimal: only state changes (hover, focus, alert transitions). Nothing moves for its own sake.

References: Linear's systematic UI discipline, Stripe's information density and typographic confidence, GOV.UK's no-nonsense hierarchy and compliance-forward clarity. Anti-reference: consumer health apps — no warmth, no illustration, no reassurance pastels. *"This is a clinical tool for a medical professional, not a patient-facing product."* — PRODUCT.md

**Key Characteristics:**
- Dense, scannable layouts — clinical data at a glance, not one screen per record
- Cool blue-tinted ink anchors the palette — precision instrument, not product pitch
- Restrained motion — state changes only, nothing decorative
- Explicit compliance signals — audit trails, locked indicators, hashes surfaced with quiet confidence
- Expert-assumption copy — no hand-holding, no consumer-grade empty states

## 2. Colors

The palette is built on discipline: one cool blue-tinted ink as the dominant surface and typographic anchor, one precise accent used at ≤10% of any given screen. Rarity is the point.

### Primary
- **Cool-Tinted Clinical Ink** [to be resolved during implementation]: The dominant type and structural color. Used for all primary text, primary actions, and interface chrome. The blue tint signals precision — clinical, not corporate.

### Neutral
- **Paper White / Off-White** [to be resolved during implementation]: Default surface background. Slightly off-white to reduce eye strain in long clinical sessions.
- **Structural Gray** [to be resolved during implementation]: Borders, table rules, dividers. Defines hierarchy without competing with content.
- **Muted Text** [to be resolved during implementation]: Secondary labels, timestamps, metadata. One step lighter than primary ink.

### Status (functional, never decorative)
- **Alert Red** [to be resolved during implementation]: Validation errors, locked-note violations, CURP mismatches. Used only for system warnings and errors.
- **Confirmation Green** [to be resolved during implementation]: Verified consent, successful saves, cryptographic hash confirmed. Appears only for affirmative system feedback.

### Named Rules
**The One Accent Rule.** There is one accent color. It appears on ≤10% of any given screen. Its rarity is what makes it a signal — a primary button, an active state indicator, a badge. Diluting it across the UI destroys the signal entirely.

**The No-Warmth Rule.** The palette is cool and neutral. No warm beiges, no amber tones, no wellness-adjacent pastels. The specialist is a medical professional, not a patient.

## 3. Typography

**Display/Body Font:** Single sans-serif family at multiple weights [font pairing to be chosen at implementation]
**Mono Font:** System monospace for clinical identifiers (CURPs, SHA-256 hashes, document IDs) [to be resolved during implementation]

**Character:** One sans family at disciplined weights — likely a geometric or humanist sans with strong numeric figures and good tabular number rendering. The type should read like a well-typeset medical journal, not a SaaS landing page.

### Hierarchy
- **Display** ([weight TBD], [size TBD]): Section titles, patient name at the top of a record. Used sparingly — one per view maximum.
- **Headline** ([weight TBD], [size TBD]): Card headers, modal titles, primary navigation labels.
- **Title** ([weight TBD], [size TBD]): Field group labels, table column headers, sidebar section names.
- **Body** ([weight TBD], [size TBD]): SOAP note content, evaluation descriptors, record narratives. Max line length ~75ch for readability in dense clinical text.
- **Label** ([weight TBD], [size TBD], uppercase where applicable): Form field labels, metadata, timestamps, tab labels.
- **Mono** (system monospace, [size TBD]): CURPs, SHA-256 hashes, internal IDs — any string a user might need to verify character-by-character.

### Named Rules
**The No-Decoration Rule.** Type weight and size carry hierarchy, not aesthetic interest. A heavier weight means the element is more important. Never bold text for visual rhythm.

**The Mono Identifier Rule.** Any string that a human might need to verify character-by-character (CURP, SHA-256 hash, document ID) must render in monospace. Proportional type makes transcription errors invisible.

## 4. Elevation

This system is flat by default. Surfaces do not float; they are separated through tonal layering, structural borders, and clear containment — not box shadows. A sidebar sits beside the content area because it has a defined border, not because it casts a shadow. A modal is elevated by a neutral overlay and a bordered container, not by a dramatic drop shadow.

**The Flat-By-Default Rule.** Surfaces are flat at rest. If a shadow appears, it signals an actively elevated interactive state — an open dropdown, a focused input, an active modal overlay. Shadows are never decorative card treatments. The system's depth vocabulary is structural, not atmospheric.

## 5. Components

[No components yet — re-run `/impeccable document` once there's code to capture the real component system.]

## 6. Do's and Don'ts

### Do:
- **Do** use cool blue-tinted ink as the dominant type and structural color. It is the visual and semantic anchor of the system.
- **Do** surface compliance signals — audit timestamps, locked-note badges, CURP validation status, SHA-256 hashes — in the primary UI flow. They are features of system integrity, not footnotes.
- **Do** use monospace type for any identifier a user might need to verify character-by-character: CURPs, hashes, document IDs.
- **Do** assume a trained medical professional. Interface copy is direct and professional — no hand-holding, no empty-state illustrations, no onboarding animations.
- **Do** treat density as a feature. Clinical data should be scannable at a glance; structured layouts, consistent type hierarchy, and restrained whitespace serve the specialist's workflow.
- **Do** respect `prefers-reduced-motion`. Motion is already restrained; honor the media query unconditionally.
- **Do** maintain WCAG 2.1 AA contrast: ≥4.5:1 for body text, ≥3:1 for large text.

### Don't:
- **Don't** use gradients, glow effects, hero sections, large animations, oversized whitespace, or startup-style visual flair. *"The system is a precision instrument, not a product pitch."* — PRODUCT.md
- **Don't** use the warm, illustrative, or friendly aesthetic of consumer health apps — Apple Health, Headspace, wellness trackers. *"This is a clinical tool for a medical professional."* — PRODUCT.md
- **Don't** dilute the single accent color. If it appears on more than ~10% of a screen, it has lost its function as a signal.
- **Don't** use shadows as decoration. Elevation is reserved for interactive state (open dropdowns, active modals) — not for making cards look interesting.
- **Don't** hide compliance signals to reduce visual noise. Audit timestamps, locked indicators, and cryptographic hash badges are core features. Suppressing them weakens the system's legal posture.
- **Don't** use consumer-grade empty states — no illustrations, no friendly copy, no confetti. An empty patient list is an empty patient list. State it plainly.
- **Don't** soften the interface with warm neutrals, beige backgrounds, or pastel accents. The palette is cool, precise, and neutral.
- **Don't** use SaaS marketing conventions: no hero CTAs, no feature-highlight cards, no testimonial-style pull quotes in the UI.
