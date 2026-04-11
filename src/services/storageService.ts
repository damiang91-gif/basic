import AsyncStorage from '@react-native-async-storage/async-storage';
import { FiscalData } from '../types';
import { STORAGE_KEYS } from '../constants';

export async function saveFiscalData(data: FiscalData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.FISCAL_DATA, JSON.stringify(data));
}

export async function loadFiscalData(): Promise<FiscalData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FISCAL_DATA);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const { rfc, nombre, email, codigoPostal, direccion } = parsed;
    if (
      typeof rfc === 'string' &&
      typeof nombre === 'string' &&
      typeof email === 'string' &&
      typeof codigoPostal === 'string' &&
      typeof direccion === 'string'
    ) {
      return { rfc, nombre, email, codigoPostal, direccion };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.OCR_API_KEY, key);
}

export async function loadApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.OCR_API_KEY);
  } catch {
    return null;
  }
}
