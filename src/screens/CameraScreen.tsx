import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING } from '../constants';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Camera'>;
};

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
        <Text style={styles.permissionText}>
          FacturaFácil necesita acceso a tu cámara para fotografiar los tickets.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.permissionSecondary}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.permissionSecondaryText}>Cancelar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function takePicture() {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        navigation.navigate('Processing', { photoUri: photo.uri });
      }
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    } finally {
      setTaking(false);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Processing', { photoUri: result.assets[0].uri });
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
      >
        {/* Top controls */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Fotografía tu Ticket</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
          >
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Viewfinder guide */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder} />
          <Text style={styles.viewfinderHint}>Centra el ticket en el recuadro</Text>
        </View>

        {/* Bottom controls */}
        <SafeAreaView style={styles.bottomBar}>
          <TouchableOpacity style={styles.sideButton} onPress={pickFromGallery}>
            <Text style={styles.sideButtonIcon}>🖼️</Text>
            <Text style={styles.sideButtonText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, taking && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={taking}
          >
            {taking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, torch && styles.torchActive]}
            onPress={() => setTorch(t => !t)}
          >
            <Text style={styles.sideButtonIcon}>💡</Text>
            <Text style={styles.sideButtonText}>{torch ? 'Flash On' : 'Flash'}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
  },
  viewfinderHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: SPACING.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
  },
  torchActive: {
    backgroundColor: 'rgba(255,200,0,0.3)',
  },
  sideButtonIcon: {
    fontSize: 24,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionSecondary: {
    padding: SPACING.md,
  },
  permissionSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});
