
import React, { useEffect, useState } from 'react';
import api from './api';
import {
  LayoutDashboard,
  Users,
  FileText,
  Landmark,
  Wallet,
  ChartNoAxesCombined,
  Calculator,
  AlertTriangle,
  FileBarChart,
  Bell,
  Search,
  Plus,
  Download,
  RefreshCw,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Gauge,
  CircleDollarSign,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Info,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const nav = [
  ['Overview', LayoutDashboard],
  ['Customers', Users],
  ['Applications', FileText],
  ['Loans', Landmark],
  ['Loan products', ClipboardList],
  ['Payments', Wallet],
  ['Risk analytics', ChartNoAxesCombined],
  ['Risk records', ShieldCheck],
  ['Credit score', Gauge],
  ['Loan eligibility', CircleDollarSign],
  ['Repayment schedule', CalendarDays],
  ['Overdue loans', AlertTriangle],
  ['Notifications', Bell],
  ['EMI calculator', Calculator],
  ['Reports', FileBarChart],
];

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(+n || 0);

const dt = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('cl_token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('cl_user') || 'null')
  );
  const [page, setPage] = useState('Overview');
  const [mobile, setMobile] = useState(false);

  function signout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  if (!token) {
    return (
      <Login
        done={(t, u) => {
          localStorage.setItem('cl_token', t);
          localStorage.setItem('cl_user', JSON.stringify(u));
          setToken(t);
          setUser(u);
        }}
      />
    );
  }

  return (
    <div className="shell">
      <aside className={mobile ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="mark">
            <ChartNoAxesCombined />
          </div>
          <div>
            <b>
              CREDIT<span>LENS</span>
            </b>
            <small>INTELLIGENCE PLATFORM</small>
          </div>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>

        <div className="workspace">
          <i /> Lending operations <span>⌄</span>
        </div>

        <small className="nav-label">WORKSPACE</small>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={page === name ? 'nav active' : 'nav'}
              onClick={() => {
                setPage(name);
                setMobile(false);
              }}
            >
              <Icon size={17} />
              {name}
              {name === 'Overdue loans' && <i className="alert-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help">
            <ShieldCheck />
            <b>Risk intelligence</b>
            <p>
              Monitor your portfolio with clear, actionable insights.
            </p>
            <small>LEARN MORE ↗</small>
          </div>

          <div className="user">
            <div className="avatar">{user?.name?.[0] || 'A'}</div>
            <div>
              <b>{user?.name || 'Administrator'}</b>
              <small>{user?.role || 'Admin'}</small>
            </div>
          </div>
          <button onClick={signout}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobile && (
        <div className="scrim" onClick={() => setMobile(false)} />
      )}

      <main>
        <header>
          <button className="hamb" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="crumb">
            Workspace　/　<b>{page}</b>
          </div>
          <div className="topright">
            <span className="online">● Systems operational</span>
            <Search />
            <button
              className="header-icon-button"
              title="Open notifications"
              onClick={() => setPage('Notifications')}
            >
              <Bell />
            </button>
            <div className="avatar">{user?.name?.[0] || 'A'}</div>
          </div>
        </header>

        <section className="content">
          <Page page={page} navigate={setPage} />
        </section>

        <footer>
          © 2026 CREDITLENS 2.0
          <span>CONFIDENTIAL • INTERNAL USE</span>
        </footer>
      </main>
    </div>
  );
}

function Login({ done }) {
  const [email, setEmail] = useState('admin@creditlens.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      done(data.token, data.user);
    } catch (e) {
      setErr(e.response?.data?.message || 'Unable to connect to API');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-left">
        <div className="brand">
          <div className="mark">
            <ChartNoAxesCombined />
          </div>
          <b>
            CREDIT<span>LENS</span>
          </b>
        </div>

        <div className="login-copy">
          <small>FINANCIAL INTELLIGENCE, REIMAGINED</small>
          <h1>
            Clarity behind
            <br />
            every <em>credit decision.</em>
          </h1>
          <p>
            A unified workspace for loan operations, repayment performance
            and portfolio risk visibility.
          </p>
          <div className="stats">
            <b>
              360°
              <small>PORTFOLIO VIEW</small>
            </b>
            <b>
              Real-time
              <small>OPERATIONAL INSIGHTS</small>
            </b>
          </div>
        </div>
      </div>

      <form onSubmit={submit}>
        <small>WELCOME BACK</small>
        <h2>Sign in to CREDITLENS</h2>
        <p>Enter your credentials to access your workspace.</p>

        {err && <div className="error">{err}</div>}

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="primary wide" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in securely　↗'}
        </button>

        <div className="secure">
          ♧ Protected workspace • JWT authentication
        </div>
      </form>
    </div>
  );
}

function Page({ page, navigate }) {
  const [reload, setReload] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const path = {
      Overview: '/dashboard',
      Customers: '/customers',
      Applications: '/applications',
      Loans: '/loans',
      Payments: '/payments',
      'Risk analytics': '/risk/summary',
      'Risk records': '/risk',
      'Repayment schedule': '/schedules',
      'Overdue loans': '/overdue',
      Notifications: '/notifications',
      Reports: '/reports',
    }[page];

    if (path) {
      setData(null);
      setErr('');
      api
        .get(path)
        .then((r) => setData(r.data))
        .catch((e) =>
          setErr(e.response?.data?.message || 'Could not load data')
        );
    }
  }, [page, reload]);

  if (page === 'Loan products') return <LoanProductsPage navigate={navigate} />;
  if (page === 'EMI calculator') return <CalculatorPage />;
  if (page === 'Credit score') return <CreditScorePage />;
  if (page === 'Loan eligibility') return <LoanEligibilityPage />;

  return (
    <>
      <div className="pagehead">
        <div>
          <small>
            {page === 'Overview'
              ? 'PORTFOLIO AT A GLANCE'
              : 'CREDITLENS WORKSPACE'}
          </small>
          <h1>{page === 'Overview' ? 'Good evening.' : page}</h1>
          <p>
            {
              {
                Overview:
                  'Here’s what’s happening across your lending portfolio today.',
                Customers:
                  'Manage customer profiles and financial information.',
                Applications:
                  'Review incoming requests and manage application decisions.',
                Loans:
                  'Track active facilities, collections and remaining principal.',
                'Loan products':
                  'Compare illustrative loan categories, annual interest ranges and typical tenures.',
                Payments:
                  'Record repayments and review transaction history.',
                'Risk analytics':
                  'Review portfolio-level indicators based on the latest available customer assessments.',
                'Risk records':
                  'Browse and add customer credit assessments stored in the database.',
                'Credit score':
                  'Review a transparent educational profile indicator; official bureau scores require authorised access.',
                'Loan eligibility':
                  'Estimate affordability from income, existing EMIs, interest rate and tenure assumptions.',
                'Repayment schedule':
                  'Monitor instalments across active loan accounts.',
                Notifications:
                  'Review application queues, overdue instalments and upcoming payments.',
                'Overdue loans':
                  'Identify missed instalments and update repayment schedules.',
                Reports:
                  'Consolidated customer, application, loan and repayment data.',
              }[page]
            }
          </p>
        </div>

        <button
          className="secondary"
          onClick={() => setReload((x) => x + 1)}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {err && <div className="error">{err}</div>}

      {!data ? (
        <div className="loading">Loading workspace…</div>
      ) : page === 'Overview' ? (
        <Dashboard d={data} navigate={navigate} />
      ) : page === 'Risk analytics' ? (
        <RiskAnalyticsPage data={data} refresh={() => setReload((x) => x + 1)} />
      ) : page === 'Repayment schedule' ? (
        <RepaymentSchedulePage rows={data} refresh={() => setReload((x) => x + 1)} />
      ) : page === 'Notifications' ? (
        <NotificationsPage data={data} navigate={navigate} />
      ) : page === 'Reports' ? (
        <AdvancedReportsPage rows={data} />
      ) : (
        <Records
          page={page}
          data={data}
          refresh={() => setReload((x) => x + 1)}
        />
      )}
    </>
  );
}

