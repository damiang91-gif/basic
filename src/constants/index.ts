import { CfdiOption, FormaPagoOption } from '../types';

export const STORAGE_KEYS = {
  FISCAL_DATA: '@facturafacil/fiscal_data',
  OCR_API_KEY: '@facturafacil/gcv_api_key',
  LAST_CFDI_USO: '@facturafacil/last_cfdi_uso',
  LAST_FORMA_PAGO: '@facturafacil/last_forma_pago',
} as const;

export const COLORS = {
  primary: '#1565C0',
  primaryDark: '#003c8f',
  primaryLight: '#E3F2FD',
  accent: '#43A047',
  accentLight: '#E8F5E9',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  warning: '#F57F17',
  warningBg: '#FFF9C4',
  disabled: '#BDBDBD',
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

// Fallback Google search URL when portal is not in the known database
export const SEARCH_URL_TEMPLATE =
  'https://www.google.com/search?q={businessName}+facturacion+en+linea';

export const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

// ---------- CFDI Uso options (SAT 4.0) ----------
export const CFDI_USOS: CfdiOption[] = [
  { code: 'G03', label: 'Gastos en general', common: true },
  { code: 'G01', label: 'Adquisición de mercancias', common: true },
  { code: 'D01', label: 'Honorarios médicos y gastos hospitalarios', common: true },
  { code: 'D07', label: 'Primas por seguros de gastos médicos', common: true },
  { code: 'G02', label: 'Devoluciones, descuentos o bonificaciones' },
  { code: 'I01', label: 'Construcciones' },
  { code: 'D03', label: 'Gastos funerales' },
  { code: 'D04', label: 'Donativos' },
  { code: 'D05', label: 'Intereses reales de créditos hipotecarios' },
  { code: 'D06', label: 'Aportaciones voluntarias al SAR' },
  { code: 'D08', label: 'Transportación escolar obligatoria' },
  { code: 'D10', label: 'Pagos por servicios educativos' },
  { code: 'S01', label: 'Sin efectos fiscales' },
];

// ---------- Forma de Pago options (SAT) ----------
export const FORMAS_PAGO: FormaPagoOption[] = [
  { code: '04', label: 'Tarjeta de crédito', common: true },
  { code: '28', label: 'Tarjeta de débito', common: true },
  { code: '01', label: 'Efectivo', common: true },
  { code: '03', label: 'Transferencia electrónica', common: true },
  { code: '05', label: 'Monedero electrónico' },
  { code: '06', label: 'Dinero electrónico' },
  { code: '08', label: 'Vales de despensa' },
  { code: '02', label: 'Cheque nominativo' },
  { code: '99', label: 'Por definir' },
];
