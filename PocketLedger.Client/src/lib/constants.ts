export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ACCOUNT_TYPES = [
  { value: 0, label: 'Personal', icon: 'UserIcon', color: '#6366f1' },
  { value: 1, label: 'Savings', icon: 'BanknotesIcon', color: '#22c55e' },
  { value: 7, label: 'Business', icon: 'BriefcaseIcon', color: '#8b5cf6' },
  { value: 8, label: 'Custom', icon: 'Cog6ToothIcon', color: '#06b6d4' },
  { value: 3, label: 'Cash', icon: 'BanknotesIcon', color: '#f97316' },
  { value: 4, label: 'Investment', icon: 'ChartBarIcon', color: '#eab308' },
  { value: 2, label: 'Credit Card', icon: 'CreditCardIcon', color: '#ef4444' },
  { value: 5, label: 'Loan', icon: 'ArrowTrendingDownIcon', color: '#6b7280' },
  { value: 6, label: 'Other', icon: 'QuestionMarkCircleIcon', color: '#1e293b' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 0, label: 'Income', color: 'text-success' },
  { value: 1, label: 'Expense', color: 'text-destructive' },
  { value: 2, label: 'Transfer', color: 'text-info' },
] as const;

export const BUDGET_PERIODS = [
  { value: 0, label: 'Weekly' },
  { value: 1, label: 'Monthly' },
  { value: 2, label: 'Quarterly' },
  { value: 3, label: 'Yearly' },
] as const;

export const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6b7280', '#1e293b', '#d946ef', '#0ea5e9', '#84cc16',
  '#f43f5e', '#a855f7', '#2dd4bf', '#fb923c', '#facc15',
];

export const CATEGORY_TYPES = [
  { value: 0, label: 'Income', color: 'text-green-600' },
  { value: 1, label: 'Expense', color: 'text-red-600' },
  { value: 2, label: 'Both', color: 'text-primary' },
] as const;

export const CATEGORY_ICONS = [
  'folder', 'utensils', 'car', 'bolt', 'film', 'shopping-bag', 'heart', 'academic-cap',
  'currency-dollar', 'briefcase', 'chart-bar', 'home', 'user', 'gift', 'plane', 'musical-note',
  'paint-brush', 'camera', 'book-open', 'wrench', 'globe', 'sun', 'moon', 'star',
  'shopping-cart', 'credit-card', 'banknotes', 'building-library', 'beaker', 'code',
  'device-phone-mobile', 'truck', 'cake', 'paw', 'sparkles', 'trending-up', 'trending-down',
  'clock', 'calendar', 'map-pin', 'check-circle', 'x-circle', 'exclamation-triangle',
  'information-circle', 'bell', 'cog', 'key', 'lock', 'shield', 'fire', 'lightning-bolt',
];

export const ACCOUNT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#d946ef', '#0ea5e9', '#84cc16', '#f43f5e', '#a855f7',
];

export const WALLET_COLORS = ACCOUNT_COLORS;

export const PAYMENT_METHODS = [
  { value: 0, label: 'Cash', icon: 'BanknotesIcon' },
  { value: 1, label: 'Credit Card', icon: 'CreditCardIcon' },
  { value: 2, label: 'Debit Card', icon: 'CreditCardIcon' },
  { value: 3, label: 'Bank Transfer', icon: 'BuildingLibraryIcon' },
  { value: 4, label: 'Mobile Payment', icon: 'DevicePhoneMobileIcon' },
  { value: 5, label: 'Check', icon: 'DocumentTextIcon' },
  { value: 6, label: 'Other', icon: 'EllipsisHorizontalIcon' },
] as const;

export const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest first)', sortBy: 'date', sortOrder: 'desc' },
  { value: 'date_asc', label: 'Date (Oldest first)', sortBy: 'date', sortOrder: 'asc' },
  { value: 'amount_desc', label: 'Amount (Highest first)', sortBy: 'amount', sortOrder: 'desc' },
  { value: 'amount_asc', label: 'Amount (Lowest first)', sortBy: 'amount', sortOrder: 'asc' },
  { value: 'payee_asc', label: 'Payee (A-Z)', sortBy: 'payee', sortOrder: 'asc' },
  { value: 'payee_desc', label: 'Payee (Z-A)', sortBy: 'payee', sortOrder: 'desc' },
] as const;

export const REPORT_PERIODS = [
  { value: 'weekly', label: 'Weekly', description: 'Last 4 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Last 12 months' },
  { value: 'yearly', label: 'Yearly', description: 'Last 5 years' },
  { value: 'custom', label: 'Custom', description: 'Choose dates' },
] as const;

export const DASHBOARD_PERIODS = [
  { value: 'monthly', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const;

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
] as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'SunIcon' },
  { value: 'dark', label: 'Dark', icon: 'MoonIcon' },
  { value: 'system', label: 'System', icon: 'ComputerDesktopIcon' },
] as const;