const loanProductCatalogue = [
  {
    id: 'personal',
    name: 'Personal Loan',
    category: 'Personal',
    icon: Wallet,
    minRate: 10.5,
    maxRate: 18.0,
    tenure: '1–5 years',
    security: 'Usually unsecured',
    purpose: 'Flexible funding for personal expenses and planned purchases.',
    eligibility: 'Income, employment stability and existing obligations may be reviewed.',
  },
  {
    id: 'home',
    name: 'Home Loan',
    category: 'Housing',
    icon: Landmark,
    minRate: 8.5,
    maxRate: 11.5,
    tenure: '5–30 years',
    security: 'Property-secured',
    purpose: 'Financing for purchasing, constructing or renovating a home.',
    eligibility: 'Income, property valuation, credit profile and repayment capacity may be reviewed.',
  },
  {
    id: 'education',
    name: 'Education Loan',
    category: 'Education',
    icon: Calculator,
    minRate: 8.0,
    maxRate: 13.5,
    tenure: '1–15 years',
    security: 'May require a co-applicant or collateral',
    purpose: 'Financing for eligible higher-education courses and related costs.',
    eligibility: 'Course, institution, academic details and co-applicant profile may be reviewed.',
  },
  {
    id: 'vehicle',
    name: 'Vehicle Loan',
    category: 'Vehicle',
    icon: CircleDollarSign,
    minRate: 8.75,
    maxRate: 14.0,
    tenure: '1–7 years',
    security: 'Vehicle-secured',
    purpose: 'Financing for eligible new or used vehicles.',
    eligibility: 'Vehicle value, down payment, income and repayment capacity may be reviewed.',
  },
  {
    id: 'business',
    name: 'Business Loan',
    category: 'Business',
    icon: ClipboardList,
    minRate: 11.0,
    maxRate: 20.0,
    tenure: '1–7 years',
    security: 'Secured or unsecured, depending on lender',
    purpose: 'Working capital, equipment and eligible business expansion costs.',
    eligibility: 'Business vintage, turnover, cash flow and existing liabilities may be reviewed.',
  },
  {
    id: 'gold',
    name: 'Gold Loan',
    category: 'Gold',
    icon: ShieldCheck,
    minRate: 9.0,
    maxRate: 16.0,
    tenure: '3–36 months',
    security: 'Gold collateral required',
    purpose: 'Short-term borrowing secured against eligible gold ornaments.',
    eligibility: 'Gold purity, net weight, valuation and lender policy may be reviewed.',
  },
];

function LoanProductsPage({ navigate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(loanProductCatalogue.map((p) => p.category))];
  const filtered = loanProductCatalogue.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [
      product.name,
      product.category,
      product.purpose,
      product.security,
    ].join(' ').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="pagehead loan-products-head">
        <div>
          <small>PRODUCT CATALOGUE</small>
          <h1>Loan products</h1>
          <p>Explore loan categories, illustrative annual interest ranges and typical repayment tenures.</p>
        </div>
        <button className="secondary" onClick={() => navigate('Applications')}>
          <FileText size={15} /> View applications
        </button>
      </div>

      <div className="loan-rate-notice" role="note">
        <Info size={18} />
        <div>
          <b>Illustrative rates for project demonstration</b>
          <p>These sample ranges are not live bank quotations, lender offers or guaranteed rates. Actual rates, fees and eligibility vary by lender, applicant profile, product terms and market conditions. Verify current terms directly with the lender before making a financial decision.</p>
        </div>
      </div>

      <div className="loan-product-toolbar">
        <div className="loan-product-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search loan products…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by loan category">
          {categories.map((item) => <option key={item} value={item}>{item} categories</option>)}
        </select>
        <span>{filtered.length} products</span>
      </div>

      <div className="loan-product-grid">
        {filtered.map((product) => {
          const Icon = product.icon;
          return (
            <article className="loan-product-card" key={product.id}>
              <div className="loan-product-card-top">
                <div className="loan-product-icon"><Icon size={19} /></div>
                <span className="loan-product-category">{product.category}</span>
              </div>
              <h2>{product.name}</h2>
              <p className="loan-product-purpose">{product.purpose}</p>
              <div className="loan-product-rate-label">Illustrative interest rate</div>
              <div className="loan-product-rate">
                {product.minRate.toFixed(2)}% <span>–</span> {product.maxRate.toFixed(2)}%
                <small>per annum</small>
              </div>
              <div className="loan-product-details">
                <div><span>Typical tenure</span><b>{product.tenure}</b></div>
                <div><span>Security</span><b>{product.security}</b></div>
              </div>
              <div className="loan-product-eligibility">
                <b>Eligibility considerations</b>
                <p>{product.eligibility}</p>
              </div>
              <button className="primary loan-product-action" onClick={() => navigate('Applications')}>
                Start an application <span aria-hidden="true">→</span>
              </button>
            </article>
          );
        })}
        {!filtered.length && <div className="empty loan-products-empty">No matching loan products found.</div>}
      </div>
      <div className="loan-products-footnote">
        <Info size={14} />
        <span>Rates shown here are configurable demonstration values stored in the frontend catalogue. No live bank-rate feed or lender API is connected.</span>
      </div>
    </>
  );
}

