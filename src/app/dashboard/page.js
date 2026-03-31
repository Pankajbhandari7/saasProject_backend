"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [activeOrgId, setActiveOrgId] = useState("");
  const [myOrgs, setMyOrgs] = useState([]);

  useEffect(() => {
    if (user) {
      fetch("https://saasproject-backend.onrender.com", {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
         setMyOrgs(data);
         if(data.length > 0) setActiveOrgId(data[0]._id);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activeOrgId) {
      fetch(`http://localhost:5000/api/core/analytics/${activeOrgId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => setAnalytics(data));
    }
  }, [user, activeOrgId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <select 
          value={activeOrgId} 
          onChange={(e) => setActiveOrgId(e.target.value)}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black bg-white shadow-sm border"
        >
          <option value="" disabled>Select Organization</option>
          {myOrgs.map(org => (
            <option key={org._id} value={org._id}>{org.name}</option>
          ))}
        </select>
      </div>

      {!activeOrgId ? (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg text-indigo-700">
           Please select an organization from the top right to view analytics.
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage by Category</h3>
            <div className="h-80">
              {analytics && analytics.categoryStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dx={-10} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="totalValue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Value" barSize={40} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Event Count" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No chart data available yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Recent API Activities</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {analytics?.recentRecords?.length > 0 ? (
                analytics.recentRecords.map((record) => (
                  <li key={record._id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.title}</p>
                      <p className="text-sm text-gray-500">{record.category}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))
              ) : (
                 <li className="px-6 py-8 text-center text-sm text-gray-500">No recent activity found for this organization.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
