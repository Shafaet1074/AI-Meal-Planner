"use client";
import { useState, useEffect } from "react";
import {
  Typography, Card, Select, InputNumber, Button, message, 
  Progress, Row, Col, Tooltip, Statistic, Space, Divider, Skeleton,
  Tag
} from "antd";
import {
  FireOutlined, ThunderboltOutlined, RiseOutlined,
  CheckCircleOutlined, InfoCircleOutlined, AimOutlined,
  RocketOutlined, SettingOutlined
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ProgressTracker() {
  const user = useSelector((state: any) => state.user);
  const [workoutFrequency, setWorkoutFrequency] = useState("never");
  const [caloriesPerWorkout, setCaloriesPerWorkout] = useState<number>(200);
  const [goal, setGoal] = useState("maintain");
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // 1. Fetch Progress Logic
  async function fetchProgress() {
    if (!user?.uid) return;
    try {
      setFetching(true);
      const res = await fetch(`/api/progress?user_id=${user.uid}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setProgressData(data.data);
        // Sync local inputs with saved data
        setWorkoutFrequency(data.data.workout_frequency || "never");
        setCaloriesPerWorkout(data.data.calories_per_workout || 200);
        setGoal(data.data.goal || "maintain");
      }
    } catch {
      message.error("Failed to synchronize with cloud");
    } finally {
      setFetching(false);
    }
  }

  // 2. Save Progress Logic
  async function saveProgress() {
    if (!user?.uid) return message.warning("Authentication required");

    try {
      setLoading(true);
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          workout_frequency: workoutFrequency,
          calories_per_workout: caloriesPerWorkout,
          goal,
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      message.success("Fitness Blueprint Updated ✨");
      await fetchProgress();
    } catch (err) {
      message.error("Failed to update progress");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.uid) fetchProgress();
  }, [user]);

  return (
    <div className=" space-y-8 min-h-screen bg-[#f8fafc]">
      
      {/* SECTION 1: THE STRATEGY CARD (Configuration) */}
      <Card 
        className="border-none  rounded-[2rem] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)', marginBottom:20 }}
      >
        <div className="p-2 sm:p-6">
          <header className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <SettingOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={2} className="!m-0 tracking-tight">Fitness Blueprint</Title>
              <Text type="secondary" className="text-sm">Calibrate your metabolism and primary health objectives</Text>
            </div>
          </header>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-blue-50 shadow-sm">
                <Text strong className="text-blue-900/40 uppercase text-[10px] tracking-widest block mb-3 font-black">Activity Cadence</Text>
                <Select 
                  className="w-full text-lg" 
                  size="large" 
                  variant="borderless" 
                  value={workoutFrequency} 
                  onChange={setWorkoutFrequency}
                >
                  <Option value="daily">🔥 Daily Routine</Option>
                  <Option value="3_per_week">⚡ 3 Days / Week</Option>
                  <Option value="never">🧘 Sedentary</Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-blue-50 shadow-sm">
                <Text strong className="text-blue-900/40 uppercase text-[10px] tracking-widest block mb-3 font-black">Energy per Session</Text>
                <div className="flex items-center gap-2">
                   <InputNumber 
                    className="w-full font-bold text-xl" 
                    variant="borderless"
                    min={100} 
                    max={2000} 
                    value={caloriesPerWorkout} 
                    onChange={(val) => setCaloriesPerWorkout(val || 0)} 
                  />
                  <Text type="secondary">kcal</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-blue-50 shadow-sm">
                <Text strong className="text-blue-900/40 uppercase text-[10px] tracking-widest block mb-3 font-black">Success Metric</Text>
                <Select className="w-full text-lg" size="large" variant="borderless" value={goal} onChange={setGoal}>
                  <Option value="lose">📉 Weight Loss</Option>
                  <Option value="gain">📈 Muscle Gain</Option>
                  <Option value="maintain">⚖️ Maintenance</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <Button 
            type="primary" 
            style={{marginTop:20}}
            size="large"
            icon={<RocketOutlined />}
            className="mt-8 rounded-2xl h-14 px-12 bg-blue-600 hover:scale-105 transition-all border-none shadow-xl shadow-blue-200 font-bold"
            onClick={saveProgress}
            loading={loading}
          >
            Update Blueprint
          </Button>
        </div>
      </Card>

      {/* SECTION 2: THE OUTCOME (Analysis) */}
      {fetching ? (
        <Card className="rounded-[2rem] border-none shadow-sm p-10"><Skeleton active /></Card>
      ) : progressData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center justify-between px-2">
            <Title level={4} className="!m-0 flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" /> Bio-Feedback Analysis
            </Title>
            <Tag color="blue" className="rounded-full border-none px-4">Weekly Cycle</Tag>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Card className="rounded-[2rem] border-none shadow-lg h-full p-4 sm:p-8">
                <Row gutter={24} align="middle">
                  <Col xs={24} sm={12}>
                    <Statistic 
                      title={<span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Net Caloric Balance</span>}
                      value={progressData.netCalories} 
                      suffix="kcal"
                      valueStyle={{ 
                        color: progressData.netCalories <= 0 ? '#10b981' : '#f59e0b', 
                        fontSize: '3rem', 
                        fontWeight: '900' 
                      }}
                    />
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Space align="start">
                        <InfoCircleOutlined className="text-blue-500 mt-1" />
                        <div>
                           <Text strong className="block text-sm">Metabolic Status</Text>
                           <Text type="secondary" className="text-xs">{progressData.status}</Text>
                        </div>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} className="text-center pt-8 sm:pt-0">
                    <Tooltip title="This progress represents your fat-loss tissue change based on a 3500kcal per 1lb deficit model.">
                      <Progress
                        type="circle"
                        percent={Math.min(Math.floor(Math.abs(progressData.netCalories / 3500) * 100), 100)}
                        strokeColor={progressData.netCalories <= 0 ? '#10b981' : '#f59e0b'}
                        strokeWidth={12}
                        size={200}
                        format={() => (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase">Tissue</span>
                            <span className="text-xl font-black tracking-tighter">CHANGE</span>
                          </div>
                        )}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <div className="flex flex-col gap-4 h-full">
                <MetricCard 
                  icon={<FireOutlined />} 
                  label="Total Intake" 
                  value={progressData.totalConsumed} 
                  color="#3b82f6" 
                  desc="Total energy from logged meals"
                />
                <MetricCard 
                  icon={<ThunderboltOutlined />} 
                  label="Energy Expenditure" 
                  value={progressData.totalBurned} 
                  color="#10b981" 
                  desc="Base metabolic rate + workouts"
                />
              </div>
            </Col>
          </Row>

          {/* AI ADVICE FOOTER */}
          <Card className="rounded-[2rem] border-none shadow-md bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-2">
            <div className="flex items-center gap-6 p-4">
              <div className="bg-white/20 backdrop-blur-lg p-4 rounded-3xl text-3xl shadow-inner">💡</div>
              <div>
                <Title level={5} className="!text-white !m-0 !mb-1 tracking-tight">AI Biological Optimization</Title>
                <Text className="text-blue-50 opacity-90 leading-relaxed italic">
                  "{progressData.tip || "Your consistency is your superpower. Based on current trends, we suggest maintaining this balance for 14 days to see measurable results."}"
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// 📦 Reusable Professional Metric Component
function MetricCard({ icon, label, value, color, desc }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all flex-1 group">
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: color + '15', color }}>
            {icon}
          </div>
          <Text strong className="text-xl">{value} <small className="text-[10px] text-gray-400">kcal</small></Text>
        </div>
        <div>
          <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest block opacity-60">{label}</Text>
          <Text className="text-[11px] text-gray-400 leading-none">{desc}</Text>
        </div>
      </div>
    </Card>
  );
}