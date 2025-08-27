import React from "react";
import { Form, Button, Input, message, Radio, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { RegisterUser } from "../../api/users";
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Register() {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await RegisterUser(values);
      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
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
              Join Seatzy Today
            </Title>
            <Text type="secondary" style={{ fontSize: '1rem' }}>
              Create your account to start booking movies
            </Text>
          </div>
          
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="Enter your full name"
              />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#999' }} />}
                placeholder="Enter your email address"
                type="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="Create a strong password"
              />
            </Form.Item>

            <Form.Item
              label="Account Type"
              name="role"
              rules={[{ required: true, message: "Please select account type" }]}
            >
              <Radio.Group>
                <Space direction="horizontal" size="large">
                  <Radio value="user">
                    <Space>
                      <UserOutlined />
                      Movie Fan
                    </Space>
                  </Radio>
                  <Radio value="partner">
                    <Space>
                      <TeamOutlined />
                      Theatre Partner
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#e94560', fontWeight: '600' }}>
                  Sign In
                </Link>
              </Text>
            </div>
          </Form>
        </div>
      </main>
    </>
  );
}

export default Register;
