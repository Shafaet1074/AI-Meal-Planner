"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function UserProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    goalType: "maintain",
    calorieGoal: "",
  });

  const [bmi, setBmi] = useState(null);
  const [bmiStatus, setBmiStatus] = useState("");

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBMI = () => {
    const { height, weight } = formData;
    if (!height || !weight) return;
    const heightM = height / 100;
    const bmiValue = (weight / (heightM * heightM)).toFixed(1);
    setBmi(bmiValue);

    let status = "";
    if (bmiValue < 18.5) status = "Underweight 😐";
    else if (bmiValue < 25) status = "Normal ✅";
    else if (bmiValue < 30) status = "Overweight ⚠️";
    else status = "Obese 🚨";
    setBmiStatus(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateBMI();
    // Here you’d POST formData + BMI to backend
    console.log("Submitted:", { ...formData, bmi });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-10 border border-green-100"
      >
        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
          Complete Your Health Profile 🌿
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Let’s personalize your AI meal plan based on your body metrics and goals.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. Alif Rahman"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Age</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. 24"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Activity Level</label>
            <select
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              required
            >
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. 172"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. 68"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Goal Type</label>
            <select
              name="goalType"
              value={formData.goalType}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="maintain">Maintain Weight</option>
              <option value="lose">Lose Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Daily Calorie Goal (optional)
            </label>
            <input
              name="calorieGoal"
              type="number"
              value={formData.calorieGoal}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. 2200"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="md:col-span-2 mt-4 w-full py-3 bg-green-500 text-white font-semibold rounded-xl shadow hover:bg-green-600 transition"
          >
            Calculate BMI & Save
          </motion.button>
        </form>

        {bmi && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 text-center"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Your BMI: <span className="text-green-600">{bmi}</span>
            </h2>
            <p className="text-gray-600 mt-2">{bmiStatus}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
