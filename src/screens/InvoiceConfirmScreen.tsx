import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CfdiOption, FormaPagoOption } from '../types';
import { COLORS, SPACING, CFDI_USOS, FORMAS_PAGO, SEARCH_URL_TEMPLATE } from '../constants';
import { useUserData } from '../hooks/useUserData';
import CopyableField from '../components/CopyableField';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'InvoiceConfirm'>;
  route: RouteProp<RootStackParamList, 'InvoiceConfirm'>;
};

/** Fields that were auto-filled in the background — shown as read-only checkmarks */
function AutoFilledRow({ label, filled }: { label: string; filled: boolean }) {
  return (
    <View style={styles.autoFilledRow}>
      <View style={[styles.statusDot, filled ? styles.dotFilled : styles.dotMissed]} />
      <Text style={[styles.autoFilledLabel, !filled && styles.autoFilledLabelMissed]}>
        {label}
      </Text>
      <Text style={[styles.autoFilledStatus, filled ? styles.statusOk : styles.statusMiss]}>
        {filled ? 'Completado' : 'No encontrado'}
      </Text>
    </View>
  );
}

/** Generic bottom-sheet picker */
function OptionPicker<T extends { code: string; label: string; common?: boolean }>({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: T[];
  onSelect: (item: T) => void;
  onClose: () => void;
}) {
  const common = options.filter(o => o.common);
  const rest = options.filter(o => !o.common);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>

        <FlatList
          data={[
            { code: '_header_common', label: 'Más comunes', _isHeader: true } as T & { _isHeader?: boolean },
            ...common.map(o => ({ ...o, _isHeader: false })),
            { code: '_header_rest', label: 'Todos', _isHeader: true } as T & { _isHeader?: boolean },
            ...rest.map(o => ({ ...o, _isHeader: false })),
          ]}
          keyExtractor={item => item.code}
          renderItem={({ item }) => {
            if ((item as any)._isHeader) {
              return <Text style={styles.sheetSectionHeader}>{item.label}</Text>;
            }
            return (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <View style={styles.sheetOptionCode}>
                  <Text style={styles.sheetCodeText}>{item.code}</Text>
                </View>
                <Text style={styles.sheetOptionLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

/** What cannot be automated — shown as a collapsible info section */
function LimitationsSection() {
  const [open, setOpen] = useState(false);

  const items = [
    { icon: '⚙️', text: 'Uso del CFDI y Forma de Pago — decisión que debes tomar tú' },
    { icon: '🤖', text: 'CAPTCHA / verificación humana en el portal' },
    { icon: '🔐', text: 'Portales que requieren login o cuenta del negocio' },
    { icon: '🏛️', text: 'Régimen Fiscal del receptor (depende del tipo de RFC)' },
    { icon: '✉️', text: 'Descarga del CFDI — el portal lo envía a tu correo' },
    { icon: '🔑', text: 'Autenticación con e.firma o contraseña SAT' },
    { icon: '🌐', text: 'Portales de negocios no incluidos en nuestra base de datos' },
  ];

  return (
    <View style={styles.limitationsBox}>
      <TouchableOpacity style={styles.limitationsHeader} onPress={() => setOpen(v => !v)}>
        <Text style={styles.limitationsTitle}>ℹ️  ¿Qué no podemos automatizar?</Text>
        <Text style={styles.limitationsChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.limitationsList}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.limitationItem}>
              <Text style={styles.limitationIcon}>{item.icon}</Text>
              <Text style={styles.limitationText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function InvoiceConfirmScreen({ navigation, route }: Props) {
  const { businessName, photoUri, portalUrl, fillResults, fillScript } = route.params;
  const { fiscalData } = useUserData();

  const [cfdiUso, setCfdiUso] = useState<CfdiOption>(CFDI_USOS[0]); // G03 default
  const [formaPago, setFormaPago] = useState<FormaPagoOption>(FORMAS_PAGO[0]); // Tarjeta crédito default
  const [showCfdiPicker, setShowCfdiPicker] = useState(false);
  const [showFormaPagoPicker, setShowFormaPagoPicker] = useState(false);

  const portalFound = !!portalUrl;
  const hasFillResults = !!fillResults;
  const anythingFilled =
    fillResults && (fillResults.rfc || fillResults.nombre || fillResults.email || fillResults.codigoPostal);

  const targetUrl = portalUrl
    ?? SEARCH_URL_TEMPLATE.replace('{businessName}', encodeURIComponent(businessName));

  function openPortal() {
    navigation.navigate('WebView', {
      businessName,
      portalUrl: targetUrl,
      fillScript: fillScript,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Status banner ───────────────────────────────── */}
        <View style={[styles.statusBanner, portalFound ? styles.bannerOk : styles.bannerWarn]}>
          <Text style={styles.statusIcon}>{portalFound ? '✓' : '○'}</Text>
          <View style={styles.statusText}>
            <Text style={[styles.statusTitle, portalFound ? styles.statusTitleOk : styles.statusTitleWarn]}>
              {portalFound ? `Portal encontrado · ${businessName}` : 'Portal no identificado'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {portalFound
                ? hasFillResults && anythingFilled
                  ? 'Formulario completado en segundo plano'
                  : 'Portal cargado — completa los datos restantes'
                : `Buscaremos "${businessName} facturación" en Google`}
            </Text>
          </View>
        </View>

        {/* ── Auto-filled fields ──────────────────────────── */}
        {hasFillResults && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos completados automáticamente</Text>
            <AutoFilledRow label="RFC"                   filled={fillResults!.rfc} />
            <AutoFilledRow label="Nombre / Razón Social" filled={fillResults!.nombre} />
            <AutoFilledRow label="Correo Electrónico"    filled={fillResults!.email} />
            <AutoFilledRow label="Código Postal"         filled={fillResults!.codigoPostal} />
            {fillResults!.hasCaptcha && (
              <View style={styles.captchaWarning}>
                <Text style={styles.captchaWarningText}>
                  ⚠️  El portal tiene CAPTCHA — tendrás que completarlo manualmente.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* When portal not found: show copyable fiscal data */}
        {!portalFound && fiscalData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tus datos fiscales (para copiar)</Text>
            <CopyableField label="RFC"                   value={fiscalData.rfc} />
            <CopyableField label="Nombre / Razón Social" value={fiscalData.nombre} />
            <CopyableField label="Correo Electrónico"    value={fiscalData.email} />
            <CopyableField label="Código Postal"         value={fiscalData.codigoPostal} />
            <CopyableField label="Dirección Fiscal"      value={fiscalData.direccion} />
          </View>
        )}

        {/* ── Fields that always need user input ─────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confirma estos datos</Text>
          <Text style={styles.cardSubtitle}>
            Estos campos siempre requieren tu decisión.
          </Text>

          {/* CFDI Uso picker */}
          <Text style={styles.fieldLabel}>Uso del CFDI</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCfdiPicker(true)}
          >
            <View style={styles.pickerCodeBadge}>
              <Text style={styles.pickerCodeText}>{cfdiUso.code}</Text>
            </View>
            <Text style={styles.pickerLabel} numberOfLines={1}>{cfdiUso.label}</Text>
            <Text style={styles.pickerChevron}>▼</Text>
          </TouchableOpacity>

          {/* Forma de pago picker */}
          <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Forma de Pago</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowFormaPagoPicker(true)}
          >
            <View style={styles.pickerCodeBadge}>
              <Text style={styles.pickerCodeText}>{formaPago.code}</Text>
            </View>
            <Text style={styles.pickerLabel} numberOfLines={1}>{formaPago.label}</Text>
            <Text style={styles.pickerChevron}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* ── Main CTA ────────────────────────────────────── */}
        <TouchableOpacity style={styles.ctaButton} onPress={openPortal}>
          <Text style={styles.ctaText}>
            {portalFound ? 'Abrir Portal de Facturación →' : 'Buscar Portal en Google →'}
          </Text>
        </TouchableOpacity>

        {/* ── Limitations section ─────────────────────────── */}
        <LimitationsSection />

      </ScrollView>

      {/* Pickers */}
      <OptionPicker
        visible={showCfdiPicker}
        title="Uso del CFDI"
        options={CFDI_USOS}
        onSelect={setCfdiUso}
        onClose={() => setShowCfdiPicker(false)}
      />
      <OptionPicker
        visible={showFormaPagoPicker}
        title="Forma de Pago"
        options={FORMAS_PAGO}
        onSelect={setFormaPago}
        onClose={() => setShowFormaPagoPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.md,
  },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  bannerOk: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  bannerWarn: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  statusIcon: {
    fontSize: 28,
    lineHeight: 34,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusTitleOk: {
    color: COLORS.accent,
  },
  statusTitleWarn: {
    color: COLORS.warning,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },

  // Auto-filled rows
  autoFilledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFilled: {
    backgroundColor: COLORS.accent,
  },
  dotMissed: {
    backgroundColor: COLORS.border,
  },
  autoFilledLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  autoFilledLabelMissed: {
    color: COLORS.textSecondary,
  },
  autoFilledStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusOk: {
    color: COLORS.accent,
  },
  statusMiss: {
    color: COLORS.disabled,
  },
  captchaWarning: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.warningBg,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  captchaWarningText: {
    fontSize: 13,
    color: COLORS.warning,
  },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },

  // Picker button
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  pickerCodeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pickerCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pickerLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerChevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // CTA button
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: SPACING.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sheetSectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetOptionCode: {
    width: 44,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  sheetCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sheetOptionLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },

  // Limitations section
  limitationsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  limitationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  limitationsTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  limitationsChevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  limitationsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  limitationItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  limitationIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  limitationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
