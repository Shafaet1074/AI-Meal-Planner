"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardHome from "../components/dashboard/DashboardHome";
import AIFoodPlan from "../components/dashboard/AIFoodPlan";
import FoodLog from "../components/dashboard/FoodLog";
import ProgressView from "../components/dashboard/ProgressView";
import {
  AppleOutlined,
  DashboardOutlined,
  FireOutlined,
  LineChartOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Drawer, Button, Spin, Tag } from "antd";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";

/* ---------- Supabase client ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false); // Desktop sidebar collapse
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false); // Mobile menu
  const [drawerVisible, setDrawerVisible] = useState(false); // Profile drawer
  const [activeMenu, setActiveMenu] = useState("1");
  const [isMobile, setIsMobile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const user = useSelector((state: any) => state.user);

  /* 🔹 Detect screen size for responsive layout */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true); // collapse desktop sidebar on mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 🔹 Fetch profile data when drawer opens */
  useEffect(() => {
    if (drawerVisible && user?.email) {
      fetchProfileData();
    }
  }, [drawerVisible, user?.email]);

  /* 🔹 Fetch profile data from Supabase */
  const fetchProfileData = async () => {
    if (!user?.email) return;

    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error) throw error;
      setProfileData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* 🔹 Format activity level for display */
  const formatActivityLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      sedentary: "Sedentary (little or no exercise)",
      light: "Lightly Active (1–3 days/week)",
      moderate: "Moderately Active (3–5 days/week)",
      active: "Active (6–7 days/week)",
      "very-active": "Very Active (intense daily exercise)",
    };
    return levels[level] || level;
  };

  /* 🔹 Format goal for display */
  const formatGoal = (goal: string) => {
    const goals: { [key: string]: string } = {
      lose: "Lose Weight",
      maintain: "Maintain Weight",
      gain: "Gain Weight",
    };
    return goals[goal] || goal;
  };

  /* 🔹 Get BMI category color */
  const getBMIColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Underweight: "blue",
      Normal: "green",
      Overweight: "orange",
      Obese: "red",
    };
    return colors[category] || "default";
  };

  /* 🔹 Render selected content */
  const renderContent = () => {
    switch (activeMenu) {
      case "1":
        return <DashboardHome />;
      case "2":
        return <AIFoodPlan />;
      case "3":
        return <FoodLog />;
      case "4":
        return <ProgressView />;
      default:
        return <DashboardHome />;
    }
  };

  /* 🔹 Sidebar menu items */
  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "2", icon: <AppleOutlined />, label: "AI Meal Plan" },
    { key: "3", icon: <FireOutlined />, label: "Food Log" },
    { key: "4", icon: <LineChartOutlined />, label: "Progress" },
    {
      key: "5",
      icon: <SettingOutlined />,
      label: "Profile",
      onClick: () => setDrawerVisible(true),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar (Tablet & Desktop) */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={230}
          className="shadow-md"
        >
          <div className="flex items-center justify-center py-4 font-bold text-xl border-b">
            <Button
              type="text"
              icon={<MenuOutlined className="text-xl" />}
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center"
            />
            {!collapsed && (
              <Link href="/">
                <span className="text-green-600 hover:text-green-700">
                  SmartMealAI
                </span>
              </Link>
            )}
          </div>

          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[activeMenu]}
            onClick={(e) => setActiveMenu(e.key)}
            items={menuItems}
          />
        </Sider>
      )}

      {/* Main Content */}
      <Layout className="flex-1">
        {/* Custom Header */}
        <div className="flex items-center justify-between bg-white shadow-sm sticky top-0 z-50 h-16 px-3 md:px-6">
          {/* Left side: Hamburger for mobile + greeting */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setMobileDrawerOpen(true)}
              />
            )}
            <h1 className="text-green-600 font-bold text-lg md:text-xl">
              {isMobile
                ? "SmartMealAI"
                : `Welcome back, ${user.displayName || "User"} 👋`}
            </h1>
          </div>

          {/* Right side: Profile Avatar */}
          <Avatar
            size="large"
            src={user.photoURL || undefined}
            icon={<UserOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="cursor-pointer border"
          />
        </div>

        {/* Page content */}
        <Content className="p-2 md:p-6 bg-gray-50 overflow-y-auto">
          {renderContent()}
        </Content>
      </Layout>

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          title="SmartMealAI Menu"
          placement="left"
          closable
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            onClick={(e) => {
              setActiveMenu(e.key);
              setMobileDrawerOpen(false);
            }}
            items={menuItems}
          />
        </Drawer>
      )}

      {/* Profile Drawer */}
      <Drawer
        title="Your Profile"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        extra={
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => {
              setDrawerVisible(false);
              window.location.href = "/setup-profile";
            }}
          >
            Edit Profile
          </Button>
        }
      >
        {loadingProfile ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex gap-6 items-center space-x-4">
              <Avatar
                size={80}
                src={user.photoURL || undefined}
                icon={<UserOutlined />}
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {profileData?.name || user.displayName || "User Name"}
                </h2>
                <p className="text-gray-600">{user.email || "No email provided"}</p>
                {profileData?.age && (
                  <p className="text-gray-500">{profileData.age} years old</p>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium capitalize">{profileData?.gender || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Age</label>
                  <p className="font-medium">{profileData?.age ? `${profileData.age} years` : "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Height</label>
                  <p className="font-medium">{profileData?.height ? `${profileData.height} cm` : "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Weight</label>
                  <p className="font-medium">{profileData?.weight ? `${profileData.weight} kg` : "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            {(profileData?.bmi || profileData?.bmi_category) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">Health Metrics</h3>
                {profileData?.bmi && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">BMI</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{profileData.bmi}</span>
                      {profileData?.bmi_category && (
                        <Tag color={getBMIColor(profileData.bmi_category)}>
                          {profileData.bmi_category}
                        </Tag>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fitness Goals */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">Fitness Goals</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Activity Level</span>
                <span className="font-semibold text-right">
                  {profileData?.activity_level ? formatActivityLevel(profileData.activity_level) : "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Primary Goal</span>
                <Tag color={profileData?.goal === 'lose' ? 'red' : profileData?.goal === 'gain' ? 'blue' : 'green'}>
                  {profileData?.goal ? formatGoal(profileData.goal) : "Not set"}
                </Tag>
              </div>
            </div>

            {/* Last Updated */}
            {profileData?.updated_at && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Last updated: {new Date(profileData.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!profileData && !loadingProfile && (
              <div className="text-center py-8">
                <UserOutlined className="text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No profile data found</p>
                <Button 
                  type="primary" 
                  onClick={() => {
                    setDrawerVisible(false);
                    window.location.href = "/setup-profile";
                  }}
                >
                  Complete Your Profile
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
