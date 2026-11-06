USE creditlens;
INSERT INTO Customers(full_name,email,phone,address,monthly_income,employment_type) VALUES
('Aarav Mehta','aarav@example.com','9876500011','New Delhi',85000,'Salaried'),
('Diya Sharma','diya@example.com','9876500012','Gurugram',62000,'Self-employed'),
('Kabir Verma','kabir@example.com','9876500013','Noida',110000,'Salaried'),
('Ananya Rao','ananya@example.com','9876500014','New Delhi',48000,'Salaried'),
('Ishaan Gupta','ishaan@example.com','9876500015','Faridabad',72000,'Business');
INSERT INTO LoanApplications(customer_id,loan_amount,loan_purpose,tenure_months,status) VALUES
(1,800000,'Home',120,'Approved'),(2,250000,'Business',48,'Pending'),(3,1200000,'Home',180,'Approved'),(4,180000,'Education',36,'Rejected'),(5,400000,'Personal',60,'Approved');
INSERT INTO Loans(application_id,principal,interest_rate,tenure_months,start_date,status) VALUES
(1,800000,9.5,120,'2025-03-01','Active'),(3,1200000,8.9,180,'2025-06-01','Active'),(5,400000,12.5,60,'2025-01-15','Active');
INSERT INTO CreditAssessments(customer_id,credit_score,debt_to_income,risk_level) VALUES
(1,780,22.5,'Low'),(2,650,38,'Medium'),(3,810,18,'Low'),(4,590,48,'High'),(5,690,34,'Medium');
INSERT INTO LoanSchedules(loan_id,due_date,due_amount,status) VALUES
(1,DATE_SUB(CURRENT_DATE,INTERVAL 35 DAY),10360,'Overdue'),(1,DATE_SUB(CURRENT_DATE,INTERVAL 5 DAY),10360,'Pending'),(2,DATE_ADD(CURRENT_DATE,INTERVAL 10 DAY),12050,'Pending'),(3,DATE_ADD(CURRENT_DATE,INTERVAL 15 DAY),9000,'Pending');
INSERT INTO Payments(loan_id,amount_paid,payment_date,payment_status) VALUES
(1,10360,DATE_SUB(CURRENT_DATE,INTERVAL 65 DAY),'Paid'),(1,10360,DATE_SUB(CURRENT_DATE,INTERVAL 35 DAY),'Late'),(2,15000,DATE_SUB(CURRENT_DATE,INTERVAL 20 DAY),'Paid');
