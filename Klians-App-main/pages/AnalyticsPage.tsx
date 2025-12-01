import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ANALYTICS_DATA, ICONS } from '../constants';
import { Card } from '../components/ui/Card';

const AnalyticsCard: React.FC<{title: string; value: string | number; children?: React.ReactNode}> = ({title, value, children}) => (
    <Card>
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
        <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{value}</p>
        {children}
    </Card>
)

export const AnalyticsPage: React.FC = () => {
  const { userEngagement, postActivity, messagingActivity, keyMetrics } = ANALYTICS_DATA;
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
    } else {
        navigate('/home', { replace: true });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
            {ICONS.chevronLeft}
        </button>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Users" value={keyMetrics.totalUsers.toLocaleString()} />
        <AnalyticsCard title="Active Users" value={keyMetrics.activeUsers.toLocaleString()} />
        <AnalyticsCard title="Posts Today" value={keyMetrics.postsToday.toLocaleString()} />
        <AnalyticsCard title="Messages Sent" value={keyMetrics.messagesSent.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">User Engagement (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userEngagement}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" name="Active Users" stroke="#DC2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Post Activity by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={postActivity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {postActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                 contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
       <Card>
          <h2 className="text-xl font-semibold mb-4">Messaging Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messagingActivity}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                 contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar dataKey="DMs" fill="#DC2626" />
              <Bar dataKey="Groups" fill="#B91C1C" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
    </div>
  );
};