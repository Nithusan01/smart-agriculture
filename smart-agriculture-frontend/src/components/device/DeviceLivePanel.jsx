import React from "react";
import useDeviceRealtime from "../hooks/useDeviceRealtime";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {getTemperatureTrend,getHumidityLabel,getHumidityStatus} from "../hooks/useHistoryData"

const DeviceLivePanel = ({ deviceId }) => {
  const { latest, history, connected,error } = useDeviceRealtime(deviceId);

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-white/70 backdrop-blur-xl border border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📡 Live Device:
          <span className="text-blue-600">{deviceId}</span>
        </h3>

        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            connected
              ? "bg-green-100 text-green-700 shadow"
              : "bg-red-100 text-red-600 shadow"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Latest Data + Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Temperature Gauge */}
        <div className="flex flex-col items-center bg-white p-5 rounded-xl shadow-inner">
          <h4 className="font-semibold text-gray-700 mb-3">🌡 Temperature</h4>
          <div className="w-32 h-32">
            <CircularProgressbar
              value={latest?.temperature || 0}
              maxValue={100}
              text={`${latest?.temperature ?? "--"}°C`}
              styles={buildStyles({
                textSize: "12px",
                pathColor: "#FF5722",
                textColor: "#333",
                trailColor: "#ffe1d9",
              })}
            />
          </div>
        </div>

        {/* Humidity Gauge */}
        <div className="flex flex-col items-center bg-white p-5 rounded-xl shadow-inner">
          <h4 className="font-semibold text-gray-700 mb-3">💧 Humidity</h4>
          <div className="w-32 h-32">
            <CircularProgressbar
              value={latest?.humidity || 0}
              maxValue={100}
              text={`${latest?.humidity ?? "--"}%`}
              styles={buildStyles({
                textSize: "12px",
                pathColor: "#2196F3",
                textColor: "#333",
                trailColor: "#dcefff",
              })}
            />
          </div>
        </div>

        {/* Latest Timestamp */}
        <div className="bg-white p-5 rounded-xl shadow-inner flex flex-col justify-center">
          <p className="text-gray-600 font-medium">Last Update</p>
          <p className="font-bold text-gray-800 text-lg mt-2">
            {latest
              ? new Date(latest.readingTime).toLocaleString()
              : "--"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10">
        <h4 className="font-semibold text-gray-700 mb-2 text-lg">
          📈 Temperature & Humidity Chart
        </h4>

       <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-800">Sensor Data History</h2>
    <p className="text-gray-600 mt-1">Real-time monitoring of environmental parameters</p>
  </div>

  {history.length > 0 ? (
    <div className="space-y-8">
      {/* Temperature Chart */}
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Temperature</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {history[history.length - 1]?.temperature?.toFixed(1) || 'N/A'}°C
                </span>
                {getTemperatureTrend(history) > 0 ? (
                  <span className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    +{getTemperatureTrend(history).toFixed(1)}°C
                  </span>
                ) : (
                  <span className="text-sm text-blue-600 flex items-center">
                    <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    {Math.abs(getTemperatureTrend(history)).toFixed(1)}°C
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(history[history.length - 1]?.readingTime).toLocaleTimeString()}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="readingTime"
              tick={{ fontSize: 12 }}
              tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10 }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(value) => [`${value}°C`, 'Temperature']}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="url(#temperatureGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              fill="url(#temperatureFill)"
              fillOpacity={0.3}
            />
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ff9a3c" />
              </linearGradient>
               <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
              </linearGradient>
             
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Chart */}
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Humidity</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {history[history.length - 1]?.humidity?.toFixed(1) || 'N/A'}%
                </span>
                <span className={`text-sm px-2 py-1 rounded-full ${getHumidityStatus(history[history.length - 1]?.humidity)}`}>
                  {getHumidityLabel(history[history.length - 1]?.humidity)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Range: {Math.min(...history.map(h => h.humidity)).toFixed(1)}% - {Math.max(...history.map(h => h.humidity)).toFixed(1)}%
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="readingTime"
              tick={{ fontSize: 12 }}
              tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(value) => [`${value}%`, 'Humidity']}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="url(#humidityGradient)"
              strokeWidth={2.5}
              fill="url(#humidityFill)"
              fillOpacity={0.3}
            />
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2196F3" />
                <stop offset="100%" stopColor="#64b5f6" />
              </linearGradient>
              <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Temperature</div>
          <div className="text-2xl font-bold text-gray-900">
            {(history.reduce((sum, h) => sum + h.temperature, 0) / history.length).toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Humidity</div>
          <div className="text-2xl font-bold text-gray-900">
            {(history.reduce((sum, h) => sum + h.humidity, 0) / history.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Records</div>
          <div className="text-2xl font-bold text-gray-900">{history.length}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Time Span</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((new Date(history[history.length - 1]?.readingTime) - new Date(history[0]?.readingTime)) / (1000 * 60 * 60))}h
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        No sensor data has been recorded yet. Data will appear here once the device starts transmitting.
      </p>
    </div>
  )}
</div>
      </div>

      {/* Table */}
      <div className="mt-10">
        <h4 className="font-semibold text-gray-700 mb-3 text-lg">
          📄 Recent Reading Logs
        </h4>

        <div className="bg-white rounded-xl shadow-lg max-h-60 overflow-auto border">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Humidity (%)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {history.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {new Date(row.readingTime).toLocaleTimeString()}
                  </td>
                  <td className="p-2">{row.temperature}</td>
                  <td className="p-2">{row.humidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DeviceLivePanel;
