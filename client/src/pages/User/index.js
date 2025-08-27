import React from "react";
import { Typography } from "antd";
import Bookings from "./Bookings";

const { Title } = Typography;

function Profile() {
  return (
    <div className="page-container">
      <Title level={2} style={{ color: '#1a1a2e', marginBottom: '2rem' }}>
        My Profile
      </Title>
      <Bookings />
    </div>
  );
}

export default Profile;
