# Ээлж: system and approach

## What foreign shift platforms do

The products use a structured shift record so workers can judge a job before committing: duties, place, date and hours, pay, and any skill or eligibility requirements. Employers create or request shifts; workers browse and choose work that fits their schedule.

- [Instawork: how it works for businesses](https://www.instawork.com/how-it-works) describes posting a shift with role, time, and requirements, then matching qualified workers and handling shift operations.
- [Timee: business workflow](https://timee.co.jp/client/step/step03/) explains creating short-time job listings with the details workers need to apply.
- [Zenjob: how it works for students](https://support.zenjob.com/hc/en-150/articles/4801198607775-How-does-Zenjob-work) describes job details, profile/availability fit, and applying through the app.
- [Zenjob: how it works for companies](https://www.zenjob.com/en/companies/how-does-zenjob-work/) describes the staffing-provider model, matching people to a company's requirements, and handling employment administration.

These are different operating models. The prototype borrows the clear shift details and two-sided workflow, not foreign contracts, payments, screening claims, or employment arrangements.

## The Ээлж marketplace loop

1. Employer drafts a shift with role, tasks, district, date, start/end time, hourly pay, openings, and requirements.
2. A published shift appears in the student listing and can be filtered by role and district.
3. Student opens the full details, saves the shift, and submits a short application.
4. Employer reviews the application and accepts, declines, or leaves it under review.
5. Student sees the updated status in “Миний хүсэлтүүд”.
6. The shift closes when paused by the employer or its openings are filled.

For the prototype, both roles operate in one browser and share demo data through localStorage. There is no real account, employer identity, or network transmission.

## Build approach

### 1. Prototype now

Build the responsive static website in plain HTML, CSS, and JavaScript. Use role selection from the sign-in action, role/district search, sortable sample listings, listing details, saved jobs, an application form, employer listing management, and application status changes. Persist state locally so the loop works during a demonstration. Keep the sample-data notice visible throughout.

### 2. Live pilot later

Before serving real people, move listings, profiles, and applications to a backend with proper authentication and separate student/employer permissions. Verify employer organizations, moderate listings, protect contact information, and send application/status notifications. Measure listing views, applications, time to fill, and cancellation rates before adding algorithmic matching.

### 3. Operations only after validation

Foreign products may include staffing administration, qualification checks, attendance, support, mutual ratings, contracts, and payroll. Keep those out of the initial Mongolian prototype. Add them only after validating local employer demand, operating capacity, payment design, and applicable employment requirements.

## Explicit boundaries

- The browser demo sends no applications and no contact details.
- Sample jobs, employers, pay, and applicant statuses are illustrative.
- Do not label the prototype's simple filters as AI matching.
- Do not claim vetting, insurance, reliable attendance, guaranteed work, or fast payment.
- Treat employment, tax, payment, and worker-protection details as local product research before a live pilot.
