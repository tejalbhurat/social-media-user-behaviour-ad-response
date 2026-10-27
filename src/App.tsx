import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Database, Gauge, Info, Menu, Play, Search, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Analytics, DataResponse, ModelMetric, getAnalytics, getData, getMetrics, predict } from './api'

type Page = 'overview' | 'prediction' | 'models' | 'data' | 'methodology'
const nav = [{ id: 'overview' as Page, label: 'Overview', icon: Gauge }, { id: 'prediction' as Page, label: 'Ad response', icon: Play }, { id: 'models' as Page, label: 'Model evaluation', icon: BarChart3 }, { id: 'data' as Page, label: 'Dataset explorer', icon: Database }, { id: 'methodology' as Page, label: 'Methodology', icon: Info }]

function App() {
  const [page, setPage] = useState<Page>('overview')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [metrics, setMetrics] = useState<{ models: ModelMetric[]; best_model: string } | null>(null)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { Promise.all([getAnalytics(), getMetrics()]).then(([a, m]) => { setAnalytics(a); setMetrics(m) }).catch((e) => setError(e.message)) }, [])
  const selectPage = (next: Page) => { setPage(next); setMenuOpen(false) }
  return <div className="app-shell">
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}><div className="brand"><div className="brand-mark">SA</div><div><strong>Social analytics</strong><span>ML studio</span></div><button className="icon-button mobile-close" onClick={() => setMenuOpen(false)}><X size={18} /></button></div><nav>{nav.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => selectPage(id)}><Icon size={17} />{label}</button>)}</nav><div className="sidebar-note"><Info size={16} /><span>Transparent analysis of a 400-record advertising dataset.</span></div></aside>
    <main className="main"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Workspace / <strong>{page === 'overview' ? 'Overview' : nav.find((item) => item.id === page)?.label}</strong></div><div className="status"><span className="status-dot" />Backend connected</div></header>
      {error && <div className="error-banner">Could not load live data: {error}. Start the Flask backend and refresh.</div>}
      {page === 'overview' && <Overview analytics={analytics} onPredict={() => selectPage('prediction')} />}
      {page === 'prediction' && <Prediction />}
      {page === 'models' && <Models metrics={metrics} />}
      {page === 'data' && <Explorer />}
      {page === 'methodology' && <Methodology />}
      <footer>Social Media User Behaviour & Ad Response <span>•</span> Built from the Social Network Ads dataset</footer>
    </main>
  </div>
}

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) { return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="intro-copy">{copy}</p></div>{action}</div> }

