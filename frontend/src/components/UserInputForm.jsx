// frontend/src/components/UserInputForm.jsx
import React, { useState } from "react";
import axios from "axios";

const UserInputForm = ({ userId }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    personalityData: { mbti: "", enneagram: "" },
    humanDesign: { type: "", authority: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit data");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="date"
        name="birthDate"
        value={formData.birthDate}
        onChange={handleChange}
      />
      <input
        type="time"
        name="birthTime"
        value={formData.birthTime}
        onChange={handleChange}
      />
      <input
        type="text"
        name="birthPlace"
        placeholder="Birth Place"
        value={formData.birthPlace}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserInputForm;