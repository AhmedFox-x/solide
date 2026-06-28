# Solide — AGENTS.md

## Project Identity

This repository belongs exclusively to Solide.

Solide is a metal fabrication, installation, decorative metalworks, and custom project execution company.

The company is NOT a design agency.

3D visualizations are used only to preview projects before manufacturing and installation.

All design, content, architecture, and business decisions should reflect this reality.

---
## UI / UX Quality Standards

Every UI change must improve the overall quality of the website, never reduce it.

When implementing any new feature or section:

* Match the existing design system exactly.
* Maintain consistent spacing, typography, colors, border radius, shadows, and animations.
* New components must feel like they were designed as part of the original website.
* Prefer elegant, premium, modern interfaces over generic layouts.
* Avoid clutter, unnecessary elements, or visual noise.
* Prioritize readability, accessibility, and responsive behavior.
* Use smooth, subtle animations that enhance the experience without distracting the user.
* Never introduce inconsistent styles or duplicate design patterns.
* Reuse existing components whenever possible instead of creating similar alternatives.
* Preserve the visual hierarchy and user flow of the page.
* Optimize every change for performance and maintainability.
* Before finalizing any UI work, verify that the new feature integrates naturally with the surrounding sections and does not negatively affect layout, responsiveness, or user experience.

**Principle:** Every modification should make the website look more premium, polished, and cohesive, similar to the quality expected from world-class product websites such as Apple, Stripe, Vercel, Framer, and Linear.
---
## Project Structure

```text
Solide Project/
  Solide_Website.html

files/
  solide-backend/
  solide-frontend/

.agents/skills/
```

Ignore any Nanosent-related files or references unless explicitly requested.

---

## Mission

Your goal is to build and maintain a production-ready business website for Solide.

The website must:

* Showcase real company projects.
* Generate customer inquiries.
* Build trust and credibility.
* Present services professionally.
* Support future business growth.
* Provide a complete admin management experience.

---

## Required Technology

Frontend:

* React 18
* Vite
* Tailwind CSS
* TypeScript

Backend:

* Express
* Prisma
* SQLite (current)
* JWT Authentication

---

## Skills Policy

Before starting work:

1. Check available installed skills.
2. Use relevant installed skills automatically.
3. For major frontend work, use frontend-design first.
4. Use find-skills only when no suitable installed skill exists.
5. Do not repeatedly search for skills if an appropriate skill is already installed.

---

## Frontend Design Standards

Use frontend-design before major UI work.

The website should feel similar in quality to:

* Apple
* Vercel
* Stripe
* Linear
* Framer

Priorities:

* Premium appearance
* Strong visual hierarchy
* Clean typography
* Excellent spacing
* Mobile-first responsiveness
* Accessibility
* Fast performance

Avoid:

* Generic templates
* Placeholder content
* Inconsistent styles
* Repetitive layouts

---

## Business Sections

Public website should contain:

* Hero Section
* About Solide
* Services
* Why Choose Us
* Project Gallery
* 3D Visualization Gallery
* Video Showcase
* Testimonials
* Contact
* Request Quote

---

## Content Management Requirements

The website is content-driven.

Everything displayed publicly should be manageable from the admin dashboard.

Admin should be able to manage:

* Projects
* Images
* Videos
* 3D Renders
* Testimonials
* Contact Tickets
* Homepage Content
* Featured Projects

Avoid hardcoded content whenever possible.

---

## Dashboard Requirements

Dashboard is admin-only.

Implement:

* Secure login
* Protected routes
* Project management
* Media management
* Testimonial management
* Ticket management
* Content management

Dashboard must support:

Create
Read
Update
Delete

for all managed content.

---

## Testimonials Policy

Visitors do not publish testimonials.

Only administrators can create, edit, or remove testimonials.

Testimonials shown publicly are approved and managed by Solide.

---

## Ticket System

Visitors can:

* Request a quote
* Submit an inquiry
* Request consultation

Dashboard must allow:

* View tickets
* Filter tickets
* Update status
* Mark resolved

---

## Media Management

Support:

* Images
* Videos
* 3D project renders

Allow:

* Upload
* Preview
* Edit metadata
* Delete

---

## Verification Rules

Never assume code works.

Verify it.

After every meaningful change:

* Start the application
* Test affected pages
* Test affected APIs
* Check console errors
* Check network errors
* Check responsive layouts
* Check authentication flow

If issues are found:

* Fix them
* Re-test
* Verify again

---

## Browser Testing

Use Playwright MCP whenever available.

For frontend changes:

1. Open affected pages.
2. Interact with modified features.
3. Check console logs.
4. Check network requests.
5. Verify responsive behavior.
6. Verify forms work correctly.

Do not rely solely on code inspection.

---

## Video Analysis

When a video is provided:

1. Analyze the video directly.
2. Extract frames when necessary.
3. Identify visible behavior.
4. Reproduce the issue using browser tools.
5. Correlate findings with source code.
6. Verify conclusions before proposing fixes.

Do not ask the user to manually describe a video before attempting analysis.

---

## No Guessing Rule

Never speculate when verification is possible.

Use:

* Browser tools
* Logs
* Source code
* APIs
* Screenshots
* Videos
* MCP tools

Evidence takes priority over assumptions.

---

## Completion Criteria

A task is NOT complete until:

* Implementation is finished.
* Verification passes.
* Browser testing passes.
* No new console errors exist.
* No new runtime errors exist.
* No broken functionality exists.
* Mobile responsiveness is verified.

Do not mark work complete until all applicable checks pass.
