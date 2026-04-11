import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { OcrResult } from '../types';
import { GCV_API_URL } from '../constants';

function isDate(line: string) {
  return /^\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}/.test(line);
}

function isNumericOnly(line: string) {
  return /^[\d\s\.\$\,\%\+\-\*\/]+$/.test(line);
}

function isReceiptLabel(line: string) {
  return /^(RFC|FACTURA|TICKET|NO\.|FOLIO|SUBTOTAL|TOTAL|IVA|CAMBIO|EFECTIVO|TARJETA|CAJA|CAJERO|FECHA|HORA|GRACIAS|THANK|TEL|FAX|www\.|http)/i.test(
    line
  );
}

function extractBusinessName(rawText: string): { businessName: string; confidence: OcrResult['confidence'] } {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const filtered = lines.filter(
    line =>
      !isDate(line) &&
      !isNumericOnly(line) &&
      !isReceiptLabel(line) &&
      line.length > 3
  );

  if (filtered.length === 0) {
    return { businessName: '', confidence: 'low' };
  }

  const candidate = filtered.slice(0, 2).join(' ').substring(0, 60).trim();
  const firstLine = filtered[0];
  const confidence =
    firstLine === firstLine.toUpperCase() && firstLine.length > 5 ? 'high' : 'low';

  return { businessName: candidate, confidence };
}

export async function performOcr(
  photoUri: string,
  apiKey: string | null
): Promise<OcrResult> {
  if (!apiKey) {
    return { success: false, rawText: '', businessName: '', confidence: 'manual' };
  }

  try {
    // Resize to reduce payload size
    const resized = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const base64 = await FileSystem.readAsStringAsync(resized.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(`${GCV_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`GCV API error: ${response.status}`);
    }

    const json = await response.json();
    const rawText: string =
      json?.responses?.[0]?.fullTextAnnotation?.text ?? '';

    if (!rawText) {
      return { success: false, rawText: '', businessName: '', confidence: 'low' };
    }

    const { businessName, confidence } = extractBusinessName(rawText);
    return { success: true, rawText, businessName, confidence };
  } catch (error) {
    return { success: false, rawText: '', businessName: '', confidence: 'manual' };
  }
}
