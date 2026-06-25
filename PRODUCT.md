# Product

## Register

product

## Users

The primary user is a single neuropsychologist operating a private practice in Mexico. She uses this system daily to manage clinical records for her patients — creating patient files, writing SOAP-format evolution notes, recording neuropsychological evaluation scores across cognitive domains, and uploading signed documents. She works at a desktop computer in a clinic or office setting, with no time to spare for learning curves. She is the only user with write access; the system is not public-facing.

## Product Purpose

A private clinical records management system for neuropsychology practice. It digitizes patient files, neuropsychological evaluation data, SOAP evolution notes, and scanned documents. Compliance with Mexican health regulations (NOM-004-SSA3-2012 and NOM-024-SSA3-2012, overseen by COFEPRIS) is a first-class requirement: audit trails, immutable notes with SHA-256 hashes, CURP validation, and informed consent tracking are structural — not optional features. Success means the specialist can execute her full clinical workflow confidently, knowing every action is legally compliant and every record is secure.

## Brand Personality

Precise. Authoritative. Composed.

The system should feel like a well-designed private medical institution: structured and exacting, but not cold or hostile. Confidence comes from clarity and density — the user should trust the system because it looks like it knows what it is doing, not because it reassures her with decorative elements.

## Anti-references

- **SaaS marketing aesthetic**: no gradients, glow effects, hero sections, large animations, oversized whitespace, or startup-style visual flair. The system is a precision instrument, not a product pitch.
- **Consumer health apps**: avoid the warm, illustrative, friendly aesthetic of patient-facing apps like Apple Health or wellness trackers. This is a clinical tool for a medical professional.

## Design Principles

1. **Density earns trust** — clinical data should be scannable at a glance. Use structured layouts, consistent type hierarchy, and restrained whitespace so the specialist can extract information quickly without hunting.
2. **Compliance is visible, not bureaucratic** — legal requirements (audit timestamps, locked-note indicators, CURP validation, consent checkboxes) must be surfaced clearly in the UI without feeling like government forms. They are signals of system integrity, not obstacles.
3. **Precision over decoration** — every visual element justifies its presence through function. Color, weight, and space carry meaning; nothing is decorative.
4. **Expert confidence** — the UI assumes a trained medical professional. No hand-holding, no consumer-grade empty states. Interface copy is direct and professional.
5. **Immutable clarity** — locked records, audit trails, and cryptographic hashes are features of the system, not footnotes. They should be surfaced with quiet confidence so the specialist always knows where the record stands legally.

## Accessibility & Inclusion

WCAG 2.1 AA compliance. Standard contrast ratios (≥4.5:1 for body text, ≥3:1 for large text), full keyboard navigation, and visible focus indicators. No specific reduced-motion or color-blindness accommodations beyond AA defaults, but reduced-motion media query should be respected for any animations added.
