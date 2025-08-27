import React from "react";
import { Form, Button, Input, message, Typography, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/users";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await LoginUser(values);
      if (response.success) {
        message.success(response.message);
        localStorage.setItem("token", response.data);
        navigate("/");
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="App-header">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={2} style={{ color: '#1a1a2e', margin: 0 }}>
              Welcome Back to Seatzy
            </Title>
            <Text type="secondary" style={{ fontSize: '1rem' }}>
              Sign in to book your favorite movies
            </Text>
          </div>
          
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="Enter your email address"
                type="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '1rem' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ 
                  height: '48px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Space direction="vertical" size="small">
                <Text>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#e94560', fontWeight: '600' }}>
                    Create Account
                  </Link>
                </Text>
                <Link to="/forget" style={{ color: '#0f3460' }}>
                  Forgot your password?
                </Link>
              </Space>
            </div>
          </Form>
        </div>
      </main>
    </>
  );
}

export default Login;
