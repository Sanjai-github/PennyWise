import React from 'react';
import { Modal as RNModal, View, Pressable, Text, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-light-bg dark:bg-dark-bg rounded-t-3xl p-6 h-[85%]">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <Text 
                    className="text-light-text dark:text-dark-text text-xl font-bold"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {title}
                  </Text>
                  <Pressable 
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                  >
                    <X size={20} color={isDark ? '#E8E8E8' : '#2C2C2C'} />
                  </Pressable>
                </View>

                {/* Content */}
                <View className="flex-1">
                  {children}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default Modal;
