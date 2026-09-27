# vboard — Future / Deferred

Things intentionally out of v1. Don't add until the trigger condition is met.

## Schema

- `comment` / `reaction` tables — when a post-engagement feature is requested.
- `category` / `tag` on posts — when the discover feed needs filter UI.
- `community_follow` + notifications — v2.
- `year`, `semester`, `division` on profile — when an event needs to target by them ("BE Sem 8 only").

## Features

- **Custom registration form fields** — community managers attach event-specific questions to the registration form. Fully replaces Google Forms. v2 priority.
- Roll number CSV validation — admin uploads the official VIT student list, signups must match a row. Add when fake-account spam becomes a real problem.
- Push / email notifications on event reminders, approval decisions.
- Inter-college / alumni `guest` role — opens vboard to non-`@vit.edu.in` users for open events.
- Payments / paid event tickets — not currently a use case.

## Deployment / ops

- Custom subdomain on R2 bucket for cleaner image URLs.
- Cloudflare Cache rules for high-traffic event pages.

## RBAC

See `research/rbac.md` for the ordered list: per-event co-hosts, faculty advisor, community approval workflow, capability overrides, department-scoped admins, pending invites, audience targeting, session review.
