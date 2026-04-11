import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { FiscalData } from '../types';
import { COLORS, SPACING } from '../constants';
import CopyableField from './CopyableField';

interface Props {
  fiscalData: FiscalData;
}

const COLLAPSED_HEIGHT = 52;

export default function FiscalDataPanel({ fiscalData }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const animHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  function onContentLayout(e: LayoutChangeEvent) {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== expandedHeight) {
      setExpandedHeight(h);
    }
  }

  function toggle() {
    const toValue = isExpanded ? COLLAPSED_HEIGHT : expandedHeight || 300;
    Animated.timing(animHeight, {
      toValue,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  }

  return (
    <Animated.View style={[styles.panel, { height: animHeight }]}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.dragHandle} />
        <Text style={styles.headerTitle}>📋  Mis Datos Fiscales</Text>
        <Text style={styles.chevron}>{isExpanded ? '▼' : '▲'}</Text>
      </TouchableOpacity>

      <View
        style={styles.fields}
        onLayout={isExpanded ? undefined : onContentLayout}
      >
        <CopyableField label="RFC" value={fiscalData.rfc} />
        <CopyableField label="Nombre / Razón Social" value={fiscalData.nombre} />
        <CopyableField label="Correo Electrónico" value={fiscalData.email} />
        <CopyableField label="Código Postal" value={fiscalData.codigoPostal} />
        <CopyableField label="Dirección Fiscal" value={fiscalData.direccion} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: COLLAPSED_HEIGHT,
    gap: SPACING.sm,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -18,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  fields: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
