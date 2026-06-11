import { useRef } from "react";
import { Animated } from "react-native";

/** Yatay "sallama" animasyonu (yanlış girişte). */
export function useShake() {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(x, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  return { x, shake };
}
