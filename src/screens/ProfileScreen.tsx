import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, FiscalData } from '../types';
import { COLORS, SPACING } from '../constants';
import { useUserData } from '../hooks/useUserData';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

function validateRfc(rfc: string) {
  return /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/i.test(rfc.trim());
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateCp(cp: string) {
  return /^\d{5}$/.test(cp.trim());
}

export default function ProfileScreen({ navigation }: Props) {
  const { fiscalData, saveFiscalData, gcvApiKey, saveGcvApiKey } = useUserData();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [rfc, setRfc] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [direccion, setDireccion] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (fiscalData) {
      setRfc(fiscalData.rfc);
      setNombre(fiscalData.nombre);
      setEmail(fiscalData.email);
      setCodigoPostal(fiscalData.codigoPostal);
      setDireccion(fiscalData.direccion);
    }
    if (gcvApiKey) {
      setApiKey(gcvApiKey);
    }
  }, [fiscalData, gcvApiKey]);

  async function handleSave() {
    if (!rfc.trim() || !nombre.trim() || !email.trim() || !codigoPostal.trim() || !direccion.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }
    if (!validateRfc(rfc)) {
      Alert.alert('RFC inválido', 'El RFC debe tener el formato correcto (ej: XAXX010101000).');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }
    if (!validateCp(codigoPostal)) {
      Alert.alert('Código Postal inválido', 'El Código Postal debe tener exactamente 5 dígitos.');
      return;
    }

    const data: FiscalData = {
      rfc: rfc.trim().toUpperCase(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      codigoPostal: codigoPostal.trim(),
      direccion: direccion.trim(),
    };

    await saveFiscalData(data);

    if (apiKey.trim()) {
      await saveGcvApiKey(apiKey.trim());
    }

    Alert.alert('Guardado', 'Tus datos fiscales se guardaron correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Datos Fiscales</Text>

        <Field label="RFC *">
          <TextInput
            style={styles.input}
            value={rfc}
            onChangeText={setRfc}
            autoCapitalize="characters"
            maxLength={13}
            placeholder="XAXX010101000"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Field>

        <Field label="Nombre / Razón Social *">
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            placeholder="Mi Empresa SA de CV"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Field>

        <Field label="Correo Electrónico *">
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="correo@ejemplo.com"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Field>

        <Field label="Código Postal *">
          <TextInput
            style={styles.input}
            value={codigoPostal}
            onChangeText={setCodigoPostal}
            keyboardType="numeric"
            maxLength={5}
            placeholder="06600"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Field>

        <Field label="Dirección Fiscal *">
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={direccion}
            onChangeText={setDireccion}
            multiline
            numberOfLines={3}
            placeholder="Calle, Número, Colonia, Ciudad"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Field>

        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? '▲' : '▼'} Configuración Avanzada (OCR)
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedSection}>
            <Text style={styles.advancedHint}>
              Ingresa tu clave de Google Cloud Vision API para que la app detecte
              automáticamente el nombre del negocio en tus tickets.
              Sin esta clave, podrás ingresar el nombre manualmente.
            </Text>
            <Field label="Google Cloud Vision API Key">
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                placeholder="AIza..."
                placeholderTextColor={COLORS.textSecondary}
              />
            </Field>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  advancedToggle: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  advancedToggleText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  advancedSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  advancedHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
