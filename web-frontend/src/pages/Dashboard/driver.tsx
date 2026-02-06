import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
  Row, Col, Card, Button, Typography, Steps,
  Space, Tag, Progress, Modal, Form, Input, Upload,
  Badge, Divider, Descriptions, Select, Radio
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  PhoneOutlined,
  MessageOutlined,
  TrophyOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DriverDashboard = () => {
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);

  const tasks = [
    {
      id: 1,
      hotel: 'Hotel des Mille Collines',
      address: 'KN 2 Ave, Kigali',
      material: 'Glass Bottles',
      quantity: '120kg',
      scheduledTime: '10:00 AM - 10:30 AM',
      status: 'in-progress',
      instructions: 'Collect from back loading dock. Contact: John (078 123 4567)',
      distance: '2.3km',
      estimatedPay: '2,500 RWF'
    },
    {
      id: 2,
      hotel: 'Kigali Marriott',
      address: 'KG 456 St, Kigali',
      material: 'Used Cooking Oil',
      quantity: '80L',
      scheduledTime: '11:15 AM - 11:45 AM',
      status: 'upcoming',
      instructions: 'Bring containers for oil transfer',
      distance: '4.1km',
      estimatedPay: '2,000 RWF'
    },
  ];

  const earnings = [
    { day: 'Monday', amount: '12,500 RWF', collections: 5 },
    { day: 'Tuesday', amount: '14,200 RWF', collections: 6 },
    { day: 'Wednesday', amount: '11,800 RWF', collections: 5 },
    { day: 'Today (so far)', amount: '6,500 RWF', collections: 2 },
  ];

  const VerificationModal = () => (
    <Modal
      title="Collection Verification"
      visible={isVerificationModalVisible}
      onCancel={() => setIsVerificationModalVisible(false)}
      width={600}
      footer={[
        <Button key="cancel" onClick={() => setIsVerificationModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary">
          Submit Verification
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Collection Photos" required>
          <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
            Upload photos of the collected materials
          </Text>
          <Upload listType="picture-card" maxCount={4}>
            <div>
              <CameraOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Actual Quantity Collected" required>
          <Input 
            placeholder="Enter actual quantity" 
            addonAfter={
              <Select 
                defaultValue="kg" 
                style={{ width: 80 }}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'L', label: 'Liters' }
                ]}
              />
            }
          />
        </Form.Item>

        <Form.Item label="Quality Check">
          <Radio.Group>
            <Radio value="excellent">Excellent (Clean, well-sorted)</Radio>
            <Radio value="good">Good (Minor contamination)</Radio>
            <Radio value="fair">Fair (Requires sorting)</Radio>
            <Radio value="poor">Poor (Heavily contaminated)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Driver Notes">
          <Input.TextArea placeholder="Add any notes about the collection..." rows={3} />
        </Form.Item>

        <Form.Item label="Digital Signature">
          <div style={{ border: '1px solid #d9d9d9', padding: '24px', textAlign: 'center', borderRadius: '4px' }}>
            <Text type="secondary">Draw your signature here</Text>
            <div style={{ height: '100px', background: '#f5f5f5', margin: '16px 0' }} />
            <Button>Clear</Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <DashboardLayout role="driver">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Good Morning, John!</Title>
                <Text type="secondary">You have {tasks.filter(t => t.status === 'upcoming').length} collections scheduled today</Text>
              </div>
              <Space>
                <Badge count={3}>
                  <Button icon={<MessageOutlined />}>Messages</Button>
                </Badge>
                <Button type="primary" icon={<CarOutlined />}>Start Shift</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Current Task */}
          <Card 
            title={
              <Space>
                <CarOutlined />
                <Text strong>Current Collection</Text>
                <Tag color="processing">IN PROGRESS</Tag>
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => setIsVerificationModalVisible(true)}
              >
                Complete Collection
              </Button>
            }
          >
            {tasks[0] && (
              <>
                <Descriptions column={2} bordered style={{ marginBottom: '24px' }}>
                  <Descriptions.Item label="Hotel" span={2}>
                    <Text strong>{tasks[0].hotel}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    <Space>
                      <EnvironmentOutlined />
                      {tasks[0].address}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact">
                    <Space>
                      <PhoneOutlined />
                      John (078 123 4567)
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Material">{tasks[0].material}</Descriptions.Item>
                  <Descriptions.Item label="Quantity">{tasks[0].quantity}</Descriptions.Item>
                  <Descriptions.Item label="Scheduled Time">
                    <Space>
                      <ClockCircleOutlined />
                      {tasks[0].scheduledTime}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Distance">{tasks[0].distance}</Descriptions.Item>
                </Descriptions>

                <Card title="Instructions" size="small">
                  <Text>{tasks[0].instructions}</Text>
                </Card>

                <Steps 
                  current={1} 
                  style={{ marginTop: '24px' }}
                  items={[
                    { title: "Dispatched", description: "9:45 AM" },
                    { title: "En Route", description: "Current" },
                    { title: "Collecting", description: "Next" },
                    { title: "Verification", description: "Pending" },
                    { title: "Completed", description: "Pending" }
                  ]}
                />
              </>
            )}
          </Card>

          {/* Upcoming Tasks */}
          <Card title="Upcoming Collections" style={{ marginTop: '24px' }}>
            {tasks.filter(t => t.status === 'upcoming').map(task => (
              <Card
                key={task.id}
                size="small"
                style={{ marginBottom: '12px', borderLeft: '4px solid #faad14' }}
              >
                <Row align="middle">
                  <Col span={16}>
                    <Space direction="vertical" size={0}>
                      <Text strong>{task.hotel}</Text>
                      <Text type="secondary">{task.material} • {task.quantity}</Text>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {task.scheduledTime}
                      </Text>
                      <Text type="secondary">{task.distance} away</Text>
                    </Space>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Space direction="vertical">
                      <Text strong>{task.estimatedPay}</Text>
                      <Button size="small" type="primary">Start</Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Driver Stats */}
          <Card title="Today's Stats">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Col>
                  <Text>Collections Completed</Text>
                </Col>
                <Col>
                  <Text strong>2/8</Text>
                </Col>
              </Row>
              <Progress percent={25} />

              <Row justify="space-between" style={{ marginTop: '16px' }}>
                <Col>
                  <Text>Distance Traveled</Text>
                </Col>
                <Col>
                  <Text strong>18.5 km</Text>
                </Col>
              </Row>

              <Row justify="space-between" style={{ marginTop: '16px' }}>
                <Col>
                  <Text>Today's Earnings</Text>
                </Col>
                <Col>
                  <Text strong style={{ color: '#52c41a' }}>6,500 RWF</Text>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Weekly Earnings */}
          <Card title="Weekly Earnings" style={{ marginTop: '24px' }}>
            {earnings.map((day, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <Text strong>{day.day}</Text>
                  <div>
                    <Text type="secondary">{day.collections} collections</Text>
                  </div>
                </div>
                <Text strong>{day.amount}</Text>
              </div>
            ))}
            <Button type="link" block style={{ marginTop: '16px' }}>
              View Full Earnings Report
            </Button>
          </Card>

          {/* Performance Metrics */}
          <Card title="Performance Metrics" style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Customer Rating</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Progress percent={96} size="small" />
                  <Text strong>4.8/5</Text>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Text>On-Time Rate</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Progress percent={92} size="small" />
                  <Text strong>92%</Text>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Text>Safety Score</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Progress percent={98} size="small" />
                  <Text strong>98/100</Text>
                </div>
              </div>
            </Space>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />
              <div>
                <Text strong>Weekly Top Performer</Text>
                <div>
                  <Text type="secondary">You're ranked #2 this week</Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency/Support */}
          <Card title="Support" style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<PhoneOutlined />} type="primary" danger>
                Emergency Support
              </Button>
              <Button block icon={<MessageOutlined />}>
                Contact Dispatch
              </Button>
              <Button block icon={<SafetyOutlined />}>
                Safety Guidelines
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <VerificationModal />
    </DashboardLayout>
  );
};

export default DriverDashboard;