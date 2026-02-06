import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
  Row, Col, Card, Button, Typography, Tabs,
  Space, Tag, List, Avatar, Progress, Badge,
  Statistic, Divider, Input, Select,
  Rate, Form
} from 'antd';
import {
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('marketplace');

  // Saved Listings
  const savedListings = [
    { id: 1, title: 'Premium Used Cooking Oil', business: 'Hotel des Mille Collines', price: '8,500 RWF', location: '2km away', saved: '2 days ago' },
    { id: 2, title: 'Glass Bottles Bulk', business: 'Kigali Marriott', price: '12,000 RWF', location: '4.5km away', saved: '1 week ago' },
  ];

  // Following Businesses
  const following = [
    { id: 1, name: 'GreenTech Recycling', type: 'Recycler', rating: 4.8, listings: 24 },
    { id: 2, name: 'EcoClean Rwanda', type: 'Recycler', rating: 4.6, listings: 18 },
  ];

  // Environmental Impact
  const impactStats = [
    { label: 'CO2 Saved', value: '45 kg', icon: '🌱' },
    { label: 'Water Saved', value: '2,800 L', icon: '💧' },
    { label: 'Landfill Diverted', value: '120 kg', icon: '🗑️' },
    { label: 'Equivalent Trees', value: '3', icon: '🌳' },
  ];

  return (
    <DashboardLayout role="user">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Welcome to KCEM!</Title>
                <Text type="secondary">
                  Track your environmental impact and discover recycling opportunities
                </Text>
              </div>
              <Button type="primary" onClick={() => window.location.href = '/marketplace'}>
                Browse Marketplace
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Marketplace Feed" key="marketplace">
              {/* Marketplace Feed Items */}
              <Card style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <Text strong>Hot Deals Nearby</Text>
                    <div>
                      <Text type="secondary">Best offers within 5km radius</Text>
                    </div>
                  </div>
                  <Select 
                    defaultValue="distance" 
                    style={{ width: 120 }}
                    options={[
                      { value: 'distance', label: 'Distance' },
                      { value: 'price', label: 'Price' },
                      { value: 'newest', label: 'Newest' }
                    ]}
                  />
                </div>

                {/* Listing Cards */}
                {[1, 2, 3].map(item => (
                  <Card 
                    key={item}
                    size="small" 
                    style={{ marginBottom: '12px', borderLeft: '4px solid #52c41a' }}
                  >
                    <Row align="middle">
                      <Col span={16}>
                        <Space direction="vertical" size={0}>
                          <Text strong>Premium Used Cooking Oil - 200L</Text>
                          <Text type="secondary">Hotel des Mille Collines</Text>
                          <Space>
                            <Tag color="blue">UCO</Tag>
                            <Text type="secondary">
                              <EnvironmentOutlined /> 2.3km away
                            </Text>
                            <Text type="secondary">
                              <CalendarOutlined /> Available today
                            </Text>
                          </Space>
                        </Space>
                      </Col>
                      <Col span={8} style={{ textAlign: 'right' }}>
                        <Space direction="vertical">
                          <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                            8,500 RWF
                          </Text>
                          <Space>
                            <Button size="small" icon={<EyeOutlined />} />
                            <Button size="small" icon={<HeartOutlined />} />
                            <Button size="small" type="primary">View Details</Button>
                          </Space>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Card>
            </TabPane>

            <TabPane tab="Saved Items" key="saved">
              <List
                header={<Text strong>Your Saved Listings</Text>}
                dataSource={savedListings}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button key="view" size="small">View</Button>,
                      <Button key="remove" size="small" danger>Remove</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <Space>
                          <Text type="secondary">{item.business}</Text>
                          <Tag color="blue">{item.price}</Tag>
                          <Text type="secondary">
                            <EnvironmentOutlined /> {item.location}
                          </Text>
                          <Text type="secondary">Saved {item.saved}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="Following" key="following">
              <List
                dataSource={following}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button key="view" size="small">View Profile</Button>,
                      <Button key="unfollow" size="small">Unfollow</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar size="large">{item.name.charAt(0)}</Avatar>}
                      title={
                        <Space>
                          <Text strong>{item.name}</Text>
                          <Tag color="green">{item.type}</Tag>
                          <Rate disabled defaultValue={item.rating} style={{ fontSize: '14px' }} />
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{item.listings} active listings</Text>
                          <Button type="link" icon={<MessageOutlined />}>
                            Contact
                          </Button>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Col>

        <Col xs={24} lg={8}>
          {/* Personal Environmental Impact */}
          <Card title="Your Environmental Impact">
            <Space direction="vertical" style={{ width: '100%' }}>
              {impactStats.map((stat, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Space>
                    <Text style={{ fontSize: '20px' }}>{stat.icon}</Text>
                    <Text>{stat.label}</Text>
                  </Space>
                  <Text strong>{stat.value}</Text>
                </div>
              ))}
            </Space>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={65} size={80} />
              <div style={{ marginTop: '12px' }}>
                <Text strong>Impact Score: 65/100</Text>
                <div>
                  <Text type="secondary">Top 35% of users</Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Your Activity" style={{ marginTop: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Listings Viewed" value={42} />
              </Col>
              <Col span={12}>
                <Statistic title="Businesses Followed" value={5} />
              </Col>
              <Col span={12}>
                <Statistic title="Offers Made" value={3} />
              </Col>
              <Col span={12}>
                <Statistic title="Days Active" value={14} />
              </Col>
            </Row>
          </Card>

          {/* Community Leaderboard */}
          <Card title="Community Leaderboard" style={{ marginTop: '24px' }}>
            <List
              size="small"
              dataSource={[
                { rank: 1, name: 'Eco Warrior', score: 98, icon: '🥇' },
                { rank: 2, name: 'Green Champion', score: 92, icon: '🥈' },
                { rank: 3, name: 'Recycle Master', score: 88, icon: '🥉' },
                { rank: 4, name: 'You', score: 65, icon: '⭐' },
              ]}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Text strong style={{ fontSize: '20px' }}>{item.icon}</Text>
                    <Text>{item.name}</Text>
                  </Space>
                  <Badge count={item.score} style={{ backgroundColor: item.rank <= 3 ? '#52c41a' : '#1890ff' }} />
                </List.Item>
              )}
            />
            <Button type="link" block style={{ marginTop: '12px' }}>
              View Full Leaderboard
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<TeamOutlined />}>
                Join Community Forum
              </Button>
              <Button block icon={<TrophyOutlined />}>
                Participate in Challenges
              </Button>
              <Button block icon={<ShareAltOutlined />}>
                Share Your Impact
              </Button>
              <Button block type="primary" icon={<HeartOutlined />}>
                Donate to Environmental Causes
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Community Activity */}
      <Card title="Community Activity" style={{ marginTop: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <List
              dataSource={[
                { user: 'GreenTech Recycling', action: 'processed 2.4T of materials', time: '2 hours ago' },
                { user: 'Hotel Rwanda', action: 'achieved 90% waste diversion', time: '5 hours ago' },
                { user: 'EcoClean Team', action: 'expanded to new facility', time: '1 day ago' },
              ]}
              renderItem={item => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{item.user}</Text>
                    <Text>{item.action}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Col>
          <Col span={8}>
            <Card title="Share Your Thoughts">
              <Form>
                <Form.Item>
                  <TextArea rows={4} placeholder="Share your recycling journey or ask a question..." />
                </Form.Item>
                <Button type="primary" block>
                  Post to Community
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Card>
    </DashboardLayout>
  );
};

export default UserDashboard;