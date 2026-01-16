"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Tabs,
  Card,
  Skeleton,
  Button,
  message,
  Steps,
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  Empty,
} from "antd";
import { createClient } from "@supabase/supabase-js";
import {
  ReloadOutlined,
  BulbOutlined,
  SmileOutlined,
  FireOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined
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
  const [aiTips, setAiTips] = useState<string[]>([]);

  const fetchData = async () => {
    if (!user?.email) {
      message.warning("Authentication required to generate plan.");
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
        message.error("Please complete your profile first.");
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
      
        setAiTips(result.aiTips || []); 
        message.success("AI Ecosystem Synchronized");
      } else {
        message.error(result.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
      message.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const mealSchedule = [
    { time: "08:00", meal: "Breakfast", icon: "🍳" },
    { time: "13:00", meal: "Lunch", icon: "🍛" },
    { time: "17:00", meal: "Snacks", icon: "☕" },
    { time: "20:30", meal: "Dinner", icon: "🍲" },
  ];

  const tabItems = plan ? [
    { key: "breakfast", label: "Breakfast", items: plan.breakfast },
    { key: "lunch", label: "Lunch", items: plan.lunch },
    { key: "snacks", label: "Snacks", items: plan.snacks },
    { key: "dinner", label: "Dinner", items: plan.dinner },
  ] : [];

  return (
    <div className=" space-y-8 bg-[#f9fbf9] min-h-screen">
      
   
      <Card style={{ marginBottom: 40 }} className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-green-800 to-emerald-950 text-white overflow-hidden">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14} className="p-8">
       
            <Title level={1} className="!text-black  text-3xl sm:!text-4xl">
              Hello, {user?.displayName?.split(" ")[0] || "User"} 👋
            </Title>
            <p className=" text-lg mt-4 opacity-90 leading-relaxed">
              Your personalized Bangladeshi meal plan is calibrated for a **{profile?.goal || 'Health'}** objective.
            </p>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              className="mt-6 h-12 rounded-full border-none bg-white text-emerald-900 font-bold hover:bg-emerald-50 shadow-lg"
            >
              Regenerate Plan
            </Button>
          </Col>
          <Col xs={24} md={10} className="p-4 sm:p-8">
            <div className="grid grid-cols-2 gap-4 p-6 rounded-xl bg-white/10  border border-white/20 shadow-md">
              <Statistic 
                title={<span className=" text-lg uppercase font-bold tracking-widest">Target Energy</span>}
                value={plan?.nutrition_summary?.match(/\d+/)?.[0] || '---'}
                suffix={<small className="text-white/60 ml-1">kcal</small>}
                valueStyle={{  fontWeight: '900', fontSize: '2rem' }}
              />
              <Statistic 
                title={<span className="text-lg uppercase font-bold tracking-widest">Hydration</span>}
                value="2.5"
                suffix={<small className="text-white/60 ml-1">L</small>}
                valueStyle={{ fontWeight: '900', fontSize: '2rem' }}
              />
            </div>
          </Col>
        </Row>
      </Card>


      <div className="flex flex-wrap gap-4">
        <Badge label="Metabolic BMI" value={profile?.bmi || "--"} color="green" />
        <Badge label="Primary Goal" value={profile?.goal || "--"} color="blue" />
        <Badge label="Bio Profile" value={profile?.gender || "--"} color="amber" />
      </div>

      <Row gutter={[32, 32]}>
     
        <Col xs={24} lg={16}>
          <div className="flex justify-between items-center mb-6">
            <Title level={3} className="!m-0 text-gray-800">Daily Meal Plan</Title>
            <Text type="secondary" className="hidden sm:inline">
              <InfoCircleOutlined className="mr-1"/> Locally Sourced Ingredients
            </Text>
          </div>

          {loading ? (
            <Card className="rounded-3xl shadow-sm border-none bg-white p-6">
              <Skeleton active paragraph={{ rows: 12 }} />
            </Card>
          ) : plan ? (
            <Tabs
              defaultActiveKey="breakfast"
              type="card"
              className="professional-tabs"
              items={tabItems.map((tab) => ({
                key: tab.key,
                label: <span className="px-4 py-2 font-medium">{tab.label}</span>,
                children: (
                  <Card className="rounded-3xl shadow-md border-none bg-white p-4">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <Title level={4} className="text-emerald-900 mb-6 flex items-center">
                          <CheckCircleOutlined className="mr-2 text-emerald-500" /> 
                          AI Recommendations
                        </Title>
                        <ul className="space-y-4">
                          {tab.items?.items?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-gray-700 text-lg bg-emerald-50/30 p-3 rounded-2xl border border-emerald-50">
                              <span className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:w-56 bg-gradient-to-b from-green-50 to-green-100 rounded-3xl p-8 flex flex-col items-center justify-center border border-green-200 shadow-inner">
                        <FireOutlined className="text-orange-500 text-4xl mb-3 animate-pulse" />
                        <Text type="secondary" className="uppercase text-[10px] font-black tracking-widest text-orange-800/60">Calories</Text>
                        <Title level={3} className="!m-0 text-orange-700">{tab.items?.calories || "N/A"}</Title>
                      </div>
                    </div>
                  </Card>
                ),
              }))}
            />
          ) : (
            <Empty description="Please refresh to load plan" />
          )}


       <Card 
            style={{marginTop:20}}
            title={<span className="font-extrabold text-blue-900">Optimal Metabolic Window</span>} 
            className="rounded-3xl shadow-lg border-none bg-gradient-to-b from-blue-50 to-indigo-50"
          >
            <Steps
              direction="vertical"
              size="small"
              current={-1}
              items={mealSchedule.map((m) => ({
                title: <span className="text-sm font-bold text-blue-900">{m.meal}</span>,
                subTitle: <span className="text-xs font-black text-blue-600/60">{m.time}</span>,
                icon: <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100 text-xl">{m.icon}</div>
              }))}
            />
          </Card>
        </Col>

    
        <Col xs={24} lg={8} className="space-y-8" style={{marginTop:100}}>

          <Card 
            title={<span className="font-extrabold text-emerald-900"><BulbOutlined className="text-yellow-500 mr-2" /> Actionable Insights</span>} 
            className="rounded-3xl shadow-lg border-none bg-white overflow-hidden"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : aiTips.length > 0 ? (
              <div className="space-y-4">
                {aiTips.map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-amber-50/40 rounded-2xl border border-amber-100 group hover:bg-amber-50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-black text-xs shrink-0">
                      {i + 1}
                    </div>
                    <Text className="text-gray-700 leading-snug text-sm font-medium">
                      {tip}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No specific tips yet" />
            )}
          </Card>


         
        </Col>
      </Row>


      <Divider />

      <div className="text-center py-12">
        <SmileOutlined className="text-emerald-500 text-4xl mb-6" />
        <Title level={4} className="!m-0 text-gray-800 tracking-tight">Your health is an investment, not an expense.</Title>
        <Paragraph className="text-gray-500 italic mt-4 max-w-lg mx-auto leading-relaxed">
          “Stay consistent with your choices today for a stronger version of yourself tomorrow.”
        </Paragraph>
        <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 w-max mx-auto px-6 py-2 rounded-full border border-emerald-100">
          <HeartOutlined /> Precision Nutrition Engine v2.5
        </div>
      </div>
    </div>
  );
}

// PROFESSIONALLY STYLED BADGE COMPONENT
function Badge({ label, value, color }: any) {
  const colorMap: any = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <div className={`px-8 py-5 rounded-3xl border shadow-sm ${colorMap[color]} transition-all hover:-translate-y-1 hover:shadow-md cursor-default`}>
      <p className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-1">{label}</p>
      <p className="font-black text-xl m-0">{value}</p>
    </div>
  );
}