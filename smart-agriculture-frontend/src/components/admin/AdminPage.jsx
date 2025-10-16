import { useState } from 'react';
import CropForm from './CropForm';
import CropList from './CropList';
import UserList from './UserList';

const AdminPage = () => {
    const [activeSection, setActiveSection] = useState('crops');
    const [showCropForm, setShowCropForm] = useState(false);
    const [cropListRefresh, setCropListRefresh] = useState(0);

    const sections = [
        { id: 'crops', name: 'Crop Management', icon: '🌱' },
        { id: 'users', name: 'User Management', icon: '👥' },
    ];

    const handleCropAdded = () => {
        setShowCropForm(false);
        setCropListRefresh(prev => prev + 1); // Trigger crop list refresh
    };

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'crops':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-green-800">Crop Management</h2>
                            <button
                                onClick={() => setShowCropForm(!showCropForm)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                    showCropForm 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {showCropForm ? (
                                    <>✕ Cancel</>
                                ) : (
                                    <>➕ Add New Crop</>
                                )}
                            </button>
                        </div>
                        
                        {showCropForm && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200 animate-fade-in">
                                <CropForm onSuccess={handleCropAdded} />
                            </div>
                        )}
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                            <CropList refreshTrigger={cropListRefresh} />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                        <h2 className="text-2xl font-bold text-green-800 mb-6">User Management</h2>
                        <UserList />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
                        🌿 Farm Management System
                    </h1>
                    <p className="text-lg text-green-600 max-w-2xl mx-auto">
                        Welcome, Admin! Manage your agricultural ecosystem efficiently.
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                if (section.id !== 'crops') {
                                    setShowCropForm(false);
                                }
                            }}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                activeSection === section.id
                                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
                            }`}
                        >
                            <span className="text-xl">{section.icon}</span>
                            {section.name}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto">
                    {renderActiveSection()}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;