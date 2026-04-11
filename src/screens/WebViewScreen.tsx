import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import * as Linking from 'expo-linking';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, MOBILE_UA, SPACING } from '../constants';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'WebView'>;
  route: RouteProp<RootStackParamList, 'WebView'>;
};

export default function WebViewScreen({ navigation, route }: Props) {
  const { businessName, portalUrl, fillScript } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(portalUrl);
  const [scriptInjected, setScriptInjected] = useState(false);
  const webviewRef = useRef<WebView>(null);

  function onNavigationStateChange(state: WebViewNavigation) {
    setCurrentUrl(state.url);
    // Re-inject on navigation if user navigates away and back (reset flag)
    if (!state.loading && state.url !== portalUrl) {
      setScriptInjected(false);
    }
  }

  function handleLoadEnd() {
    setIsLoading(false);
    // Inject the fill script once, after the page finishes loading
    if (fillScript && !scriptInjected) {
      webviewRef.current?.injectJavaScript(fillScript);
      setScriptInjected(true);
    }
  }

  function openInBrowser() {
    Linking.openURL(currentUrl).catch(() => {});
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>{businessName}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Portal de Facturación</Text>
          </View>

          {isLoading && <ActivityIndicator size="small" color="#fff" />}

          <TouchableOpacity style={styles.iconBtn} onPress={openInBrowser}>
            <Text style={styles.browserIcon}>🌐</Text>
          </TouchableOpacity>
        </View>

        {fillScript && (
          <View style={styles.preFillBanner}>
            <Text style={styles.preFillText}>
              ✓ Datos pre-cargados automáticamente
            </Text>
          </View>
        )}
      </SafeAreaView>

      <WebView
        ref={webviewRef}
        source={{ uri: portalUrl }}
        style={styles.webview}
        userAgent={MOBILE_UA}
        javaScriptEnabled
        domStorageEnabled
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingView}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando portal...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerSafe: {
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    minHeight: 52,
  },
  iconBtn: {
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
  browserIcon: {
    fontSize: 20,
  },
  titleWrap: {
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
  preFillBanner: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  preFillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingView: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
