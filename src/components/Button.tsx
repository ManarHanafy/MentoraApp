import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme';
import { styles } from './Button.style';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}: ButtonProps & Omit<React.ComponentProps<typeof TouchableOpacity>, keyof ButtonProps>): React.ReactElement {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isOutline && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
      ]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isSecondary ? colors.primary : '#FFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.textSecondary,
            isOutline && styles.textOutline,
            textStyle,
          ]}
          allowFontScaling={true}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default Button;
