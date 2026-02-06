import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, Menu, Avatar, Badge, Dropdown, 
  Tooltip, Button, Space, Typography 
} from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  CarOutlined,
  UserOutlined,
  LineChartOutlined,
  CalendarOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WalletOutlined,
  ClearOutlined,
  TeamOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = ({ children, role = 'hotel' }: { children: React.ReactNode; role: string }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Role-based navigation items
  const roleMenus: { [key: string]: Array<{ key: string; icon: React.ReactNode; label: string }> } = {
    admin: [
      { key: '/admin', icon: <DashboardOutlined />, label: 'Platform Overview' },
      { key: '/admin/users', icon: <TeamOutlined />, label: 'User Management' },
      { key: '/admin/listings', icon: <DatabaseOutlined />, label: 'Content Moderation' },
      { key: '/admin/analytics', icon: <LineChartOutlined />, label: 'Advanced Analytics' },
      { key: '/admin/settings', icon: <SettingOutlined />, label: 'System Configuration' },
    ],
    recycler: [
      { key: '/dashboard/recycler', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/marketplace', icon: <ShopOutlined />, label: 'Marketplace' },
      { key: '/dashboard/schedule', icon: <CalendarOutlined />, label: 'Schedule & Logistics' },
      { key: '/dashboard/financial', icon: <WalletOutlined />, label: 'Financial' },
      { key: '/dashboard/analytics', icon: <LineChartOutlined />, label: 'Analytics' },
      { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ],
    driver: [
      { key: '/dashboard/driver', icon: <DashboardOutlined />, label: 'My Schedule' },
      { key: '/dashboard/tasks', icon: <CarOutlined />, label: 'Active Tasks' },
      { key: '/dashboard/collections', icon: <ClearOutlined />, label: 'Collections' },
      { key: '/dashboard/earnings', icon: <WalletOutlined />, label: 'Earnings' },
      { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ],
    hotel: [
      { key: '/dashboard/hotel', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/dashboard/listings', icon: <DatabaseOutlined />, label: 'My Listings' },
      { key: '/marketplace', icon: <ShopOutlined />, label: 'Marketplace' },
      { key: '/dashboard/financial', icon: <WalletOutlined />, label: 'Financial' },
      { key: '/dashboard/analytics', icon: <LineChartOutlined />, label: 'Analytics' },
      { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ],
    user: [
      { key: '/dashboard/user', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/marketplace', icon: <ShopOutlined />, label: 'Marketplace' },
      { key: '/blog', icon: <DashboardOutlined />, label: 'Blog' },
      { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ]
  };

  const menuItems = roleMenus[role] || roleMenus.hotel;

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        width={250}
      >
        <div className="logo" style={{ padding: '16px', textAlign: 'center' }}>
          <Text strong style={{ fontSize: collapsed ? '14px' : '18px' }}>
            {collapsed ? 'KCEM' : 'Kigali Circular Economy'}
          </Text>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item: { key: string; icon: React.ReactNode; label: string }) => ({
            ...item,
            onClick: () => navigate(item.key)
          }))}
        />
        
        {/* Quick Stats Widget */}
        {!collapsed && role === 'hotel' && (
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Today's Stats</Text>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Revenue</Text>
                <Text strong>5,000 RWF</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <Text>Waste</Text>
                <Text strong>120 kg</Text>
              </div>
            </div>
          </div>
        )}
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Space size="large">
            <Tooltip title="Notifications">
              <Badge count={3}>
                <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
              </Badge>
            </Tooltip>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  size="default" 
                  src="https://i.pravatar.cc/300"
                  icon={<UserOutlined />}
                />
                {!collapsed && (
                  <>
                    <Text strong>Business Name</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {role === 'hotel' ? 'Hotel/Restaurant' : 
                       role === 'recycler' ? 'Recycling Company' : 
                       role === 'driver' ? 'Driver' : 
                       role === 'admin' ? 'Admin' : 'User'}
                    </Text>
                  </>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '8px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;