import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SPACING } from '../constants';
import { useUserData } from '../hooks/useUserData';
import FiscalDataPanel from '../components/FiscalDataPanel';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'WebView'>;
  route: RouteProp<RootStackParamList, 'WebView'>;
};

const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export default function WebViewScreen({ navigation, route }: Props) {
  const { businessName, searchUrl } = route.params;
  const { fiscalData } = useUserData();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(searchUrl);
  const webviewRef = useRef<WebView>(null);

  function onNavigationStateChange(state: WebViewNavigation) {
    setCurrentUrl(state.url);
  }

  function openInBrowser() {
    Linking.openURL(currentUrl).catch(() => {});
  }

  return (
    <View style={styles.container}>
      {/* Custom header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {businessName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Portal de Facturación
            </Text>
          </View>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loadingIndicator}
            />
          )}

          <TouchableOpacity style={styles.browserButton} onPress={openInBrowser}>
            <Text style={styles.browserIcon}>🌐</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* WebView */}
      <WebView
        ref={webviewRef}
        source={{ uri: searchUrl }}
        style={styles.webview}
        userAgent={MOBILE_UA}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={onNavigationStateChange}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.webviewLoadingText}>Cargando portal...</Text>
          </View>
        )}
      />

      {/* Fiscal data panel */}
      {fiscalData ? (
        <FiscalDataPanel fiscalData={fiscalData} />
      ) : (
        <View style={styles.noProfileBanner}>
          <Text style={styles.noProfileText}>
            ⚠️  Sin perfil fiscal configurado —{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.noProfileLink}>Configurar ahora</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafe: {
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    minHeight: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  loadingIndicator: {
    marginHorizontal: SPACING.xs,
  },
  browserButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browserIcon: {
    fontSize: 22,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  webviewLoadingText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  noProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning,
  },
  noProfileText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '500',
  },
  noProfileLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
