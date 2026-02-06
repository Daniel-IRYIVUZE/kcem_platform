import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
  Row, Col, Card, Statistic, Button, Table, Tag,
  Progress, Space, Typography,
  DatePicker, Steps, Radio
} from 'antd';
import {
  CarOutlined,
  TeamOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RecyclerDashboard = () => {
  const [selectedDate, setSelectedDate] = useState('today');

  // Stats for recycler
  const stats = [
    { title: 'Total Collections', value: '48', change: '+15%', icon: <CarOutlined />, color: '#1890ff' },
    { title: 'Active Drivers', value: '5/8', change: '+1', icon: <TeamOutlined />, color: '#52c41a' },
    { title: 'Revenue', value: '120,400 RWF', change: '+22%', icon: <DollarOutlined />, color: '#fa8c16' },
    { title: 'Materials Processed', value: '2.4T', change: '+18%', icon: <EnvironmentOutlined />, color: '#722ed1' },
  ];

  // Active collections
  const activeCollections = [
    { id: 1, hotel: 'Hotel des Mille Collines', material: 'Glass', quantity: '120kg', driver: 'John D.', eta: '10:30 AM', status: 'in-transit' },
    { id: 2, hotel: 'Kigali Marriott', material: 'UCO', quantity: '80L', driver: 'Jane S.', eta: '11:15 AM', status: 'loading' },
    { id: 3, hotel: 'Radisson Blu', material: 'Cardboard', quantity: '200kg', driver: 'Mike T.', eta: '1:30 PM', status: 'scheduled' },
  ];

  // Driver Management Component
  const DriverManagement = () => (
    <Card title="Driver Management" extra={<Button type="link">Manage All</Button>}>
      <Table
        dataSource={[
          { id: 1, name: 'John D.', phone: '+250 78 123 4567', status: 'active', tasks: 3, rating: 4.8 },
          { id: 2, name: 'Jane S.', phone: '+250 78 987 6543', status: 'active', tasks: 2, rating: 4.9 },
          { id: 3, name: 'Mike T.', phone: '+250 73 456 7890', status: 'break', tasks: 1, rating: 4.7 },
          { id: 4, name: 'Sarah M.', phone: '+250 78 111 2233', status: 'off-duty', tasks: 0, rating: 4.6 },
        ]}
        columns={[
          { title: 'Driver', dataIndex: 'name', key: 'name' },
          { title: 'Status', dataIndex: 'status', key: 'status',
            render: (status) => (
              <Tag color={
                status === 'active' ? 'success' : 
                status === 'break' ? 'warning' : 'default'
              }>
                {status.toUpperCase()}
              </Tag>
            )
          },
          { title: 'Active Tasks', dataIndex: 'tasks', key: 'tasks' },
          { title: 'Rating', dataIndex: 'rating', key: 'rating',
            render: (rating) => (
              <Space>
                <Progress percent={rating * 20} size="small" showInfo={false} />
                <Text>{rating}</Text>
              </Space>
            )
          },
          { title: 'Actions', key: 'actions',
            render: () => (
              <Space>
                <Button size="small">Assign</Button>
                <Button size="small">Message</Button>
              </Space>
            )
          },
        ]}
        pagination={false}
      />
    </Card>
  );

  // Route Optimization Component
  const RouteOptimization = () => (
    <Card title="Route Optimization" extra={
      <Space>
        <Button icon={<DownloadOutlined />}>Export</Button>
        <Button type="primary">Optimize Now</Button>
      </Space>
    }>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <Text strong>Today's Route</Text>
          <div>
            <Text type="secondary">8 stops • 42km • Estimated 3.5 hours</Text>
          </div>
        </div>
        <Tag color="blue">OPTIMIZED</Tag>
      </div>

      <Steps 
        direction="vertical" 
        current={2}
        items={[
          {
            title: "Hotel des Mille Collines",
            description: "Glass • 120kg • 9:00 AM",
            status: "finish"
          },
          {
            title: "Kigali Marriott",
            description: "UCO • 80L • 10:15 AM",
            status: "finish"
          },
          {
            title: "Radisson Blu",
            description: "Cardboard • 200kg • 11:30 AM",
            status: "process"
          },
          {
            title: "Ubumwe Grande Hotel",
            description: "Glass • 150kg • 1:00 PM",
            status: "wait"
          },
          {
            title: "Return to Facility",
            description: "Estimated 2:30 PM",
            status: "wait"
          }
        ]}
      />

      <div style={{ marginTop: '16px', padding: '12px', background: '#f6ffed', borderRadius: '4px' }}>
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text type="success">
            Route optimized: Saves 12km and 45 minutes compared to manual routing
          </Text>
        </Space>
      </div>
    </Card>
  );

  return (
    <DashboardLayout role="recycler">
      <Title level={2}>Recycling Operations Dashboard</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Manage your collection operations and driver teams
      </Text>

      {/* Date Filter */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Text strong>Show data for:</Text>
          <Radio.Group value={selectedDate} onChange={(e: any) => setSelectedDate(e.target.value)}>
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="week">This Week</Radio.Button>
            <Radio.Button value="month">This Month</Radio.Button>
            <Radio.Button value="custom">
              <RangePicker size="small" />
            </Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

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
                {stat.change} from last period
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <RouteOptimization />

          {/* Collection Verification Queue */}
          <Card title="Collection Verification Queue" style={{ marginTop: '24px' }}>
            <Table
              dataSource={[
                { id: 1, hotel: 'Hotel des Mille Collines', driver: 'John D.', material: 'Glass', 
                  quantity: '120kg', time: '10:30 AM', status: 'pending' },
                { id: 2, hotel: 'Kigali Marriott', driver: 'Jane S.', material: 'UCO', 
                  quantity: '80L', time: '11:15 AM', status: 'verified' },
              ]}
              columns={[
                { title: 'Hotel', dataIndex: 'hotel', key: 'hotel' },
                { title: 'Driver', dataIndex: 'driver', key: 'driver' },
                { title: 'Material', dataIndex: 'material', key: 'material' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Time', dataIndex: 'time', key: 'time' },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'verified' ? 'success' : 'warning'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                },
                { 
                  title: 'Actions', 
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button size="small">View Photos</Button>
                      {record.status === 'pending' && (
                        <Button size="small" type="primary">Verify</Button>
                      )}
                    </Space>
                  )
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <DriverManagement />

          {/* Active Collections */}
          <Card title="Active Collections" style={{ marginBottom: '24px' }}>
            {activeCollections.map(collection => (
              <Card 
                key={collection.id}
                size="small" 
                style={{ 
                  marginBottom: '8px',
                  borderLeft: `4px solid ${
                    collection.status === 'in-transit' ? '#1890ff' : 
                    collection.status === 'loading' ? '#faad14' : '#d9d9d9'
                  }`
                }}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>{collection.hotel}</Text>
                  <Text>{collection.material} • {collection.quantity}</Text>
                  <Text type="secondary">
                    <CarOutlined /> Driver: {collection.driver}
                  </Text>
                  <Text type="secondary">
                    <ClockCircleOutlined /> ETA: {collection.eta}
                  </Text>
                  <Tag color={
                    collection.status === 'in-transit' ? 'blue' : 
                    collection.status === 'loading' ? 'orange' : 'default'
                  }>
                    {collection.status}
                  </Tag>
                </Space>
              </Card>
            ))}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<SearchOutlined />} onClick={() => window.location.href = '/marketplace'}>
                Browse New Listings
              </Button>
              <Button block icon={<TeamOutlined />} onClick={() => window.location.href = '/dashboard/schedule'}>
                Schedule Pickups
              </Button>
              <Button block icon={<FilterOutlined />} onClick={() => window.location.href = '/dashboard/analytics'}>
                View Analytics
              </Button>
              <Button block icon={<DownloadOutlined />}>
                Export Reports
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
};

export default RecyclerDashboard;