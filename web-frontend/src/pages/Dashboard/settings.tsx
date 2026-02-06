import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
  Tabs, Form, Input, Button, Upload, Switch,
  Select, Row, Col, Card, Typography,
  Avatar, Divider,
  Table, Tag
} from 'antd';
import {
  UserOutlined,
  BellOutlined,
  LockOutlined,
  DollarOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SettingsPage = ({ role = 'hotel' }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const onFinish = (_values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const profileSettings = (
    <Card>
      <Form layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={24} style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <div style={{ marginTop: '12px' }}>
              <Upload>
                <Button icon={<UploadOutlined />}>Change Logo/Photo</Button>
              </Upload>
            </div>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Business Name"
              name="businessName"
              rules={[{ required: true, message: 'Please input your business name!' }]}
            >
              <Input placeholder="Enter business name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Contact Person"
              name="contactPerson"
            >
              <Input placeholder="Enter contact person name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="business@email.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
            >
              <Input prefix={<PhoneOutlined />} placeholder="+250 78 123 4567" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Address" name="address">
          <Input.TextArea rows={3} placeholder="Enter your business address" />
        </Form.Item>

        <Form.Item label="Business Description" name="description">
          <Input.TextArea rows={4} placeholder="Describe your business..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const notificationSettings = (
    <Card>
      <Form layout="vertical" onFinish={onFinish}>
        <Title level={5}>Email Notifications</Title>
        <Form.Item name="emailOffers">
          <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          <Text style={{ marginLeft: '12px' }}>New offers on my listings</Text>
        </Form.Item>

        <Form.Item name="emailCollections">
          <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          <Text style={{ marginLeft: '12px' }}>Upcoming collection reminders</Text>
        </Form.Item>

        <Form.Item name="emailPayments">
          <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          <Text style={{ marginLeft: '12px' }}>Payment notifications</Text>
        </Form.Item>

        <Divider />

        <Title level={5}>SMS Notifications</Title>
        <Form.Item name="smsUrgent">
          <Switch checkedChildren="On" unCheckedChildren="Off" />
          <Text style={{ marginLeft: '12px' }}>Urgent alerts only</Text>
        </Form.Item>

        <Divider />

        <Title level={5}>Push Notifications</Title>
        <Form.Item name="pushAll">
          <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          <Text style={{ marginLeft: '12px' }}>All notifications</Text>
        </Form.Item>

        <Form.Item name="quietHours">
          <Switch checkedChildren="On" unCheckedChildren="Off" />
          <Text style={{ marginLeft: '12px' }}>Enable quiet hours (10PM - 7AM)</Text>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Notification Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const securitySettings = (
    <Card>
      <Form layout="vertical" onFinish={onFinish}>
        <Title level={5}>Change Password</Title>
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your current password!' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input new password!' }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your password!' }]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Divider />

        <Title level={5}>Two-Factor Authentication</Title>
        <Form.Item name="twoFactor">
          <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          <Text style={{ marginLeft: '12px' }}>Require 2FA for login</Text>
        </Form.Item>

        <Divider />

        <Title level={5}>Active Sessions</Title>
        <Table
          dataSource={[
            { device: 'Chrome on Windows', location: 'Kigali, Rwanda', lastActive: 'Now', current: true },
            { device: 'Safari on iPhone', location: 'Kigali, Rwanda', lastActive: '2 hours ago', current: false },
          ]}
          columns={[
            { title: 'Device', dataIndex: 'device', key: 'device' },
            { title: 'Location', dataIndex: 'location', key: 'location' },
            { title: 'Last Active', dataIndex: 'lastActive', key: 'lastActive' },
            { 
              title: 'Status', 
              key: 'status',
              render: (_, record) => record.current ? 
                <Tag color="green">Current</Tag> : 
                <Button size="small" danger>Revoke</Button>
            },
          ]}
          pagination={false}
        />

        <Form.Item style={{ marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Security Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const billingSettings = (
    <Card>
      <Form layout="vertical" onFinish={onFinish}>
        <Title level={5}>Payment Methods</Title>
        <Form.Item label="Default Payment Method">
          <Select 
            defaultValue="mtn"
            options={[
              { value: 'mtn', label: 'MTN Mobile Money' },
              { value: 'airtel', label: 'Airtel Money' },
              { value: 'bank', label: 'Bank Transfer' }
            ]}
          />
        </Form.Item>

        <Divider />

        <Title level={5}>Bank Account Details</Title>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Bank Name" name="bankName">
              <Input placeholder="Bank of Kigali" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Account Number" name="accountNumber">
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Account Holder" name="accountHolder">
              <Input placeholder="Account holder name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Swift Code" name="swiftCode">
              <Input placeholder="BKIGRWRW" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Mobile Money</Title>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="MTN Mobile Money" name="mtnNumber">
              <Input placeholder="078 123 4567" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Airtel Money" name="airtelNumber">
              <Input placeholder="073 123 4567" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Billing Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <DashboardLayout role={role}>
      <Title level={2}>Account Settings</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Manage your profile, notifications, and security settings
      </Text>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Profile" key="profile" icon={<UserOutlined />}>
          {profileSettings}
        </TabPane>
        <TabPane tab="Notifications" key="notifications" icon={<BellOutlined />}>
          {notificationSettings}
        </TabPane>
        <TabPane tab="Security" key="security" icon={<LockOutlined />}>
          {securitySettings}
        </TabPane>
        <TabPane tab="Billing" key="billing" icon={<DollarOutlined />}>
          {billingSettings}
        </TabPane>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;