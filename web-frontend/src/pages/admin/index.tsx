// pages/admin/index.jsx
import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
  Row, Col, Card, Statistic, Table, Tag, Button,
  Space, Typography, Select, Input,
  Modal, Form, Switch, Tabs,
  Avatar, List, Alert, Timeline
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface User {
  id: number;
  name: string;
  type: string;
  date: string;
  status: string;
}

const AdminDashboard = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // Platform Overview Stats
  const platformStats = [
    { title: 'Total Users', value: '1,248', change: '+15%', icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Active Listings', value: '156', change: '+8%', icon: <ShopOutlined />, color: '#52c41a' },
    { title: 'Transactions Today', value: '42', change: '+23%', icon: <DollarOutlined />, color: '#fa8c16' },
    { title: 'CO2 Saved', value: '4.2T', change: '+18%', icon: <CheckCircleOutlined />, color: '#722ed1' },
  ];

  // System Health Metrics
  const systemHealth = [
    { component: 'API Server', status: 'healthy', uptime: '99.9%', response: '45ms' },
    { component: 'Database', status: 'healthy', uptime: '99.8%', response: '12ms' },
    { component: 'Payment Gateway', status: 'warning', uptime: '99.5%', response: '120ms' },
    { component: 'Email Service', status: 'healthy', uptime: '99.7%', response: '85ms' },
  ];

  // Recent Signups
  const recentSignups = [
    { id: 1, name: 'Hotel des Mille Collines', type: 'hotel', date: '2024-02-07', status: 'verified' },
    { id: 2, name: 'GreenTech Recycling', type: 'recycler', date: '2024-02-06', status: 'pending' },
    { id: 3, name: 'John Driver', type: 'driver', date: '2024-02-06', status: 'verified' },
    { id: 4, name: 'Kigali Coffee Shop', type: 'hotel', date: '2024-02-05', status: 'verified' },
  ];

  // User Management Modal
  const UserManagementModal = () => (
    <Modal
      title="User Management"
      visible={isUserModalVisible}
      onCancel={() => setIsUserModalVisible(false)}
      width={800}
      footer={[
        <Button key="cancel" onClick={() => setIsUserModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="save" type="primary">
          Save Changes
        </Button>,
      ]}
    >
      {selectedUser && (
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Business Name">
                <Input defaultValue={selectedUser.name} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input defaultValue="contact@business.rw" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="User Role">
                <Select 
                  defaultValue={selectedUser.type}
                  options={[
                    { value: 'hotel', label: 'Hotel/Restaurant' },
                    { value: 'recycler', label: 'Recycling Company' },
                    { value: 'driver', label: 'Driver' },
                    { value: 'admin', label: 'Administrator' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Account Status">
                <Select 
                  defaultValue={selectedUser.status}
                  options={[
                    { value: 'verified', label: 'Verified' },
                    { value: 'pending', label: 'Pending Verification' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'banned', label: 'Banned' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Verification Documents">
            <List
              size="small"
              dataSource={[
                { name: 'Business License.pdf', size: '2.4MB' },
                { name: 'Tax Certificate.pdf', size: '1.8MB' },
              ]}
              renderItem={item => (
                <List.Item
                  actions={[<a key="view">View</a>, <a key="download">Download</a>]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`Size: ${item.size}`}
                  />
                </List.Item>
              )}
            />
          </Form.Item>

          <Form.Item label="Permissions">
            <Space direction="vertical">
              <Switch checkedChildren="Can create listings" unCheckedChildren="Cannot create listings" defaultChecked />
              <Switch checkedChildren="Can make offers" unCheckedChildren="Cannot make offers" defaultChecked />
              <Switch checkedChildren="Can withdraw funds" unCheckedChildren="Cannot withdraw funds" defaultChecked />
            </Space>
          </Form.Item>

          <Form.Item label="Notes">
            <Input.TextArea rows={4} placeholder="Add admin notes about this user..." />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );

  return (
    <DashboardLayout role="admin">
      <Title level={2}>Platform Administration</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Monitor system health, manage users, and configure platform settings
      </Text>

      {/* Platform Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {platformStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
              <Text type={stat.change.startsWith('+') ? 'success' : 'danger'}>
                {stat.change} from last week
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* System Health Monitoring */}
          <Card title="System Health Monitoring">
            <Table
              dataSource={systemHealth}
              columns={[
                { title: 'Component', dataIndex: 'component', key: 'component' },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'error'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                },
                { title: 'Uptime', dataIndex: 'uptime', key: 'uptime' },
                { title: 'Avg Response', dataIndex: 'response', key: 'response' },
                { 
                  title: 'Actions', 
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button size="small">View Logs</Button>
                      {record.status !== 'healthy' && (
                        <Button size="small" type="primary">Restart</Button>
                      )}
                    </Space>
                  )
                },
              ]}
              pagination={false}
            />
          </Card>

          {/* Content Moderation Queue */}
          <Card title="Content Moderation Queue" style={{ marginTop: '24px' }}>
            <Tabs defaultActiveKey="listings">
              <TabPane tab="Pending Listings (12)" key="listings">
                <List
                  dataSource={[
                    { id: 1, business: 'New Hotel Kigali', material: 'UCO 200L', date: '2 hours ago' },
                    { id: 2, business: 'City Restaurant', material: 'Glass 150kg', date: '4 hours ago' },
                  ]}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button key="approve" type="primary" size="small">Approve</Button>,
                        <Button key="reject" danger size="small">Reject</Button>,
                        <Button key="view" size="small">View Details</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.business}
                        description={`Material: ${item.material} • Submitted: ${item.date}`}
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab="Dispute Resolution (3)" key="disputes">
                <Alert
                  message="Payment Dispute"
                  description="Hotel claims non-payment for 120kg glass collection"
                  type="warning"
                  showIcon
                  style={{ marginBottom: '12px' }}
                />
                <Alert
                  message="Quality Dispute"
                  description="Recycler claims materials were contaminated"
                  type="warning"
                  showIcon
                />
              </TabPane>
              <TabPane tab="Fraud Alerts (2)" key="fraud">
                <Alert
                  message="Suspicious Activity"
                  description="Multiple accounts from same IP address"
                  type="error"
                  showIcon
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Recent Signups */}
          <Card 
            title="Recent Signups" 
            extra={<Button type="link">View All</Button>}
            style={{ marginBottom: '24px' }}
          >
            <List
              dataSource={recentSignups}
              renderItem={user => (
                <List.Item
                  actions={[
                    <Button 
                      key="manage" 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsUserModalVisible(true);
                      }}
                    />,
                    user.status === 'pending' ? (
                      <Button key="verify" size="small" type="primary">Verify</Button>
                    ) : (
                      <Button key="suspend" size="small" danger>Suspend</Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={user.name}
                    description={
                      <Space>
                        <Tag color={user.type === 'hotel' ? 'blue' : user.type === 'recycler' ? 'green' : 'orange'}>
                          {user.type}
                        </Tag>
                        <Text type="secondary">{user.date}</Text>
                        <Tag color={user.status === 'verified' ? 'success' : 'warning'}>
                          {user.status}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* User Activity Timeline */}
          <Card title="Recent Activity Timeline">
            <Timeline>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>System Update Completed</Text>
                  <Text type="secondary">Version 2.1.0 deployed successfully</Text>
                  <Text type="secondary">Today, 02:00 AM</Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Space direction="vertical" size={0}>
                  <Text strong>New Recycling Company Registered</Text>
                  <Text type="secondary">GreenTech Recycling verification pending</Text>
                  <Text type="secondary">Yesterday, 15:30</Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Space direction="vertical" size={0}>
                  <Text strong>Payment Dispute Reported</Text>
                  <Text type="secondary">Case #DR-2024-002 requires attention</Text>
                  <Text type="secondary">Feb 6, 11:45 AM</Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* Quick Admin Actions */}
          <Card title="Quick Actions" style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<UserOutlined />} onClick={() => window.location.href = '/admin/users'}>
                User Management
              </Button>
              <Button block icon={<FilterOutlined />} onClick={() => window.location.href = '/admin/listings'}>
                Content Moderation
              </Button>
              <Button block icon={<LineChartOutlined />} onClick={() => window.location.href = '/admin/analytics'}>
                Advanced Analytics
              </Button>
              <Button block icon={<SettingOutlined />} onClick={() => window.location.href = '/admin/settings'}>
                System Configuration
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* System Configuration Preview */}
      <Card title="System Configuration" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Commission Rate" value="5%" />
              <Button type="link" size="small">Edit</Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Minimum Listing Price" value="1,000 RWF" />
              <Button type="link" size="small">Edit</Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Auto-approval Threshold" value="4.5 ★" />
              <Button type="link" size="small">Edit</Button>
            </Card>
          </Col>
        </Row>
      </Card>

      <UserManagementModal />
    </DashboardLayout>
  );
};

export default AdminDashboard;