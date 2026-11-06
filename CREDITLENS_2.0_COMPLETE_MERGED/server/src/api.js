import { Router } from 'express';
import db from './db.js';

const r = Router();

r.get('/dashboard', async (req, res, next) => {
  try {
    const [[customers]] = await db.query(
      'SELECT COUNT(*) AS total FROM Customers'
    );
    const [[applications]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'Pending'), 0) AS pending,
        COALESCE(SUM(status = 'Approved'), 0) AS approved,
        COALESCE(SUM(status = 'Rejected'), 0) AS rejected
      FROM LoanApplications
    `);
    const [[loans]] = await db.query(`
      SELECT COUNT(*) AS total, COALESCE(SUM(principal), 0) AS disbursed
      FROM Loans
      WHERE status = 'Active'
    `);
    const [[payments]] = await db.query(`
      SELECT COALESCE(SUM(amount_paid), 0) AS total
      FROM Payments
      WHERE payment_status IN ('Paid', 'Late')
    `);
    const [[activeLoanPayments]] = await db.query(`
      SELECT COALESCE(SUM(p.amount_paid), 0) AS total
      FROM Payments p
      JOIN Loans l USING (loan_id)
      WHERE l.status = 'Active'
        AND p.payment_status IN ('Paid', 'Late')
    `);
    const [[scheduleStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'Paid'), 0) AS paid,
        COALESCE(SUM(status = 'Overdue' OR (status = 'Pending' AND due_date < CURRENT_DATE)), 0) AS overdue,
        COALESCE(SUM(status = 'Pending' AND due_date >= CURRENT_DATE), 0) AS upcoming
      FROM LoanSchedules
    `);
    const [[outstanding]] = await db.query(`
      SELECT COALESCE(SUM(GREATEST(l.principal - COALESCE(p.paid, 0), 0)), 0) AS total
      FROM Loans l
      LEFT JOIN (
        SELECT loan_id, SUM(amount_paid) AS paid
        FROM Payments
        WHERE payment_status IN ('Paid', 'Late')
        GROUP BY loan_id
      ) p ON p.loan_id = l.loan_id
      WHERE l.status = 'Active'
    `);
    const [risk] = await db.query(`
      SELECT risk_level AS name, COUNT(*) AS value
      FROM (
        SELECT
          risk_level,
          ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY assessment_date DESC, assessment_id DESC
          ) AS row_num
        FROM CreditAssessments
      ) latest
      WHERE row_num = 1
      GROUP BY risk_level
    `);
    const [monthly] = await db.query(`
      SELECT
        DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL m.month_offset MONTH), '%b %y') AS month,
        COALESCE(SUM(p.amount_paid), 0) AS amount
      FROM (
        SELECT 5 AS month_offset UNION ALL SELECT 4 UNION ALL SELECT 3
        UNION ALL SELECT 2 UNION ALL SELECT 1 UNION ALL SELECT 0
      ) m
      LEFT JOIN Payments p
        ON YEAR(p.payment_date) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL m.month_offset MONTH))
       AND MONTH(p.payment_date) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL m.month_offset MONTH))
       AND p.payment_status IN ('Paid', 'Late')
      GROUP BY m.month_offset
      ORDER BY m.month_offset DESC
    `);
    const [recent] = await db.query(`
      SELECT a.*, c.full_name AS customer
      FROM LoanApplications a
      JOIN Customers c USING (customer_id)
      ORDER BY a.application_id DESC
      LIMIT 6
    `);

    const collectionRate =
      Number(loans.disbursed) > 0
        ? (Number(activeLoanPayments.total) / Number(loans.disbursed)) * 100
        : 0;
    const overdueRate =
      Number(scheduleStats.total) > 0
        ? (Number(scheduleStats.overdue) / Number(scheduleStats.total)) * 100
        : 0;

    res.json({
      customers: customers.total,
      applications,
      loans,
      payments: payments.total,
      overdue: scheduleStats.overdue,
      outstanding: outstanding.total,
      risk,
      monthly,
      recent,
      scheduleStats,
      collectionRate: Number(collectionRate.toFixed(1)),
      activeLoanPayments: activeLoanPayments.total,
      overdueRate: Number(overdueRate.toFixed(1)),
    });
  } catch (error) {
    next(error);
  }
});

