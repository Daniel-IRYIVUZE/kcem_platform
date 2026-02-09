// components/dashboard/ChartComponent.jsx
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartDataSet {
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  // Add label property:
  label?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataSet[];
}

interface ChartComponentProps {
  type: 'line' | 'bar' | 'pie';
  data: ChartData;
  width?: string | number;
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ type, data, width = '100%', height = 300 }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data.datasets[0].data.map((value, index) => ({
            name: data.labels[index],
            value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={data.datasets[0].borderColor} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data.datasets[0].data.map((value, index) => ({
            name: data.labels[index],
            value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={data.datasets[0].backgroundColor} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data.labels.map((label, index) => ({
                name: label,
                value: data.datasets[0].data[index]
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.labels.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  // Ensure width is either a number or a string in the format `${number}%`
  const getResponsiveWidth = (w: string | number): number | `${number}%` | undefined => {
    if (typeof w === 'number') return w;
    if (typeof w === 'string' && /^\d+%$/.test(w)) return w as `${number}%`;
    return undefined;
  };

  return (
    <ResponsiveContainer width={getResponsiveWidth(width)} height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default ChartComponent;