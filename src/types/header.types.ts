export type HeaderTitleType =
  | 'page-based'
  | 'time-based'
  | 'financial-status'
  | 'quick-stats'
  | 'motivational';

export interface HeaderTitleConfig {
  type: HeaderTitleType;
  enabled: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  header_title_preference?: HeaderTitleType;
  // ... other existing fields
}

export interface FinancialSummary {
  totalBalance: number;
  netWorth: number;
  monthlyChange: number;
  accountsCount: number;
  transactionsCount: number;
  savingsRate: number;
  totalIncome: number;
  totalExpenses: number;
}
