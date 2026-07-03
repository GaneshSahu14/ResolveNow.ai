# TODO - Helpdesk Premium SaaS UI Redesign

## Phase 1 — Foundation & navigation
- [x] Add Command Palette (Ctrl+K) component
- [ ] Redesign Layout: permanent left sidebar (240px) + floating top bar + profile menu + theme toggle
- [ ] Add/adjust shared glass/glow utility styles in client `index.css` (only if needed)

## Phase 2 — Pages UI redesign (keep APIs & queries intact)
- [ ] DashboardPage: replace stat cards with bento grid + AI-first widgets
- [ ] Tickets list: replace table UX with Linear-like issue cards, skeletons, empty states (keep sorting/pagination/filter API params)
- [ ] TicketsFilters: premium spacing + modern sort dropdown & chips
- [ ] TicketDetailPage/TicketDetail/ReplyThread: Intercom-like thread UI + sticky AI assistant panel (reuse existing AI endpoints/components)

## Phase 3 — Marketing + Auth
- [ ] HomePage: refine into full landing spec (bento sections, SVG, grid/gradient)
- [ ] LoginPage & SignupPage: Clerk-inspired polish + motion consistency

## Phase 4 — Motion, polish, verification
- [ ] Apply Framer Motion to key interactions (sidebar, command palette, cards, transitions) with reduced-motion support
- [ ] Verify all existing e2e tests + critical flows (tickets, replies, summarize/polish) still pass

## Prompt 2 — Implement Missing Playwright E2E Tests (QA Automation)
- [ ] Authentication: empty form validation, session expiration, remember session (if present), unauthorized route access
- [ ] Dashboard: empty states, navigation links, loading states (if applicable)
- [ ] Tickets: view/edit/assign/change status, search no results, sorting verification, pagination verification, bulk disabled/error states (if implemented)
- [ ] Replies/Ticket detail: empty reply validation, empty internal note validation, conversation history persistence after reload
- [ ] AI: classification, retry generation, timeout handling, endpoint-specific error handling, suggested reply validation
- [ ] Knowledge Base: empty search results, category filter + search interaction
- [ ] Users: duplicate email validation, change role, admin-only UI validation
- [ ] Settings: persistence after reload, theme persistence
- [ ] Medium: inbound webhook created ticket appears in UI / attachment verification (only if supported & deterministic)
- [ ] Low: outbound email delivery + failure handling (defer/not testable unless UI has deterministic states)

