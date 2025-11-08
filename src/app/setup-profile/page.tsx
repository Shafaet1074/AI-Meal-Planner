"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { createClient } from "@supabase/supabase-js";
import {  Spin, message } from "antd";

/* ---------- Supabase client ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ---------- Step definitions ---------- */
type HeightUnit = "cm" | "ftin";

export default function SetupProfilePage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user);

  /* ---------- form state ---------- */
  const [step, setStep] = useState(0); // 0..6
  const totalSteps = 7;

  const [age, setAge] = useState<string>(user?.age?.toString() || "");
  const [name, setName] = useState<string>(user?.displayName || "");
  const [gender, setGender] = useState<string>("male");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>(""); // feet
  const [heightIn, setHeightIn] = useState<string>(""); // inches

  const [weight, setWeight] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [goal, setGoal] = useState<string>("maintain");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ---------- fetch existing profile to prefill ---------- */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) {
        setFetching(false);
        return;
      }
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          if (data.age) setAge(String(data.age));
          if (data.name) setName(data.name);
          if (data.gender) setGender(data.gender);
          if (data.height) {
            // assume stored in cm
            setHeightCm(String(data.height));
            setHeightUnit("cm");
          }
          if (data.weight) setWeight(String(data.weight));
          if (data.activity_level) setActivityLevel(data.activity_level);
          if (data.goal) setGoal(data.goal);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        message.error("Failed to load profile.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  /* ---------- helpers ---------- */
  const heightInCm = useMemo(() => {
    if (heightUnit === "cm") {
      const n = parseFloat(heightCm || "0");
      return isNaN(n) ? null : n;
    } else {
      const ft = parseFloat(heightFt || "0");
      const inch = parseFloat(heightIn || "0");
      if (isNaN(ft) && isNaN(inch)) return null;
      const totalInches = (isNaN(ft) ? 0 : ft * 12) + (isNaN(inch) ? 0 : inch);
      if (totalInches <= 0) return null;
      const cm = totalInches * 2.54;
      return cm;
    }
  }, [heightUnit, heightCm, heightFt, heightIn]);

  const bmiValue = useMemo(() => {
    const h = heightInCm;
    const w = parseFloat(weight || "0");
    if (!h || isNaN(w) || w <= 0) return null;
    const m = h / 100;
    const bmi = w / (m * m);
    return isNaN(bmi) ? null : bmi;
  }, [heightInCm, weight]);

  const bmiCategory = useMemo(() => {
    if (bmiValue == null) return "";
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  }, [bmiValue]);

  const suggestedGoal = useMemo(() => {
    if (bmiValue == null) return "maintain";
    if (bmiValue < 18.5) return "gain";
    if (bmiValue >= 18.5 && bmiValue < 25) return "maintain";
    return "lose";
  }, [bmiValue]);

  /* ---------- UI step content ---------- */
  // const StepCard: React.FC<{ img: string; title: string; subtitle?: string }> = ({
  //   img,
  //   title,
  //   subtitle,
  //   children,
  // }) => {
  //   return (
  //     <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
  //       <div className="relative w-full md:w-1/2 h-48 md:h-auto">
  //         <Image src={img} alt={title} fill className="object-cover" priority />
  //         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
  //         <div className="absolute bottom-4 left-4 text-white">
  //           <h3 className="text-xl font-bold">{title}</h3>
  //           {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
  //         </div>
  //       </div>

  //       <div className="p-6 w-full md:w-1/2">
  //         {children}
  //       </div>
  //     </div>
  //   );
  // };

  /* ---------- navigation ---------- */
  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  /* ---------- validate step ---------- */
  const validateCurrentStep = (): boolean => {
    // Lightweight validation per step
    switch (step) {
      case 0: // Age
        return !!age && parseInt(age) > 0 && parseInt(age) < 120;
      case 1: // Name
        return name.trim().length >= 2;
      case 2: // Gender
        return ["male", "female"].includes(gender);
      case 3: // Height
        if (heightUnit === "cm") {
          const v = parseFloat(heightCm || "0");
          return !isNaN(v) && v > 50 && v < 300;
        } else {
          const ft = parseInt(heightFt || "0");
          const inch = parseInt(heightIn || "0");
          return (ft > 0 && ft < 9) && (inch >= 0 && inch < 12);
        }
      case 4: // Weight -> BMI preview step
        const w = parseFloat(weight || "0");
        return !isNaN(w) && w > 10 && w < 500 && heightInCm != null;
      case 5: // Exercise
        return ["sedentary", "light", "moderate", "active", "very-active"].includes(activityLevel);
      case 6: // Goal
        return ["lose", "maintain", "gain"].includes(goal);
      default:
        return true;
    }
  };

  /* ---------- submit to supabase ---------- */
  const handleSubmit = async () => {
    // Final submit (similar to your original code)
    if (!validateCurrentStep()) {
      message.error("Please complete the final step correctly before submitting.");
      return;
    }

    setLoading(true);

    const finalBmi = bmiValue ? parseFloat(bmiValue.toFixed(1)) : null;
    const profileData = {
      user_id: user?.uid || null,
      email: user?.email || null,
      name: name || null,
      age: age ? parseInt(age) : null,
      gender,
      height: heightInCm || null,
      weight: weight ? parseFloat(weight) : null,
      bmi: finalBmi,
      bmi_category: bmiCategory || null,
      activity_level: activityLevel,
      goal,
      updated_at: new Date(),
      created_at: new Date(),
    };

    try {
      // Check if profile exists
      const { data: existingProfile, error: existErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user?.email)
        .maybeSingle();

      if (existErr) throw existErr;

      let result;
      if (existingProfile && existingProfile.id) {
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("email", user?.email);
      } else {
        result = await supabase.from("profiles").insert([profileData]);
      }

      if (result.error) throw result.error;

      message.success("Profile saved successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      message.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- render loading ---------- */
  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin tip="Loading profile..." size="large" />
      </div>
    );

  /* ---------- progress percentage ---------- */
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-white">
      <div className="w-full max-w-4xl space-y-6">
        {/* progress bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div>Step {step + 1} of {totalSteps}</div>
          <div>{progressPercent}%</div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
         {step === 0 && (
            <div className="flex flex-col items-center  text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Nutritional goals? No problem.
              </h2>
              <p className="text-gray-500 max-w-sm">
                Choose your age group to personalize your experience.
              </p>

              {/* Age group cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mt-6">
                {[
                  { id: "teen", label: "13–19", img: "/boy.png" },
                  { id: "adult", label: "20–35", img: "/boy1.jpg" },
                  { id: "middle", label: "36–55", img: "/man.png" },
                  { id: "senior", label: "56+", img: "/old.jpg" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAge(item.label)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      age === item.label
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="relative w-24 h-24 mb-2">
                      <Image
                        src={item.img}
                        alt={item.label}
                        fill
                        className="object-contain rounded-full"
                      />
                    </div>
                    <span className="font-medium text-gray-800">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {/* <div className="mt-10">
                <button
                  type="button"
                  onClick={() => {
                    if (!age) {
                      message.warning("Please select your age range.");
                      return;
                    }
                    goNext();
                  }}
                  disabled={!age}
                  className={`px-8 py-3 rounded-xl text-white font-semibold shadow-md transition ${
                    age
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div> */}
            </div>
          )}


         {step === 1 && (
          <div className="flex flex-col items-center text-center space-y-8 mt-10">
            {/* Mascot + speech bubble */}
            <div className="flex 
                  
                  items-center space-y-4 relative">
          {/* Mascot Image */}
                  <div className="relative w-64 h-52">
                    <Image
                      src="/person.jpg"
                      alt="Mascot"
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>

          {/* Speech Bubble */}
                  <div className="relative bg-white  rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
                    What’s your full name?
                    {/* Left side tail */}
                    <div
                      className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                                border-t-[10px] border-t-transparent 
                                border-b-[10px] border-b-transparent 
                                border-r-[10px] border-r-white 
                                drop-shadow-sm"
                    ></div>
                  </div>
                  </div>


            {/* Subtitle */}
            <p className="text-gray-600 max-w-lg">
              So we can personalize your experience just for you.
            </p>

            {/* Input field */}
            <div className="w-full max-w-md mt-4 space-y-2">
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p style={{marginTop:12}} className="text-xs text-gray-500">
                You can change this later in your profile settings.
              </p>
            </div>

            {/* Next button */}
        
          </div>
        )}

       {step === 2 && (
          <div className="flex flex-col items-center text-center space-y-8 mt-10">
            {/* Mascot + speech bubble */}
          <div className="flex 
          
          items-center space-y-4 relative">
  {/* Mascot Image */}
          <div className="relative w-64 h-52">
            <Image
              src="/person.jpg"
              alt="Mascot"
              fill
              className="object-contain rounded-2xl"
            />
          </div>

  {/* Speech Bubble */}
          <div className="relative bg-white  rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
            What’s your sex?
            {/* Left side tail */}
            <div
              className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                        border-t-[10px] border-t-transparent 
                        border-b-[10px] border-b-transparent 
                        border-r-[10px] border-r-white 
                        drop-shadow-sm"
            ></div>
          </div>
          </div>



            {/* Explanation text */}
            <p className="text-gray-600 max-w-lg">
              Since the formula for an accurate calorie calculation differs based on sex, we need this information to calculate your daily calorie goal.
            </p>

            {/* Gender selection cards */}
            <div className="grid grid-cols-2 gap-4 max-w-lg w-full mt-4">
              {[
                { id: "female", label: "Female", emoji: "🙋‍♀️" },
                { id: "male", label: "Male", emoji: "🙋‍♂️" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGender(option.id)}
                  type="button"
                  className={`flex flex-col items-center justify-center py-6 rounded-xl border-2 transition-all text-lg font-medium ${
                    gender === option.id
                      ? "bg-green-50 border-green-400 shadow-sm"
                      : "border-gray-200 hover:border-green-300 bg-white"
                  }`}
                >
                  <span className="text-4xl mb-2">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>

            {/* Navigation */}
          
          </div>
        )}


         {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-8 mt-10">
              {/* Mascot + speech bubble */}
              <div className="flex items-center space-y-4 relative">
                {/* Mascot Image */}
                <div className="relative w-64 h-52">
                  <Image
                    src="/person.jpg"
                    alt="Mascot"
                    fill
                    className="object-contain rounded-2xl"
                  />
                </div>

                {/* Speech Bubble */}
                <div className="relative bg-white rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
                  What’s your height?
                  {/* Left side tail */}
                  <div
                    className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                              border-t-[10px] border-t-transparent 
                              border-b-[10px] border-b-transparent 
                              border-r-[10px] border-r-white 
                              drop-shadow-sm"
                  ></div>
                </div>
              </div>

              {/* Explanation text */}
              <p className="text-gray-600 max-w-lg">
                Choose your preferred unit and enter your height below.
              </p>

              {/* Height input section */}
              <div className="space-y-4 w-full max-w-md">
                {/* Unit buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHeightUnit("cm")}
                    className={`flex-1 p-3 rounded-lg border text-lg font-medium transition-all ${
                      heightUnit === "cm"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white border-gray-300 hover:border-green-400"
                    }`}
                  >
                    CM
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit("ftin")}
                    className={`flex-1 p-3 rounded-lg border text-lg font-medium transition-all ${
                      heightUnit === "ftin"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white border-gray-300 hover:border-green-400"
                    }`}
                  >
                    Feet / Inch
                  </button>
                </div>

                {/* Conditional inputs */}
                {heightUnit === "cm" ? (
                  <input
                    type="number"
                    min={50}
                    max={300}
                    placeholder="Height in cm (e.g. 175)"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={0}
                      max={8}
                      placeholder="Feet"
                      className="w-1/2 border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      placeholder="Inches"
                      className="w-1/2 border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                    />
                  </div>
                )}

                {/* Tip text */}
                <p style={{marginTop:12}}  className="text-xs text-gray-500">
                  Tip: Accurate height improves BMI accuracy.
                </p>
              </div>
            </div>
          )}


        {step === 4 && (
          <div className="flex flex-col items-center text-center space-y-8 mt-10">
            {/* Mascot + speech bubble */}
            <div className="flex items-center space-y-4 relative">
              {/* Mascot Image */}
              <div className="relative w-64 h-52">
                <Image
                  src="/person.jpg"
                  alt="Mascot"
                  fill
                  className="object-contain rounded-2xl"
                />
              </div>

              {/* Speech Bubble */}
              <div className="relative bg-white rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
                How much do you weigh?
                {/* Left side tail */}
                <div
                  className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                              border-t-[10px] border-t-transparent 
                              border-b-[10px] border-b-transparent 
                              border-r-[10px] border-r-white 
                              drop-shadow-sm"
                ></div>
              </div>
            </div>

            {/* Explanation text */}
            <p className="text-gray-600 max-w-lg">
              Your weight is needed to calculate your BMI accurately.
            </p>

            {/* Weight input and BMI preview */}
            <div className="space-y-4 w-full max-w-md">
              {/* Weight input */}
              <input
                type="number"
                min={10}
                max={500}
                placeholder="Weight in kg (e.g. 68)"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              {/* BMI preview */}
              {bmiValue != null ? (
                <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-gray-700">
                    Estimated BMI: <strong>{bmiValue.toFixed(1)}</strong> —{" "}
                    <strong>{bmiCategory}</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Suggested goal: <strong>{suggestedGoal}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Enter your height and weight to preview BMI and suggested goal.
                </p>
              )}
            </div>
          </div>
        )}


        {step === 5 && (
  <div className="flex flex-col items-center text-center space-y-8 mt-10">
    {/* Mascot + speech bubble */}
    <div className="flex items-center space-y-4 relative">
      {/* Mascot Image */}
      <div className="relative w-64 h-52">
        <Image
          src="/person.jpg"
          alt="Mascot"
          fill
          className="object-contain rounded-2xl"
        />
      </div>

      {/* Speech Bubble */}
      <div className="relative bg-white rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
        How active are you?
        {/* Left side tail */}
        <div
          className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                      border-t-[10px] border-t-transparent 
                      border-b-[10px] border-b-transparent 
                      border-r-[10px] border-r-white 
                      drop-shadow-sm"
        ></div>
      </div>
    </div>

    {/* Explanation text */}
    <p className="text-gray-600 max-w-lg">
      Choose your typical weekly activity level below.
    </p>

    {/* Activity level selection */}
    <div className="space-y-4 w-full max-w-md">
      <select
        value={activityLevel}
        onChange={(e) => setActivityLevel(e.target.value)}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
      >
        <option value="sedentary">Sedentary (little or no exercise)</option>
        <option value="light">Lightly Active (1–3 days/week)</option>
        <option value="moderate">Moderately Active (3–5 days/week)</option>
        <option value="active">Active (6–7 days/week)</option>
        <option value="very-active">Very Active (intense daily exercise)</option>
      </select>

      <p style={{marginTop:12}} className="text-xs text-gray-500">
        Activity level affects daily calorie estimates.
      </p>
    </div>
  </div>
)}


        {step === 6 && (
  <div className="flex flex-col items-center text-center space-y-8 mt-10">
    {/* Mascot + speech bubble */}
    <div className="flex items-center space-y-4 relative">
      {/* Mascot Image */}
      <div className="relative w-64 h-52">
        <Image
          src="/person.jpg"
          alt="Mascot"
          fill
          className="object-contain rounded-2xl"
        />
      </div>

      {/* Speech Bubble */}
      <div className="relative bg-white rounded-xl shadow-sm px-5 py-3 text-gray-800 font-semibold max-w-xs">
        Choose your goal
        {/* Left side tail */}
        <div
          className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 
                      border-t-[10px] border-t-transparent 
                      border-b-[10px] border-b-transparent 
                      border-r-[10px] border-r-white 
                      drop-shadow-sm"
        ></div>
      </div>
    </div>

    {/* Explanation text */}
    <p className="text-gray-600 max-w-lg">
      We’ll tailor your meal plans based on your fitness goal.
    </p>

    {/* Goal selection section */}
    <div className="space-y-4 w-full max-w-md">
      {/* Goal buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setGoal("lose")}
          className={`p-3 rounded-lg border text-lg font-medium transition-all ${
            goal === "lose"
              ? "bg-red-100 border-red-400"
              : "bg-white border-gray-300 hover:border-red-300"
          }`}
        >
          Lose
        </button>
        <button
          type="button"
          onClick={() => setGoal("maintain")}
          className={`p-3 rounded-lg border text-lg font-medium transition-all ${
            goal === "maintain"
              ? "bg-green-100 border-green-400"
              : "bg-white border-gray-300 hover:border-green-300"
          }`}
        >
          Maintain
        </button>
        <button
          type="button"
          onClick={() => setGoal("gain")}
          className={`p-3 rounded-lg border text-lg font-medium transition-all ${
            goal === "gain"
              ? "bg-blue-100 border-blue-400"
              : "bg-white border-gray-300 hover:border-blue-300"
          }`}
        >
          Gain
        </button>
      </div>

      {/* BMI + suggested goal preview */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
        <p className="text-sm">
          BMI: <strong>{bmiValue ? bmiValue.toFixed(1) : "—"}</strong>{" "}
          ({bmiCategory || "—"})
        </p>
        <p className="text-sm">
          Suggested goal:{" "}
          <strong className="capitalize">{suggestedGoal}</strong>
        </p>
      </div>
    </div>
  </div>
)}

        </div>

        {/* navigation controls */}
        <div style={{marginTop:10}} className="flex items-center justify-between gap-4">
          <div>
            {step > 0 && (
              <button
                onClick={goBack}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                type="button"
              >
                Back
              </button>
            )}
          </div>

          <div style={{marginTop:10}} className="flex items-center gap-3">
            {/* quick preview button */}
            <div  className="text-sm text-gray-600 mr-4 hidden md:block">
              {step < totalSteps - 1 ? "Fill the step, then Next" : "Review & Submit"}
            </div>

            {step < totalSteps - 1 ? (
              <button
                onClick={() => {
                  if (!validateCurrentStep()) {
                    message.error("Please fill this step correctly before continuing.");
                    return;
                  }
                  goNext();
                }}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                type="button"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                type="button"
                disabled={loading}
              >
                {loading ? <Spin /> : "Save & Continue"}
              </button>
            )}
          </div>
        </div>

        {/* small footer: review summary if at last step */}
        {step === totalSteps - 1 && (
          <div className="bg-white/80 p-4 rounded-lg border text-sm">
            <h4 className="font-semibold mb-2">Review</h4>
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Name</strong></div><div>{name || "—"}</div>
              <div><strong>Age</strong></div><div>{age || "—"}</div>
              <div><strong>Gender</strong></div><div>{gender || "—"}</div>
              <div><strong>Height</strong></div><div>{heightInCm ? `${heightInCm.toFixed(1)} cm` : "—"}</div>
              <div><strong>Weight</strong></div><div>{weight ? `${parseFloat(weight).toFixed(1)} kg` : "—"}</div>
              <div><strong>BMI</strong></div><div>{bmiValue ? bmiValue.toFixed(1) : "—"} {bmiCategory ? `(${bmiCategory})` : ""}</div>
              <div><strong>Activity</strong></div><div>{activityLevel}</div>
              <div><strong>Goal</strong></div><div className="capitalize">{goal}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
