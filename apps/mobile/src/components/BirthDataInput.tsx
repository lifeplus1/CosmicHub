import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

interface BirthDataForm {
  date: string;
  time: string;
  city: string;
  timezone: string;
}

interface Props {
  onSubmit: (data: BirthDataForm) => void;
  loading?: boolean;
}

export function BirthDataInput({ onSubmit, loading = false }: Props) {
  const [formData, setFormData] = useState<BirthDataForm>({
    date: '',
    time: '',
    city: '',
    timezone: '',
  });

  const handleSubmit = () => {
    // Basic validation
    const { date, time, city } = formData;
    if (date === '' || time === '' || city === '') {
      // In real app, show validation error
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Birth Information</Text>
      <Text style={styles.subtitle}>
        Enter your birth details to generate your chart
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date</Text>
          <TextInput
            style={styles.input}
            placeholder='YYYY-MM-DD'
            placeholderTextColor='#666'
            value={formData.date}
            onChangeText={text => setFormData({ ...formData, date: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Time</Text>
          <TextInput
            style={styles.input}
            placeholder='HH:MM (24-hour format)'
            placeholderTextColor='#666'
            value={formData.time}
            onChangeText={text => setFormData({ ...formData, time: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth City</Text>
          <TextInput
            style={styles.input}
            placeholder='City, Country'
            placeholderTextColor='#666'
            value={formData.city}
            onChangeText={text => setFormData({ ...formData, city: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Timezone (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., America/New_York'
            placeholderTextColor='#666'
            value={formData.timezone}
            onChangeText={text => setFormData({ ...formData, timezone: text })}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            loading ? styles.submitButtonDisabled : undefined,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Generating Chart...' : 'Generate Birth Chart'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Need Help?</Text>
        <Text style={styles.infoText}>
          • Birth time should be as accurate as possible
        </Text>
        <Text style={styles.infoText}>
          • If you don&apos;t know the exact time, use 12:00 PM
        </Text>
        <Text style={styles.infoText}>
          • Location affects house calculations
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000014',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#4a4a6a',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#1a1a2e',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a4a6a',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
    lineHeight: 18,
  },
});
