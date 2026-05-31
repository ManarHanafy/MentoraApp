import React, { useRef, useEffect } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

interface SwipeContainerProps {
  children: React.ReactNode;
}

const TAB_ORDER = ['Home', 'Chat', 'Journal', 'Insights', 'Profile'];

export function SwipeContainer({ children }: SwipeContainerProps) {
  const navigation = useNavigation();
  const state = useNavigationState(s => s);
  const { isRTL } = useLanguage();

  const stateRef = useRef(state);
  const isRTLRef = useRef(isRTL);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Detect horizontal swipe: significant dx, small dy
        return Math.abs(gestureState.dx) > 40 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentState = stateRef.current;
        const currentIsRTL = isRTLRef.current;
        if (!currentState) return;
        
        let currentTabName = '';
        
        // 1. If current state is the Tab Navigator's state
        if (currentState.routes.some(r => TAB_ORDER.includes(r.name))) {
          const activeRoute = currentState.routes[currentState.index];
          currentTabName = activeRoute?.name || '';
        } 
        // 2. If current state is the parent Stack Navigator's state
        else {
          const mainRoute = currentState.routes.find(r => r.name === 'Main');
          if (mainRoute && mainRoute.state) {
            const tabState = mainRoute.state;
            const activeRoute = tabState.routes[tabState.index ?? 0];
            currentTabName = activeRoute?.name || '';
          }
        }

        const currentIndex = TAB_ORDER.indexOf(currentTabName);
        if (currentIndex === -1) return;

        // In both RTL and LTR, a left swipe (finger moves right to left, dx < -50)
        // should visually move to the next screen to the left/right, which corresponds to index + 1.
        // And a right swipe (finger moves left to right, dx > 50) corresponds to index - 1.
        let indexShift = 0;
        if (gestureState.dx < -50) {
          indexShift = 1;
        } else if (gestureState.dx > 50) {
          indexShift = -1;
        }

        if (indexShift !== 0) {
          const targetIndex = currentIndex + indexShift;
          if (targetIndex >= 0 && targetIndex < TAB_ORDER.length) {
            navigation.navigate(TAB_ORDER[targetIndex] as never);
          }
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

