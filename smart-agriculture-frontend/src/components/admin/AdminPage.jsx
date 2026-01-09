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
    ChevronDown,
    LogOut,
    User,
    Shield,
    AlertCircle,
    Wifi,
    Database,
    Activity
} from 'lucide-react';
import CropForm from './CropForm';
import CropList from './CropList';
import UserList from './UserList';
import DiseasesAdmin from './DiseasesAdmin';
import DeviceAdminPage from './DeviceAdminPage';

const AdminPage = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { users, fetchAllUsers, currentUser, logout, setUsers } = useAuth();
    const { crops } = useCrops();
    const { diseases } = useDiseases();
    const [showCropForm, setShowCropForm] = useState(false);
    const [refreshTriggers, setRefreshTriggers] = useState({
        crops: 0,
        users: 0,
        diseases: 0,
        devices: 0
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const currentYear = new Date().getFullYear();


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
            id: 'devices',
            name: 'Device Management',
            icon: <Wifi size={20} />,
            description: 'Manage registered IoT devices'
        },
    ];

    // Stats data for dashboard
    const stats = [
        {
            label: 'Total Users',
            value: users.length,
            change: '+12%',
            trend: 'up',
            icon: <Users className="text-blue-500" size={24} />
        },
        {
            label: 'Active Crops',
            value: crops.length,
            change: '+5%',
            trend: 'up',
            icon: <Sprout className="text-green-500" size={24} />
        },
        {
            label: 'Diseases Tracked',
            value: diseases.length,
            change: '+3%',
            trend: 'up',
            icon: <Skull className="text-red-500" size={24} />
        },
        {
            label: 'Pending Actions',
            value: '7',
            change: '-2%',
            trend: 'down',
            icon: <AlertCircle className="text-yellow-500" size={24} />
        },
    ];

    useEffect(() => {
        // Fetch all users when component mounts or when active section changes to users
        if (activeSection === 'users' && currentUser?.role === 'admin') {
            fetchAllUsers();
        }
    }, [activeSection, currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            // Redirect to login page or home
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    };

    // Then update your recent activity variables
    const recentUser = [...users]
        .filter(u => u && u.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

    const recentCrop = [...crops]
        .filter(c => c && c.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

    const recentDisease = [...diseases]
        .filter(d => d && d.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;



    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                            <h1 className="text-2xl font-bold mb-2">
                                Welcome back, {currentUser?.username || currentUser?.email || 'Admin'}!
                            </h1>
                            <p className="opacity-90">
                                Here's what's happening with your farm management system today.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            {stat.icon}
                                        </div>
                                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <span className="text-sm text-blue-600 cursor-pointer hover:underline">View all</span>
                                </div>
                                <div className="space-y-3">

                                    {[   
                                        {
                                            action: 'New user registered',
                                            time: recentUser ? formatTimeAgo(recentUser.created_at) : 'Recently',
                                            user: recentUser ? `${recentUser.firstName || recentUser.username || 'New User'}` : 'System'
                                        },
                                        {
                                            action: 'Crop variety added',
                                            time: recentCrop ? formatTimeAgo(recentCrop.created_at) : 'Recently',
                                            user: 'System'
                                        },
                                        {
                                            action: 'Disease reported',
                                            time: recentDisease ? formatTimeAgo(recentDisease.created_at) : 'Recently',
                                            user: recentDisease ? 'System Admin' : 'System'
                                        },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                                <p className="text-xs text-gray-500">By {item.user} • {item.time}</p>
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
                                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-all duration-200 hover:scale-105"
                                    >
                                        <Sprout className="mx-auto mb-2 text-green-600" size={24} />
                                        <span className="text-sm font-medium text-green-700">Add Crop</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('diseases')}
                                        className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-all duration-200 hover:scale-105"
                                    >
                                        <Skull className="mx-auto mb-2 text-red-600" size={24} />
                                        <span className="text-sm font-medium text-red-700">Add Disease</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('users')}
                                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all duration-200 hover:scale-105"
                                    >
                                        <Users className="mx-auto mb-2 text-blue-600" size={24} />
                                        <span className="text-sm font-medium text-blue-700">New User</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('devices')}
                                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-all duration-200 hover:scale-105"
                                    >
                                        <Wifi className="mx-auto mb-2 text-purple-600" size={24} />
                                        <span className="text-sm font-medium text-purple-700">Add Device</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'crops':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <CropList refreshTrigger={refreshTriggers.crops} />
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <UserList refreshTrigger={refreshTriggers.users} />
                        </div>
                    </div>
                );

            case 'diseases':
                return (
                    <div className="space-y-6">
                        <DiseasesAdmin />
                    </div>
                );

            case 'devices':
                return (
                    <div className="space-y-6">
                        <DeviceAdminPage refreshTrigger={refreshTriggers.devices} />
                    </div>
                );

            default:
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Section Not Found</h2>
                        <p className="text-gray-600">The requested section could not be loaded.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 sm:px-6 lg:px-8 h-16">
                    <div className="flex items-center justify-between h-full">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    <Sprout size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                                    <p className="text-xs text-gray-500 hidden sm:block">
                                        {sections.find(s => s.id === activeSection)?.name || 'Dashboard'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-md mx-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search users, crops, diseases..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">

                            {/* User profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-green-600" />
                                    </div>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {/* Dropdown menu */}
                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {currentUser?.username || currentUser?.email}
                                                </p>
                                                <p className="text-xs text-gray-500">{currentUser?.email}</p>
                                            </div>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar - Fixed for mobile, static for desktop */}
                <aside className={`
                    fixed  inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    mt-16 lg:mt-16 h-[calc(100vh-4rem)] overflow-y-auto 
                `}>
                    <div className="flex flex-col h-full">
                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setSidebarOpen(false);
                                        if (section.id !== 'dashboard') {
                                            setShowCropForm(false);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeSection === section.id
                                        ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {section.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{section.name}</div>
                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{section.description}</div>
                                    </div>
                                    {activeSection === section.id && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                                <div className="text-sm font-medium text-gray-900">Need help?</div>
                                <div className="text-xs text-gray-600 mt-1">Contact our support team</div>
                                <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                                    Get Help
                                </button>
                            </div>
                            <div className="mt-4 text-center text-xs text-gray-500">
                                <p>Version 1.0.0</p>
                                <p className="mt-1">© {currentYear} Farm Management</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden px-4 lg:pl-72">
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