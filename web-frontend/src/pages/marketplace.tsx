import { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Row, Col, Card, Input, Button, Select, Slider,
  Typography, Space, Tag, Radio, Checkbox,
  Badge, Rate, Modal, Form, InputNumber, DatePicker
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  AppstoreOutlined,
  EnvironmentOutlined as MapOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

interface Listing {
  id: number;
  title: string;
  business: string;
  material: string;
  quantity: string;
  price: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  available: string;
  photos: number;
  featured: boolean;
}

const MarketplacePage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const materialTypes = [
    { value: 'uco', label: 'Used Cooking Oil', color: 'volcano' },
    { value: 'glass', label: 'Glass Bottles', color: 'blue' },
    { value: 'paper', label: 'Paper/Cardboard', color: 'green' },
    { value: 'plastic', label: 'Plastic', color: 'cyan' },
    { value: 'metal', label: 'Metal', color: 'orange' },
  ];

  const listings = [
    {
      id: 1,
      title: 'Premium Used Cooking Oil - 200L',
      business: 'Hotel des Mille Collines',
      material: 'uco',
      quantity: '200L',
      price: '8,500 RWF',
      location: 'KN 2 Ave, Kigali',
      distance: '2.3km',
      rating: 4.8,
      reviews: 24,
      available: 'Today',
      photos: 3,
      featured: true
    },
    // Add more listings...
  ];

  const FilterModal = () => (
    <Modal
      title="Advanced Filters"
      visible={isFilterModalVisible}
      onCancel={() => setIsFilterModalVisible(false)}
      width={600}
      footer={[
        <Button key="reset" onClick={() => setIsFilterModalVisible(false)}>
          Reset Filters
        </Button>,
        <Button key="apply" type="primary" onClick={() => setIsFilterModalVisible(false)}>
          Apply Filters
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Material Type">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {materialTypes.map(material => (
                <Col span={8} key={material.value}>
                  <Checkbox value={material.value}>{material.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Location Radius">
          <Slider
            range
            min={0}
            max={50}
            defaultValue={[0, 20]}
            marks={{ 0: '0km', 25: '25km', 50: '50km' }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Minimum Price (RWF)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Min"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Maximum Price (RWF)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Max"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Quantity Available">
          <Select 
            placeholder="Select minimum quantity" 
            allowClear
            options={[
              { value: 'small', label: 'Small (<50kg/L)' },
              { value: 'medium', label: 'Medium (50-200kg/L)' },
              { value: 'large', label: 'Large (>200kg/L)' }
            ]}
          />
        </Form.Item>

        <Form.Item label="Sort By">
          <Radio.Group defaultValue="newest">
            <Space direction="vertical">
              <Radio value="newest">Newest First</Radio>
              <Radio value="price_low">Price: Low to High</Radio>
              <Radio value="price_high">Price: High to Low</Radio>
              <Radio value="distance">Distance: Nearest First</Radio>
              <Radio value="rating">Highest Rated</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Saved Searches">
          <Select 
            placeholder="Select saved search" 
            allowClear
            options={[
              { value: 'daily', label: 'My Daily Search' },
              { value: 'glass', label: 'Glass Bottles Near Me' },
              { value: 'premium', label: 'Premium UCO Listings' }
            ]}
          />
          <Button type="link" style={{ marginTop: '8px' }}>
            Save Current Search
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  const OfferModal = () => (
    <Modal
      title="Make an Offer"
      visible={isOfferModalVisible}
      onCancel={() => setIsOfferModalVisible(false)}
      width={500}
      footer={[
        <Button key="cancel" onClick={() => setIsOfferModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => setIsOfferModalVisible(false)}>
          Submit Offer
        </Button>,
      ]}
    >
      {selectedListing && (
        <Form layout="vertical">
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" size={2}>
              <Text strong>{selectedListing.title}</Text>
              <Text type="secondary">{selectedListing.business}</Text>
              <Text>Listed Price: <Text strong>{selectedListing.price}</Text></Text>
            </Space>
          </Card>

          <Form.Item
            label="Your Offer Price (RWF)"
            rules={[{ required: true, message: 'Please enter your offer!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Enter your offer amount"
              formatter={value => `RWF ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item label="Quantity Requested">
            <Input 
              placeholder="Enter quantity" 
              addonAfter={
                <Select 
                  defaultValue="all" 
                  style={{ width: 100 }}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'partial', label: 'Partial' }
                  ]}
                />
              }
            />
          </Form.Item>

          <Form.Item label="Proposed Collection Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Message to Seller (Optional)">
            <Input.TextArea rows={4} placeholder="Add a message explaining your offer..." />
          </Form.Item>

          <Form.Item>
            <Text type="secondary">
              Your offer will be binding. If accepted, you'll be charged a 5% commission fee.
            </Text>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );

  return (
    <DashboardLayout role="user">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Marketplace</Title>
                <Text type="secondary">Find and trade recyclable materials in Kigali</Text>
              </div>
              <Space>
                <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <Radio.Button value="grid">
                    <AppstoreOutlined />
                  </Radio.Button>
                  <Radio.Button value="map">
                    <MapOutlined />
                  </Radio.Button>
                  <Radio.Button value="list">
                    <FilterOutlined />
                  </Radio.Button>
                </Radio.Group>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Search materials, businesses, or locations..."
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setIsFilterModalVisible(true)}
              >
                Filters
              </Button>
              <Select placeholder="Material Type" style={{ width: 150 }} allowClear
                options={materialTypes.map(m => ({ value: m.value, label: m.label }))}
              />
              <Select placeholder="Sort By" style={{ width: 150 }} defaultValue="newest"
                options={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'distance', label: 'Nearest' }
                ]}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Listings Grid */}
      <Row gutter={[24, 24]}>
        {listings.map(listing => (
          <Col xs={24} sm={12} lg={8} key={listing.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: '200px', background: '#f5f5f5', position: 'relative' }}>
                  {listing.featured && (
                    <Badge.Ribbon text="Featured" color="red">
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Text type="secondary">Click to view {listing.photos} photos</Text>
                      </div>
                    </Badge.Ribbon>
                  )}
                </div>
              }
              actions={[
                <EyeOutlined key="view" />,
                <HeartOutlined key="save" />,
                <ShareAltOutlined key="share" />,
                <Button 
                  key="offer" 
                  type="primary" 
                  size="small"
                  onClick={() => {
                    setSelectedListing(listing);
                    setIsOfferModalVisible(true);
                  }}
                >
                  Make Offer
                </Button>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tag color={materialTypes.find(m => m.value === listing.material)?.color}>
                    {materialTypes.find(m => m.value === listing.material)?.label}
                  </Tag>
                  <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                    {listing.price}
                  </Text>
                </div>

                <Title level={5} style={{ margin: 0 }}>{listing.title}</Title>
                
                <Text type="secondary">{listing.business}</Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <EnvironmentOutlined />
                    <Text>{listing.distance}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text>{listing.available}</Text>
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Rate disabled defaultValue={listing.rating} style={{ fontSize: '14px' }} />
                    <Text type="secondary">({listing.reviews})</Text>
                  </Space>
                  <Text strong>{listing.quantity}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <Card style={{ marginTop: '24px', height: '500px' }}>
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <Space direction="vertical" align="center">
              <MapOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <Title level={4}>Interactive Map View</Title>
              <Text type="secondary">Map showing listings with cluster markers</Text>
              <Button type="primary">Load Map</Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Space>
          <Button>Previous</Button>
          <Button type="primary">1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>Next</Button>
        </Space>
      </div>

      <FilterModal />
      <OfferModal />
    </DashboardLayout>
  );
};

export default MarketplacePage;