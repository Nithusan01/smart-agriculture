import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  Loader2,
  AlertCircle,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  RefreshCw,
  Save,
  Key,
  EyeOff,
  Lock
} from 'lucide-react';
import LoadingSpinner from "../common/LoadingSpinner"
import { toast } from 'react-toastify'

const UserList = () => {
    const { users, fetchAllUsers, currentUser, deleteUser, setUsers, register, updateUser, createUserByAdmin} = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ 
        firstName: "", 
        lastName: "", 
        username: "", 
        email: "", 
        role: "farmer", 
        password: "",
        confirmPassword: "",
        farmName: "" 
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Advanced search states
    const [filters, setFilters] = useState({
        search: "",
        role: "all",
        status: "all",
        sortBy: "username",
        sortOrder: "asc"
    })

    // Debounced search to prevent excessive filtering
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const loadUsers = async () => {
            if (!currentUser || currentUser.role !== 'admin') {
                setLoading(false)
                return
            }

            try {
                setError(null)
                const result = await fetchAllUsers()
                if (!result.success) {
                    setError(result.error)
                    toast.error(result.error || 'Failed to load users')
                }
            } catch (err) {
                setError('Failed to load users')
                toast.error('Failed to load users')
            } finally {
                setLoading(false)
            }
        }

        loadUsers()
    }, [currentUser])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search)
        }, 300) // 300ms delay

        return () => clearTimeout(timer)
    }, [filters.search])

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        let filtered = [...users]

        // Text search across multiple fields
        if (debouncedSearch.trim() !== "") {
            const searchTerm = debouncedSearch.toLowerCase()
            filtered = filtered.filter(user =>
                user.username?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm) ||
                user.farmName?.toLowerCase().includes(searchTerm) ||
                user.role?.toLowerCase().includes(searchTerm) ||
                `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm)
            )
        }

        // Role filter
        if (filters.role !== "all") {
            filtered = filtered.filter(user => user.role === filters.role)
        }

        // Status filter based on last login
        if (filters.status !== "all") {
            const now = new Date()
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
            
            filtered = filtered.filter(user => {
                if (filters.status === "active") {
                    return user.lastLogin && new Date(user.lastLogin) > sevenDaysAgo
                } else if (filters.status === "inactive") {
                    return !user.lastLogin || new Date(user.lastLogin) <= sevenDaysAgo
                }
                return true
            })
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (filters.sortBy) {
                case "username":
                    aValue = a.username?.toLowerCase() || ""
                    bValue = b.username?.toLowerCase() || ""
                    break
                case "email":
                    aValue = a.email?.toLowerCase() || ""
                    bValue = b.email?.toLowerCase() || ""
                    break
                case "role":
                    aValue = a.role?.toLowerCase() || ""
                    bValue = b.role?.toLowerCase() || ""
                    break
                case "lastLogin":
                    aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
                    bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
                    break
                case "name":
                    aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase()
                    bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase()
                    break
                default:
                    aValue = a.username?.toLowerCase() || ""
                    bValue = b.username?.toLowerCase() || ""
            }

            if (filters.sortOrder === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        return filtered
    }, [users, debouncedSearch, filters.role, filters.status, filters.sortBy, filters.sortOrder])

    const handleDelete = async (userId, userRole, userName) => {
        if (userRole === 'admin') {
            toast.error('Cannot delete admin users')
            return
        }

        if (userId === currentUser?.id) {
            toast.error('Cannot delete your own account')
            return
        }

        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return
        }

        try {
        setDeletingId(userId)
        setError(null)
        const result = await deleteUser(userId)
        
        if (result.success) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
            toast.success(result.message || 'User deleted successfully')
        } else {
            toast.error(result.error || 'Failed to delete user')
        }
    } catch (error) {
        console.error('Failed to delete user:', error)
        setError('Failed to delete user')
        toast.error('Failed to delete user')
    } finally {
        setDeletingId(null)
    }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearAllFilters = () => {
        setFilters({
            search: "",
            role: "all",
            status: "all",
            sortBy: "username",
            sortOrder: "asc"
        })
    }

    const refreshUsers = async () => {
        try {
            setLoading(true)
            const result = await fetchAllUsers()
            if (!result.success) {
                toast.error(result.error || 'Failed to refresh users')
            } else {
                toast.success('Users refreshed successfully')
            }
        } catch (err) {
            toast.error('Failed to refresh users')
        } finally {
            setLoading(false)
        }
    }

    const exportUsers = () => {
        const csvContent = [
            ['Username', 'First Name', 'Last Name', 'Email', 'Role', 'Farm Name', 'Last Login', 'Status'],
            ...filteredUsers.map(user => [
                user.username || 'N/A',
                user.firstName || 'N/A',
                user.lastName || 'N/A',
                user.email || 'N/A',
                user.role || 'N/A',
                user.farmName || 'N/A',
                user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
                user.lastLogin && new Date(user.lastLogin) > new Date(new Date().setDate(new Date().getDate() - 7)) ? 'Active' : 'Inactive'
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('Users exported successfully')
    }

    const getStatusBadge = (user) => {
        if (!user.lastLogin) return "Never logged in"
        
        const lastLogin = new Date(user.lastLogin)
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))
        
        if (lastLogin > sevenDaysAgo) {
            return {
                text: "Active",
                className: "bg-green-100 text-green-800 border border-green-200",
                icon: <CheckCircle size={12} className="inline mr-1" />
            }
        } else {
            return {
                text: "Inactive",
                className: "bg-red-100 text-red-800 border border-red-200",
                icon: <XCircle size={12} className="inline mr-1" />
            }
        }
    }

    const formatLastLogin = (lastLogin) => {
        if (!lastLogin) return "Never"
        
        const date = new Date(lastLogin)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        
        return date.toLocaleDateString()
    }

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return {
                    className: "bg-purple-100 text-purple-800 border border-purple-200",
                    icon: <Shield size={12} className="inline mr-1" />
                }
            case 'farmer':
                return {
                    className: "bg-green-100 text-green-800 border border-green-200",
                    icon: <User size={12} className="inline mr-1" />
                }
            default:
                return {
                    className: "bg-gray-100 text-gray-800 border border-gray-200",
                    icon: <User size={12} className="inline mr-1" />
                }
        }
    }

    const handleCreateUser = async () => {
        // // Validate required fields
        // const requiredFields = ['firstName', 'lastName', 'username', 'email', 'role', 'password', 'farmName'];
        // for (const field of requiredFields) {
        //     if (!formData[field]?.trim()) {
        //         toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        //         return;
        //     }
        // }

        // // Email validation
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(formData.email)) {
        //     toast.error("Please enter a valid email address");
        //     return;
        // }

        // // Password validation
        // if (formData.password.length < 6) {
        //     toast.error("Password must be at least 6 characters long");
        //     return;
        // }

        // // Confirm password
        // if (formData.password !== formData.confirmPassword) {
        //     toast.error("Passwords do not match");
        //     return;
        // }

        setLoading(true);
       try {
        const result = await createUserByAdmin(formData);
        if (result.success) {
            toast.success(result.message || "User created successfully.");
            handleCancelForm();
            refreshUsers();
        } else {
            toast.error(result.error || "Failed to create user.");
        }
    } catch (error) {
        console.error('Error creating user:', error);
        toast.error("An error occurred while creating the user.");
    } finally {
        setLoading(false);   
    }
    }


    const handleCancelForm = () => {
        setEditingUser(null);
        setFormData({ 
            firstName: "", 
            lastName: "", 
            username: "", 
            email: "", 
            role: "", 
            password: "",
            confirmPassword: "",
            farmName: "" ,
        });
        setShowUserForm(false);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            username: user.username || "",
            email: user.email || "",
            farmName: user.farmName || "",
            role: user.role || "farmer",
            password: "",
            confirmPassword: ""
        });
        setShowUserForm(true);
    };

    const handleUpdateUser = async () => {
        // Validate required fields for update
        const requiredFields = ['firstName', 'lastName', 'username', 'email', 'role', 'farmName'];
        for (const field of requiredFields) {
            if (!formData[field]?.trim()) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // If password is provided, validate it
        if (formData.password) {
            if (formData.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
        }

        setLoading(true);
        try {
            // Prepare update data
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                farmName: formData.farmName,
                role: formData.role
            };

            // Only include password if provided
            if (formData.password) {
                updateData.password = formData.password;
            }

            const result = await updateUser(editingUser.id, updateData);
            if (result.success) {
                toast.success(result.message || "User updated successfully.");
                handleCancelForm();
                //refreshUsers();
                
            } else {
                toast.error(result.error || "Failed to update user.");
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error("An error occurred while updating the user.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const hasActiveFilters = filters.search || filters.role !== "all" || filters.status !== "all"

    // Show loading state
    if (loading && !showUserForm) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-3">Loading users data...</p>
                </div>
            </div>
        )
    }

    // Check permissions
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
                <p className="text-red-700 font-medium mb-2">Access Denied</p>
                <p className="text-red-600 text-sm">Administrator privileges required to view this page.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <button
                        onClick={refreshUsers}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setFormData({ 
                                firstName: "", 
                                lastName: "", 
                                username: "", 
                                email: "", 
                                role: "farmer", 
                                password: "",
                                confirmPassword: "",
                                farmName: "" 
                            });
                            setShowUserForm(!showUserForm);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                            showUserForm
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        {showUserForm ? (
                            <>
                                <X size={18} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Add New User
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Add/Edit User Form */}
            {showUserForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingUser ? "✏️ Edit User" : "➕ Add New User"}
                        </h2>
                        {editingUser && (
                            <button
                                type="button"
                                onClick={handleCancelForm}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                                <span>Cancel Edit</span>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Farm Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Farm Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="farmName"
                                placeholder="Enter farm name"
                                value={formData.farmName}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleFormChange}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            >
                                <option value="farmer">Farmer</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Password {editingUser ? "(Leave blank to keep current)" : <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    required={!editingUser}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm Password {editingUser && !formData.password ? "(Optional)" : <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleFormChange}
                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    required={!editingUser || formData.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Fields marked with <span className="text-red-500">*</span> are required
                        </div>

                        <button
                            onClick={editingUser ? handleUpdateUser : handleCreateUser}
                            disabled={loading}
                            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    {editingUser ? 'Updating...' : 'Creating...'}
                                </>
                            ) : editingUser ? (
                                <>
                                    <Save size={18} />
                                    Update User
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Add User
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <User className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Administrators</p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">
                                {users.filter(u => u?.role === 'admin').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Shield className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Farmers</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {users.filter(u => u?.role === 'farmer').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <User className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                {users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(new Date().setDate(new Date().getDate() - 7))).length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users by name, email, farm, or role..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange("search", "")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange("role", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="farmer">Farmer</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                            <option value="username">Sort by Username</option>
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="role">Sort by Role</option>
                            <option value="lastLogin">Sort by Last Login</option>
                        </select>

                        <button
                            onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                            {filters.sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <button
                            onClick={exportUsers}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Active Filters Indicator */}
                {hasActiveFilters && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
                            <Filter size={14} />
                            <span>Active filters:</span>
                            {filters.search && (
                                <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">Search: "{filters.search}"</span>
                            )}
                            {filters.role !== "all" && (
                                <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">Role: {filters.role}</span>
                            )}
                            {filters.status !== "all" && (
                                <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">Status: {filters.status}</span>
                            )}
                            <button
                                onClick={clearAllFilters}
                                className="text-blue-600 hover:text-blue-800 underline ml-2"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">User Database</h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                                Total: {users.length}
                            </div>
                            <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                                Active: {users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(new Date().setDate(new Date().getDate() - 7))).length}
                            </div>
                        </div>
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <User size={48} className="mb-3 opacity-50" />
                            <p className="text-lg font-medium text-gray-500 mb-2">No users found</p>
                            <p className="text-sm text-gray-400 max-w-md">
                                {hasActiveFilters 
                                    ? "No users match your search criteria. Try adjusting your filters."
                                    : "Start by adding the first user to your system."}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        User Information
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Role & Status
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Farm Details
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => {
                                    const statusBadge = getStatusBadge(user)
                                    const roleBadge = getRoleBadge(user.role)
                                    
                                    return (
                                        <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-gray-900">
                                                                {user.firstName && user.lastName 
                                                                    ? `${user.firstName} ${user.lastName}`
                                                                    : user.username || 'No name'}
                                                            </h4>
                                                            {user.id === currentUser.id && (
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">You</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                            <Mail size={12} />
                                                            <span className="truncate">{user.email}</span>
                                                        </div>
                                                        {user.username && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                @{user.username}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="space-y-2 space-x-0 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge.className}`}>
                                                        {roleBadge.icon}
                                                        {user.role}
                                                    </span>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                                        {statusBadge.icon}
                                                        {statusBadge.text}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Building size={14} />
                                                    <span>{user.farmName || <span className="text-gray-400 italic">No farm registered</span>}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar size={14} />
                                                    <span>{formatLastLogin(user.lastLogin)}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.role, user.username || user.email)}
                                                        disabled={deletingId === user.id || user.id === currentUser.id || user.role === 'admin'}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            deletingId === user.id || user.id === currentUser.id || user.role === 'admin'
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                        }`}
                                                        title={
                                                            user.id === currentUser.id 
                                                                ? "Cannot delete your own account"
                                                                : user.role === 'admin'
                                                                ? "Cannot delete admin users"
                                                                : "Delete User"
                                                        }
                                                    >
                                                        {deletingId === user.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer */}
                {filteredUsers.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                            <div>
                                Showing <span className="font-semibold">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                                        <ChevronUp size={16} />
                                    </button>
                                    <span className="px-2">Page 1 of 1</span>
                                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserList