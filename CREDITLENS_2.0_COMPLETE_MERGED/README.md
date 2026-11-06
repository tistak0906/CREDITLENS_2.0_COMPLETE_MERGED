# CREDITLENS 2.0 — Complete Merged Build
Dark-theme full-stack loan management and credit-risk analytics starter.

## Stack
React + Vite + Recharts | Node.js + Express | MySQL + mysql2 | JWT + bcrypt

## Setup
1. Install MySQL 8 and Node.js 18+.
2. Run `mysql -u root -p < database/schema.sql`.
3. Optional demo records: `mysql -u root -p creditlens < database/seed.sql`.
4. In `server`, copy `.env.example` to `.env`, configure DB credentials and a strong JWT secret, then run `npm install && npm run create-admin && npm run dev`.
5. In `client`, run `npm install && npm run dev`.
6. Open http://localhost:5173. Demo login: `admin@creditlens.local` / `ChangeMe123!` (change immediately).

The API listens on port 5000. The frontend uses Vite's dev server on port 5173.

## Modules
Overview dashboard, customers CRUD, loan applications and approval, loan portfolio, Loan Products catalogue, payment recording, credit-risk assessments, repayment schedules, notifications, EMI calculator, credit score estimator, loan eligibility estimator, risk analytics, and advanced reports.

## Important
This is an educational DBMS project, not a production lending decision system. Risk categories are simple rule-based indicators and must not be the sole basis for real credit decisions. Apply appropriate privacy, security, fairness and lending reviews before real-world deployment.


## CREDITLENS 2.0 feature upgrades

The updated application adds:
- **Credit Score Calculator:** a transparent educational profile index. It is not a CIBIL or other bureau score. Genuine bureau retrieval requires an authorised bureau relationship, an approved API product, and credentials configured securely on the server.
- **Loan Eligibility Calculator:** an illustrative FOIR-based affordability calculation. Its cap is editable and is not a lending approval.
- **Repayment Schedule:** reads existing `LoanSchedules` records and displays paid, pending, and overdue instalments. Approving a new loan now generates its monthly EMI schedule automatically. Marking an instalment paid records a corresponding payment and updates the schedule in one database transaction.
- **Improved Risk Analytics:** aggregates the latest assessment for each customer and shows descriptive risk and repayment indicators. The stored risk rules are not a validated default-prediction model.
- **Notification Center:** derives application, overdue, and upcoming-instalment alerts from current database rows. Read state is stored in the current browser.
- **Advanced Reports:** adds database-backed summary cards, CSV export, and browser Print / Save PDF.
- **Dashboard improvements:** six-month collection series (including zero-activity months), latest-assessment risk distribution, quick tools, and portfolio indicators.

### Accuracy and model limitations

Arithmetic such as EMI, FOIR capacity, percentages, totals, and database counts is deterministic and can be tested against known calculations. That does **not** establish 70% predictive accuracy. To measure predictive accuracy, the project needs a representative, consented dataset with verified outcomes (for example, repayment/default outcomes), a defined target and evaluation window, and a held-out test set. The current fictional seed/demo records are not suitable evidence of real-world model accuracy.

### Database compatibility

No new tables or schema changes are required for these upgrades. They use the existing `Customers`, `LoanApplications`, `Loans`, `Payments`, `CreditAssessments`, and `LoanSchedules` tables. The API now records a payment when an admin marks an unpaid schedule row as paid.

### Important local configuration

The ZIP intentionally does not include `server/.env` because it contains local database/JWT settings. Before running this extracted project:
1. Copy `server/.env` from your existing working project into this project's `server` folder. Do not share that file.
2. Keep your existing MySQL `creditlens` database; no schema reset or seed rerun is required.
3. Keep the existing ports: Vite frontend `5173`, Express API `5000`.

Start the server and client in separate terminals as before:
```bash
cd server
npm run dev
```
```bash
cd client
npm run dev
```


## Loan Products board

The sidebar includes a Loan Products catalogue with searchable/filterable demo categories (personal, home, education, vehicle, business and gold loans), illustrative annual interest-rate ranges, typical tenures, security notes and eligibility considerations. The catalogue is frontend-only and requires no database migration. The displayed rates are demonstration values, not live lender quotations or offers.


## Complete merged build

This ZIP combines all previously implemented CREDITLENS 2.0 features and fixes with the new Loan Products catalogue. It is a full project package, not a patch-only ZIP. The Loan Products catalogue is frontend-based and requires no database migration.

## Windows setup after extraction

1. Copy your existing private `server/.env` into this project's `server` folder. Do not share it.
2. In a terminal at `server`, run `npm install`, then `npm run dev`.
3. In a second terminal at `client`, run `npm install`, then `npm run dev`.
4. Open `http://localhost:5173`. The API remains on port `5000`.
5. Keep your existing MySQL `creditlens` database. Do not rerun schema or seed scripts on the populated database.
