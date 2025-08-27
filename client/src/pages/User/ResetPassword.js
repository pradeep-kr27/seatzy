import React, { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Space } from "antd";
import { ResetPassword, ForgetPassword } from "../../api/users";
import { message } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LockOutlined, MailOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Reset() {
  const { email: urlEmail } = useParams(); // Extract email from URL parameters (old approach)
  const location = useLocation(); // Get state from navigation (new approach)
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isResending, setIsResending] = useState(false);
  
  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOTP = async () => {
    if (!canResend || !userEmail) return;

    try {
      setIsResending(true);
      const response = await ForgetPassword({ email: userEmail });
      
      if (response.success) {
        message.success("OTP sent successfully to your email!");
        setCanResend(false);
        setResendTimer(60); // 1 minute timer
        
        // Update session timestamp
        sessionStorage.setItem('resetPasswordTimestamp', Date.now().toString());
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Failed to send OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleLoginRedirect = () => {
    // Clear reset password session when user goes to login
    sessionStorage.removeItem('resetPasswordSession');
    sessionStorage.removeItem('resetPasswordEmail');
    sessionStorage.removeItem('resetPasswordTimestamp');
    navigate('/login');
  };

  const onFinish = async (values) => {
    try {
      const response = await ResetPassword(values, userEmail);
      if (response.success) {
        message.success(response.message);
        // Clear the session flag and redirect
        sessionStorage.removeItem('resetPasswordSession');
        sessionStorage.removeItem('resetPasswordEmail');
        sessionStorage.removeItem('resetPasswordTimestamp');
        navigate("/login");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    if (localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    // Try to get email from different sources
    let emailToUse = '';
    
    // Method 1: From navigation state (new secure approach)
    if (location.state?.email && location.state?.fromForgetPassword) {
      emailToUse = location.state.email;
    }
    // Method 2: From URL parameter (old approach, but validate session)
    else if (urlEmail) {
      emailToUse = decodeURIComponent(urlEmail);
    }
    // Method 3: From session storage
    else {
      emailToUse = sessionStorage.getItem('resetPasswordEmail');
    }

    // Check if user came from forget password page
    const resetSession = sessionStorage.getItem('resetPasswordSession');
    const sessionEmail = sessionStorage.getItem('resetPasswordEmail');
    const timestamp = sessionStorage.getItem('resetPasswordTimestamp');
    
    if (!resetSession || !sessionEmail) {
      message.error("Invalid access. Please use the forgot password flow.");
      navigate("/forget");
      return;
    }

    // Check if session is not too old (30 minutes)
    if (timestamp && (Date.now() - parseInt(timestamp)) > 30 * 60 * 1000) {
      message.error("Session expired. Please request a new OTP.");
      sessionStorage.clear();
      navigate("/forget");
      return;
    }

    // Verify the email matches the session
    if (!emailToUse || sessionEmail !== emailToUse) {
      message.error("Invalid email parameter.");
      navigate("/forget");
      return;
    }

    setUserEmail(emailToUse);
    setIsValidSession(true);
  }, [urlEmail, location, navigate]);

  // Only render the form if session is valid
  if (!isValidSession) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Validating access...
      </div>
    );
  }

  return (
    <>
      <header className="App-header">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={2} style={{ color: '#1a1a2e', margin: 0 }}>
              Reset Your Password
            </Title>
            <Text type="secondary" style={{ fontSize: '1rem', display: 'block', marginTop: '0.5rem' }}>
              <MailOutlined style={{ marginRight: '0.5rem' }} />
              OTP sent to: {userEmail}
            </Text>
          </div>
          
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Enter OTP"
              name="otp"
              rules={[
                { required: true, message: "OTP is required" },
                { len: 6, message: "OTP must be 6 digits" }
              ]}
            >
              <Input
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="Enter your new password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '1rem' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ 
                  height: '48px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          {/* Resend OTP Section */}
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Didn't receive the OTP?
            </Text>
            
            {canResend ? (
              <Button
                type="link"
                onClick={handleResendOTP}
                loading={isResending}
                style={{ 
                  color: '#e94560', 
                  fontWeight: '600',
                  padding: 0
                }}
              >
                {isResending ? 'Sending OTP...' : 'Send OTP Again'}
              </Button>
            ) : (
              <Space align="center">
                <ClockCircleOutlined style={{ color: '#999' }} />
                <Text type="secondary">
                  Resend OTP in {formatTime(resendTimer)}
                </Text>
              </Space>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Remember your password?{' '}
              <span 
                onClick={handleLoginRedirect}
                style={{ 
                  color: '#e94560', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </span>
            </Text>
          </div>
        </div>
      </header>
    </>
  );
}

export default Reset;
