import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrops } from "../../contexts/CropContext";
import { useDiseases } from "../../contexts/DiseaseContext";


import { 
  Users, 
  Sprout, 
  Skull, 
  Settings, 
  BarChart3, 
  Bell,
  Search,
  Plus,
  X,
  Menu,
  ChevronDown
} from 'lucide-react';
import CropForm from './CropForm';
import CropList from './CropList';
import UserList from './UserList';
import DiseasesAdmin from './DiseasesAdmin';
import DeviceAdminPage from './DeviceAdminPage';

const AdminPage = () => {
    const [activeSection, setActiveSection] = useState('crops');
    const { users, fetchAllUsers, currentUser, deleteUser, setUsers } = useAuth()
    const {crops} = useCrops();
    const {diseases}= useDiseases();
    const [showCropForm, setShowCropForm] = useState(false);
    const [refreshTriggers, setRefreshTriggers] = useState({
        crops: 0,
        users: 0,
        diseases: 0
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(3); // Example notification count

    const sections = [
        { 
            id: 'dashboard', 
            name: 'Dashboard', 
            icon: <BarChart3 size={20} />,
            description: 'System overview and analytics'
        },
        { 
            id: 'users', 
            name: 'User Management', 
            icon: <Users size={20} />,
            description: 'Manage system users and permissions'
        },
        { 
            id: 'crops', 
            name: 'Crop Management', 
            icon: <Sprout size={20} />,
            description: 'Manage crop database and varieties'
        },
        { 
            id: 'diseases', 
            name: 'Disease Management', 
            icon: <Skull size={20} />,
            description: 'Manage disease database and treatments'
        },
        { 
            id: 'device', 
            name: 'Device Management',   
            icon: <Bell size={20} />,
            description: 'Manage registered devices'  
        },
        { 
            id: 'settings', 
            name: 'System Settings', 
            icon: <Settings size={20} />,
            description: 'System configuration and preferences'
        },
        
    ];

    // Stats data for dashboard
    const stats = [
        { label: 'Total Users', value: users.length, change: '+12%', trend: 'up' },
        { label: 'Active Crops', value: crops.length, change: '+5%', trend: 'up' },
        { label: 'Diseases Tracked', value: diseases.length, change: '+3%', trend: 'up' },
        { label: 'Pending Actions', value: '7', change: '-2%', trend: 'down' },
    ];

    const handleCropAdded = () => {
        setShowCropForm(false);
        refreshSection('crops');
    };

    const refreshSection = (section) => {
        setRefreshTriggers(prev => ({
            ...prev,
            [section]: prev[section] + 1
        }));
    };

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${
                                            stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            <span className="text-sm font-semibold">{stat.change}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className={`w-full bg-gray-200 rounded-full h-2 ${
                                            stat.trend === 'up' ? 'bg-green-200' : 'bg-red-200'
                                        }`}>
                                            <div className={`h-2 rounded-full ${
                                                stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                                            }`} style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">New crop variety added</p>
                                                <p className="text-xs text-gray-500">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setActiveSection('crops')}
                                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                                    >
                                        <Sprout className="mx-auto mb-2 text-green-600" size={24} />
                                        <span className="text-sm font-medium text-green-700">Add Crop</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveSection('diseases')}
                                        className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors"
                                    >
                                        <Skull className="mx-auto mb-2 text-red-600" size={24} />
                                        <span className="text-sm font-medium text-red-700">Add Disease</span>
                                    </button>
                                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                                        <Users className="mx-auto mb-2 text-blue-600" size={24} />
                                        <span className="text-sm font-medium text-blue-700">New User</span>
                                    </button>
                                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                                        <BarChart3 className="mx-auto mb-2 text-purple-600" size={24} />
                                        <span className="text-sm font-medium text-purple-700">Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'crops':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Crop Management</h2>
                                <p className="text-gray-600 mt-1">Manage your crop database and varieties</p>
                            </div>
                            <button
                                onClick={() => setShowCropForm(!showCropForm)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                                    showCropForm 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {showCropForm ? (
                                    <>
                                        <X size={18} />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Add New Crop
                                    </>
                                )}
                            </button>
                        </div>

                        {showCropForm && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200 animate-fade-in">
                                <CropForm onSuccess={handleCropAdded} />
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <CropList refreshTrigger={refreshTriggers.crops} />
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                                <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg">
                                <Plus size={18} />
                                Add User
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <UserList refreshTrigger={refreshTriggers.users} />
                        </div>
                    </div>
                );

            case 'diseases':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Disease Management</h2>
                                <p className="text-gray-600 mt-1">Manage disease database and treatment information</p>
                            </div>
                           
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <DiseasesAdmin refreshTrigger={refreshTriggers.diseases} />
                        </div>
                    </div>
                );

            case 'device':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Disease Management</h2>
                                <p className="text-gray-600 mt-1">Manage disease database and treatment information</p>
                            </div>
                           
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <DeviceAdminPage refreshTrigger={refreshTriggers.device} />
                        </div>
                    </div>
                );    

            case 'settings':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
                            <div className="grid gap-6">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">General Settings</h3>
                                    <p className="text-gray-600">Configure system preferences and defaults</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Database Management</h3>
                                    <p className="text-gray-600">Backup and restore system data</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
     <div className="min-h-screen bg-gray-50">
    {/* Top Navigation Bar */}
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Your header content here */}
    </header>

    <div className="flex pt-16 "> {/* Added pt-16 for header height */}
        {/* Sidebar */}
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-16 lg:mt-0 /* Added mt-16 for mobile */
        `}>
            <div className="flex flex-col h-full pt-16 lg:pt-0"> {/* Added pt-16 for header */}
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                            <Sprout size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Farm Management</h2>
                            <p className="text-xs text-gray-500">Administrator Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                setSidebarOpen(false);
                                if (section.id !== 'crops') {
                                    setShowCropForm(false);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                activeSection === section.id
                                    ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${
                                activeSection === section.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {section.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{section.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm font-medium text-gray-900">Need help?</div>
                        <div className="text-xs text-gray-600 mt-1">Contact support</div>
                        <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                            Get Help
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 mt-16 lg:mt-0"> {/* Added mt-16 for mobile */}
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="max-w-7xl mx-auto">
                {renderActiveSection()}
            </div>
        </main>
    </div>
</div>
    );
};

export default AdminPage;