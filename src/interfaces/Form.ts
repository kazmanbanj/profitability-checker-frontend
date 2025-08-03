import type { Item } from '@/interfaces/Item'

export interface Form {
  line_items: Item[]
  labor_hours: number
  labor_cost_per_hour: number
  fixed_overheads: number
  target_profit_margin: number
}