function Overview({ analytics, onPredict }: { analytics: Analytics | null; onPredict: () => void }) {
  if (!analytics) return <Loading />
  const pie = [{ name: 'Purchased', value: analytics.purchased }, { name: 'Not purchased', value: analytics.not_purchased }]
  return <><PageIntro eyebrow="Overview" title="Understand the audience behind ad response." copy="A grounded view of who purchased in the sample, where patterns emerge, and what the models can reasonably infer." action={<button className="primary-button" onClick={onPredict}>Run a prediction <Play size={15} /></button>} /><div className="stat-grid"><Stat label="Total records" value={analytics.total_records.toString()} note="Rows in the source dataset" /><Stat label="Purchased" value={`${analytics.purchased} · ${analytics.purchase_rate.toFixed(1)}%`} note="Positive outcomes" accent /><Stat label="Average age" value={`${analytics.average_age.toFixed(1)} yrs`} note="Across all users" /><Stat label="Average salary" value={money(analytics.average_salary)} note="Estimated salary" /></div><div className="chart-grid"><Card title="Purchase outcomes" subtitle="Observed outcomes in the dataset"><div className="chart-with-legend"><ResponsiveContainer width="55%" height={220}><PieChart><Pie data={pie} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3}>{pie.map((entry, i) => <Cell key={entry.name} fill={i ? '#d9dedf' : '#2f6f78'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="legend-list">{pie.map((entry, i) => <div key={entry.name}><span className={`legend-dot ${i ? 'muted' : ''}`} /> <span>{entry.name}</span><strong>{entry.value}</strong></div>)}</div></div></Card><Card title="Purchase rate by age group" subtitle="Share of users with a purchase"><ResponsiveContainer width="100%" height={220}><BarChart data={analytics.age_groups}><CartesianGrid vertical={false} stroke="#e8e8e5" /><XAxis dataKey="age_group" tickLine={false} axisLine={false} /><YAxis unit="%" tickLine={false} axisLine={false} /><Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} /><Bar dataKey="purchase_rate" name="Purchase rate" fill="#2f6f78" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></Card></div><div className="chart-grid"><Card title="Purchase rate by gender" subtitle="A descriptive comparison, not a causal claim"><ResponsiveContainer width="100%" height={220}><BarChart data={analytics.gender}><CartesianGrid vertical={false} stroke="#e8e8e5" /><XAxis dataKey="gender" tickLine={false} axisLine={false} /><YAxis unit="%" tickLine={false} axisLine={false} /><Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} /><Bar dataKey="purchase_rate" fill="#6d9ba0" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Age and salary" subtitle="Each point is one user; colour shows outcome"><ResponsiveContainer width="100%" height={220}><ScatterChart><CartesianGrid stroke="#e8e8e5" /><XAxis type="number" dataKey="age" name="Age" unit=" yrs" /><YAxis type="number" dataKey="salary" name="Salary" tickFormatter={(v) => `$${Number(v) / 1000}k`} /><Tooltip formatter={(v, n) => [n === 'salary' ? money(Number(v)) : v, n]} /><Legend /><Scatter name="Purchased" data={analytics.scatter.filter((p) => p.purchased === 1)} fill="#2f6f78" /><Scatter name="Not purchased" data={analytics.scatter.filter((p) => p.purchased === 0)} fill="#b9c3c4" /></ScatterChart></ResponsiveContainer></Card></div></>
}
function Stat({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) { return <div className={`stat-card ${accent ? 'accent' : ''}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="card"><div className="card-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section> }
function Loading() { return <div className="loading"><div className="spinner" />Loading live dataset…</div> }

function Prediction() {
  const [form, setForm] = useState({ gender: 'Female', age: '35', estimated_salary: '70000' }); const [result, setResult] = useState<Awaited<ReturnType<typeof predict>> | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(''); setResult(null); const age = Number(form.age); const salary = Number(form.estimated_salary); if (!Number.isFinite(age) || age < 18 || age > 100 || !Number.isFinite(salary) || salary < 0) { setError('Enter an age between 18 and 100 and a non-negative salary.'); return } setLoading(true); try { setResult(await predict({ gender: form.gender, age, estimated_salary: salary })) } catch (err) { setError(err instanceof Error ? err.message : 'Prediction failed.') } finally { setLoading(false) } }
  return <><PageIntro eyebrow="Ad response" title="Test a new audience profile." copy="Enter the demographic features available in this dataset. The result is a model estimate, not a guarantee of behaviour." /><div className="two-column"><Card title="Prediction inputs" subtitle="All fields are required"><form className="prediction-form" onSubmit={submit}><label>Gender<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Female</option><option>Male</option></select></label><label>Age<input type="number" min="18" max="100" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label><label>Estimated salary<input type="number" min="0" step="1000" value={form.estimated_salary} onChange={(e) => setForm({ ...form, estimated_salary: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button disabled={loading} className="primary-button full" type="submit">{loading ? <><span className="button-spinner" /> Calculating…</> : <>Predict outcome <Play size={15} /></>}</button></form></Card><div className="result-panel">{result ? <><p className="eyebrow">Model result</p><div className={result.prediction ? 'result-outcome positive' : 'result-outcome'}>{result.prediction ? 'Likely purchase' : 'Unlikely purchase'}</div>{result.probability !== undefined && <div className="probability"><div><span>Purchase probability</span><strong>{(result.probability * 100).toFixed(1)}%</strong></div><div className="progress"><span style={{ width: `${result.probability * 100}%` }} /></div></div>}<dl><div><dt>Model</dt><dd>{result.model}</dd></div><div><dt>Interpretation</dt><dd>{result.explanation}</dd></div></dl></> : <div className="empty-result"><div className="result-icon"><Play size={20} /></div><h2>Your result will appear here</h2><p>Complete the form to get a live prediction from the trained backend model.</p></div>}</div></div></>
}

function Models({ metrics }: { metrics: { models: ModelMetric[]; best_model: string } | null }) {
  if (!metrics) return <Loading />

  return (
    <>
      <PageIntro
        eyebrow="Model evaluation"
        title="Compare models on equal footing."
        copy="Every model uses the same split, feature preparation, and held-out test data. Metrics are calculated from fresh predictions."
      />
      <Card
        title="Evaluation metrics"
        subtitle={`Best F1 score in this split: ${metrics.best_model}`}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 score</th>
                <th>Confusion matrix</th>
              </tr>
            </thead>
            <tbody>
              {metrics.models.map((model) => (
                <tr key={model.model}>
                  <td>
                    <strong>{model.model}</strong>
                    {model.model === metrics.best_model && (
                      <span className="best-tag">Best F1</span>
                    )}
                  </td>
                  {(['accuracy', 'precision', 'recall', 'f1'] as const).map((key) => (
                    <td key={key}>{(model[key] * 100).toFixed(1)}%</td>
                  ))}
                  <td>
                    <span className="matrix">
                      {model.confusion_matrix
                        .map((row) => `[${row.join(', ')}]`)
                        .join(' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="model-note">
        <Info size={17} />
        <span>
          Accuracy measures all correct outcomes; precision and recall focus on
          positive predictions; F1 balances the latter two. A confusion matrix
          is shown as [[true negatives, false positives], [false negatives,
          true positives]].
        </span>
      </div>
    </>
  )
}

function Explorer() { const [data, setData] = useState<DataResponse | null>(null); const [search, setSearch] = useState(''); const [page, setPage] = useState(1); const [sortBy, setSortBy] = useState('User ID'); const [sortOrder, setSortOrder] = useState('asc'); useEffect(() => { getData(new URLSearchParams({ page: page.toString(), per_page: '12', search, sort_by: sortBy, sort_order: sortOrder }).toString()).then(setData).catch(() => setData(null)) }, [page, search, sortBy, sortOrder]); return <><PageIntro eyebrow="Dataset explorer" title="Inspect the source records." copy="Search across the dataset and review the exact records used for the aggregate views and model evaluation." /><div className="toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search ID, gender, age…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} /></div><div className="sort-controls"><label>Sort <select value={sortBy} onChange={(e) => { setPage(1); setSortBy(e.target.value) }}><option>User ID</option><option>Gender</option><option>Age</option><option>EstimatedSalary</option><option>Purchased</option></select></label><select aria-label="Sort order" value={sortOrder} onChange={(e) => { setPage(1); setSortOrder(e.target.value) }}><option value="asc">A–Z / low–high</option><option value="desc">Z–A / high–low</option></select><span>{data?.total ?? '—'} matching records</span></div></div><Card title="Social Network Ads" subtitle="The original 400-record sample"><div className="table-wrap">{data ? <table><thead><tr><th>User ID</th><th>Gender</th><th>Age</th><th>Estimated salary</th><th>Purchased</th></tr></thead><tbody>{data.records.map((r) => <tr key={String(r['User ID'])}><td>{r['User ID']}</td><td>{r.Gender}</td><td>{r.Age}</td><td>{money(Number(r.EstimatedSalary))}</td><td><span className={r.Purchased ? 'outcome-tag yes' : 'outcome-tag'}>{r.Purchased ? 'Yes' : 'No'}</span></td></tr>)}</tbody></table> : <Loading />}</div>{data && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {data.pages}</span><button disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}</Card></> }

function Methodology() { return <><PageIntro eyebrow="Methodology" title="Useful analysis, with clear boundaries." copy="This project is deliberately transparent about its data, process, and limitations." /><div className="method-grid">{[['Dataset', '400 records from the Social Network Ads dataset. Each row includes a user ID, gender, age, estimated salary, and a binary purchase outcome.'], ['Preprocessing', 'Gender is one-hot encoded, while age and estimated salary are standardized for scale-sensitive models. User ID is excluded from training.'], ['Algorithms', 'The backend trains Logistic Regression, Decision Tree Classifier, and Support Vector Classifier pipelines using the same 80/20 split (random state 42).'], ['Evaluation', 'Accuracy, precision, recall, and F1 are calculated on the held-out test set. Confusion matrices show the count of each outcome type.'], ['Limitations', 'This sample predicts purchase outcomes from gender, age, and estimated salary. It does not contain likes, shares, comments, impressions, or time spent viewing ads.'], ['Responsible use', 'A prediction describes a pattern in this small dataset; it does not guarantee what a person will do and should not be used as a sole basis for consequential decisions.']].map(([title, copy]) => <section className="method-card" key={title}><p className="eyebrow">{title}</p><p>{copy}</p></section>)}</div></> }

export default App
