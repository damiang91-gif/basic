import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AutoStep } from '../types';
import { COLORS, SPACING } from '../constants';

interface Step {
  id: AutoStep;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { id: 'ocr',     label: 'Leyendo ticket',    sublabel: 'Extrayendo datos...' },
  { id: 'finding', label: 'Buscando portal',   sublabel: 'Identificando negocio...' },
  { id: 'filling', label: 'Completando datos', sublabel: 'Llenando formulario...' },
  { id: 'ready',   label: 'Listo',             sublabel: 'Todo completado' },
];

const STEP_INDEX: Record<AutoStep, number> = {
  ocr: 0,
  finding: 1,
  filling: 2,
  ready: 3,
};

interface Props {
  currentStep: AutoStep;
  businessName?: string;
}

export default function ProgressSteps({ currentStep, businessName }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentIndex = STEP_INDEX[currentStep];

  useEffect(() => {
    if (currentStep === 'ready') {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [currentStep]);

  // Dynamic sublabel for the finding step
  const getSublabel = (step: Step, idx: number) => {
    if (step.id === 'finding' && businessName && currentIndex >= 1) {
      return `"${businessName}"`;
    }
    return step.sublabel;
  };

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <View key={step.id} style={styles.stepRow}>
            {/* Connector line above (except first) */}
            {idx > 0 && (
              <View
                style={[
                  styles.connector,
                  isDone || isCurrent ? styles.connectorActive : styles.connectorInactive,
                ]}
              />
            )}

            {/* Circle indicator */}
            <View style={styles.circleRow}>
              {isCurrent ? (
                <Animated.View
                  style={[styles.circle, styles.circleActive, { transform: [{ scale: pulseAnim }] }]}
                >
                  <View style={styles.innerDot} />
                </Animated.View>
              ) : isDone ? (
                <View style={[styles.circle, styles.circleDone]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              ) : (
                <View style={[styles.circle, styles.circleFuture]} />
              )}

              {/* Step text */}
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.label,
                    isDone && styles.labelDone,
                    isCurrent && styles.labelActive,
                    isFuture && styles.labelFuture,
                  ]}
                >
                  {step.label}
                </Text>
                {(isCurrent || isDone) && (
                  <Text style={[styles.sublabel, isDone && styles.sublabelDone]}>
                    {isDone && step.id !== 'ready' ? 'Completado' : getSublabel(step, idx)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const CIRCLE_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  stepRow: {
    alignItems: 'flex-start',
  },
  connector: {
    width: 2,
    height: 24,
    marginLeft: CIRCLE_SIZE / 2 - 1,
  },
  connectorActive: {
    backgroundColor: COLORS.accent,
  },
  connectorInactive: {
    backgroundColor: COLORS.border,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  circleDone: {
    backgroundColor: COLORS.accent,
  },
  circleFuture: {
    backgroundColor: COLORS.border,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  labelActive: {
    color: COLORS.primary,
    fontSize: 16,
  },
  labelDone: {
    color: COLORS.accent,
  },
  labelFuture: {
    color: COLORS.disabled,
    fontWeight: '400',
  },
  sublabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sublabelDone: {
    color: COLORS.accent,
    fontWeight: '500',
  },
});
