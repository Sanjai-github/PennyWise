import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, height = 8 }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(Math.max(progress, 0), 1), // Clamp between 0 and 1
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View 
      className="w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden"
      style={{ height }}
    >
      <Animated.View
        style={{
          width: widthInterpolated,
          backgroundColor: color,
          height: '100%',
          borderRadius: height / 2,
        }}
      />
    </View>
  );
};

export default ProgressBar;
