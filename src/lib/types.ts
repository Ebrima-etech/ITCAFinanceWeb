export type Role = 'ADMIN' | 'FINANCE_OFFICER' | 'COMMITTEE_MEMBER' | 'STUDENT';

export type TransactionType =
  | 'DUE'
  | 'EVENT_REVENUE'
  | 'EVENT_COST'
  | 'GIFT'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSE';

export type DuesMethod = 'CASH' | 'ONLINE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  externalId: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: string | number;
  occurredAt: string;
  eventId: string | null;
  event?: { id: string; name: string } | null;
  recordedBy: { id: string; name: string };
}

export interface EventSummary {
  id: string;
  name: string;
  description: string | null;
  date: string;
  revenue: number;
  cost: number;
  result: number;
}

export interface MembershipDue {
  id: string;
  memberName: string;
  memberEmail: string | null;
  amount: string | number;
  method: DuesMethod;
  paidAt: string;
  recordedBy: { id: string; name: string };
}

export interface BudgetItem {
  id: string;
  year: number;
  category: string;
  label: string;
  plannedAmount: number;
  actual: number;
  variance: number;
  priorYearActual: number;
  notes: string | null;
}

export interface DashboardSummary {
  year: number;
  income: number;
  expenses: number;
  net: number;
  byMonth: { month: string; income: number; expenses: number }[];
  byType: Record<string, number>;
  events: { id: string; name: string; date: string; revenue: number; cost: number; result: number }[];
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

export interface Comment {
  id: string;
  author: { id: string; name: string };
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: { id: string; name: string };
  content: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
}