function Metric({ label, value, icon: Icon, tone = 'blue', hint }) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <i className={tone}>
          <Icon size={18} />
        </i>
      </div>
      <b>{value}</b>
      <small>{hint || 'Updated just now'}</small>
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <b>{title}</b>
          <small>{sub}</small>
        </div>
      </div>
      {children}
    </section>
  );
}

function Status({ v }) {
  return (
    <span className={'status ' + String(v || 'pending').toLowerCase()}>
      {v || 'Pending'}
    </span>
  );
}

function Dashboard({ d, navigate }) {
  const risk = (d.risk || []).map((x) => ({
    ...x,
    fill:
      x.name === 'Low'
        ? '#36c99a'
        : x.name === 'Medium'
          ? '#eab85b'
          : '#f16c79',
  }));

  return (
    <>
      <div className="metrics">
        <Metric
          label="Total customers"
          value={d.customers || 0}
          icon={Users}
          hint="Registered profiles"
        />
        <Metric
          label="Active loan book"
          value={money(d.loans?.disbursed)}
          icon={Landmark}
          tone="purple"
          hint={`${d.loans?.total || 0} active accounts`}
        />
        <Metric
          label="Total collected"
          value={money(d.payments)}
          icon={Wallet}
          tone="green"
          hint="Paid and late transactions"
        />
        <Metric
          label="Outstanding balance"
          value={money(d.outstanding)}
          icon={ChartNoAxesCombined}
          tone="amber"
          hint="Estimated remaining principal"
        />
      </div>

      <div className="dashboard-quick-actions">
        <div>
          <b>Quick tools</b>
          <small>Open a calculator or review operational alerts</small>
        </div>
        <button className="secondary" onClick={() => navigate('Credit score')}><Gauge size={15} /> Credit profile</button>
        <button className="secondary" onClick={() => navigate('Loan eligibility')}><CircleDollarSign size={15} /> Loan eligibility</button>
        <button className="secondary" onClick={() => navigate('Repayment schedule')}><CalendarDays size={15} /> Repayment schedule</button>
        <button className="secondary" onClick={() => navigate('Notifications')}><Bell size={15} /> Notifications</button>
      </div>

      <div className="portfolio-pulse">
        <div><span>Payments-to-active-principal ratio</span><b>{d.collectionRate || 0}%</b></div>
        <div className="pulse-track"><span style={{ width: `${Math.min(100, Number(d.collectionRate || 0))}%` }} /></div>
        <small>Descriptive ratio: recorded Paid/Late cash collected divided by active-loan principal. Collections can include interest, so this is not principal recovery or a repayment forecast.</small>
      </div>

      <div className="dashgrid">
        <Panel
          title="Repayment performance"
          sub="Collections over the last six months"
        >
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.monthly || []}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#7893ff"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="#7893ff"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263348" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8290a5', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8290a5', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#111c2b',
                    border: '1px solid #2b3a50',
                    borderRadius: 8,
                  }}
                  formatter={(v) => money(v)}
                />
                <Area
                  dataKey="amount"
                  stroke="#7893ff"
                  strokeWidth={2.5}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Credit risk distribution"
          sub="Latest available assessments"
        >
          <div className="risk">
            <ResponsiveContainer width="58%" height="100%">
              <PieChart>
                <Pie
                  data={risk}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {risk.map((x, i) => (
                    <Cell key={i} fill={x.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="legend">
              {risk.map((x) => (
                <div key={x.name}>
                  <i style={{ background: x.fill }} />
                  {x.name} risk <b>{x.value}</b>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="dashgrid lower">
        <Panel
          title="Recent applications"
          sub="Latest requests entering your pipeline"
        >
          <Table
            rows={d.recent || []}
            cols={['customer', 'loan_purpose', 'loan_amount', 'status']}
            labels={['Applicant', 'Purpose', 'Amount', 'Status']}
            render={{
              loan_amount: (r) => money(r.loan_amount),
              status: (r) => <Status v={r.status} />,
            }}
          />
        </Panel>

        <Panel
          title="Attention required"
          sub="Collections monitoring"
        >
          <div className="alertbox">
            <AlertTriangle />
            <div>
              <b>{d.overdue || 0} overdue instalments</b>
              <p>
                Review delayed repayments and follow up on outstanding
                accounts.
              </p>
            </div>
          </div>
          <p className="muted">
            Application pipeline: <b>{d.applications?.pending || 0}</b>{' '}
            pending · <b>{d.applications?.approved || 0}</b> approved ·{' '}
            <b>{d.applications?.rejected || 0}</b> rejected
          </p>
        </Panel>
      </div>
    </>
  );
}


function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function calculateEmi(principal, annualRate, months) {
  const p = Math.max(0, Number(principal) || 0);
  const n = Math.max(1, Number(months) || 1);
  const monthlyRate = Math.max(0, Number(annualRate) || 0) / 1200;
  if (monthlyRate === 0) return p / n;
  const factor = Math.pow(1 + monthlyRate, n);
  return (p * monthlyRate * factor) / (factor - 1);
}

function CreditScorePage() {
  const [inputs, setInputs] = useState({
    onTimePayments: 96,
    utilisation: 25,
    historyMonths: 48,
    creditTypes: 2,
    enquiries: 1,
  });

  const update = (key, value) =>
    setInputs((current) => ({ ...current, [key]: value }));

  const factors = [
    {
      label: 'On-time repayment record',
      weight: 35,
      points: clamp(inputs.onTimePayments, 0, 100),
      detail: `${clamp(inputs.onTimePayments, 0, 100)}% of instalments paid on time`,
    },
    {
      label: 'Credit utilisation',
      weight: 30,
      points: clamp(110 - clamp(inputs.utilisation, 0, 100) * 1.25, 0, 100),
      detail: `${clamp(inputs.utilisation, 0, 100)}% of available revolving credit used`,
    },
    {
      label: 'Credit history length',
      weight: 15,
      points: clamp((clamp(inputs.historyMonths, 0, 360) / 120) * 100, 0, 100),
      detail: `${clamp(inputs.historyMonths, 0, 360)} months of history`,
    },
    {
      label: 'Credit mix',
      weight: 10,
      points: clamp((clamp(inputs.creditTypes, 0, 4) / 4) * 100, 0, 100),
      detail: `${clamp(inputs.creditTypes, 0, 4)} types of credit`,
    },
    {
      label: 'Recent credit enquiries',
      weight: 10,
      points: clamp(100 - clamp(inputs.enquiries, 0, 20) * 15, 0, 100),
      detail: `${clamp(inputs.enquiries, 0, 20)} enquiries in the last 6 months`,
    },
  ];

  const profileIndex = Math.round(
    factors.reduce((total, factor) => total + factor.points * factor.weight / 100, 0)
  );
  const indicativeIndex = Math.round(300 + profileIndex * 6);
  const band =
    indicativeIndex >= 800 ? 'Strong profile indicator' :
    indicativeIndex >= 740 ? 'Healthy profile indicator' :
    indicativeIndex >= 670 ? 'Developing profile indicator' :
    indicativeIndex >= 580 ? 'Needs attention' : 'Needs significant attention';

  return (
    <>
      <div className="pagehead">
        <div>
          <small>EDUCATIONAL CREDIT PROFILE TOOL</small>
          <h1>Credit Score Calculator</h1>
          <p>Explore how common credit-profile factors can influence a score range.</p>
        </div>
        <span className="status pending">Illustrative model</span>
      </div>

      <div className="bureau-notice">
        <Info size={19} />
        <div>
          <b>Official bureau score is not connected</b>
          <p>
            A genuine CIBIL or other bureau score can only be retrieved through an authorised bureau
            integration with the required organisation approval and credentials. This calculator does
            not access bureau data and must not be presented as an official score.
          </p>
        </div>
      </div>

      <div className="score-layout">
        <section className="panel score-panel">
          <div className="panel-title">
            <div>
              <b>Illustrative profile index</b>
              <small>Transparent 300–900 demonstration scale; not a bureau score</small>
            </div>
          </div>
          <div className="score-display">
            <div className="score-value">{indicativeIndex}</div>
            <div className="score-band">{band}</div>
            <div className="score-track">
              <span style={{ width: `${((indicativeIndex - 300) / 600) * 100}%` }} />
            </div>
            <div className="score-range"><span>300</span><span>900</span></div>
            <p>
              Weighted profile index: {profileIndex}/100. Change the inputs to see the arithmetic
              effect of each factor.
            </p>
          </div>
          <div className="factor-list">
            {factors.map((factor) => (
              <div className="factor-row" key={factor.label}>
                <div className="factor-copy">
                  <b>{factor.label}</b>
                  <small>{factor.detail} · weight {factor.weight}%</small>
                </div>
                <div className="factor-bar">
                  <span style={{ width: `${factor.points}%` }} />
                </div>
                <strong>{Math.round(factor.points)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <b>Profile inputs</b>
              <small>Use known, consented information for a demonstration only</small>
            </div>
          </div>
          <div className="tool-form">
            <label>
              On-time payment percentage
              <input type="number" min="0" max="100" value={inputs.onTimePayments}
                onChange={(e) => update('onTimePayments', e.target.value)} />
              <small>Percentage of instalments paid by the due date</small>
            </label>
            <label>
              Credit utilisation (%)
              <input type="number" min="0" max="100" value={inputs.utilisation}
                onChange={(e) => update('utilisation', e.target.value)} />
            </label>
            <label>
              Credit history (months)
              <input type="number" min="0" max="360" value={inputs.historyMonths}
                onChange={(e) => update('historyMonths', e.target.value)} />
            </label>
            <label>
              Types of active credit (0–4)
              <input type="number" min="0" max="4" value={inputs.creditTypes}
                onChange={(e) => update('creditTypes', e.target.value)} />
            </label>
            <label>
              Credit enquiries in last 6 months
              <input type="number" min="0" max="20" value={inputs.enquiries}
                onChange={(e) => update('enquiries', e.target.value)} />
            </label>
          </div>
        </section>
      </div>

      <div className="method-note">
        <ShieldCheck size={17} />
        <p>
          <b>Transparency and accuracy:</b> the arithmetic and stated weights are deterministic and
          reproducible. This is not a trained or bureau-calibrated model; no 70% predictive accuracy
          claim is made. Validate against a consented, representative dataset before using any model
          for real credit decisions.
        </p>
      </div>
    </>
  );
}

function LoanEligibilityPage() {
  const [income, setIncome] = useState(80000);
  const [existingEmi, setExistingEmi] = useState(12000);
  const [foir, setFoir] = useState(50);
  const [rate, setRate] = useState(10.5);
  const [months, setMonths] = useState(60);
  const [requested, setRequested] = useState(500000);

  const maxTotalObligations = Math.max(0, income * foir / 100);
  const affordableEmi = Math.max(0, maxTotalObligations - existingEmi);
  const monthlyRate = rate / 1200;
  const maximumLoan = monthlyRate === 0
    ? affordableEmi * months
    : affordableEmi * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
  const requestedEmi = calculateEmi(requested, rate, months);
  const remainingCapacity = affordableEmi - requestedEmi;
  const fits = requestedEmi <= affordableEmi && affordableEmi > 0;

  return (
    <>
      <div className="pagehead">
        <div>
          <small>AFFORDABILITY ESTIMATOR</small>
          <h1>Loan Eligibility Calculator</h1>
          <p>Estimate repayment capacity using income, existing obligations and configurable assumptions.</p>
        </div>
        <span className="status pending">Indicative only</span>
      </div>

      <div className="bureau-notice">
        <Info size={19} />
        <div>
          <b>This is not a lender approval or offer</b>
          <p>
            Lenders apply their own FOIR/DTI limits, credit policy, verification, collateral rules and
            bureau checks. The default 50% obligation cap is an editable demonstration assumption, not
            a universal lending rule.
          </p>
        </div>
      </div>

      <div className="score-layout">
        <section className="panel">
          <div className="panel-title">
            <div>
              <b>Applicant and loan inputs</b>
              <small>All amounts are in Indian rupees (₹)</small>
            </div>
          </div>
          <div className="tool-form">
            <label>Monthly net income (₹)
              <input type="number" min="0" value={income} onChange={(e) => setIncome(clamp(e.target.value, 0, 100000000))} />
            </label>
            <label>Existing monthly EMIs (₹)
              <input type="number" min="0" value={existingEmi} onChange={(e) => setExistingEmi(clamp(e.target.value, 0, 100000000))} />
            </label>
            <label>Maximum total-obligation ratio (%)
              <input type="number" min="1" max="80" value={foir} onChange={(e) => setFoir(clamp(e.target.value, 1, 80))} />
            </label>
            <label>Annual interest rate (%)
              <input type="number" min="0" max="60" step="0.1" value={rate} onChange={(e) => setRate(clamp(e.target.value, 0, 60))} />
            </label>
            <label>Loan tenure (months)
              <input type="number" min="1" max="360" value={months} onChange={(e) => setMonths(clamp(e.target.value, 1, 360))} />
            </label>
            <label>Requested loan amount (₹)
              <input type="number" min="0" value={requested} onChange={(e) => setRequested(clamp(e.target.value, 0, 1000000000))} />
            </label>
          </div>
        </section>

        <section className="panel eligibility-result">
          <div className="panel-title">
            <div>
              <b>Affordability estimate</b>
              <small>Calculated from the values entered</small>
            </div>
          </div>
          <div className="eligibility-status">
            <span className={fits ? 'status approved' : 'status rejected'}>
              {fits ? 'Within the selected limit' : 'Above the selected limit'}
            </span>
            <h2>{money(maximumLoan)}</h2>
            <p>Estimated maximum principal under these assumptions</p>
          </div>
          <div className="result-lines">
            <div><span>Estimated EMI on requested amount</span><b>{money(requestedEmi)}</b></div>
            <div><span>Maximum affordable new EMI</span><b>{money(affordableEmi)}</b></div>
            <div><span>Existing EMIs</span><b>{money(existingEmi)}</b></div>
            <div><span>EMI headroom after request</span><b>{money(remainingCapacity)}</b></div>
            <div><span>Total-obligation cap</span><b>{money(maxTotalObligations)}</b></div>
          </div>
          <div className="eligibility-foot">
            {fits
              ? 'The requested EMI fits within the selected obligation cap.'
              : 'The requested EMI exceeds the available monthly EMI capacity.'}
          </div>
        </section>
      </div>
    </>
  );
}

function RiskAnalyticsPage({ data, refresh }) {
  const distribution = (data.distribution || []).map((item) => ({
    ...item,
    fill: item.name === 'Low' ? '#36c99a' : item.name === 'Medium' ? '#eab85b' : '#f16c79',
  }));
  const total = Number(data.profile?.assessed_customers || 0);
  const highRisk = Number(distribution.find((x) => x.name === 'High')?.value || 0);
  const highRiskShare = total ? (highRisk / total) * 100 : 0;
  const avgScore = data.profile?.average_score;
  const avgDti = data.profile?.average_dti;

  return (
    <>
      <div className="pagehead">
        <div>
          <small>PORTFOLIO RISK MONITORING</small>
          <h1>Risk Analytics</h1>
          <p>Latest recorded assessment for each customer, with repayment stress indicators.</p>
        </div>
        <button className="secondary" onClick={refresh}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div className="metrics">
        <Metric label="Customers assessed" value={total} icon={Users} hint="One latest assessment per customer" />
        <Metric label="Average recorded score" value={avgScore == null ? '—' : Math.round(avgScore)} icon={Gauge} tone="purple" hint="From stored assessments only" />
        <Metric label="Average debt-to-income" value={avgDti == null ? '—' : `${avgDti}%`} icon={ChartNoAxesCombined} tone="amber" hint="Latest assessment per customer" />
        <Metric label="Overdue schedule rate" value={`${data.repayments?.overdue_rate || 0}%`} icon={AlertTriangle} tone="green" hint={`${data.repayments?.overdue_count || 0} overdue of ${data.repayments?.schedule_count || 0} schedules`} />
      </div>

      <div className="dashgrid">
        <Panel title="Latest risk distribution" sub="Each customer is counted once using their newest assessment">
          {distribution.length ? (
            <div className="risk">
              <ResponsiveContainer width="58%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={4}>
                    {distribution.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend">
                {distribution.map((entry) => (
                  <div key={entry.name}><i style={{ background: entry.fill }} />{entry.name} risk <b>{entry.value}</b></div>
                ))}
              </div>
            </div>
          ) : <div className="empty">No credit assessments are available yet.</div>}
        </Panel>

        <Panel title="Portfolio signals" sub="Descriptive statistics, not a prediction of default">
          <div className="signal-list">
            <div><span>High-risk share</span><b>{highRiskShare.toFixed(1)}%</b></div>
            <div><span>Paid schedules</span><b>{data.repayments?.paid_count || 0}</b></div>
            <div><span>Overdue amount</span><b>{money(data.repayments?.overdue_amount || 0)}</b></div>
            <div><span>Assessment coverage</span><b>{total} customers</b></div>
          </div>
          <div className="method-note compact">
            <Info size={16} />
            <p>Risk labels follow the application's stored rule-based assessment. They are not a statistically validated default model.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Customers currently labelled High risk" sub="Sorted by lower recorded score, then higher debt-to-income">
        <Table
          rows={data.highRiskCustomers || []}
          cols={['customer', 'credit_score', 'debt_to_income', 'assessment_date']}
          labels={['Customer', 'Credit score', 'Debt-to-income', 'Assessment date']}
          render={{
            debt_to_income: (row) => `${row.debt_to_income ?? '—'}%`,
            assessment_date: (row) => dt(row.assessment_date),
          }}
        />
      </Panel>
    </>
  );
}

function RepaymentSchedulePage({ rows, refresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const visibleRows = (Array.isArray(rows) ? rows : []).filter((row) => {
    const matchesSearch = `${row.customer} ${row.loan_id} ${row.loan_purpose}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'All' || row.status === filter);
  });
  const allRows = Array.isArray(rows) ? rows : [];
  const count = (status) => allRows.filter((row) => row.status === status).length;
  const paidAmount = allRows.filter((row) => row.status === 'Paid').reduce((sum, row) => sum + Number(row.due_amount || 0), 0);
  const overdueAmount = allRows.filter((row) => row.status === 'Overdue').reduce((sum, row) => sum + Number(row.due_amount || 0), 0);

  async function markPaid(row) {
    setBusyId(row.schedule_id);
    try {
      await api.patch(`/overdue/${row.schedule_id}/paid`);
      refresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not record this instalment');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <small>LOAN SERVICING</small>
          <h1>Repayment Schedule</h1>
          <p>Instalments sourced from the LoanSchedules table in your database.</p>
        </div>
        <button className="secondary" onClick={refresh}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div className="metrics">
        <Metric label="Total instalments" value={allRows.length} icon={CalendarDays} hint="Schedule rows in database" />
        <Metric label="Paid instalments" value={count('Paid')} icon={CheckCircle2} tone="green" hint={money(paidAmount) + ' recorded as paid'} />
        <Metric label="Overdue instalments" value={count('Overdue')} icon={AlertTriangle} tone="amber" hint={money(overdueAmount) + ' overdue amount'} />
        <Metric label="Pending instalments" value={count('Pending')} icon={Clock3} tone="purple" hint="Not yet recorded as paid" />
      </div>

      <div className="toolbar">
        <div className="search"><Search size={15} /><input placeholder="Search customer, loan or purpose…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option><option>Pending</option><option>Paid</option><option>Overdue</option>
        </select>
        <span>{visibleRows.length} instalments</span>
      </div>

      <Panel title="Instalment ledger" sub="Marking an instalment paid records a payment and updates its schedule status">
        <div className="tablewrap">
          <table>
            <thead><tr><th>Customer</th><th>Loan</th><th>Purpose</th><th>Due date</th><th>Due amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.schedule_id}>
                  <td>{row.customer}</td>
                  <td>LN-{row.loan_id}</td>
                  <td>{row.loan_purpose || '—'}</td>
                  <td>{dt(row.due_date)}</td>
                  <td>{money(row.due_amount)}</td>
                  <td><Status v={row.status} /></td>
                  <td>
                    {row.status !== 'Paid' ? (
                      <button className="link" disabled={busyId === row.schedule_id} onClick={() => markPaid(row)}>
                        {busyId === row.schedule_id ? 'Saving…' : 'Record paid'}
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleRows.length && <div className="empty">No repayment schedule rows match this filter.</div>}
        </div>
      </Panel>
    </>
  );
}

function NotificationsPage({ data, navigate }) {
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cl_notification_read') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cl_notification_read', JSON.stringify(readIds));
  }, [readIds]);

  const items = data.items || [];
  const unread = items.filter((item) => !readIds.includes(item.id)).length;
  const markAllRead = () => setReadIds(items.map((item) => item.id));
  const markRead = (id) => setReadIds((current) => current.includes(id) ? current : [...current, id]);

  return (
    <>
      <div className="pagehead">
        <div>
          <small>OPERATIONS INBOX</small>
          <h1>Notification Center</h1>
          <p>Live reminders derived from pending applications and repayment schedules.</p>
        </div>
        <button className="secondary" onClick={markAllRead}>Mark all as read</button>
      </div>

      <div className="metrics">
        <Metric label="Pending applications" value={data.counts?.applications || 0} icon={FileText} hint="Awaiting a decision" />
        <Metric label="Overdue instalments" value={data.counts?.overdue || 0} icon={AlertTriangle} tone="amber" hint="Require collections review" />
        <Metric label="Due in 7 days" value={data.counts?.upcoming || 0} icon={CalendarDays} tone="purple" hint="Upcoming scheduled instalments" />
        <Metric label="Unread notifications" value={unread} icon={Bell} tone="green" hint="Read state saved in this browser" />
      </div>

      <Panel title="Latest operational alerts" sub={`Generated ${data.generated_at ? new Date(data.generated_at).toLocaleString('en-IN') : 'just now'}`}>
        <div className="notification-list">
          {items.map((item) => (
            <div className={`notification-item ${readIds.includes(item.id) ? 'is-read' : ''}`} key={item.id}>
              <div className={`notification-icon ${item.severity}`}>
                {item.severity === 'critical' ? <AlertTriangle size={17} /> : item.severity === 'warning' ? <Clock3 size={17} /> : <FileText size={17} />}
              </div>
              <div className="notification-copy">
                <b>{item.title}</b>
                <p>{item.message}</p>
                <small>{dt(item.date)}</small>
              </div>
              <div className="notification-actions">
                <button className="link" onClick={() => { markRead(item.id); navigate(item.target); }}>Open</button>
                {!readIds.includes(item.id) && <button className="link muted-link" onClick={() => markRead(item.id)}>Mark read</button>}
              </div>
            </div>
          ))}
          {!items.length && <div className="empty">No pending operational notifications. You're all caught up.</div>}
        </div>
      </Panel>
    </>
  );
}

function AdvancedReportsPage({ rows }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const data = Array.isArray(rows) ? rows : [];
  const filtered = data.filter((row) => {
    const matchesSearch = JSON.stringify(row).toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (riskFilter === 'All' || row.risk_level === riskFilter);
  });
  const uniqueCustomers = new Set(data.map((row) => row.customer_id)).size;
  const uniqueLoans = new Map();
  data.forEach((row) => {
    if (row.loan_id != null && !uniqueLoans.has(row.loan_id)) uniqueLoans.set(row.loan_id, row);
  });
  const loanRows = [...uniqueLoans.values()];
  const principal = loanRows.reduce((sum, row) => sum + Number(row.principal || 0), 0);
  const collected = loanRows.reduce((sum, row) => sum + Number(row.total_paid || 0), 0);
  const outstanding = loanRows.reduce((sum, row) => sum + Number(row.outstanding || 0), 0);

  function exportCsv() {
    const columns = [
      ['customer_id', 'Customer ID'],
      ['full_name', 'Customer'],
      ['email', 'Email'],
      ['application_id', 'Application ID'],
      ['application_status', 'Application status'],
      ['loan_id', 'Loan ID'],
      ['principal', 'Principal'],
      ['loan_status', 'Loan status'],
      ['total_paid', 'Total paid'],
      ['outstanding', 'Outstanding'],
      ['risk_level', 'Latest risk level'],
    ];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      columns.map((column) => escapeCsv(column[1])).join(','),
      ...filtered.map((row) => columns.map(([key]) => escapeCsv(row[key])).join(',')),
    ].join('\r\n');
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'creditlens-portfolio-report.csv';
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <small>PORTFOLIO REPORTING</small>
          <h1>Advanced Reports</h1>
          <p>Exportable customer, application, loan, collection and risk records.</p>
        </div>
        <div className="report-actions">
          <button className="secondary" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="primary" onClick={exportCsv}><Download size={15} /> Export CSV</button>
        </div>
      </div>

      <div className="metrics">
        <Metric label="Customers in report" value={uniqueCustomers} icon={Users} hint="Distinct customer IDs" />
        <Metric label="Loan accounts" value={loanRows.length} icon={Landmark} tone="purple" hint="Distinct loan IDs" />
        <Metric label="Principal represented" value={money(principal)} icon={CircleDollarSign} tone="amber" hint="One row counted per loan" />
        <Metric label="Outstanding principal" value={money(outstanding)} icon={Wallet} tone="green" hint={`Collected: ${money(collected)}`} />
      </div>

      <div className="bureau-notice">
        <Info size={18} />
        <div>
          <b>Report data source</b>
          <p>Values below are retrieved from your CREDITLENS database. Loan totals count each unique loan ID once to avoid double-counting customers with multiple applications.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={15} /><input placeholder="Search report records…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option>All</option><option>Low</option><option>Medium</option><option>High</option>
        </select>
        <span>{filtered.length} rows</span>
      </div>

      <Panel title="Portfolio detail" sub="Use Export CSV for spreadsheet analysis, or Print / Save PDF for a report copy">
        <Table
          rows={filtered}
          cols={['customer_id', 'full_name', 'application_status', 'principal', 'total_paid', 'outstanding', 'risk_level']}
          labels={['Customer ID', 'Customer', 'Application', 'Principal', 'Paid', 'Outstanding', 'Risk']}
          render={{
            principal: (row) => money(row.principal),
            total_paid: (row) => money(row.total_paid),
            outstanding: (row) => money(row.outstanding),
            risk_level: (row) => row.risk_level ? <Status v={row.risk_level} /> : '—',
            application_status: (row) => row.application_status ? <Status v={row.application_status} /> : '—',
          }}
        />
      </Panel>
    </>
  );
}

function Table({ rows, cols, labels, render = {} }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {labels.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c}>{render[c] ? render[c](r) : r[c] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="empty">No records found.</div>}
    </div>
  );
}

function Records({ page, data, refresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const rows = Array.isArray(data) ? data : [];

  const filtered = rows.filter(
    (r) =>
      JSON.stringify(r).toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'All' || r.status === filter)
  );

  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    api
      .get('/customers')
      .then((x) => setCustomers(x.data))
      .catch(() => {});
    api
      .get('/loans')
      .then((x) => setLoans(x.data))
      .catch(() => {});
  }, [modal]);

  async function save(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));

    try {
      if (page === 'Customers') await api.post('/customers', f);
      if (page === 'Applications') await api.post('/applications', f);
      if (page === 'Payments') await api.post('/payments', f);
      if (page === 'Risk records') await api.post('/risk', f);

      setModal(false);
      refresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Unable to save record');
    }
  }

  async function action(id, status) {
    try {
      if (page === 'Applications') {
        const numericId = Number(String(id).replace(/^APP-/, ''));

        if (!Number.isInteger(numericId) || numericId <= 0) {
          throw new Error('Invalid application ID. Please refresh the Applications page.');
        }

        await api.patch(`/applications/${numericId}/status`, { status });
      }

      if (page === 'Overdue loans') {
        await api.patch(`/overdue/${id}/paid`);
      }

      refresh();
    } catch (e) {
      alert(
        e.response?.data?.message ||
          e.message ||
          'Action failed'
      );
    }
  }

  const configs = {
    Customers: [
      ['customer_id', 'ID'],
      ['full_name', 'Customer'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['monthly_income', 'Monthly income'],
    ],
    Applications: [
      ['application_id', 'Reference'],
      ['customer', 'Applicant'],
      ['loan_purpose', 'Purpose'],
      ['loan_amount', 'Amount'],
      ['tenure_months', 'Tenure'],
      ['status', 'Status'],
    ],
    Loans: [
      ['loan_id', 'Loan ID'],
      ['customer', 'Customer'],
      ['loan_purpose', 'Purpose'],
      ['principal', 'Principal'],
      ['interest_rate', 'Rate'],
      ['paid', 'Paid'],
      ['outstanding', 'Outstanding'],
      ['status', 'Status'],
    ],
    Payments: [
      ['payment_id', 'Transaction'],
      ['customer', 'Customer'],
      ['loan_id', 'Loan'],
      ['amount_paid', 'Amount'],
      ['payment_date', 'Date'],
      ['payment_status', 'Status'],
    ],
    'Risk records': [
      ['assessment_id', 'Assessment'],
      ['customer', 'Customer'],
      ['credit_score', 'Credit score'],
      ['debt_to_income', 'Debt-to-income'],
      ['risk_level', 'Risk'],
      ['assessment_date', 'Date'],
    ],
    'Overdue loans': [
      ['schedule_id', 'Schedule'],
      ['customer', 'Customer'],
      ['loan_id', 'Loan'],
      ['due_date', 'Due date'],
      ['due_amount', 'Due amount'],
      ['status', 'Status'],
    ],
    Reports: [
      ['customer_id', 'Customer ID'],
      ['full_name', 'Customer'],
      ['application_status', 'Application'],
      ['principal', 'Principal'],
      ['total_paid', 'Paid'],
      ['outstanding', 'Outstanding'],
      ['risk_level', 'Risk'],
    ],
  };

  const cols = configs[page] || [];

  const formatted = filtered.map((r) => ({
    ...r,
    monthly_income: money(r.monthly_income),
    loan_amount: money(r.loan_amount),
    principal: money(r.principal),
    paid: money(r.paid),
    outstanding: money(r.outstanding),
    amount_paid: money(r.amount_paid),
    due_amount: money(r.due_amount),
    total_paid: money(r.total_paid),
    debt_to_income:
      r.debt_to_income == null ? '—' : `${r.debt_to_income}%`,
    interest_rate:
      r.interest_rate == null ? '—' : `${r.interest_rate}%`,
    tenure_months: r.tenure_months
      ? `${r.tenure_months} mo`
      : r.tenure_months,
    application_id: r.application_id
      ? `APP-${r.application_id}`
      : r.application_id,
    loan_id: r.loan_id ? `LN-${r.loan_id}` : r.loan_id,
    status: <Status v={r.status} />,
    risk_level: <Status v={r.risk_level} />,
    payment_status: <Status v={r.payment_status} />,
  }));

  const exportCsv = () => {
    const csv = [
      cols.map((c) => c[1]).join(','),
      ...filtered.map((r) =>
        cols.map((c) => JSON.stringify(r[c[0]] ?? '')).join(',')
      ),
    ].join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv' })
    );
    a.download = 'creditlens-report.csv';
    a.click();
  };

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {page === 'Applications' && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        )}

        <span>{filtered.length} records</span>

        {['Customers', 'Applications', 'Payments', 'Risk records'].includes(
          page
        ) && (
          <button className="primary" onClick={() => setModal(true)}>
            <Plus size={15} /> Add new
          </button>
        )}

        {page === 'Reports' && (
          <button className="primary" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      <Panel
        title={
          page === 'Loans'
            ? 'Loan portfolio'
            : page === 'Overdue loans'
              ? 'Overdue instalments'
              : page === 'Reports'
                ? 'Portfolio report'
                : page
        }
        sub="Operational records from your CREDITLENS database"
      >
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c[0]}>{c[1]}</th>
                ))}
                {['Applications', 'Overdue loans'].includes(page) && (
                  <th>Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {formatted.map((r, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c[0]}>{r[c[0]] ?? '—'}</td>
                  ))}

                  {page === 'Applications' && (
                    <td>
                      {r.status?.props?.v === 'Pending' ? (
                        <>
                          <button
                            className="link"
                            onClick={() =>
                              action(r.application_id, 'Approved')
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="link danger"
                            onClick={() =>
                              action(r.application_id, 'Rejected')
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}

                  {page === 'Overdue loans' && (
                    <td>
                      <button
                        className="link"
                        onClick={() => action(r.schedule_id)}
                      >
                        Mark paid
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {!formatted.length && (
            <div className="empty">No records found.</div>
          )}
        </div>
      </Panel>

      {modal && (
        <div className="backdrop">
          <form className="modal" onSubmit={save}>
            <div className="modalhead">
              <b>
                {page === 'Customers'
                  ? 'Add customer'
                  : page === 'Applications'
                    ? 'New loan application'
                    : page === 'Payments'
                      ? 'Record payment'
                      : 'New credit assessment'}
              </b>
              <button type="button" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>

            {page === 'Customers' && (
              <>
                <Field label="Full name" name="full_name" required />
                <Field label="Email" name="email" type="email" />
                <Field label="Phone" name="phone" />
                <Field label="Address" name="address" />
                <Field
                  label="Monthly income"
                  name="monthly_income"
                  type="number"
                />
                <Field label="Employment type" name="employment_type" />
              </>
            )}

            {page === 'Applications' && (
              <>
                <SelectField
                  label="Customer"
                  name="customer_id"
                  items={customers.map((c) => [
                    c.customer_id,
                    c.full_name,
                  ])}
                />
                <Field
                  label="Loan amount"
                  name="loan_amount"
                  type="number"
                  required
                />
                <Field label="Loan purpose" name="loan_purpose" />
                <Field
                  label="Tenure (months)"
                  name="tenure_months"
                  type="number"
                  required
                />
              </>
            )}

            {page === 'Payments' && (
              <>
                <SelectField
                  label="Loan account"
                  name="loan_id"
                  items={loans.map((l) => [
                    l.loan_id,
                    `LN-${l.loan_id} · ${l.customer}`,
                  ])}
                />
                <Field
                  label="Amount paid"
                  name="amount_paid"
                  type="number"
                  required
                />
                <Field
                  label="Payment date"
                  name="payment_date"
                  type="date"
                  required
                />
                <SelectField
                  label="Status"
                  name="payment_status"
                  items={['Paid', 'Late', 'Failed'].map((x) => [x, x])}
                />
              </>
            )}

            {page === 'Risk analytics' && (
              <>
                <SelectField
                  label="Customer"
                  name="customer_id"
                  items={customers.map((c) => [
                    c.customer_id,
                    c.full_name,
                  ])}
                />
                <Field
                  label="Credit score"
                  name="credit_score"
                  type="number"
                  required
                />
                <Field
                  label="Debt-to-income (%)"
                  name="debt_to_income"
                  type="number"
                  required
                />
              </>
            )}

            <button className="primary wide">Save record</button>
          </form>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = 'text', required = false }) {
  return (
    <label className="field">
      {label}
      <input name={name} type={type} required={required} />
    </label>
  );
}

function SelectField({ label, name, items }) {
  return (
    <label className="field">
      {label}
      <select name={name} required>
        {items.map(([v, t]) => (
          <option value={v} key={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

function CalculatorPage() {
  const [p, setP] = useState(500000);
  const [rate, setRate] = useState(10);
  const [n, setN] = useState(60);

  const r = rate / 1200;
  const emi = r
    ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : p / n;
  const total = emi * n;

  return (
    <>
      <div className="pagehead">
        <div>
          <small>PLANNING TOOL</small>
          <h1>EMI calculator</h1>
          <p>Estimate monthly instalments and total repayment.</p>
        </div>
      </div>

      <div className="calcgrid">
        <Panel
          title="Loan parameters"
          sub="Adjust values to calculate indicative EMI"
        >
          <div className="calcfields">
            <label>
              Principal (₹)
              <input
                type="number"
                value={p}
                onChange={(e) => setP(Math.max(1, +e.target.value))}
              />
            </label>
            <label>
              Annual interest rate (%)
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(+e.target.value)}
              />
            </label>
            <label>
              Tenure (months)
              <input
                type="number"
                value={n}
                onChange={(e) => setN(Math.max(1, +e.target.value))}
              />
            </label>
          </div>
        </Panel>

        <div className="result">
          <small>ESTIMATED MONTHLY EMI</small>
          <h2>{money(emi)}</h2>
          <p>For {n} monthly instalments</p>
          <hr />
          <div>
            Principal <b>{money(p)}</b>
          </div>
          <div>
            Total interest <b>{money(total - p)}</b>
          </div>
          <div>
            Total repayment <b>{money(total)}</b>
          </div>
        </div>
      </div>
    </>
  );
}
