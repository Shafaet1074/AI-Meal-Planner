"use client";
import { useState, useEffect } from "react";
import {
  Typography, Card, Button, Input, Select, message, Spin,
  Divider, Row, Col, Tag, Empty, Progress, Statistic, Space, Calendar
} from "antd";
import {
  FireOutlined, CalendarOutlined, CoffeeOutlined, TrophyOutlined, 
  PlusOutlined, ThunderboltOutlined, ArrowUpOutlined, HistoryOutlined
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function FoodLog() {
  const user = useSelector((state: any) => state.user);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [mealType, setMealType] = useState<string>("");
  const [foodItems, setFoodItems] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const waterGoal = 8;

  // 🗓️ Selection State for History
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const fetchLogs = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const res = await fetch("/api/food-log");
      const data = await res.json();
      const userLogs = (data.data || []).filter((log: any) => log.user_id === user.uid);
      setLogs(userLogs);
      syncDailyData(userLogs, dayjs());
    } catch (err) {
      message.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const syncDailyData = (allLogs: any[], targetDate: Dayjs) => {
    const dateStr = targetDate.format("YYYY-MM-DD");
    const dailyWater = allLogs
      .filter((l: any) => dayjs(l.log_date).format("YYYY-MM-DD") === dateStr)
      .reduce((sum: number, l: any) => sum + (l.water_intake || 0), 0);
    setWaterIntake(dailyWater);
  };

  // Filter logs based on the date clicked in the calendar
  const filteredLogs = logs.filter(log => 
    dayjs(log.log_date || log.created_at).format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
  );

  const totalCalories = filteredLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const calorieGoal = 2200;
  const calPercent = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100);

  const addLog = async () => {
    if (!mealType || !foodItems) return message.error("Missing meal details");
    setLoading(true);
    try {
      const payload = {
        user_id: user.uid,
        meal_type: mealType,
        food_items: foodItems.split(",").map(f => f.trim()),
        date: date?.format("YYYY-MM-DD"),
      };
      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setFoodItems("");
      await fetchLogs();
      message.success("Log saved ✨");
    } catch (err) {
      message.error("Log failed");
    } finally {
      setLoading(false);
    }
  };

  const updateWater = async () => {
    if (!user?.uid) return message.warning("Please log in first.");
    try {
      const res = await fetch("/api/food-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid, glasses: 1 }),
      });
      if (!res.ok) throw new Error("Update failed");
      setWaterIntake((prev) => prev + 1);
      message.success("💧 Hydration updated");
    } catch (err) {
      message.error("Failed to update water");
    }
  };

  useEffect(() => { if (user?.uid) fetchLogs(); }, [user]);

  // Function to highlight dates that have logs
  const dateFullCellRender = (value: Dayjs) => {
    const hasLog = logs.some(log => dayjs(log.log_date).isSame(value, 'day'));
    const isSelected = value.isSame(selectedDate, 'day');
    
    return (
      <div className={`ant-picker-cell-inner flex flex-col items-center justify-center rounded-full transition-all 
        ${isSelected ? 'bg-green-600 text-white shadow-lg' : hasLog ? 'bg-green-50 text-green-700' : ''}`}>
        {value.date()}
        {hasLog && !isSelected && <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />}
      </div>
    );
  };

  return (
    <div className=" space-y-6 bg-[#f8fafc] min-h-screen">
      
      {/* 1. HERO MACRO DASHBOARD */}
      <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
        <Row gutter={[24, 24]} align="middle" className="p-2 sm:p-4">
          <Col xs={24} md={8} className="text-center md:border-r border-gray-100">
            <Progress
              type="dashboard"
              percent={calPercent}
              size={180}
              strokeColor={calPercent > 90 ? "#ef4444" : "#10b981"}
              format={() => (
                <div className="flex flex-col">
                  <span className="text-2xl font-black">{totalCalories}</span>
                  <span className="text-gray-400 text-xs uppercase tracking-widest">kcal</span>
                </div>
              )}
            />
            <Title level={5} className="mt-2 text-gray-500 uppercase tracking-tighter !text-xs">
              {selectedDate.isSame(dayjs(), 'day') ? "Today's Energy" : `Energy on ${selectedDate.format("MMM D")}`}
            </Title>
          </Col>
          <Col xs={24} md={16}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MacroMetric label="Protein" value={Math.round(totalCalories * 0.06)} unit="g" color="blue" />
              <MacroMetric label="Carbs" value={Math.round(totalCalories * 0.12)} unit="g" color="orange" />
              <MacroMetric label="Fats" value={Math.round(totalCalories * 0.03)} unit="g" color="purple" />
            </div>
            <Divider className="my-4" />
            <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100 flex items-start gap-3">
              <ThunderboltOutlined className="text-yellow-500 mt-1" />
              <Text type="secondary" className="italic text-xs sm:text-sm">
                AI Insight: Reviewing your history helps identify nutritional gaps. Select a date on the calendar to see past performance.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 2. LOGGING & TIMELINE SECTION */}
        <Col xs={24} lg={15}>
          <Card 
            style={{marginTop:20}}
            title={<span className="text-lg font-bold">Add New Entry</span>}
            className="rounded-3xl shadow-sm border-none mb-6"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                placeholder="Meal"
                className="w-full sm:w-40 h-10" 
                value={mealType || undefined} 
                onChange={setMealType}
                dropdownStyle={{ borderRadius: '12px' }}
              >
                <Option value="Breakfast">Breakfast</Option>
                <Option value="Lunch">Lunch</Option>
                <Option value="Dinner">Dinner</Option>
                <Option value="Snack">Snack</Option>
              </Select>
              <Input 
                placeholder="What did you eat?" 
                className="flex-1 rounded-xl h-10"
                value={foodItems}
                onChange={(e) => setFoodItems(e.target.value)}
              />
              <Button 
                type="primary" 
                onClick={addLog} 
                loading={loading}
                className="rounded-xl h-10 bg-green-600 font-bold px-6"
              >
                Log Meal
              </Button>
            </div>
          </Card>

          <Title    style={{marginTop:20}} level={4} className="mb-4 ml-2 flex items-center gap-2 !text-lg sm:!text-xl">
            <HistoryOutlined /> {selectedDate.format("MMMM D, YYYY")} Timeline
          </Title>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <Empty description="No meals logged for this date" className="py-10 bg-white rounded-3xl border border-dashed border-gray-200" />
            ) : (
              filteredLogs.map((log) => (
                <Card  key={log.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all" bodyStyle={{ padding: '16px' }}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-3 rounded-xl text-xl shrink-0">
                        {log.meal_type === 'Breakfast' ? '🍳' : log.meal_type === 'Lunch' ? '🍛' : '🍲'}
                      </div>
                      <div>
                        <Text strong className="text-sm sm:text-lg block">{log.meal_type}</Text>
                        <Paragraph className="text-gray-500 m-0 text-xs sm:text-sm">
                          {Array.isArray(log.food_items) ? log.food_items.join(", ") : log.food_items}
                        </Paragraph>
                        {log.ai_advice && <Tag color="blue" className="mt-2 border-none rounded-md bg-blue-50 text-blue-600 text-[10px] sm:text-xs">💡 {log.ai_advice}</Tag>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Text strong className="text-sm sm:text-lg block text-green-700">{log.calories} kcal</Text>
                      <Text type="secondary" className="text-[10px] uppercase">{dayjs(log.created_at).format("h:mm A")}</Text>
                    </div>
                  </div>
                </Card>

                 
              ))
            )}
          </div>

          <Card    style={{marginTop:20}} title={<><TrophyOutlined className="text-yellow-500 mr-2"/> Consistency</>} className="rounded-3xl border-none shadow-sm">
            <Statistic title="Total Logs" value={logs.length} suffix="Meals" valueStyle={{ color: '#10b981', fontWeight: 'bold' }} prefix={<ArrowUpOutlined />} />
            <Divider className="my-3" />
            <Text type="secondary" className="text-[11px]">Consistent logging helps AI provide better health advice.</Text>
          </Card>
        </Col>

        {/* 3. WIDGET SIDEBAR */}
        <Col xs={24} lg={9} className="space-y-6">
          
          {/* HYDRATION */}
          <Card    style={{marginTop:20}} className="rounded-3xl border-none shadow-xl bg-blue-600 text-white overflow-hidden">
            <div className="flex justify-between items-center mb-4 px-4 pt-4">
              <Title level={5} className="text-white !m-0 !text-sm uppercase tracking-widest"><CoffeeOutlined className="mr-2"/> Hydration</Title>
              <Button shape="circle" icon={<PlusOutlined />} onClick={updateWater} className="bg-white/20 border-none text-white hover:bg-white/40 flex items-center justify-center h-8 w-8" />
            </div>
            <div className="text-center pb-6">
              <Title level={1} className="text-white !m-0 !text-3xl sm:!text-4xl">{waterIntake} <small className="text-sm opacity-60">/ {waterGoal}</small></Title>
              <Progress percent={(waterIntake / waterGoal) * 100} showInfo={false} strokeColor="#fff" trailColor="rgba(255,255,255,0.2)" className="mt-4 px-4" strokeWidth={12} />
            </div>
          </Card>

          {/* 🗓️ MONTHLY CALENDAR HISTORY */}
          <Card 
            style={{marginTop:20}}
            title={<span className="text-base font-bold"><CalendarOutlined className="mr-2 text-green-600" /> Activity History</span>} 
            className="rounded-3xl border-none shadow-sm overflow-hidden custom-mini-calendar"
            bodyStyle={{ padding: '12px' }}
          >
            <Calendar 
              fullscreen={false} 
              onSelect={(val) => {
                setSelectedDate(val);
                syncDailyData(logs, val);
              }}
              fullCellRender={dateFullCellRender}
              headerRender={({ value, onChange }) => {
                const current = value.clone();
                return (
                  <div className="flex items-center justify-between mb-4 px-2">
                    <Text strong className="text-gray-600">{current.format("MMMM YYYY")}</Text>
                    <Space>
                      <Button size="small" onClick={() => onChange(current.subtract(1, 'month'))}>{"<"}</Button>
                      <Button size="small" onClick={() => onChange(current.add(1, 'month'))}>{">"}</Button>
                    </Space>
                  </div>
                );
              }}
            />
            <Divider className="my-3" />
            <Space direction="vertical" size={1} className="w-full">
              <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest ml-1">Legend</Text>
              <Space className="mt-1 ml-1">
                <Tag color="green" className="rounded-full border-none w-2 h-2 p-0" /> <Text className="text-[11px] text-gray-500">Activity logged</Text>
              </Space>
            </Space>
          </Card>

          
        </Col>
      </Row>
    </div>
  );
}

function MacroMetric({ label, value, unit, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className={`p-3 sm:p-4 rounded-2xl ${colors[color]} text-center border border-white/50 shadow-sm transition-transform hover:-translate-y-1`}>
      <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest block opacity-70">{label}</Text>
      <div className="text-lg sm:text-xl font-black">{value}{unit}</div>
    </div>
  );
}