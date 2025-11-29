import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  gradientColors?: [string, string, ...string[]];
  className?: string;
}

const GlassView: React.FC<GlassViewProps> = ({ 
  children, 
  intensity = 20, 
  gradientColors, 
  style, 
  className,
  ...props 
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!isDark) {
    // Fallback for light mode (no glass effect, just solid background)
    return (
      <View style={[styles.lightContainer, style]} className={className} {...props}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} className={`overflow-hidden ${className}`} {...props}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      {gradientColors && (
         <LinearGradient
           colors={gradientColors}
           style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
           locations={[0, 1]}
         />
      )}
      <View style={{ backgroundColor: 'transparent' }} className="flex-1">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // borderRadius is usually handled by className or style prop
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  }
});

export default GlassView;
