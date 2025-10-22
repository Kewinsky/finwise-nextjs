import { HeaderTitleType, FinancialSummary } from '@/types/header.types';
import { formatCurrency } from '@/lib/utils';

export function getTimeBasedGreeting(fullName: string): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return `Good morning, ${fullName}!`;
  } else if (hour >= 12 && hour < 18) {
    return `Good afternoon, ${fullName}!`;
  } else if (hour >= 18 && hour < 24) {
    return `Good evening, ${fullName}!`;
  } else {
    return `Good night, ${fullName}!`;
  }
}

export function getPageBasedTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'dashboard') {
    return 'Dashboard';
  }

  const pageMap: Record<string, string> = {
    accounts: 'Accounts',
    transactions: 'Transactions',
    settings: 'Settings',
    billing: 'Billing',
    assistant: 'AI Assistant',
  };

  return pageMap[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
}

export function getFinancialStatusTitle(summary: FinancialSummary): string {
  if (summary.monthlyChange > 0) {
    return `Total Balance: ${formatCurrency(summary.totalBalance)} (+${formatCurrency(summary.monthlyChange)} this month)`;
  } else if (summary.monthlyChange < 0) {
    return `Total Balance: ${formatCurrency(summary.totalBalance)} (${formatCurrency(summary.monthlyChange)} this month)`;
  } else {
    return `Total Balance: ${formatCurrency(summary.totalBalance)}`;
  }
}

export function getQuickStatsTitle(summary: FinancialSummary): string {
  const accountText = summary.accountsCount === 1 ? 'Account' : 'Accounts';

  // Use actual income/expense data
  const incomeFormatted = formatCurrency(summary.totalIncome);
  const expensesFormatted = formatCurrency(summary.totalExpenses);
  const netFormatted = formatCurrency(summary.monthlyChange);
  const savingsRate = Math.round(summary.savingsRate);

  return `${summary.accountsCount} ${accountText} • ${incomeFormatted} In • ${expensesFormatted} Out • ${netFormatted} Net (${savingsRate}%)`;
}

// Alternative quick stats variations
export function getQuickStatsVariations(summary: FinancialSummary): string[] {
  const accountText = summary.accountsCount === 1 ? 'Account' : 'Accounts';
  const transactionText = summary.transactionsCount === 1 ? 'Transaction' : 'Transactions';

  return [
    // Basic balance
    `${summary.accountsCount} ${accountText} • ${formatCurrency(summary.totalBalance)} Total`,

    // Monthly change (if available)
    ...(summary.monthlyChange !== 0
      ? [
          `${summary.accountsCount} ${accountText} • ${summary.monthlyChange > 0 ? '+' : ''}${formatCurrency(summary.monthlyChange)} This Month`,
        ]
      : []),

    // Transaction count
    ...(summary.transactionsCount > 0
      ? [
          `${summary.accountsCount} ${accountText} • ${summary.transactionsCount} ${transactionText}`,
        ]
      : []),

    // Savings rate (if meaningful)
    ...(summary.savingsRate > 0
      ? [
          `${summary.accountsCount} ${accountText} • ${Math.round(summary.savingsRate)}% Savings Rate`,
        ]
      : []),

    // Net worth focus
    `${formatCurrency(summary.totalBalance)} Net Worth • ${summary.accountsCount} ${accountText}`,
  ];
}

export function getMotivationalTitle(): string {
  const motivationalMessages = [
    'Keep up the great work!',
    "You're on track for your goals!",
    'Financial freedom is within reach!',
    'Every step counts!',
    "You're building a better future!",
    'Stay focused on your goals!',
    'Progress over perfection!',
    'Your financial future looks bright!',
  ];

  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
}

export function generateHeaderTitle(
  type: HeaderTitleType,
  fullName: string,
  pathname: string,
  financialSummary?: FinancialSummary,
): string {
  switch (type) {
    case 'time-based':
      return getTimeBasedGreeting(fullName);
    case 'page-based':
      return getPageBasedTitle(pathname);
    case 'financial-status':
      return financialSummary ? getFinancialStatusTitle(financialSummary) : 'Financial Overview';
    case 'quick-stats':
      return financialSummary ? getQuickStatsTitle(financialSummary) : 'Quick Stats';
    case 'motivational':
      return getMotivationalTitle();
    default:
      return getTimeBasedGreeting(fullName);
  }
}
