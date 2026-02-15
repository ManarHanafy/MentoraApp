import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './BreathingExerciseScreen.style';

const INHALE_TIME = 4000;
const HOLD_TIME = 4000;
const EXHALE_TIME = 4000;

export function BreathingExerciseScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [isActive, setIsActive] = useState(false);
  const [instruction, setInstruction] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(0); // Optional simplistic timer

  // Animation value for circle scale
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startBreathing = () => {
    setIsActive(true);
    runAnimationCycle();
  };

  const stopBreathing = () => {
    setIsActive(false);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
  };

  const runAnimationCycle = () => {
    if (!isActive) return; // check in case stopped

    // Inhale
    setInstruction('Inhale');
    Animated.timing(scaleAnim, {
      toValue: 1.5,
      duration: INHALE_TIME,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Hold
      setInstruction('Hold');
      setTimeout(() => {
        // Exhale
        setInstruction('Exhale');
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: EXHALE_TIME,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          // Loop
          if (isActive) { // Check active ref/state if needing strictness, but recursion works nicely with state check at top
            runAnimationCycle();
          }
        });
      }, HOLD_TIME);
    });
  };

  // Re-trigger loop if active state persists (simple recursion above might miss state update timing without ref, 
  // but for this simple demo, we can just chain logic. Better: useEffect)

  useEffect(() => {
    let isMounted = true;
    if (isActive) {
      const loop = () => {
        if (!isMounted || !isActive) return;

        setInstruction('Inhale');
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: INHALE_TIME,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          if (!isMounted) return;

          setInstruction('Hold');
          setTimeout(() => {
            if (!isMounted || !isActive) return;

            setInstruction('Exhale');
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: EXHALE_TIME,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished && isMounted && isActive) loop();
            });
          }, HOLD_TIME);
        });
      };
      loop();
    }
    return () => { isMounted = false; scaleAnim.stopAnimation(); };
  }, [isActive]);


  if (isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.activeContainer}>
          <View style={styles.circleWrap}>
            <Animated.View
              style={[
                styles.breathingCircle,
                { transform: [{ scale: scaleAnim }] }
              ]}
            />
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.4)',
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            />
          </View>
          <Text style={styles.instructionText}>{instruction}</Text>

          <TouchableOpacity style={styles.stopBtn} onPress={stopBreathing}>
            <Text style={styles.stopBtnText}>End Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Breathing</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.illustration}>
          <Text style={styles.illustrationIcon}>🧘</Text>
        </View>
        <Text style={styles.title}>Mindful Breathing</Text>
        <Text style={styles.description}>
          A simple 4-4-4 breathing technique to help you reduce stress and find your center in just a few minutes.
        </Text>

        <TouchableOpacity style={styles.startBtn} onPress={startBreathing}>
          <Text style={styles.startBtnText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default BreathingExerciseScreen;
