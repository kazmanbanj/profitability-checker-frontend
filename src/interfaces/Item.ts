import type { AdditionalInfo } from '@/interfaces'

export interface Item {
  name: string
  cost_price: number
  sell_price: number
  quantity: number
  additional_info: AdditionalInfo
}
