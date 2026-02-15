import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { styles } from './Card.style';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style, ...rest }: CardProps & React.ComponentProps<typeof View>): React.ReactElement {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

export default Card;
