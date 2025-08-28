import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  HomeOutlined,
  LogoutOutlined,
  ProfileOutlined,
  UserOutlined,
  DashboardOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { GetCurrentUser } from "../api/users";
import { SetUser } from "../redux/userSlice";
import { message, Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
import { ShowLoading, HideLoading } from "../redux/loaderSlice";

const { Text } = Typography;

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Header, Content, Footer, Sider } = Layout;

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role display name and icon
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin Dashboard', icon: <DashboardOutlined /> };
      case 'partner':
        return { label: 'Partner Portal', icon: <ShopOutlined /> };
      default:
        return { label: 'My Profile', icon: <ProfileOutlined /> };
    }
  };

  // User menu items for dropdown
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <span
          onClick={() => {
            if (user?.role === "admin") {
              navigate("/admin");
            } else if (user?.role === "partner") {
              navigate("/partner");
            } else {
              navigate("/profile");
            }
          }}
        >
          {getRoleInfo(user?.role).label}
        </span>
      ),
      icon: getRoleInfo(user?.role).icon,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={{ color: '#ff4d4f' }}
        >
          Logout
        </span>
      ),
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
    },
  ];

  // Main navigation items
  const navItems = [
    {
      key: 'home',
      label: (
        <span
          onClick={() => navigate("/")}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'white',
            fontSize: '1rem'
          }}
        >
          <HomeOutlined />
          Home
        </span>
      ),
    },
  ];

  useEffect(() => {
    const getValidUser = async () => {
      try {
        dispatch(ShowLoading());
        const response = await GetCurrentUser();
        dispatch(HideLoading());
        dispatch(SetUser(response.data));
      } catch (err) {
        dispatch(HideLoading());
        message.error(err.message);
        navigate("/login");
      }
    };

    if (localStorage.getItem("token")) {
      getValidUser();
    } else {
      navigate("/login");
    }
  }, []);
  return (
    user && (
      <>
        <Layout>
          <Header
            className="main-header"
            style={{
              position: "fixed",
              top: 0,
              zIndex: 1000,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 2rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Left Side - Logo */}
            <div 
              className="logo-container"
              onClick={() => navigate("/")}
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <img 
                src="/seatzy-logo-100-100.png" 
                alt="Seatzy Logo" 
                style={{ 
                  height: '50px', 
                  width: 'auto',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              <span 
                style={{
                  color: 'white',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}
              >
                Seatzy
              </span>
            </div>

            {/* Center - Navigation */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Menu 
                theme="dark" 
                mode="horizontal" 
                items={navItems}
                style={{ 
                  backgroundColor: 'transparent',
                  borderBottom: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Right Side - User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Role Badge */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                color: 'white',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {user?.role || 'User'}
              </div>

              {/* User Dropdown */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
                overlayStyle={{
                  marginTop: '8px'
                }}
              >
                <div 
                  className="user-dropdown-trigger"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <Avatar 
                    size={36}
                    style={{ 
                      backgroundColor: '#e94560',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                  <div 
                    className="user-info"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      lineHeight: '1.2',
                      margin: 0
                    }}>
                      {user?.name || 'User'}
                    </Text>
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: '0.75rem',
                      lineHeight: '1.2',
                      margin: 0
                    }}>
                      {user?.email}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>

          <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
            {children}
          </div>
        </Layout>
      </>
    )
  );
};

export default ProtectedRoute;
