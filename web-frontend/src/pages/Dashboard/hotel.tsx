// pages/dashboard/hotel.jsx
import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  Row, Col, Card, Statistic, Button, Progress, 
  Table, Tag, Space, Typography, Timeline,
  Badge, Modal, Form, Input, Select, DatePicker,
  Upload, Radio
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  DatabaseOutlined,
  ShopOutlined,
  CalendarOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const HotelDashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Quick Stats Data
  const stats = [
    { title: 'Total Revenue', value: '25,400 RWF', change: '+12.5%', icon: <DollarOutlined />, color: '#52c41a' },
    { title: 'Waste Diverted', value: '1,240 kg', change: '+8.2%', icon: <EnvironmentOutlined />, color: '#1890ff' },
    { title: 'Active Listings', value: '3', change: '-1', icon: <DatabaseOutlined />, color: '#722ed1' },
    { title: 'CO2 Saved', value: '280 kg', change: '+15%', icon: <CheckCircleOutlined />, color: '#fa8c16' },
  ];

  // Recent Transactions
  const transactions = [
    { id: 1, material: 'Used Cooking Oil', quantity: '50L', price: '5,000 RWF', date: '2024-02-05', status: 'completed' },
    { id: 2, material: 'Glass Bottles', quantity: '120kg', price: '8,400 RWF', date: '2024-02-03', status: 'pending' },
    { id: 3, material: 'Cardboard', quantity: '80kg', price: '4,800 RWF', date: '2024-02-01', status: 'completed' },
  ];

  // Upcoming Pickups
  const pickups = [
    { id: 1, material: 'Glass Bottles', date: 'Tomorrow, 10:00 AM', driver: 'John D.', status: 'confirmed' },
    { id: 2, material: 'Used Cooking Oil', date: 'Feb 10, 2:00 PM', driver: 'Jane S.', status: 'pending' },
  ];

  // Green Score Component
  const GreenScore = () => (
    <Card style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4}>Your Green Score</Title>
          <Text type="secondary">Based on consistency, quality, and timeliness</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Progress 
            type="circle" 
            percent={85} 
            size={100}
            strokeColor="#52c41a"
            format={() => (
              <div>
                <Text strong style={{ fontSize: '24px' }}>85</Text>
                <br />
                <Text type="secondary">/100</Text>
              </div>
            )}
          />
          <Text style={{ display: 'block', marginTop: '8px' }}>Excellent</Text>
        </div>
      </div>
      
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={8}>
          <div>
            <Text strong>Consistency</Text>
            <Progress percent={90} size="small" />
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text strong>Quality</Text>
            <Progress percent={85} size="small" />
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text strong>Timeliness</Text>
            <Progress percent={80} size="small" />
          </div>
        </Col>
      </Row>
    </Card>
  );

  // Quick Actions
  const QuickActions = () => (
    <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Button 
            type="primary" 
            block 
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create New Listing
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            block 
            icon={<ShopOutlined />}
            onClick={() => window.location.href = '/marketplace'}
          >
            View Marketplace
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            block 
            icon={<CalendarOutlined />}
            onClick={() => window.location.href = '/dashboard/schedule'}
          >
            Check Schedule
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            block 
            icon={<LineChartOutlined />}
            onClick={() => window.location.href = '/dashboard/analytics'}
          >
            View Analytics
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Create Listing Modal
  const CreateListingModal = () => (
    <Modal
      title="Create New Waste Listing"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      width={700}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary">
          Create Listing
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Material Type" required>
              <Select placeholder="Select material type">
                <Option value="uco">Used Cooking Oil</Option>
                <Option value="glass">Glass Bottles</Option>
                <Option value="paper">Paper/Cardboard</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Quantity" required>
              <Input 
                placeholder="Enter quantity" 
                addonAfter={
                  <Select defaultValue="kg" style={{ width: 80 }}>
                    <Option value="kg">kg</Option>
                    <Option value="L">Liters</Option>
                    <Option value="units">Units</Option>
                  </Select>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Quality" required>
          <Radio.Group>
            <Radio.Button value="good">
              <Badge color="green" text="Good" />
            </Radio.Button>
            <Radio.Button value="fair">
              <Badge color="orange" text="Fair" />
            </Radio.Button>
            <Radio.Button value="poor">
              <Badge color="red" text="Poor" />
            </Radio.Button>
          </Radio.Group>
          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
            Good: Clean, well-sorted, ready for processing
          </Text>
        </Form.Item>

        <Form.Item label="Photos">
          <Upload listType="picture-card" maxCount={5}>
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Available Dates" required>
          <DatePicker.RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Minimum Price (RWF)" required>
          <Input type="number" placeholder="Enter minimum price" />
        </Form.Item>

        <Form.Item label="Location">
          <Input 
            placeholder="Click to set location on map" 
            prefix={<EnvironmentOutlined />}
            readOnly
          />
          <Button type="link" style={{ marginTop: '8px' }}>
            Set location on map
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <DashboardLayout role="hotel">
      <Title level={2}>Welcome, Hotel des Mille Collines</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Track your waste management performance and revenue
      </Text>

      <GreenScore />

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
              <Text type={stat.change.startsWith('+') ? 'success' : 'danger'}>
                {stat.change} from last month
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Recent Activity */}
          <Card title="Recent Activity">
            <Timeline>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>Glass bottles collected</Text>
                  <Text type="secondary">120kg • 8,400 RWF earned</Text>
                  <Text type="secondary">Today, 10:30 AM</Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Space direction="vertical" size={0}>
                  <Text strong>New offer received</Text>
                  <Text type="secondary">Used Cooking Oil • 7,500 RWF</Text>
                  <Text type="secondary">Yesterday, 3:15 PM</Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>Listing created</Text>
                  <Text type="secondary">Cardboard packaging • 50kg</Text>
                  <Text type="secondary">Feb 3, 2024 • 2:00 PM</Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* Active Listings */}
          <Card title="Active Listings" style={{ marginTop: '24px' }}>
            <Table 
              dataSource={[
                { id: 1, material: 'Used Cooking Oil', quantity: '100L', price: '10,000 RWF', status: 'active', offers: 3 },
                { id: 2, material: 'Glass Bottles', quantity: '200kg', price: '14,000 RWF', status: 'reserved', offers: 5 },
                { id: 3, material: 'Cardboard', quantity: '150kg', price: '9,000 RWF', status: 'pending', offers: 1 },
              ]}
              columns={[
                { title: 'Material', dataIndex: 'material', key: 'material' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Price', dataIndex: 'price', key: 'price' },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => (
                    <Tag color={
                      status === 'active' ? 'blue' : 
                      status === 'reserved' ? 'orange' : 'default'
                    }>
                      {status.toUpperCase()}
                    </Tag>
                  )
                },
                { 
                  title: 'Actions', 
                  key: 'actions',
                  render: () => (
                    <Space>
                      <Button size="small" icon={<EyeOutlined />} />
                      <Button size="small" icon={<EditOutlined />} />
                      <Button size="small" icon={<DeleteOutlined />} danger />
                    </Space>
                  )
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <QuickActions />

          {/* Upcoming Pickups */}
          <Card title="Upcoming Pickups" style={{ marginBottom: '24px' }}>
            {pickups.map(pickup => (
              <Card 
                key={pickup.id}
                size="small" 
                style={{ marginBottom: '8px', borderLeft: `4px solid ${pickup.status === 'confirmed' ? '#52c41a' : '#faad14'}` }}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>{pickup.material}</Text>
                  <Text type="secondary">
                    <ClockCircleOutlined /> {pickup.date}
                  </Text>
                  <Text type="secondary">Driver: {pickup.driver}</Text>
                  <Tag color={pickup.status === 'confirmed' ? 'success' : 'warning'}>
                    {pickup.status}
                  </Tag>
                </Space>
              </Card>
            ))}
          </Card>

          {/* Recent Transactions */}
          <Card title="Recent Transactions">
            {transactions.map(transaction => (
              <div 
                key={transaction.id}
                style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <Text strong>{transaction.material}</Text>
                  <div>
                    <Text type="secondary">{transaction.quantity} • {transaction.date}</Text>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text strong>{transaction.price}</Text>
                  <div>
                    <Tag color={transaction.status === 'completed' ? 'success' : 'warning'}>
                      {transaction.status}
                    </Tag>
                  </div>
                </div>
              </div>
            ))}
            <Button type="link" block style={{ marginTop: '16px' }}>
              View All Transactions
            </Button>
          </Card>
        </Col>
      </Row>

      <CreateListingModal />
    </DashboardLayout>
  );
};

export default HotelDashboard;