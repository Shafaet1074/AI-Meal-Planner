"use client";
import { useState, useEffect } from "react";
import { Card, Typography, DatePicker, Empty, message, Spin, Row, Col, Statistic, Progress, Tag } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import axios from "axios";
import { useSelector } from "react-redux";
import { AppleOutlined, FireOutlined, ThunderboltOutlined, ArrowUpOutlined, CalendarOutlined } from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CaloriesDashboard() {
  const user = useSelector((state: any) => state.user);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, "day"), dayjs()]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);


 useEffect(() => {
  // We define the function inside or outside, but call it here
  const initializeDashboard = async () => {
    // 1. Guard Clause: Don't even start if user isn't loaded yet
    if (!user?.email) {
      // Note: We usually don't show a warning on mount, 
      // just wait for the user state to hydrate.
      return;
    }

    try {
      setLoading(true);

      // 2. Fetch Profile from Supabase
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("bmi, goal, gender")
        .eq("email", user.email)
        .single();

      if (error || !profileData) {
        message.error("Please complete your profile first.");
        return; 
      }

      // 3. Update State
      setProfile(profileData);

      // 4. (Optional) You can trigger other fetches here
      // await fetchNutritionPlan(profileData.goal);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      message.error("Failed to synchronize dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  initializeDashboard();

  // Dependency array ensures this runs when the user object changes
}, [user?.email]);
    
  const fetchDashboard = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [start, end] = dateRange;
      const res = await axios.get(`/api/dashboard`, {
        params: { 
          user_id: user.uid, 
          start: start.format("YYYY-MM-DD"), 
          end: end.format("YYYY-MM-DD") 
        }
      });
      
      setSummary(res.data);
      
      if (res.data?.weeklyData) {
        const formatted = res.data.weeklyData.map((d: any) => ({
          ...d,
          // ✅ Robust Parsing: Turn YYYY-MM-DD into "Jan 16"
          displayDate: dayjs(d.date).format("MMM D"),
        }));
        setChartData(formatted);
      }
    } catch (err) {
      message.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchDashboard();
  }, [user, dateRange]);

  if (!summary && loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

  return (
    <div className="space-y-8  min-h-screen">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Title level={2} className="!m-0 tracking-tight text-gray-800">Health Intelligence</Title>
          <Text type="secondary" className="text-xs uppercase tracking-widest font-black opacity-40">
            <CalendarOutlined className="mr-1" /> Sync Status: Verified
          </Text>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <RangePicker
            value={dateRange}
            variant="borderless"
            allowClear={false}
            onChange={(v) => v && setDateRange(v as any)}
            className="font-medium"
          />
        </div>
      </header>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
             <MetricCard title="Intake" value={summary?.totalConsumed || 0} unit="kcal" icon={<AppleOutlined />} color="#10b981" />
             <MetricCard title="Burned" value={summary?.totalBurned || 0} unit="kcal" icon={<FireOutlined />} color="#f59e0b" />
             <MetricCard title="Body Index" value={profile?.bmi || 0} unit="BMI" icon={<ThunderboltOutlined />} color="#3b82f6" />
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="rounded-[2.5rem] border-none shadow-xl h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="flex flex-col items-center justify-center h-full py-6">
              <Progress
                type="circle"
                percent={Math.round(summary?.goalProgress || 0)}
                strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
                size={160}
                strokeWidth={10}
                format={(p) => <span className="text-black font-black text-3xl">{p}%</span>}
              />
              <Title level={4} className="!text-white !mt-6 !mb-0 font-bold tracking-tight">Success Rate</Title>
              <Text className="text-gray-400 text-[10px] mt-1 uppercase tracking-[0.2em]">Goal Convergence</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-2 sm:p-6"
        title={<span className="font-bold flex items-center gap-2 text-lg"><ArrowUpOutlined className="text-green-500" /> Metabolic Trend</span>}
      >
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer>
            <BarChart data={chartData} barGap={12}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="consumed" radius={[8, 8, 0, 0]} fill="url(#g1)" barSize={32} name="Consumed" />
              <Bar dataKey="burned" radius={[8, 8, 0, 0]} fill="url(#g2)" barSize={32} name="Burned" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, unit, icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-md hover:shadow-xl transition-all h-full group">
      <div className="flex flex-col justify-between h-full">
        <div className="p-4 rounded-2xl text-2xl w-fit" style={{ backgroundColor: color + '15', color }}>
          {icon}
        </div>
        <div className="mt-8">
          <Text type="secondary" className="text-[10px] uppercase font-black tracking-widest opacity-50 block mb-1">{title}</Text>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-800">{value}</span>
            <span className="text-gray-400 font-bold text-xs uppercase">{unit}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}