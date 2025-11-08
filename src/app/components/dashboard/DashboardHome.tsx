"use client";

import { useState, useEffect } from "react";
import { Card, Typography, DatePicker, Empty, message, Spin, Row, Col, Statistic, Progress } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import axios from "axios";
import { useSelector } from "react-redux";
import { AppleOutlined, FireOutlined, ThunderboltOutlined, AimOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DailyCalories {
  date: string;
  consumed: number;
  burned: number;
}

export default function CaloriesDashboard() {
  const user = useSelector((state: any) => state.user);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, "day"),
    dayjs(),
  ]);
  const [chartData, setChartData] = useState<DailyCalories[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  /* ---------- Fetch summary (totalConsumed, totalBurned, bmi, goalProgress) ---------- */
  const fetchSummary = async () => {
    if (!user?.uid) return message.warning("Please log in first");
    setLoadingSummary(true);
    try {
      const res = await axios.get(`/api/dashboard`, {
        params: { user_id: user.uid },
      });
      setSummary(res.data);
    } catch (err: any) {
      console.error(err);
      message.error("Failed to load summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ---------- Fetch chart data for selected date range ---------- */
  const fetchChartData = async (start: string, end: string) => {
    if (!user?.uid) return;

    setLoadingChart(true);
    try {
      const res = await axios.get(`/api/dashboard`, {
        params: { user_id: user.uid, start, end },
      });

      if (res.data?.weeklyData && Array.isArray(res.data.weeklyData)) {
        const formatted: DailyCalories[] = res.data.weeklyData.map((d: any) => ({
          ...d,
          date: dayjs(d.date).format("MMM D"),
        }));
        setChartData(formatted);
      } else {
        setChartData([]);
        message.warning("No chart data returned for the selected range");
      }
    } catch (err: any) {
      console.error(err);
      message.error("Failed to load chart data");
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchSummary();
  }, [user]);

  useEffect(() => {
    if (dateRange && user?.uid) {
      const [start, end] = dateRange;
      fetchChartData(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    }
  }, [dateRange, user]);

  if (loadingSummary)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!summary) return null;

  return (
    <div className="p-2 md:p-6">
      <Title level={3}>Your Fitness Dashboard</Title>

      {/* ---------- Summary Cards ---------- */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Calories Consumed"
              value={summary.totalConsumed || 0}
              suffix="kcal"
              prefix={<AppleOutlined className="text-green-600" />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Calories Burned"
              value={summary.totalBurned || 0}
              suffix="kcal"
              prefix={<FireOutlined className="text-orange-500" />}
              valueStyle={{ color: "#f97316" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="BMI"
              value={summary.bmi || 0}
              precision={1}
              prefix={<ThunderboltOutlined className="text-blue-500" />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-sm text-center">
            <AimOutlined className="text-green-600 text-xl mb-2" />
            <Text className="block mb-1 font-medium">Goal Progress</Text>
            <Progress
              percent={Math.round(summary.goalProgress || 0)}
              strokeColor="#16a34a"
              showInfo={true}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* ---------- Date Range Picker + Bar Chart ---------- */}
      <Card className="shadow-sm mt-4">
        <div style={{ marginBottom: 16 }}>
          <Text strong>Select Date Range: </Text>
          <RangePicker
            value={dateRange}
            onChange={(values) =>
              setDateRange(values as [dayjs.Dayjs, dayjs.Dayjs])
            }
            format="YYYY-MM-DD"
          />
        </div>

        <div
          style={{
            width: "100%",
            height: 380,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loadingChart ? (
            <Spin tip="Loading chart data..." />
          ) : chartData.length === 0 ? (
            <Empty description="No data available for the selected range." />
          ) : (
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 13, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 13, fill: "#6b7280" }} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    padding: "12px 16px",
                  }}
                  formatter={(value: number, name: string) => [`${value} kcal`, name]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="consumed"
                  name="Calories Consumed"
                  fill="#16a34a"
                  barSize={40}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="burned"
                  name="Calories Burned"
                  fill="#f97316"
                  barSize={40}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
