"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Tag,
  Empty,
  Progress,
} from "antd";
import {
  SmileOutlined,
  FireOutlined,
  BulbOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  CoffeeOutlined,
  TrophyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import isBetween from "dayjs/plugin/isBetween"; // 👈 import plugin
dayjs.extend(isBetween); 

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function FoodLog() {
  const user = useSelector((state: any) => state.user);
  const [mealType, setMealType] = useState<string>("");
  const [foodItems, setFoodItems] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestAI, setLatestAI] = useState<{ calories?: number; advice?: string } | null>(null);

  // New states for right section
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const waterGoal = 8; // glasses per day

  async function fetchLogs() {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const res = await fetch("/api/food-log");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch logs");

      const userLogs = (data.data || []).filter((log: any) => log.user_id === user.uid);
      setLogs(userLogs);
    } catch (err) {
      message.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  async function addLog() {
    if (!user?.uid) {
      message.warning("Please log in to save your meal data.");
      return;
    }

    if (!mealType || !foodItems) {
      message.error("Please enter meal details");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.uid,
        meal_type: mealType,
        food_items: foodItems
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        mood,
        date: date ? date.format("YYYY-MM-DD") : null,
      };

      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setMealType("");
      setFoodItems("");
      setMood("");

      setLatestAI({
        calories: data.data?.[0]?.calories,
        advice: data.data?.[0]?.ai_advice,
      });

      await fetchLogs();
      message.success("Meal logged and analyzed by AI ✅");
    } catch (err) {
      console.error(err);
      message.error("Failed to add meal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.uid) fetchLogs();
  }, [user]);

  useEffect(() => {
  if (user?.uid) fetchLogs();
}, [user]);

useEffect(() => {
  if (logs.length > 0) {
    const today = dayjs().format("YYYY-MM-DD");
    const todayLog = logs.find((l) => dayjs(l.date).format("YYYY-MM-DD") === today);
    if (todayLog?.water_intake) {
      setWaterIntake(todayLog.water_intake);
    }
  }
}, [logs]);


  const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);

  // 🧮 Daily macros (example logic)
  const macroSummary = {
    protein: Math.round(totalCalories * 0.25 / 4),
    carbs: Math.round(totalCalories * 0.5 / 4),
    fat: Math.round(totalCalories * 0.25 / 9),
  };

  // 🗓️ Weekly Summary
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = dayjs().endOf("week");
  const weeklyCalories = logs
    .filter((log) => dayjs(log.date).isBetween(startOfWeek, endOfWeek, null, "[]"))
    .reduce((sum, l) => sum + (l.calories || 0), 0);

  return (
    <div className="grid md:grid-cols-2 gap-6 ">
      {/* LEFT SIDE: Log & AI */}
      <Card className="rounded-2xl" bodyStyle={{ padding: "2rem" }}>
        <div className="flex justify-between items-center mb-3">
          <Title level={3} className="!mb-0 text-green-700">
            🍽️ AI-Powered Food Log
          </Title>
          {user?.uid && (
            <Tag color="green" className="text-md py-1 px-3 rounded-lg">
              Total: {totalCalories || 0} kcal
            </Tag>
          )}
        </div>

        <Paragraph type="secondary" className="!mt-0 mb-6">
          Log your meals and let AI estimate calories + offer smart nutrition tips.
        </Paragraph>

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Meal Type"
              value={mealType}
              onChange={setMealType}
              className="w-full"
            >
              <Option value="Breakfast">Breakfast</Option>
              <Option value="Lunch">Lunch</Option>
              <Option value="Dinner">Dinner</Option>
              <Option value="Snack">Snack</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Food items (comma separated)"
              value={foodItems}
              onChange={(e) => setFoodItems(e.target.value)}
              className="w-full"
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <DatePicker
              value={date}
              onChange={setDate}
              className="w-full"
              suffixIcon={<CalendarOutlined />}
            />
          </Col>

       
          <Col xs={24} className="flex justify-end">
            <Button
              type="primary"
              onClick={addLog}
              loading={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              {loading ? "Analyzing..." : "Add Meal 🍱"}
            </Button>
          </Col>
        </Row>

        {/* {user?.uid && latestAI && (
          <div className="bg-green-50 rounded-xl p-4 mt-5 border border-green-100">
            <Text strong className="text-green-700 block mb-1">
              <FireOutlined className="mr-2 text-orange-500" />
              AI Estimated Calories:{" "}
              {latestAI.calories ? `${latestAI.calories} kcal` : "N/A"}
            </Text>
            <Text className="text-gray-700 flex items-start">
              <BulbOutlined className="mr-2 mt-1 text-yellow-500" />
              {latestAI.advice || "No advice available"}
            </Text>
          </div>
        )} */}

        <Divider />

        {user?.uid ? (
          <Spin spinning={loading}>
            {logs.length === 0 ? (
              <Empty description="No meals logged yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card
                    style={{ marginTop: 10 }}
                    key={log.id}
                    size="small"
                    className="border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between">
                      <div>
                        <Text strong className="text-green-700">
                          {log.meal_type}
                        </Text>{" "}
                        —{" "}
                        {Array.isArray(log.food_items)
                          ? log.food_items.join(", ")
                          : log.food_items}
                        <Text className="ml-2 text-gray-500">
                          ({log.calories ?? "?"} kcal)
                        </Text>
                        {log.mood && (
                          <Tag color="blue" className="ml-2">
                            Mood: {log.mood}
                          </Tag>
                        )}
                      </div>
                      <Text type="secondary">
                        {log.created_at ? dayjs(log.created_at).format("MMM D, YYYY") : ""}
                      </Text>
                    </div>
                    {log.ai_advice && (
                      <div className="text-sm text-gray-600 italic mt-1">
                        💡 {log.ai_advice}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Spin>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Please log in to view your food logs.
          </div>
        )}
      </Card>

      {/* RIGHT SIDE: Insights */}
      <div className="space-y-5">
        <Card title="Daily Nutrition Summary" bordered={false}>
          <Text>
            <FireOutlined /> Total Calories: <b>{totalCalories} kcal</b>
          </Text>
          <div className="mt-3 space-y-2">
            <div>Protein: {macroSummary.protein}g</div>
            <div>Carbs: {macroSummary.carbs}g</div>
            <div>Fat: {macroSummary.fat}g</div>
          </div>
        </Card>

       <Card title="Water Intake" bordered={false}>
  <div className="flex items-center justify-between">
    <Text>
      <CoffeeOutlined /> {waterIntake}/{waterGoal} glasses
    </Text>
      <Button
      icon={<PlusOutlined />}
      onClick={async () => {
        if (!user?.uid) return message.warning("Please log in first.");
        try {
          const res = await fetch("/api/food-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.uid, glasses: 1 }),
          });

          if (!res.ok) throw new Error("Update failed");
          setWaterIntake((w) => w + 1);
          message.success("💧 Water logged!");
        } catch (err) {
          message.error("Failed to update water intake");
        }
      }}
      >
      Add Glass
      </Button>

  </div>

  <Progress
    percent={(waterIntake / waterGoal) * 100}
    status={waterIntake >= waterGoal ? "success" : "active"}
    className="mt-3"
  />
       </Card>


        <Card title="Weekly Summary" bordered={false}>
          <Text>
            <TrophyOutlined /> This week’s total: <b>{weeklyCalories} kcal</b>
          </Text>
        </Card>
      </div>
    </div>
  );
}
