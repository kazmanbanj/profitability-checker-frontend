import api from '@/api'

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

export interface AdditionalInfo {
  [key: string]: string
}

export interface LineItemRequest {
  name: string
  cost_price: number
  sell_price: number
  quantity: number
  additional_info: AdditionalInfo
}

export interface AnalyzeQuoteRequest {
  line_items: LineItemRequest[]
  labor_hours: number
  labor_cost_per_hour: number
  fixed_overheads: number
  target_profit_margin: number
}

export interface ReAnalyzeLineItem {
  id: string | number
  suggestion: string
}

export interface ReAnalyzeLaborSuggestions {
  comment: string
}

export interface ReAnalyzeAiSuggestions {
  target_margin_adjustments: string
  labor_allocation_improvements: string
  product_swaps: string
  profitability_summary: string
}

export interface ReAnalyzeQuoteRequest {
  quote_id: string | number
  line_items?: ReAnalyzeLineItem[]
  labor_suggestions?: ReAnalyzeLaborSuggestions
  ai_suggestions?: ReAnalyzeAiSuggestions
}

export interface AiSuggestions {
  profitability_health_indicator: 'green' | 'amber' | 'red' | string
  target_margin_adjustments: string
  labor_allocation_improvements: string
  product_swaps: string
  profitability_summary: string
}

export interface LaborSuggestions {
  estimated_sustainable_hours: number
  labor_hours_exceeded: boolean
  comment: string
}

export interface LineItemResult {
  id: string | number
  name: string
  cost_price: number
  sell_price: number
  quantity: number
  margin_percent: number
  status: string
  suggestion: string
}

export interface AiProfitabilitySuggestions {
  currency_symbol: string
  total_revenue: number
  total_cost: number
  labor_hours: number
  labor_cost_per_hour: number
  labor_cost: number
  fixed_overheads: number
  cost_of_goods_sold: number
  gross_profit: number
  profit_margin: number
  target_profit_margin: number
  meets_target: boolean
  line_items: LineItemResult[]
  labor_suggestions: LaborSuggestions
  ai_suggestions: AiSuggestions
}

export interface QuoteResult {
  id: number
  created_at: string
  target_profit_margin: number
  labor_hours: number
  labor_cost_per_hour: number
  ai_profitability_suggestions: AiProfitabilitySuggestions
}

export interface AnalyzeQuoteResponse {
  success: boolean
  message: string
  data: QuoteResult
}

export interface QuoteListItem {
  id: number
  created_at: string
  target_profit_margin: number
  ai_profitability_suggestions: {
    profit_margin: number
    total_revenue: number
    total_cost: number
    ai_suggestions: {
      profitability_health_indicator: 'green' | 'amber' | 'red' | string
    }
  }
}

export interface PaginatedQuotes {
  data: QuoteListItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface QuoteListResponse {
  success: boolean
  data: PaginatedQuotes
}

export interface QuoteDetailResponse {
  success: boolean
  data: QuoteResult
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Submit a new quote for profitability analysis.
 */
export async function analyzeQuote(payload: AnalyzeQuoteRequest): Promise<AnalyzeQuoteResponse> {
  const { data } = await api.post<AnalyzeQuoteResponse>('v1/quotes/analyze', payload)
  return data
}

/**
 * Re-analyze an existing quote with updated suggestions.
 */
export async function reAnalyzeQuote(
  quoteId: string | number,
  payload: ReAnalyzeQuoteRequest,
): Promise<AnalyzeQuoteResponse> {
  const { data } = await api.post<AnalyzeQuoteResponse>(
    `v1/quotes/${quoteId}/re-analyze`,
    payload,
  )
  return data
}

/**
 * Fetch a paginated list of quotes.
 */
export async function listQuotes(page = 1, limit = 10): Promise<QuoteListResponse> {
  const { data } = await api.get<QuoteListResponse>('v1/quotes', {
    params: { page, limit },
  })
  return data
}

/**
 * Fetch a single quote by ID.
 */
export async function getQuote(quoteId: string | number): Promise<QuoteResult> {
  const { data } = await api.get<QuoteDetailResponse>(`v1/quotes/${quoteId}`)
  return data.data
}

/**
 * Export a quote analysis as a PDF blob.
 * Returns the raw Blob — the caller is responsible for triggering the download.
 */
export async function exportQuoteAnalysis(quoteId: string | number): Promise<Blob> {
  const { data } = await api.get(`v1/quotes/${quoteId}/export-analysis`, {
    responseType: 'blob',
    params: { format: 'pdf' },
  })
  return new Blob([data], { type: 'application/pdf' })
}
