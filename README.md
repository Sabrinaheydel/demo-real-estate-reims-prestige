# Reims Prestige

### Real-estate acquisition website + CRM product demo

A public portfolio demo showing how a real-estate website can become more than a catalogue of listings.

The product connects public acquisition flows, calculators and candidate profiles to an operational CRM where an agency team can qualify leads, prioritize follow-up, plan visits and match prospects with properties.

**Live product:** https://reims-gem-real-estate.lovable.app  
**Guided CRM demo:** https://reims-gem-real-estate.lovable.app/demo

> Public demo only. The agency, agents, properties, prospects and operational data shown in the demo are fictional.

---

## Problem

Real-estate teams often receive demand through several disconnected entry points: listing forms, valuation requests, affordability calculators, rental simulations and direct contact.

The information may exist, but the team still needs to answer a more useful question:

**What should we do next with this prospect?**

This demo explores a connected workflow where website interactions become structured CRM signals instead of isolated form submissions.

---

## Product

### Public acquisition experience

- premium responsive real-estate website
- property catalogue and detail pages
- buying, selling and rental journeys
- loan affordability calculator
- rental-income calculator
- candidate profile qualification
- contact and application forms

### CRM workspace

- 5-stage prospect pipeline
- lead scoring and qualification
- next-action tracking
- internal notes
- ownership / assignment
- appointment and visit planning
- prospect-to-property matching
- operational dashboard and KPIs
- source badges for calculators and candidate profiles
- simulated follow-up actions for public testers

### Guided public demo

Visitors can enter a dedicated sandbox and follow a short guided scenario through the CRM.

The demo account can interact with fictional records but cannot access real submissions, send real prospect emails or modify real business data.

---

## Example workflow

```text
Website visitor
      ↓
Calculator / candidate profile / form
      ↓
Structured lead created
      ↓
CRM qualification
      ↓
Score + next action
      ↓
Appointment / visit
      ↓
Property matching
      ↓
Follow-up
```

For the public demo, calculator and candidate-profile conversions create **synthetic leads only**. No name, phone number or email address is required for those flows.

---

## Privacy and security

The demo was designed with a clear separation between real administration and public testing.

- Supabase authentication for staff access
- dedicated `admin` and `demo` roles
- Row Level Security on CRM and property data
- demo users restricted to `is_demo = true` records
- tester feedback kept private from demo visitors
- privileged server functions verify authorization before using elevated database access
- Brevo credentials remain server-side
- real email sending is disabled for demo CRM actions
- admin area marked `noindex,nofollow`

The optional feedback form can store a tester email for reply purposes, but that information is available only to the real administrator and is never exposed in the public CRM sandbox.

---

## Product decisions

### 1. The website feeds the CRM

A calculator is not only a marketing widget. In this demo, its result can become a qualified CRM entry with a source, score and next action.

### 2. Public testing stays isolated

The visitor experience uses fictional data and a dedicated demo role instead of opening the real admin workspace.

### 3. Scoring remains transparent

The current lead scores are deterministic business rules for demonstration purposes. They are not AI-generated eligibility decisions.

### 4. Actions need visible consequences

Pipeline changes, notes, visits, matching and simulated follow-up persist in the demo data so a tester can understand the operational workflow rather than just browse static screens.

---

## Stack

- **Frontend:** React, TypeScript, TanStack Start
- **UI:** Tailwind CSS, Radix UI, Lucide
- **Backend / database:** Supabase
- **Authentication:** Supabase Auth
- **Security:** Supabase Row Level Security + server-side authorization
- **Email:** Brevo
- **Analytics:** Google Analytics 4
- **Deployment / product workflow:** Lovable + GitHub

---

## Repository structure

```text
src/
  components/
    admin/        CRM, guided demo, feedback
    site/         public website, calculators, profile
  integrations/
    supabase/     client and auth integration
  lib/            CRM, server functions, analytics, email
  routes/         public site, /demo, /auth, /admin
supabase/
  migrations/     schema, RLS and security migrations
```

---

## Local development

```bash
git clone https://github.com/Sabrinaheydel/demo-real-estate-reims-prestige.git
cd demo-real-estate-reims-prestige
npm install
npm run dev
```

The repository contains only Supabase **publishable** configuration. Server credentials such as the Brevo API key and elevated Supabase credentials are configured in the hosting environment and are not committed to the repository.

---

## Status

**Portfolio product demo, public beta.**

The project is intended to demonstrate product thinking, UX, connected workflows, CRM architecture and secure public sandboxing. It is not a production real-estate CRM, a live agency service or a financial eligibility tool.

Built by **Sabrina Heydel**, Founder of [Agence 360 Digital](https://www.agence360digital.fr/).
