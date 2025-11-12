import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect, useMemo } from "react"
import LoadingSpinner from "../common/LoadingSpinner"

const UserList = () => {
    const { users, fetchAllUsers, currentUser, deleteUser, setUsers } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    
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
                }
            } catch (err) {
                setError('Failed to load users')
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
                user.role?.toLowerCase().includes(searchTerm)
            )
        }

        // Role filter
        if (filters.role !== "all") {
            filtered = filtered.filter(user => user.role === filters.role)
        }

        // Status filter based on last login
        if (filters.status !== "all") {
            const now = new Date()
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 7))
            
            filtered = filtered.filter(user => {
                if (filters.status === "active") {
                    return user.lastLogin && new Date(user.lastLogin) > thirtyDaysAgo
                } else if (filters.status === "inactive") {
                    return !user.lastLogin || new Date(user.lastLogin) <= thirtyDaysAgo
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

    const handleDelete = async (userId, userRole) => {
        if (userRole === 'admin') {
            alert('Cannot delete admin users. Please contact system administrator.')
            return
        }

        if (!window.confirm('Are you sure you want to delete this user?')) {
            return
        }

        try {
            setDeletingId(userId)
            setError(null)
            await deleteUser(userId)
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
        } catch (error) {
            console.error('Failed to delete user:', error)
            setError('Failed to delete user')
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

    const hasActiveFilters = filters.search || filters.role !== "all" || filters.status !== "all"

    // Show loading state
    if (loading) {
        return <div className="p-4"><LoadingSpinner /></div>
    }

    // Check permissions
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="p-4 text-red-600">
                Access denied. Administrator privileges required to view this page.
            </div>
        )
    }

    // Show error
    if (error) {
        return (
            <div className="p-4">
                <div className="text-red-600">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="p-4">
            {/* Header with Search and Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    User Management ({filteredUsers.length} of {users.length} users)
                </h2>

                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 lg:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, farm, or role..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange("search", "")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
                            >
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange("role", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="farmer">Farmer</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active (Last 7 days)</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="username">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="role">Sort by Role</option>
                            <option value="lastLogin">Sort by Last Login</option>
                        </select>

                        <button
                            onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Results Info */}
            {hasActiveFilters && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
                        <span>Active filters:</span>
                        {filters.search && (
                            <span className="bg-blue-100 px-2 py-1 rounded">Search: "{filters.search}"</span>
                        )}
                        {filters.role !== "all" && (
                            <span className="bg-blue-100 px-2 py-1 rounded">Role: {filters.role}</span>
                        )}
                        {filters.status !== "all" && (
                            <span className="bg-blue-100 px-2 py-1 rounded">Status: {filters.status}</span>
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

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    {hasActiveFilters ? (
                        <>
                            <div className="text-gray-400 text-lg mb-2">No users match your search criteria</div>
                            <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Clear All Filters
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-gray-400 text-lg mb-2">No users found</div>
                            <div className="text-gray-500 text-sm">Users will appear here once registered</div>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "username")}>
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "role")}>
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Farm
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "lastLogin")}>
                                        Last Active
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : 'bg-green-100 text-green-800 border border-green-200'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.farmName || <span className="text-gray-400">No farm</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.lastLogin ? (
                                                <div>
                                                    <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(user.lastLogin).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Never logged in</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(user.id, user.role)}
                                                disabled={deletingId === user.id}
                                                className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === user.id ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting
                                                    </span>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserList