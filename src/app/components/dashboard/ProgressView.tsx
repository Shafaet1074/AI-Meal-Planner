"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Select,
  InputNumber,
  Button,
  message,
  Progress,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  RiseOutlined,
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

  async function saveProgress() {
    if (!user?.uid) return message.warning("Please log in first");

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

      if (!res.ok) throw new Error("Failed to save");
      message.success("Progress settings saved ✅");
      await fetchProgress();
    } catch (err) {
      message.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProgress() {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/progress?user_id=${user.uid}`);
      const data = await res.json();
      if (res.ok) setProgressData(data.data);
    } catch {
      message.error("Failed to load progress data");
    }
  }

  useEffect(() => {
    if (user?.uid) fetchProgress();
  }, [user]);

  return (
    <div className=" mt-10 space-y-8 ">
      <Card
        className=" border border-gray-200 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #f9fafb 0%, #f0f7ff 50%, #e6f4ff 100%)",
        }}
      >
        <Title level={3} className="mb-4">
          🏋️‍♀️ Fitness & Goal Settings
        </Title>

        <Paragraph type="secondary">
          Set your workout habits, calorie burn estimate, and your personal goal
          to help the AI measure your progress effectively.
        </Paragraph>

        <Row gutter={16} className="mt-4">
          <Col xs={24} md={9}>
            <Text strong>Workout Frequency</Text>
            <Select
              className="w-full mt-2"
              value={workoutFrequency}
              onChange={setWorkoutFrequency}
            >
              <Option value="daily">Daily</Option>
              <Option value="3_per_week">3 Days / Week</Option>
              <Option value="never">Never</Option>
            </Select>
          </Col>

          <Col  xs={24} md={4}>
           <div style={{display:"flex",flexDirection:'column'}}>
             <Text strong>Calories Burned per Workout</Text>
            <InputNumber
              className="w-full mt-2"
              // style={{marginTop:10}}
              min={100}
              max={2000}
              value={caloriesPerWorkout}
              onChange={(val) => setCaloriesPerWorkout(val || 0)}
            />
           </div>
          </Col>

          <Col xs={24} md={9}>
            <Text strong>Goal</Text>
            <Select className="w-full mt-2" value={goal} onChange={setGoal}>
              <Option value="lose">Lose Weight</Option>
              <Option value="gain">Gain Weight</Option>
              <Option value="maintain">Maintain</Option>
            </Select>
          </Col>
        </Row>

        <Button
          type="primary"
          className="mt-6"
          style={{marginTop:20}}
          onClick={saveProgress}
          loading={loading}
        >
          Save Progress
        </Button>
      </Card>

      {progressData && (
        <Card
          className="rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7faff 50%, #f0f8ff 100%)",
              marginTop:20
          }}
        >
          <Title level={4} className="mb-2">
            📊 Weekly Summary
          </Title>
          <Paragraph type="secondary" className="mb-5">
            Here’s your current calorie balance and how it aligns with your
            fitness goal.
          </Paragraph>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                bordered={false}
                className="text-center bg-gradient-to-b from-blue-50 to-blue-100"
              >
                <FireOutlined style={{ fontSize: 28, color: "#fa8c16" }} />
                <Title level={5}>Calories Consumed</Title>
                <Text strong>{progressData.totalConsumed} kcal</Text>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                bordered={false}
                className="text-center bg-gradient-to-b from-green-50 to-green-100"
              >
                <ThunderboltOutlined style={{ fontSize: 28, color: "#52c41a" }} />
                <Title level={5}>Calories Burned</Title>
                <Text strong>{progressData.totalBurned} kcal</Text>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                bordered={false}
                className="text-center bg-gradient-to-b from-orange-50 to-orange-100"
              >
                <RiseOutlined style={{ fontSize: 28, color: "#faad14" }} />
                <Title level={5}>Net Calories</Title>
                <Text strong>{progressData.netCalories} kcal</Text>
              </Card>
            </Col>
          </Row>

          <div className="mt-8 text-center">
            <Tooltip title="A negative net calorie means you're burning more than you eat — great for weight loss!">
            <Progress
              percent={Math.min(
                Math.floor(Math.abs(progressData.netCalories / 3500) * 100),
                100
              )}
              status="active"
              strokeColor={
                progressData.netCalories < 0
                  ? "#52c41a"
                  : progressData.netCalories > 0
                  ? "#faad14"
                  : "#1890ff"
              }
            />

            </Tooltip>

            <Text
              type={
                progressData.netCalories < 0
                  ? "success"
                  : progressData.netCalories > 0
                  ? "warning"
                  : "secondary"
              }
              className="block mt-3 text-lg"
            >
              {progressData.status}
            </Text>

            <Paragraph className="mt-4 text-gray-600">
              💡 {progressData.tip ||
                "Stay consistent! Your progress compounds every week."}
            </Paragraph>
          </div>
        </Card>
      )}
    </div>
  );
}
