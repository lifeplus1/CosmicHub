import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
  onDismiss?: () => void;
}

export function Notification({ title, message, type = 'info', onDismiss }: Props) {
  const typeStyles = {
    info: { backgroundColor: '#1a1a2e', borderColor: '#4a90e2' },
    error: { backgroundColor: '#2e1a1a', borderColor: '#e74c3c' },
    success: { backgroundColor: '#1a2e1a', borderColor: '#32d74b' },
    warning: { backgroundColor: '#2e2a1a', borderColor: '#ff9500' },
  };

  return (
    <View style={[styles.container, typeStyles[type]]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 12,
  },
  dismissText: {
    color: '#ccc',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
