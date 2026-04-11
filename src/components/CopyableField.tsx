import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING } from '../constants';

interface Props {
  label: string;
  value: string;
}

export default function CopyableField({ label, value }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2} selectable>
          {value}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.copyButton, copied && styles.copiedButton]}
        onPress={handleCopy}
        accessibilityLabel={`Copiar ${label}`}
      >
        <Text style={styles.copyIcon}>{copied ? '✓' : '📋'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copiedButton: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.accent,
  },
  copyIcon: {
    fontSize: 18,
  },
});
