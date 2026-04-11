export const STORAGE_KEYS = {
  FISCAL_DATA: '@facturafacil/fiscal_data',
  OCR_API_KEY: '@facturafacil/gcv_api_key',
} as const;

export const COLORS = {
  primary: '#1565C0',
  primaryDark: '#003c8f',
  accent: '#43A047',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  warning: '#F57F17',
  warningBg: '#FFF9C4',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const GCV_API_URL =
  'https://vision.googleapis.com/v1/images:annotate';

export const SEARCH_URL_TEMPLATE =
  'https://www.google.com/search?q={businessName}+facturacion+en+linea';
