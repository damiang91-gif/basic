export interface FiscalData {
  rfc: string;
  nombre: string;
  email: string;
  codigoPostal: string;
  direccion: string;
}

export interface OcrResult {
  success: boolean;
  rawText: string;
  businessName: string;
  confidence: 'high' | 'low' | 'manual';
}

export interface AutoFillResult {
  rfc: boolean;
  nombre: boolean;
  email: boolean;
  codigoPostal: boolean;
  hasCaptcha: boolean;
  pageTitle: string;
}

export interface PortalMatch {
  url: string;
  displayName: string;
}

export interface CfdiOption {
  code: string;
  label: string;
  common?: boolean;
}

export interface FormaPagoOption {
  code: string;
  label: string;
  common?: boolean;
}

export type AutoStep = 'ocr' | 'finding' | 'filling' | 'ready';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Camera: undefined;
  Processing: { photoUri: string };
  InvoiceConfirm: {
    businessName: string;
    photoUri: string;
    portalUrl: string | null;
    fillResults: AutoFillResult | null;
    fillScript: string | null;
  };
  WebView: {
    businessName: string;
    portalUrl: string;
    fillScript: string | null;
  };
};
