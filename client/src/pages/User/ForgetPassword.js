import React, { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ForgetPassword } from "../../api/users";
import { message } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Forget() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await ForgetPassword(values);
      
      if (response.success) {
        message.success(response.message);
        
        // Set session storage to track valid reset password flow
        sessionStorage.setItem('resetPasswordSession', 'true');
        sessionStorage.setItem('resetPasswordEmail', values.email);
        sessionStorage.setItem('resetPasswordTimestamp', Date.now().toString());
        
        message.info("Please check your email for the OTP", 3);
        
        // Navigate without email in URL for better security
        navigate('/reset', { 
          state: { 
            email: values.email,
            fromForgetPassword: true 
          } 
        });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <>
      <header className="App-header">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={2} style={{ color: '#1a1a2e', margin: 0 }}>
              Forgot Your Password?
            </Title>
            <Text type="secondary" style={{ fontSize: '1rem', display: 'block', marginTop: '0.5rem' }}>
              No worries! Enter your email and we'll send you an OTP to reset your password
            </Text>
          </div>
          
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email address" }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#999' }} />}
                placeholder="Enter your email address"
                type="email"
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
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Text>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#e94560', fontWeight: '600' }}>
                  Sign In
                </Link>
              </Text>
              <Link 
                to="/login" 
                style={{ 
                  color: '#0f3460', 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeftOutlined style={{ marginRight: '0.5rem' }} />
                Back to Login
              </Link>
            </Space>
          </div>
        </div>
      </header>
    </>
  );
}

export default Forget;
