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

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Camera: undefined;
  Processing: { photoUri: string };
  WebView: { businessName: string; searchUrl: string };
};