r.get('/customers', async (req, res, next) => {
  try {
    const term = `%${req.query.search || ''}%`;
    const [rows] = await db.query(
      `SELECT * FROM Customers
       WHERE full_name LIKE ? OR email LIKE ? OR CAST(customer_id AS CHAR) LIKE ?
       ORDER BY customer_id DESC`,
      [term, term, term]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.post('/customers', async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      monthly_income,
      employment_type,
    } = req.body;
    if (!full_name?.trim()) {
      return res.status(400).json({ message: 'Name required' });
    }
    const [result] = await db.query(
      `INSERT INTO Customers
       (full_name, email, phone, address, monthly_income, employment_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        full_name.trim(),
        email || null,
        phone || null,
        address || null,
        Number(monthly_income) || 0,
        employment_type || null,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

r.put('/customers/:id', async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      monthly_income,
      employment_type,
    } = req.body;
    await db.query(
      `UPDATE Customers
       SET full_name = ?, email = ?, phone = ?, address = ?,
           monthly_income = ?, employment_type = ?
       WHERE customer_id = ?`,
      [
        full_name,
        email || null,
        phone || null,
        address || null,
        Number(monthly_income) || 0,
        employment_type || null,
        req.params.id,
      ]
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

r.delete('/customers/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM Customers WHERE customer_id = ?', [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

r.get('/applications', async (req, res, next) => {
  try {
    const status = req.query.status || 'All';
    const [rows] = await db.query(
      `SELECT a.*, c.full_name AS customer
       FROM LoanApplications a
       JOIN Customers c USING (customer_id)
       WHERE (? = 'All' OR status = ?)
       ORDER BY application_id DESC`,
      [status, status]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.post('/applications', async (req, res, next) => {
  try {
    const { customer_id, loan_amount, loan_purpose, tenure_months } = req.body;
    const amount = Number(loan_amount);
    const tenure = Number(tenure_months);
    if (!Number.isInteger(Number(customer_id)) || amount <= 0 || !Number.isInteger(tenure) || tenure <= 0 || tenure > 360) {
      return res.status(400).json({
        message: 'Choose a customer and enter a valid loan amount and a tenure from 1 to 360 months.',
      });
    }
    const [result] = await db.query(
      `INSERT INTO LoanApplications
       (customer_id, loan_amount, loan_purpose, tenure_months)
       VALUES (?, ?, ?, ?)`,
      [customer_id, amount, loan_purpose || 'Personal', tenure]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

r.patch('/applications/:id/status', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const id = Number(req.params.id);
    const { status, interest_rate = 10 } = req.body;
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    await connection.beginTransaction();
    const [[application]] = await connection.query(
      'SELECT * FROM LoanApplications WHERE application_id = ? FOR UPDATE',
      [id]
    );
    if (!application) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }

    await connection.query(
      'UPDATE LoanApplications SET status = ? WHERE application_id = ?',
      [status, id]
    );

    if (status === 'Approved') {
      const loanRate = Number(interest_rate) || 10;
      await connection.query(
        `INSERT INTO Loans
         (application_id, principal, interest_rate, tenure_months, start_date, status)
         VALUES (?, ?, ?, ?, CURRENT_DATE, 'Active')
         ON DUPLICATE KEY UPDATE status = 'Active'`,
        [
          application.application_id,
          application.loan_amount,
          loanRate,
          application.tenure_months,
        ]
      );

      const [[loan]] = await connection.query(
        'SELECT loan_id FROM Loans WHERE application_id = ?',
        [application.application_id]
      );
      const [[scheduleCount]] = await connection.query(
        'SELECT COUNT(*) AS total FROM LoanSchedules WHERE loan_id = ?',
        [loan.loan_id]
      );

      // Generate an EMI schedule exactly once for this loan.
      if (Number(scheduleCount.total) === 0) {
        const months = Number(application.tenure_months);
        const monthlyRate = loanRate / 1200;
        const factor = Math.pow(1 + monthlyRate, months);
        const emi = monthlyRate === 0
          ? Number(application.loan_amount) / months
          : (Number(application.loan_amount) * monthlyRate * factor) / (factor - 1);
        const [dueDates] = await connection.query(
          `WITH RECURSIVE month_numbers AS (
             SELECT 1 AS month_no
             UNION ALL
             SELECT month_no + 1 FROM month_numbers WHERE month_no < ?
           )
           SELECT DATE_ADD(CURRENT_DATE, INTERVAL month_no MONTH) AS due_date
           FROM month_numbers
           ORDER BY month_no`,
          [months]
        );
        const scheduleRows = dueDates.map((row) => [
          loan.loan_id,
          row.due_date,
          Number(emi.toFixed(2)),
          'Pending',
        ]);
        if (scheduleRows.length) {
          await connection.query(
            'INSERT INTO LoanSchedules (loan_id, due_date, due_amount, status) VALUES ?',
            [scheduleRows]
          );
        }
      }
    }

    await connection.commit();
    res.json({ ok: true, status });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

r.get('/loans', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        l.*,
        c.full_name AS customer,
        a.loan_purpose,
        COALESCE(p.paid, 0) AS paid,
        GREATEST(l.principal - COALESCE(p.paid, 0), 0) AS outstanding
      FROM Loans l
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      LEFT JOIN (
        SELECT loan_id, SUM(amount_paid) AS paid
        FROM Payments
        WHERE payment_status IN ('Paid', 'Late')
        GROUP BY loan_id
      ) p USING (loan_id)
      ORDER BY loan_id DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.get('/payments', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.full_name AS customer
      FROM Payments p
      JOIN Loans l USING (loan_id)
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      ORDER BY payment_date DESC, payment_id DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.post('/payments', async (req, res, next) => {
  try {
    const {
      loan_id,
      amount_paid,
      payment_date,
      payment_status = 'Paid',
    } = req.body;
    const amount = Number(amount_paid);
    if (!Number.isInteger(Number(loan_id)) || amount <= 0 || !payment_date) {
      return res.status(400).json({
        message: 'Choose a loan and enter a valid amount and payment date.',
      });
    }
    if (!['Paid', 'Late', 'Failed'].includes(payment_status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    const [result] = await db.query(
      `INSERT INTO Payments
       (loan_id, amount_paid, payment_date, payment_status)
       VALUES (?, ?, ?, ?)`,
      [loan_id, amount, payment_date, payment_status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

r.get('/risk', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT ca.*, c.full_name AS customer
      FROM CreditAssessments ca
      JOIN Customers c USING (customer_id)
      ORDER BY assessment_date DESC, assessment_id DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.get('/risk/summary', async (req, res, next) => {
  try {
    const [distribution] = await db.query(`
      SELECT risk_level AS name, COUNT(*) AS value
      FROM (
        SELECT
          customer_id,
          risk_level,
          ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY assessment_date DESC, assessment_id DESC
          ) AS row_num
        FROM CreditAssessments
      ) latest
      WHERE row_num = 1
      GROUP BY risk_level
    `);
    const [[profile]] = await db.query(`
      SELECT
        COUNT(*) AS assessed_customers,
        ROUND(AVG(credit_score), 1) AS average_score,
        ROUND(AVG(debt_to_income), 1) AS average_dti
      FROM (
        SELECT
          customer_id,
          credit_score,
          debt_to_income,
          ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY assessment_date DESC, assessment_id DESC
          ) AS row_num
        FROM CreditAssessments
      ) latest
      WHERE row_num = 1
    `);
    const [[repayments]] = await db.query(`
      SELECT
        COUNT(*) AS schedule_count,
        COALESCE(SUM(status = 'Paid'), 0) AS paid_count,
        COALESCE(SUM(status = 'Overdue' OR (status = 'Pending' AND due_date < CURRENT_DATE)), 0) AS overdue_count,
        COALESCE(SUM(CASE WHEN status = 'Overdue' OR (status = 'Pending' AND due_date < CURRENT_DATE) THEN due_amount ELSE 0 END), 0) AS overdue_amount
      FROM LoanSchedules
    `);
    const [highRiskCustomers] = await db.query(`
      SELECT customer, credit_score, debt_to_income, assessment_date
      FROM (
        SELECT
          c.full_name AS customer,
          ca.credit_score,
          ca.debt_to_income,
          ca.assessment_date,
          ca.risk_level,
          ROW_NUMBER() OVER (
            PARTITION BY ca.customer_id
            ORDER BY ca.assessment_date DESC, ca.assessment_id DESC
          ) AS row_num
        FROM CreditAssessments ca
        JOIN Customers c USING (customer_id)
      ) latest
      WHERE row_num = 1 AND risk_level = 'High'
      ORDER BY credit_score ASC, debt_to_income DESC
      LIMIT 8
    `);
    const overdueRate =
      Number(repayments.schedule_count) > 0
        ? (Number(repayments.overdue_count) / Number(repayments.schedule_count)) * 100
        : 0;

    res.json({
      distribution,
      profile,
      repayments: {
        ...repayments,
        overdue_rate: Number(overdueRate.toFixed(1)),
      },
      highRiskCustomers,
      method: 'latest assessment per customer; rule-based risk labels',
    });
  } catch (error) {
    next(error);
  }
});

r.post('/risk', async (req, res, next) => {
  try {
    const { customer_id, credit_score, debt_to_income } = req.body;
    const score = Number(credit_score);
    const dti = Number(debt_to_income);
    if (!Number.isInteger(Number(customer_id)) || score < 300 || score > 900 || dti < 0 || dti > 100) {
      return res.status(400).json({
        message: 'Enter a valid customer, credit score (300–900), and debt-to-income percentage (0–100).',
      });
    }
    const riskLevel =
      score >= 750 && dti < 30
        ? 'Low'
        : score < 620 || dti >= 45
          ? 'High'
          : 'Medium';
    const [result] = await db.query(
      `INSERT INTO CreditAssessments
       (customer_id, credit_score, debt_to_income, risk_level)
       VALUES (?, ?, ?, ?)`,
      [customer_id, score, dti, riskLevel]
    );
    res.status(201).json({ id: result.insertId, risk_level: riskLevel });
  } catch (error) {
    next(error);
  }
});

r.get('/schedules', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.schedule_id,
        s.loan_id,
        s.due_date,
        s.due_amount,
        CASE
          WHEN s.status = 'Pending' AND s.due_date < CURRENT_DATE THEN 'Overdue'
          ELSE s.status
        END AS status,
        s.status AS stored_status,
        c.full_name AS customer,
        a.loan_purpose,
        l.principal,
        l.interest_rate
      FROM LoanSchedules s
      JOIN Loans l USING (loan_id)
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      ORDER BY s.due_date ASC, s.schedule_id ASC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

r.get('/overdue', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.*,
        l.loan_id,
        c.full_name AS customer
      FROM LoanSchedules s
      JOIN Loans l USING (loan_id)
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      WHERE s.status = 'Overdue'
         OR (s.status = 'Pending' AND s.due_date < CURRENT_DATE)
      ORDER BY s.due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Marking a schedule as paid now also writes the corresponding payment record.
// The transaction and row lock prevent duplicate payment entries on repeated clicks.
r.patch('/overdue/:id/paid', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[schedule]] = await connection.query(
      'SELECT * FROM LoanSchedules WHERE schedule_id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!schedule) {
      await connection.rollback();
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    if (schedule.status === 'Paid') {
      await connection.commit();
      return res.json({ ok: true, alreadyPaid: true });
    }

    await connection.query(
      `INSERT INTO Payments
       (loan_id, amount_paid, payment_date, payment_status)
       VALUES (?, ?, CURRENT_DATE, 'Paid')`,
      [schedule.loan_id, schedule.due_amount]
    );
    await connection.query(
      `UPDATE LoanSchedules SET status = 'Paid' WHERE schedule_id = ?`,
      [req.params.id]
    );

    await connection.commit();
    res.json({ ok: true, paymentRecorded: true });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

r.get('/notifications', async (req, res, next) => {
  try {
    const [pendingApps] = await db.query(`
      SELECT
        application_id AS record_id,
        customer,
        loan_amount,
        application_date
      FROM (
        SELECT
          a.application_id,
          c.full_name AS customer,
          a.loan_amount,
          a.application_date
        FROM LoanApplications a
        JOIN Customers c USING (customer_id)
        WHERE a.status = 'Pending'
        ORDER BY a.application_date DESC, a.application_id DESC
        LIMIT 8
      ) pending
    `);
    const [overdueSchedules] = await db.query(`
      SELECT
        s.schedule_id AS record_id,
        s.loan_id,
        s.due_date,
        s.due_amount,
        c.full_name AS customer
      FROM LoanSchedules s
      JOIN Loans l USING (loan_id)
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      WHERE s.status = 'Overdue'
         OR (s.status = 'Pending' AND s.due_date < CURRENT_DATE)
      ORDER BY s.due_date ASC
      LIMIT 8
    `);
    const [upcomingSchedules] = await db.query(`
      SELECT
        s.schedule_id AS record_id,
        s.loan_id,
        s.due_date,
        s.due_amount,
        c.full_name AS customer
      FROM LoanSchedules s
      JOIN Loans l USING (loan_id)
      JOIN LoanApplications a USING (application_id)
      JOIN Customers c USING (customer_id)
      WHERE s.status = 'Pending'
        AND s.due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
      ORDER BY s.due_date ASC
      LIMIT 8
    `);
    const [[notificationTotals]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM LoanApplications WHERE status = 'Pending') AS applications,
        (SELECT COUNT(*) FROM LoanSchedules
          WHERE status = 'Overdue' OR (status = 'Pending' AND due_date < CURRENT_DATE)) AS overdue,
        (SELECT COUNT(*) FROM LoanSchedules
          WHERE status = 'Pending'
            AND due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)) AS upcoming
    `);

    const items = [
      ...pendingApps.map((x) => ({
        id: `application-${x.record_id}`,
        type: 'application',
        severity: 'info',
        title: 'Application awaiting review',
        message: `${x.customer} · ${Number(x.loan_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`,
        date: x.application_date,
        target: 'Applications',
      })),
      ...overdueSchedules.map((x) => ({
        id: `overdue-${x.record_id}`,
        type: 'overdue',
        severity: 'critical',
        title: 'Overdue instalment',
        message: `${x.customer} · Loan ${x.loan_id} · ${Number(x.due_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`,
        date: x.due_date,
        target: 'Overdue loans',
      })),
      ...upcomingSchedules.map((x) => ({
        id: `upcoming-${x.record_id}`,
        type: 'upcoming',
        severity: 'warning',
        title: 'Instalment due within 7 days',
        message: `${x.customer} · Loan ${x.loan_id} · ${Number(x.due_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`,
        date: x.due_date,
        target: 'Repayment schedule',
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      items,
      counts: {
        applications: Number(notificationTotals.applications),
        overdue: Number(notificationTotals.overdue),
        upcoming: Number(notificationTotals.upcoming),
        total: Number(notificationTotals.applications) + Number(notificationTotals.overdue) + Number(notificationTotals.upcoming),
        items_shown: items.length,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

r.get('/reports', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.customer_id,
        c.full_name,
        c.email,
        a.application_id,
        a.status AS application_status,
        l.loan_id,
        l.principal,
        l.status AS loan_status,
        COALESCE(p.paid, 0) AS total_paid,
        GREATEST(COALESCE(l.principal, 0) - COALESCE(p.paid, 0), 0) AS outstanding,
        ca.risk_level
      FROM Customers c
      LEFT JOIN LoanApplications a USING (customer_id)
      LEFT JOIN Loans l USING (application_id)
      LEFT JOIN (
        SELECT loan_id, SUM(amount_paid) AS paid
        FROM Payments
        WHERE payment_status IN ('Paid', 'Late')
        GROUP BY loan_id
      ) p USING (loan_id)
      LEFT JOIN (
        SELECT customer_id, risk_level
        FROM (
          SELECT
            customer_id,
            risk_level,
            ROW_NUMBER() OVER (
              PARTITION BY customer_id
              ORDER BY assessment_date DESC, assessment_id DESC
            ) AS row_num
          FROM CreditAssessments
        ) ranked
        WHERE row_num = 1
      ) ca ON ca.customer_id = c.customer_id
      ORDER BY c.customer_id DESC, a.application_id DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default r;
