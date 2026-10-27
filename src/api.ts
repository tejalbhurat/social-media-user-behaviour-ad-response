export type Analytics = {
  total_records: number
  purchased: number
  not_purchased: number
  purchase_rate: number
  average_age: number
  average_salary: number
  age_groups: { age_group: string; total: number; purchased: number; purchase_rate: number }[]
  gender: { gender: string; total: number; purchased: number; purchase_rate: number }[]
  scatter: { age: number; salary: number; purchased: number; gender: string }[]
}

export type ModelMetric = {
  model: string
  accuracy: number
  precision: number
  recall: number
  f1: number
  confusion_matrix: number[][]
}

export type DataResponse = { records: Record<string, string | number>[]; total: number; page: number; per_page: number; pages: number }
const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error ?? 'The request could not be completed.')
  return payload as T
}
export const getAnalytics = async () => {
  const raw = await request<{
    totals: { users: number; purchases: number; non_purchases: number; purchase_rate: number }
    averages: { age: number; estimated_salary: number }
    age_group_purchase_rates: { group: string; count: number; purchase_rate: number }[]
    gender_purchase_rates: { group: string; count: number; purchase_rate: number }[]
    scatter: { Age: number; EstimatedSalary: number; Purchased: number; Gender: string }[]
  }>('/api/analytics')
  return {
    total_records: raw.totals.users,
    purchased: raw.totals.purchases,
    not_purchased: raw.totals.non_purchases,
    purchase_rate: raw.totals.purchase_rate * 100,
    average_age: raw.averages.age,
    average_salary: raw.averages.estimated_salary,
    age_groups: raw.age_group_purchase_rates.map((item) => ({ age_group: item.group, total: item.count, purchased: Math.round(item.count * item.purchase_rate), purchase_rate: item.purchase_rate * 100 })),
    gender: raw.gender_purchase_rates.map((item) => ({ gender: item.group, total: item.count, purchased: Math.round(item.count * item.purchase_rate), purchase_rate: item.purchase_rate * 100 })),
    scatter: raw.scatter.map((item) => ({ age: item.Age, salary: item.EstimatedSalary, purchased: item.Purchased, gender: item.Gender })),
  } satisfies Analytics
}
export const getMetrics = async () => {
  const raw = await request<{ models: Record<string, Omit<ModelMetric, 'model'>>; best_model: string }>('/api/models/metrics')
  return { best_model: raw.best_model, models: Object.entries(raw.models).map(([model, metric]) => ({ model, ...metric })) }
}
export const getData = async (params: string) => {
  const raw = await request<{ data: DataResponse['records']; pagination: { total: number; page: number; per_page: number; pages: number } }>(`/api/data?${params}`)
  return { records: raw.data, ...raw.pagination }
}
export const predict = (body: { gender: string; age: number; estimated_salary: number }) =>
  request<{ outcome: number; model: string; probability?: number; explanation: string }>('/api/predict', { method: 'POST', body: JSON.stringify({ Gender: body.gender, Age: body.age, EstimatedSalary: body.estimated_salary }) }).then((result) => ({ ...result, prediction: result.outcome }))
