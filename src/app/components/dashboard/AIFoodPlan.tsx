"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Tabs,
  Card,
  Spin,
  Button,
  message,
  Steps,
  Divider,
} from "antd";
import { createClient } from "@supabase/supabase-js";
import {
  ReloadOutlined,
  BulbOutlined,
  SmileOutlined,
  FireOutlined,
  HeartOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AIFoodPlan() {
  const user = useSelector((state: any) => state.user);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // 🌿 AI Tips States
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState<boolean>(false);

  const fetchData = async () => {
    if (!user?.email) {
      message.warning("Please log in to view your AI meal plan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("bmi, goal, gender")
        .eq("email", user.email)
        .single();

      if (error || !profileData) {
        message.error("Profile not found for this user.");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const res = await fetch("/api/aiMealPlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await res.json();

      if (res.ok && !result.error) {
        setPlan(result);
        message.success("Meal Plan Loaded Successfully!");
      } else {
        message.error(result.error || "Failed to load meal plan");
      }
    } catch (err) {
      console.error(err);
      message.error("Error loading meal plan");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Fetch AI Health Tips
useEffect(() => {
  const fetchAiHealthTips = async () => {
    if (!profile) return;
    try {
      setLoadingTips(true); // ✅ Start loading
      const res = await fetch("/api/aiHealthTips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmi: profile.bmi,
          goal: profile.goal,
          gender: profile.gender,
        }),
      });

      const data = await res.json();
      console.log("🧩 AI Tips from API:", data);
      setAiTips(data.aiTips || []);
    } catch (err) {
      console.error("💥 Error fetching AI health tips:", err);
    } finally {
      setLoadingTips(false); // ✅ End loading
    }
  };

  fetchAiHealthTips();
}, [profile]);


  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // useEffect(() => {
  //   if (profile) fetchAITips();
  // }, [profile]);

  // 🧠 Helper
  const getGoalMessage = (bmi: number, goal: string) => {
    if (goal === "Lose Weight")
      return `Focus on nutrient-dense meals and stay consistent. You’re closer than you think 💪`;
    if (goal === "Maintain Weight")
      return `Consistency is your superpower 🧘‍♂️ — keep balanced meals and hydration steady.`;
    if (goal === "Gain Weight")
      return `Fuel your progress 🍗 — lean proteins and carbs will build your strength steadily.`;

    if (bmi < 18.5)
      return `Include more calorie-rich, wholesome foods in your diet 🍠.`;
    if (bmi >= 25)
      return `Stay mindful of portions 🥗 — small adjustments can make big changes.`;

    return `Follow this meal plan for your health goals 🌱.`;
  };

  const mealSchedule = [
    { time: "8:00 AM", meal: "Breakfast", icon: "🍳" },
    { time: "12:30 PM", meal: "Lunch", icon: "🍛" },
    { time: "4:30 PM", meal: "Snacks", icon: "☕" },
    { time: "8:00 PM", meal: "Dinner", icon: "🍲" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 text-center px-4">
        <Spin size="large" tip="Generating your personalized meal plan..." />
        <Text type="secondary">AI is analyzing your nutrition data 🤖</Text>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-6 px-4 text-center">
        <Text type="secondary" className="text-lg">
          No meal plan available yet. Try updating your profile and refresh.
        </Text>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
          type="primary"
          className="mt-2"
        >
          Regenerate Plan
        </Button>
      </div>
    );
  }

  const tabItems = [
    { key: "breakfast", label: "Breakfast", items: plan.breakfast },
    { key: "lunch", label: "Lunch", items: plan.lunch },
    { key: "snacks", label: "Snacks", items: plan.snacks },
    { key: "dinner", label: "Dinner", items: plan.dinner },
  ];

  return (
    <div className="max-w-8xl mx-auto px-0 sm:px-6 lg:px-12 py-2 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-green-600 font-semibold text-2xl sm:text-3xl">
          Hello, {user?.displayName || "Health Enthusiast"} 👋
        </h1>
        <p className="text-gray-700 text-base sm:text-lg">
          Here’s your AI-personalized meal plan based on your health data.
        </p>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <Badge label="BMI" value={profile.bmi} color="green" />
              <Badge label="Goal" value={profile.goal} color="blue" />
              <Badge label="Gender" value={profile.gender} color="amber" />
            </div>
          </div>

          <Paragraph className="mt-3 text-gray-600 italic text-sm sm:text-base">
            {getGoalMessage(profile.bmi, profile.goal)}
          </Paragraph>
          
        </div>
      )}

      {/* Tabs */}
      <Tabs
        className="w-full"
        defaultActiveKey="breakfast"
        items={tabItems.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: (
            <Card className="shadow-md rounded-xl mt-4 border border-gray-100 hover:shadow-lg transition-all">
             <div style={{display:'flex', justifyContent:'space-between'}}>
               <Title
                level={4}
                className="text-green-700 mb-3 !text-lg sm:!text-xl"
              >
                Recommended Items
              </Title>
              <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            type="primary"
            className="bg-green-600 hover:bg-green-700"
          >
            Regenerate Plan
          </Button>
             </div>
              {tab.items?.items ? (
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {tab.items.items.map((food: string, i: number) => (
                    <li key={i} className="font-medium">
                      {food}
                    </li>
                  ))}
                </ul>
              ) : (
                <Paragraph type="secondary" className="mt-2">
                  No suggestions available yet.
                </Paragraph>
              )}
              {tab.items?.calories && (
                <Paragraph className="mt-3 text-gray-600 text-sm sm:text-base">
                  <strong>Calories:</strong> {tab.items.calories}
                </Paragraph>
              )}
            </Card>
          ),
        }))}
      />

      {/* 🌿 AI Tips Section */}
      <div style={{ marginTop: 30 }} className="bg-green-50 rounded-xl shadow-md p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <BulbOutlined className="text-green-600 text-2xl" />
          <Title level={4} className="!mb-0 text-green-700 !text-lg sm:!text-xl">
            AI Health Tips 💡
          </Title>
        </div>
        {loadingTips ? (
          <div className="flex justify-center py-4">
            <Spin size="small" tip="Fetching health insights..." />
          </div>
        ) : (
          <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
            {aiTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Suggested Meal Schedule */}
      <div className="p-5 sm:p-6 bg-blue-50 shadow-md rounded-xl border border-blue-100">
        <Title level={4} className="text-blue-700 mb-4 !text-lg sm:!text-xl">
          Suggested Meal Schedule 🕒
        </Title>
        <div className="overflow-x-auto">
          <Steps
            responsive
            size="small"
            current={4}
            items={mealSchedule.map((m) => ({
              title: `${m.icon} ${m.meal}`,
              description: m.time,
              icon: <FireOutlined className="text-blue-600" />,
            }))}
          />
        </div>
      </div>

      {/* Goal Motivation Section */}
      <div className="bg-blue-50 border-pink-200 text-center shadow-sm p-5 sm:p-6 rounded-xl">
        <SmileOutlined className="text-pink-500 text-3xl mb-2" />
        <Title level={4} className="text-red-800 mb-1 !text-lg sm:!text-xl">
          Goal Motivation
        </Title>
        <Paragraph className="text-gray-700 italic text-sm sm:text-base">
          “Every bite you take is a step closer to the best version of yourself.”
        </Paragraph>
      </div>

      {/* Emotional Ending Line */}
      <Divider />
      <Paragraph className="text-center text-gray-500 italic text-sm sm:text-base">
        <HeartOutlined className="text-red-700 mr-2" />
        “Stay kind to your body — it’s been taking care of you since day one.”
      </Paragraph>
    </div>
  );
}

// Small reusable badge
function Badge({ label, value, color }: any) {
  const colorMap: any = {
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div
      className={`flex flex-col justify-center px-4 py-3 rounded-xl border shadow-sm ${colorMap[color]} text-center w-full`}
    >
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-base sm:text-lg">{value}</p>
    </div>
  );
}
