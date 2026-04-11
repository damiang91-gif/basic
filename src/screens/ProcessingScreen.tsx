import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, OcrResult } from '../types';
import { COLORS, SPACING, SEARCH_URL_TEMPLATE } from '../constants';
import { useUserData } from '../hooks/useUserData';
import { performOcr } from '../services/ocrService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Processing'>;
  route: RouteProp<RootStackParamList, 'Processing'>;
};

export default function ProcessingScreen({ navigation, route }: Props) {
  const { photoUri } = route.params;
  const { gcvApiKey } = useUserData();

  const [isProcessing, setIsProcessing] = useState(true);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsProcessing(true);

    performOcr(photoUri, gcvApiKey).then(result => {
      if (cancelled) return;
      setOcrResult(result);
      setBusinessName(result.businessName);
      setIsProcessing(false);
    });

    return () => { cancelled = true; };
  }, [photoUri, gcvApiKey]);

  function handleSearch() {
    const name = businessName.trim();
    if (!name) return;
    const searchUrl = SEARCH_URL_TEMPLATE.replace(
      '{businessName}',
      encodeURIComponent(name)
    );
    navigation.navigate('WebView', { businessName: name, searchUrl });
  }

  const isManual = ocrResult?.confidence === 'manual';
  const canSearch = businessName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Ticket photo */}
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />

        {isProcessing ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>Analizando ticket...</Text>
            <Text style={styles.processingSubtext}>
              Extrayendo información del negocio
            </Text>
          </View>
        ) : (
          <View style={styles.resultBox}>
            {isManual && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  ⚠️  Sin API de OCR configurada. Ingresa el nombre del negocio manualmente.
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Text style={styles.warningLink}>Configurar en Mi Perfil →</Text>
                </TouchableOpacity>
              </View>
            )}

            {ocrResult && !ocrResult.success && !isManual && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                  ℹ️  No se pudo detectar el nombre automáticamente. Ingrésalo manualmente.
                </Text>
              </View>
            )}

            {ocrResult?.success && ocrResult.confidence === 'high' && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>
                  ✓ Negocio detectado con alta confianza
                </Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Nombre del Negocio</Text>
            <TextInput
              style={styles.businessInput}
              value={businessName}
              onChangeText={setBusinessName}
              autoCapitalize="words"
              placeholder="Ej: OXXO, Walmart, Costco..."
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <Text style={styles.hint}>
              ✏️  Puedes editar el nombre si no es correcto
            </Text>

            <TouchableOpacity
              style={[styles.searchButton, !canSearch && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!canSearch}
            >
              <Text style={styles.searchButtonText}>
                🔍  Buscar Portal de Facturación
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.retakeButtonText}>📷  Tomar Otra Foto</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.border,
  },
  processingBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    gap: SPACING.md,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  processingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultBox: {
    gap: SPACING.md,
  },
  warningBanner: {
    backgroundColor: COLORS.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: 8,
  },
  warningText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  warningLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
  },
  infoText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: 8,
  },
  successText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  businessInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  retakeButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  retakeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
