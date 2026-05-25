import React, { useRef } from 'react';
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Detect horizontal swipe: significant dx, small dy
        // And ensure it is a swipe, not a light tap or scroll conflict
        return Math.abs(gestureState.dx) > 40 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!state) return;
        
        // Find the active tab in MainTabs
        let mainRoute = state.routes.find(r => r.name === 'Main') || state.routes[state.index];
        if (!mainRoute) return;
        
        let currentTabName = '';
        if (mainRoute.state) {
          const mainState = mainRoute.state;
          const activeIndex = mainState.index ?? 0;
          const activeRoute = mainState.routes[activeIndex];
          currentTabName = activeRoute?.name || '';
        } else {
          currentTabName = mainRoute.name;
        }

        const currentIndex = TAB_ORDER.indexOf(currentTabName);
        if (currentIndex === -1) return;

        // Determine forward/backward index shift based on swipe direction and RTL
        let indexShift = 0;
        
        if (gestureState.dx < -50) {
          // Swiped left (finger moves right to left)
          // In LTR, this is Next Tab (+1). In RTL, this is Previous Tab (-1).
          indexShift = isRTL ? -1 : 1;
        } else if (gestureState.dx > 50) {
          // Swiped right (finger moves left to right)
          // In LTR, this is Previous Tab (-1). In RTL, this is Next Tab (+1).
          indexShift = isRTL ? 1 : -1;
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
