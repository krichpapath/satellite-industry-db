# Product

## Register

product

## Users

Analysts and administrators maintaining company and satellite component records for the Thai satellite industry database. They work in dense operational screens, review expert taxonomy choices, and need confidence that saved records match the real manufactured product.

## Product Purpose

The product provides a governed workspace for recording companies, classifying their satellite components, searching the data, and exporting scoped datasets. Success means users can add and review component records without guessing where the data belongs or losing detail.

## Brand Personality

Precise, restrained, expert.

## Anti-references

Avoid decorative dashboards, generic SaaS gradients, unclear taxonomy forms, cramped modal inputs, placeholder-only labels, and displays that hide long technical component names.

## Design Principles

- Make the current task obvious before adding visual detail.
- Treat the expert taxonomy as guidance, not decoration.
- Keep dense records readable with clear hierarchy and wrapping text.
- Preserve standard controls, keyboard access, and visible state feedback.
- Favor restrained product UI over brand-heavy presentation.

## Role & Routing Model

- Keep one canonical company catalog and record route family: `/companies`, `/companies/new`, `/companies/[id]`, and `/companies/[id]/edit`.
- Use role-specific routes only for genuinely different workflows, such as analyst intake and admin tools.
- Do not duplicate the same company CRUD screens under separate role prefixes. Role-prefixed clones create drift and are not security.
- Public, Analyst, and Admin views should share the same resource pages where practical, with visible actions controlled by permissions.
- Future account login should enforce permissions through auth and route guards, not by trusting URL names.
- Admin-specific management surfaces belong under `/admin`; analyst-specific intake surfaces may live under `/analysis`.

## Accessibility & Inclusion

Use visible labels, descriptive button text, keyboard-operable forms, clear disabled states, and layouts that remain usable on desktop and mobile. Motion must not gate content visibility.
