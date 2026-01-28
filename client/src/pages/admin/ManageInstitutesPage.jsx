/**
 * Admin Manage Institutes Page
 * Comprehensive institutes management with CRUD operations,
 * search, filtering, stats cards, and premium styling.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { adminService } from '../../services/adminService';
import { cn } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// MOCK DATA (would come from API)
// ============================================================================

const MOCK_INSTITUTES = [
    { id: 1, name: 'Vision IAS', location: 'New Delhi', notesCount: 45, rating: 4.9, featured: true, status: 'active', website: 'visionias.in', phone: '+91 98765 43210', email: 'info@visionias.in' },
    { id: 2, name: 'Vajiram & Ravi', location: 'New Delhi', notesCount: 38, rating: 4.8, featured: true, status: 'active', website: 'vajiramandravi.com', phone: '+91 98765 43211', email: 'info@vajiramandravi.com' },
    { id: 3, name: 'Drishti IAS', location: 'New Delhi', notesCount: 42, rating: 4.7, featured: true, status: 'active', website: 'drishtiias.com', phone: '+91 98765 43212', email: 'info@drishtiias.com' },
    { id: 4, name: 'Forum IAS', location: 'New Delhi', notesCount: 28, rating: 4.6, featured: false, status: 'active', website: 'forumias.com', phone: '+91 98765 43213', email: 'info@forumias.com' },
    { id: 5, name: 'Insights IAS', location: 'Bangalore', notesCount: 32, rating: 4.5, featured: false, status: 'active', website: 'insightsonindia.com', phone: '+91 98765 43214', email: 'info@insightsonindia.com' },
    { id: 6, name: 'Shankar IAS', location: 'Chennai', notesCount: 25, rating: 4.4, featured: false, status: 'inactive', website: 'shankarias.in', phone: '+91 98765 43215', email: 'info@shankarias.in' },
    { id: 7, name: 'GS Score', location: 'New Delhi', notesCount: 22, rating: 4.3, featured: false, status: 'active', website: 'gsscore.in', phone: '+91 98765 43216', email: 'info@gsscore.in' },
    { id: 8, name: 'Next IAS', location: 'New Delhi', notesCount: 18, rating: 4.2, featured: false, status: 'active', website: 'nextias.com', phone: '+91 98765 43217', email: 'info@nextias.com' },
];

// ============================================================================
// STATS CARDS
// ============================================================================

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
                <Icon className={cn('w-6 h-6', color)} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </div>
    </div>
);

// ============================================================================
// INSTITUTE ROW
// ============================================================================

const InstituteRow = ({ institute, onEdit, onDelete, onToggleFeatured }) => (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
        <td className="px-4 py-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BuildingOfficeIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{institute.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>{institute.location}</span>
                    </div>
                </div>
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="flex items-center gap-1">
                <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{institute.notesCount}</span>
                <span className="text-gray-500 dark:text-gray-400">notes</span>
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="flex items-center gap-1">
                <StarSolidIcon className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-gray-900 dark:text-white">{institute.rating}</span>
            </div>
        </td>
        <td className="px-4 py-4">
            <Badge
                type="soft"
                variant={institute.status === 'active' ? 'success' : 'warning'}
            >
                {institute.status}
            </Badge>
        </td>
        <td className="px-4 py-4">
            <button
                onClick={() => onToggleFeatured(institute)}
                className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    institute.featured
                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title={institute.featured ? 'Remove from featured' : 'Add to featured'}
            >
                {institute.featured ? (
                    <StarSolidIcon className="w-5 h-5" />
                ) : (
                    <StarIcon className="w-5 h-5" />
                )}
            </button>
        </td>
        <td className="px-4 py-4">
            <div className="flex items-center justify-end gap-2">
                <a
                    href={`https://${institute.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Visit website"
                >
                    <GlobeAltIcon className="w-5 h-5" />
                </a>
                <button
                    onClick={() => onEdit(institute)}
                    className="p-2 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(institute)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Delete"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </td>
    </motion.tr>
);

// ============================================================================
// INSTITUTE FORM MODAL
// ============================================================================

const InstituteFormModal = ({ isOpen, onClose, institute, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        website: '',
        phone: '',
        email: '',
        status: 'active',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (institute) {
            setFormData({
                name: institute.name || '',
                location: institute.location || '',
                website: institute.website || '',
                phone: institute.phone || '',
                email: institute.email || '',
                status: institute.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                location: '',
                website: '',
                phone: '',
                email: '',
                status: 'active',
            });
        }
    }, [institute]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(institute ? 'Institute updated!' : 'Institute created!');
            onSave(formData);
            onClose();
        } catch (error) {
            toast.error('Failed to save institute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={institute ? 'Edit Institute' : 'Add New Institute'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Institute Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., Vision IAS"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., New Delhi"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                    </label>
                    <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., visionias.in"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="info@institute.com"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1">
                        {institute ? 'Update' : 'Create'} Institute
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

const DeleteModal = ({ isOpen, onClose, institute, onConfirm }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Institute deleted successfully');
            onConfirm();
            onClose();
        } catch (error) {
            toast.error('Failed to delete institute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Institute" size="sm">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{institute?.name}</strong>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                    This will also remove all {institute?.notesCount} associated notes.
                </p>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        loading={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManageInstitutesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [institutes, setInstitutes] = useState(MOCK_INSTITUTES);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [editInstitute, setEditInstitute] = useState(null);
    const [deleteInstitute, setDeleteInstitute] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const stats = useMemo(() => ({
        total: institutes.length,
        active: institutes.filter(i => i.status === 'active').length,
        featured: institutes.filter(i => i.featured).length,
        totalNotes: institutes.reduce((sum, i) => sum + i.notesCount, 0),
    }), [institutes]);

    const filteredInstitutes = useMemo(() => {
        if (!search) return institutes;
        return institutes.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.location.toLowerCase().includes(search.toLowerCase())
        );
    }, [institutes, search]);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        setSearchParams(params);
    };

    const handleToggleFeatured = (institute) => {
        setInstitutes(prev => prev.map(i =>
            i.id === institute.id ? { ...i, featured: !i.featured } : i
        ));
        toast.success(institute.featured ? 'Removed from featured' : 'Added to featured');
    };

    const handleSaveInstitute = (data) => {
        if (editInstitute) {
            setInstitutes(prev => prev.map(i =>
                i.id === editInstitute.id ? { ...i, ...data } : i
            ));
        } else {
            setInstitutes(prev => [...prev, { id: Date.now(), ...data, notesCount: 0, rating: 0, featured: false }]);
        }
        setEditInstitute(null);
        setShowAddModal(false);
    };

    const handleDeleteConfirm = () => {
        setInstitutes(prev => prev.filter(i => i.id !== deleteInstitute.id));
        setDeleteInstitute(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Institutes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage partner coaching institutes
                    </p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Institute
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={BuildingOfficeIcon}
                    label="Total Institutes"
                    value={stats.total}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-100 dark:bg-blue-900/20"
                />
                <StatCard
                    icon={CheckCircleIcon}
                    label="Active"
                    value={stats.active}
                    color="text-emerald-600 dark:text-emerald-400"
                    bgColor="bg-emerald-100 dark:bg-emerald-900/20"
                />
                <StatCard
                    icon={StarSolidIcon}
                    label="Featured"
                    value={stats.featured}
                    color="text-amber-600 dark:text-amber-400"
                    bgColor="bg-amber-100 dark:bg-amber-900/20"
                />
                <StatCard
                    icon={DocumentTextIcon}
                    label="Total Notes"
                    value={stats.totalNotes}
                    color="text-purple-600 dark:text-purple-400"
                    bgColor="bg-purple-100 dark:bg-purple-900/20"
                />
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-md relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by name or location..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <Button onClick={handleSearch} size="sm">Search</Button>
                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSearchParams(new URLSearchParams());
                            }}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                        {filteredInstitutes.length} institutes
                    </p>
                </div>
            </div>

            {/* Institutes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Institute
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Notes
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredInstitutes.map((institute) => (
                                <InstituteRow
                                    key={institute.id}
                                    institute={institute}
                                    onEdit={setEditInstitute}
                                    onDelete={setDeleteInstitute}
                                    onToggleFeatured={handleToggleFeatured}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <InstituteFormModal
                isOpen={showAddModal || !!editInstitute}
                onClose={() => {
                    setShowAddModal(false);
                    setEditInstitute(null);
                }}
                institute={editInstitute}
                onSave={handleSaveInstitute}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deleteInstitute}
                onClose={() => setDeleteInstitute(null)}
                institute={deleteInstitute}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
