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
import { getTemperatureTrend, getHumidityLabel, getHumidityStatus } from "../hooks/useHistoryData";

const DeviceLivePanel = ({ deviceId }) => {
  const { latest, history, connected, error } = useDeviceRealtime(deviceId);

  return (
    <div className="p-6 rounded-2xl shadow-lg bg-white border border-gray-200">
      {/* Header with Device Info */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
              <i className="fas fa-microchip text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Live Sensor Data</h2>
              <p className="text-gray-600">Device ID: <span className="font-mono font-medium text-blue-600">{deviceId}</span></p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
              
              {latest ? (  
                <div className="flex items-center gap-2"> 
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>  
              <span className="text-sm font-medium text-green-700">Live Streaming</span>
              </div>
              ) : (
              <span className="text-sm font-medium text-gray-500">No Live Data</span>
              )}
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              connected ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
            }`}>
              <div className={`w-2 h-2 rounded-full ${latest ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className={`text-sm font-medium ${latest ? "text-green-700" : "text-red-700"}`}>
                {latest ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Temperature Gauge */}
        <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <i className="fas fa-thermometer-half text-white text-lg"></i>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800">Temperature</h4>
              <p className="text-sm text-gray-500">Current reading</p>
            </div>
          </div>
          <div className="w-40 h-40">
            <CircularProgressbar
              value={latest?.temperature || 0}
              maxValue={100}
              text={`${latest?.temperature ?? "--"}°C`}
              styles={buildStyles({
                textSize: "18px",
                pathColor: "#FF5722",
                textColor: "#111827",
                trailColor: "#F3F4F6",
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          {latest?.temperature && (
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                latest.temperature > 30 ? "bg-red-100 text-red-700" :
                latest.temperature > 20 ? "bg-orange-100 text-orange-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {latest.temperature > 30 ? "🔥 Hot" : 
                 latest.temperature > 20 ? "☀️ Warm" : "❄️ Cool"}
              </div>
            </div>
          )}
        </div>

        {/* Humidity Gauge */}
        <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
              <i className="fas fa-tint text-white text-lg"></i>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800">Humidity</h4>
              <p className="text-sm text-gray-500">Relative humidity</p>
            </div>
          </div>
          <div className="w-40 h-40">
            <CircularProgressbar
              value={latest?.humidity || 0}
              maxValue={100}
              text={`${latest?.humidity ?? "--"}%`}
              styles={buildStyles({
                textSize: "18px",
                pathColor: "#2196F3",
                textColor: "#111827",
                trailColor: "#F3F4F6",
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          {latest?.humidity && (
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                getHumidityStatus(latest.humidity)
              }`}>
                {getHumidityLabel(latest.humidity)}
              </div>
            </div>
          )}
        </div>

        {/* Device Status */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
              <i className="fas fa-clock text-blue-600 text-2xl"></i>
            </div>
            <h4 className="font-bold text-gray-800">Last Update</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {latest
              ? new Date(latest.readingTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })
              : "--:--:--"}
          </p>
          <p className="text-sm text-gray-500">
            {latest
              ? new Date(latest.readingTime).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })
              : "No data"}
          </p>
          {latest && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live data streaming</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Historical Trends</h3>
            <p className="text-gray-600">Temperature and humidity over time</p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
            </div>
          )}
        </div>

        {history.length > 0 ? (
          <div className="space-y-8">
            {/* Temperature Chart */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-3 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Temperature Trend</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {history[history.length - 1]?.temperature?.toFixed(1) || 'N/A'}°C
                      </span>
                      {getTemperatureTrend(history) > 0 ? (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <i className="fas fa-arrow-up"></i>
                          +{getTemperatureTrend(history).toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="text-sm text-blue-600 flex items-center gap-1">
                          <i className="fas fa-arrow-down"></i>
                          {Math.abs(getTemperatureTrend(history)).toFixed(1)}°C
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Updated: {new Date(history[history.length - 1]?.readingTime).toLocaleTimeString()}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="readingTime"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(t) => new Date(t).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleString()}
                      formatter={(value) => [`${value}°C`, 'Temperature']}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="url(#temperatureGradient)"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <defs>
                      <linearGradient id="temperatureGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ff6b35" />
                        <stop offset="100%" stopColor="#ff9a3c" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-3 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Humidity Trend</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {history[history.length - 1]?.humidity?.toFixed(1) || 'N/A'}%
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${getHumidityStatus(history[history.length - 1]?.humidity)}`}>
                        {getHumidityLabel(history[history.length - 1]?.humidity)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Range: {Math.min(...history.map(h => h.humidity)).toFixed(1)}% - {Math.max(...history.map(h => h.humidity)).toFixed(1)}%
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="readingTime"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(t) => new Date(t).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleString()}
                      formatter={(value) => [`${value}%`, 'Humidity']}
                    />
                    <Area
                      type="monotone"
                      dataKey="humidity"
                      stroke="url(#humidityGradient)"
                      strokeWidth={3}
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
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-temperature-high text-orange-600"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Temperature</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(history.reduce((sum, h) => sum + h.temperature, 0) / history.length).toFixed(1)}°C
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-tint text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Humidity</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(history.reduce((sum, h) => sum + h.humidity, 0) / history.length).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-database text-green-600"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Data Points</div>
                    <div className="text-xl font-bold text-gray-900">{history.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-clock text-purple-600"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Span</div>
                    <div className="text-xl font-bold text-gray-900">
                      {Math.round((new Date(history[history.length - 1]?.readingTime) - new Date(history[0]?.readingTime)) / (1000 * 60 * 60))}h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-200 mb-6">
              <i className="fas fa-chart-line text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Historical data will appear here once the device transmits more readings.
              Currently monitoring real-time data only.
            </p>
          </div>
        )}
      </div>

      {/* Recent Readings Table */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Recent Readings</h3>
            <p className="text-gray-600">Latest sensor data points</p>
          </div>
          <div className="text-sm text-gray-500 mt-1 md:mt-0">
            Showing last {Math.min(10, history.length)} of {history.length} records
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Timestamp</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Temperature</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Humidity</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.slice(-10).reverse().map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(row.readingTime).toLocaleString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                          <i className="fas fa-thermometer-half text-orange-600 text-xs"></i>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{row.temperature}°C</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <i className="fas fa-tint text-blue-600 text-xs"></i>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{row.humidity}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        row.temperature > 30 ? "bg-red-100 text-red-700" :
                        row.temperature > 20 ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {row.temperature > 30 ? "Hot" : 
                         row.temperature > 20 ? "Warm" : "Cool"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className="py-12 text-center">
              <i className="fas fa-table text-gray-300 text-3xl mb-3"></i>
              <p className="text-gray-500">No data available for table view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLivePanel;