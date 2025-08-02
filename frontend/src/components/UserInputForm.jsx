// frontend/src/components/UserInputForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase if all required config values are present
let auth;
if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

const UserInputForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    personalityData: { mbti: '', enneagram: '' },
    humanDesign: { type: '', authority: '' },
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = await handleLogin();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user-input`,
        {
          user_id: userId,
          name: formData.name,
          birth_date: formData.birthDate,
          birth_time: formData.birthTime,
          birth_place: formData.birthPlace,
          personality_data: formData.personalityData,
          human_design: formData.humanDesign,
        },
        {
          headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit data');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
      <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
      <input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} />
      <input type="text" name="birthPlace" placeholder="Birth Place" value={formData.birthPlace} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserInputForm;