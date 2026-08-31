"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { createClient } from "@supabase/supabase-js";
import { Spin, message } from "antd";
import { ArrowLeft, ArrowRight, Check, Home, Activity } from "lucide-react";

/* ---------- Supabase client ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type HeightUnit = "cm" | "ftin";

export default function SetupProfilePage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user);

  /* ---------- form state ---------- */
  const [step, setStep] = useState(0); 
  const totalSteps = 7;

  const [age, setAge] = useState<string>(user?.age?.toString() || "");
  const [name, setName] = useState<string>(user?.displayName || "");
  const [gender, setGender] = useState<string>("male");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>(""); 
  const [heightIn, setHeightIn] = useState<string>(""); 

  const [weight, setWeight] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [goal, setGoal] = useState<string>("maintain");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ---------- fetch existing profile ---------- */
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
      return totalInches * 2.54;
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

  /* ---------- navigation ---------- */
  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step === 0) {
      router.push("/");
    } else {
      setStep((s) => s - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 0: return !!age && parseInt(age) > 0 && parseInt(age) < 120;
      case 1: return name.trim().length >= 2;
      case 2: return ["male", "female"].includes(gender);
      case 3:
        if (heightUnit === "cm") {
          const v = parseFloat(heightCm || "0");
          return !isNaN(v) && v > 50 && v < 300;
        } else {
          const ft = parseInt(heightFt || "0");
          const inch = parseInt(heightIn || "0");
          return (ft > 0 && ft < 9) && (inch >= 0 && inch < 12);
        }
      case 4:
        const w = parseFloat(weight || "0");
        return !isNaN(w) && w > 10 && w < 500 && heightInCm != null;
      case 5: return ["sedentary", "light", "moderate", "active", "very-active"].includes(activityLevel);
      case 6: return ["lose", "maintain", "gain"].includes(goal);
      default: return true;
    }
  };

  /* ---------- submit to supabase ---------- */
  const handleSubmit = async () => {
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
    };

    try {
      const { data: existingProfile, error: existErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user?.email)
        .maybeSingle();

      if (existErr) throw existErr;

      let result;
      if (existingProfile && existingProfile.id) {
        result = await supabase.from("profiles").update(profileData).eq("email", user?.email);
      } else {
        result = await supabase.from("profiles").insert([{ ...profileData, created_at: new Date() }]);
      }

      if (result.error) throw result.error;

      message.success("Profile saved successfully!");
      router.push("/dashboard?new=true"); 
    } catch (err) {
      console.error("Error saving profile:", err);
      message.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Activity className="h-10 w-10 text-emerald-500 animate-pulse mb-4" />
        <Spin tip="Preparing your workspace..." size="large" />
      </div>
    );

  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Main Card Container */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[650px] relative transition-colors duration-300">
        
        {/* Progress Header */}
        <div className="px-8 pt-10 pb-2">
          <div className="flex justify-between items-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            <span>Step {step + 1} of {totalSteps}</span>
            <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 w-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Content Area with Animation Wrapper */}
        <div className="flex-1 px-8 py-8 overflow-y-auto flex flex-col justify-center">
          
          {step === 0 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Let's personalize your plan.
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Select your age group to help our AI calculate your baseline metabolic rate.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-8">
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
                    className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                      age === item.label
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 transform scale-105"
                        : "border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600/50 bg-white dark:bg-slate-800/50 hover:shadow-md"
                    }`}
                  >
                    <div className={`relative w-16 h-16 mb-4 rounded-full overflow-hidden transition-transform duration-300 ${age === item.label ? 'ring-4 ring-emerald-200 dark:ring-emerald-900' : 'group-hover:scale-110'}`}>
                      <Image src={item.img} alt={item.label} fill className="object-cover" />
                    </div>
                    <span className={`font-bold text-sm tracking-wide ${age === item.label ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  What should we call you?
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  We'll use this to personalize your dashboard and recipes.
                </p>
              </div>
              <div className="w-full max-w-md mt-8">
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Biological sex
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Required for clinical-grade macro and calorie calculations.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 max-w-md w-full mt-8">
                {[
                  { id: "female", label: "Female", emoji: "🙋‍♀️" },
                  { id: "male", label: "Male", emoji: "🙋‍♂️" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setGender(option.id)}
                    type="button"
                    className={`group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-300 ${
                      gender === option.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 transform scale-105"
                        : "border-slate-100 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-800/50 hover:shadow-md"
                    }`}
                  >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{option.emoji}</span>
                    <span className={`font-extrabold text-lg ${gender === option.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  How tall are you?
                </h2>
              </div>
              
              <div className="w-full max-w-md space-y-8 mt-4">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setHeightUnit("cm")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      heightUnit === "cm"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Centimeters
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit("ftin")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      heightUnit === "ftin"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Feet & Inches
                  </button>
                </div>

                {heightUnit === "cm" ? (
                  <div className="relative">
                    <input
                      type="number"
                      min={50} max={300}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] py-8 text-center text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="relative w-1/2">
                      <input
                        type="number" min={0} max={8}
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] py-8 text-center text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">ft</span>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number" min={0} max={11}
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] py-8 text-center text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">in</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Current weight?
                </h2>
              </div>
              <div className="w-full max-w-md space-y-8 mt-4">
                <div className="relative">
                  <input
                    type="number" min={10} max={500}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] py-8 text-center text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">kg</span>
                </div>
                
                {/* Advanced BMI Card Preview */}
                <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${bmiValue ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 transform translate-y-0 opacity-100" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-70"}`}>
                  {bmiValue != null ? (
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Current BMI</span>
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{bmiValue.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Clinical Category</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">{bmiCategory}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-400 text-center py-4">Enter weight to unlock your clinical stats</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-2 mb-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Activity level
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Be honest! This determines your daily caloric burn.</p>
              </div>
              <div className="w-full max-w-lg flex flex-col gap-5">
                {[
                  { val: "sedentary", label: "Sedentary", desc: "Desk job, little to no exercise" },
                  { val: "light", label: "Lightly Active", desc: "Light exercise 1–3 days/week" },
                  { val: "moderate", label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
                  { val: "active", label: "Active", desc: "Hard exercise 6–7 days/week" },
                  { val: "very-active", label: "Very Active", desc: "Intense daily training or physical job" },
                ].map((lvl) => (
                  <button
                    key={lvl.val}
                    onClick={() => setActivityLevel(lvl.val)}
                    className={`group w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
                      activityLevel === lvl.val
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md transform scale-[1.02]"
                        : "border-slate-100 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-800/50 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-extrabold text-lg ${activityLevel === lvl.val ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>{lvl.label}</p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{lvl.desc}</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${activityLevel === lvl.val ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-300"}`}>
                      {activityLevel === lvl.val && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  What's the primary goal?
                </h2>
              </div>
              <div className="w-full max-w-lg">
                <div className="grid grid-cols-1 gap-4 mb-10">
                  {[
                    { val: "lose", label: "Lose Fat", icon: "🔥", color: "hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10", active: "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-md transform scale-[1.02]" },
                    { val: "maintain", label: "Maintain Weight", icon: "⚖️", color: "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10", active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-md transform scale-[1.02]" },
                    { val: "gain", label: "Build Muscle", icon: "💪", color: "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10", active: "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-md transform scale-[1.02]" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      onClick={() => setGoal(g.val)}
                      className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-300 ${
                        goal === g.val ? g.active : `border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 ${g.color}`
                      }`}
                    >
                      <span className="text-3xl">{g.icon}</span>
                      <span className="font-extrabold text-xl">{g.label}</span>
                    </button>
                  ))}
                </div>

                {/* Final Review Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 pointer-events-none">
                    <Activity className="h-24 w-24 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Profile Summary</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm relative z-10">
                    <div className="text-slate-500 font-medium">Name</div><div className="font-bold text-slate-900 dark:text-white truncate">{name || "—"}</div>
                    <div className="text-slate-500 font-medium">Age / Sex</div><div className="font-bold text-slate-900 dark:text-white">{age || "—"} • <span className="capitalize">{gender}</span></div>
                    <div className="text-slate-500 font-medium">Metrics</div><div className="font-bold text-slate-900 dark:text-white">{heightInCm ? `${heightInCm.toFixed(1)} cm` : "—"} • {weight ? `${parseFloat(weight).toFixed(1)} kg` : "—"}</div>
                    <div className="text-slate-500 font-medium">AI Strategy</div><div className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">{goal} • {activityLevel.replace("-", " ")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Floating Footer Controls */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-20">
          <button
            onClick={goBack}
            className="group flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            {step === 0 ? (
              <><Home className="h-5 w-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" /> Home</>
            ) : (
              <><ArrowLeft className="h-5 w-5" /> Back</>
            )}
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => {
                if (!validateCurrentStep()) {
                  message.error("Please fill this step correctly before continuing.");
                  return;
                }
                goNext();
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white !text-white dark:text-slate-900 font-extrabold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 !text-white font-extrabold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Spin className="mr-2" size="small" /> : "Save & Generate Plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}