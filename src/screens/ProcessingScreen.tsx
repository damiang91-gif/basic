import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AutoFillResult, AutoStep, RootStackParamList } from '../types';
import { COLORS, MOBILE_UA, SPACING } from '../constants';
import { useUserData } from '../hooks/useUserData';
import { performOcr } from '../services/ocrService';
import { findPortalUrl } from '../services/portalFinderService';
import { buildFillScript } from '../services/formFillerService';
import ProgressSteps from '../components/ProgressSteps';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Processing'>;
  route: RouteProp<RootStackParamList, 'Processing'>;
};

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export default function ProcessingScreen({ navigation, route }: Props) {
  const { photoUri } = route.params;
  const { gcvApiKey, fiscalData } = useUserData();

  const [step, setStep] = useState<AutoStep>('ocr');
  const [businessName, setBusinessName] = useState('');
  const [needsManualInput, setNeedsManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [hiddenWebViewUrl, setHiddenWebViewUrl] = useState<string | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const hiddenWebViewRef = useRef<WebView>(null);
  const fillTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigatedRef = useRef(false);

  // Navigate to confirm screen — called from multiple paths, safe to call once
  const goToConfirm = useCallback(
    (url: string | null, fillResults: AutoFillResult | null, name: string) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      if (fillTimeoutRef.current) clearTimeout(fillTimeoutRef.current);

      const script = fiscalData ? buildFillScript(fiscalData) : null;
      navigation.replace('InvoiceConfirm', {
        businessName: name,
        photoUri,
        portalUrl: url,
        fillResults,
        fillScript: url && script ? script : null,
      });
    },
    [navigation, photoUri, fiscalData]
  );

  // Main flow: runs once on mount
  const runFlow = useCallback(
    async (nameOverride?: string) => {
      let name = nameOverride ?? '';

      if (!nameOverride) {
        // Step 1 — OCR
        setStep('ocr');
        const ocrResult = await performOcr(photoUri, gcvApiKey);
        name = ocrResult.businessName.trim();

        if (!name || ocrResult.confidence === 'manual') {
          // No OCR result — ask user to type the name
          setNeedsManualInput(true);
          return;
        }
      }

      setBusinessName(name);

      // Short pause so user sees the step label update
      await delay(500);

      // Step 2 — Find portal
      setStep('finding');
      await delay(700);

      const match = findPortalUrl(name);

      if (!match) {
        // Not in database — go to confirm without auto-fill
        setStep('ready');
        goToConfirm(null, null, name);
        return;
      }

      setPortalUrl(match.url);

      // Step 3 — Load portal in hidden WebView and fill
      setStep('filling');
      setHiddenWebViewUrl(match.url);

      // Timeout: if WebView or fill script doesn't respond in 12 s, move forward
      fillTimeoutRef.current = setTimeout(() => {
        setStep('ready');
        goToConfirm(match.url, null, name);
      }, 12000);
    },
    [photoUri, gcvApiKey, goToConfirm]
  );

  useEffect(() => {
    runFlow();
    return () => {
      if (fillTimeoutRef.current) clearTimeout(fillTimeoutRef.current);
    };
  }, []);

  // Called when the hidden WebView finishes loading the portal page
  function handleHiddenWebViewLoad() {
    if (step !== 'filling' || !fiscalData) return;
    const script = buildFillScript(fiscalData);
    hiddenWebViewRef.current?.injectJavaScript(script);
  }

  // Called when the fill script sends its results
  function handleHiddenWebViewMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'FILL_RESULT' || msg.type === 'FILL_ERROR') {
        const results: AutoFillResult | null =
          msg.type === 'FILL_RESULT' ? msg.results : null;
        setStep('ready');
        goToConfirm(portalUrl, results, businessName);
      }
    } catch {
      // Malformed message — ignore, timeout will handle it
    }
  }

  // User submitted manual business name
  function handleManualSubmit() {
    const name = manualInput.trim();
    if (!name) return;
    Keyboard.dismiss();
    setNeedsManualInput(false);
    runFlow(name);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {needsManualInput ? (
          /* ── Manual input state ────────────────────────── */
          <View style={styles.manualBox}>
            <Text style={styles.manualTitle}>¿De qué negocio es el ticket?</Text>
            <Text style={styles.manualHint}>
              No pudimos leer el ticket automáticamente. Escribe el nombre del negocio
              y continuaremos desde ahí.
            </Text>
            <TextInput
              style={styles.manualInput}
              value={manualInput}
              onChangeText={setManualInput}
              autoFocus
              autoCapitalize="words"
              placeholder="Ej: OXXO, Walmart, Costco..."
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="go"
              onSubmitEditing={handleManualSubmit}
            />
            <TouchableOpacity
              style={[styles.continueButton, !manualInput.trim() && styles.continueButtonDisabled]}
              onPress={handleManualSubmit}
              disabled={!manualInput.trim()}
            >
              <Text style={styles.continueButtonText}>Continuar →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retakeLink}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.retakeLinkText}>📷  Tomar otra foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Auto-processing state ─────────────────────── */
          <View style={styles.autoBox}>
            <Text style={styles.autoTitle}>Procesando tu ticket</Text>
            <Text style={styles.autoSubtitle}>
              Estamos haciendo todo por ti, un momento...
            </Text>
            <View style={styles.stepsContainer}>
              <ProgressSteps currentStep={step} businessName={businessName} />
            </View>
          </View>
        )}
      </View>

      {/* Hidden WebView — loads the portal page and fills the form in the background */}
      {hiddenWebViewUrl && (
        <WebView
          ref={hiddenWebViewRef}
          source={{ uri: hiddenWebViewUrl }}
          style={styles.hiddenWebView}
          javaScriptEnabled
          domStorageEnabled
          userAgent={MOBILE_UA}
          onLoadEnd={handleHiddenWebViewLoad}
          onMessage={handleHiddenWebViewMessage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },

  // Auto-processing UI
  autoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  autoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  autoSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  stepsContainer: {
    paddingLeft: SPACING.sm,
  },

  // Manual input UI
  manualBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: SPACING.md,
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  manualHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  manualInput: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  retakeLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  retakeLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  // The hidden WebView — must have non-zero dimensions to render in some environments
  hiddenWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    bottom: 0,
    left: 0,
  },
});
