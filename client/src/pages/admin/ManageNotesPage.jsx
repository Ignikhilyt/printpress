/**
 * Admin Manage Notes Page
 * Comprehensive notes management with CRUD operations, bulk actions,
 * filtering, image upload, and premium styling.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    DocumentTextIcon,
    BuildingOfficeIcon,
    ArrowPathIcon,
    StarIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PhotoIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { notesService } from '../../services/notesService';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import { NOTE_CATEGORIES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// FILTER TABS
// ============================================================================

const FilterTabs = ({ value, onChange }) => {
    const tabs = [
        { value: '', label: 'All Notes' },
        { value: 'featured', label: 'Featured', icon: SparklesIcon },
        ...NOTE_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name, icon: cat.icon })),
    ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        value === tab.value
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                >
                    {typeof tab.icon === 'string' ? (
                        <span>{tab.icon}</span>
                    ) : tab.icon ? (
                        <tab.icon className="w-4 h-4" />
                    ) : null}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

// ============================================================================
// NOTE ROW
// ============================================================================

const NoteRow = ({ note, isSelected, onSelect, onEdit, onDelete, onToggleFeatured }) => {
    const navigate = useNavigate();
    const category = NOTE_CATEGORIES.find(c => c.id === note.category);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                'transition-colors',
                isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            )}
        >
            <td className="px-4 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(note.id)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DocumentTextIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {note.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {note.pageCount} pages
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <Badge type="soft" variant={category?.color || 'default'}>
                    {category?.icon} {category?.name || note.category}
                </Badge>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                        {note.institute?.name || 'N/A'}
                    </span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="font-medium text-gray-900 dark:text-white">
                    {note.subject}
                </span>
            </td>
            <td className="px-4 py-4">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(note.pageCount * note.pricePerPage)}
                </span>
            </td>
            <td className="px-4 py-4">
                <button
                    onClick={() => onToggleFeatured(note)}
                    className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        note.isFeatured
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    title={note.isFeatured ? 'Remove from featured' : 'Add to featured'}
                >
                    {note.isFeatured ? (
                        <StarSolidIcon className="w-5 h-5" />
                    ) : (
                        <StarIcon className="w-5 h-5" />
                    )}
                </button>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => window.open(`/notes/${note.slug}`, '_blank')}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="View"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onEdit(note)}
                        className="p-2 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Edit"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(note)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Delete"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

// ============================================================================
// BULK ACTIONS BAR
// ============================================================================

const BulkActionsBar = ({ selectedCount, onClear, onBulkDelete, onBulkFeature }) => {
    if (selectedCount === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-4 z-50"
        >
            <span className="text-sm">
                <strong>{selectedCount}</strong> notes selected
            </span>
            <div className="h-6 w-px bg-gray-700" />
            <button
                onClick={onBulkFeature}
                className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2"
            >
                <StarIcon className="w-4 h-4" />
                Toggle Featured
            </button>
            <button
                onClick={onBulkDelete}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
            >
                <TrashIcon className="w-4 h-4" />
                Delete
            </button>
            <button
                onClick={onClear}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </motion.div>
    );
};

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

const DeleteModal = ({ isOpen, onClose, note, onConfirm }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await notesService.delete(note.id);
            toast.success('Note deleted successfully');
            onConfirm();
            onClose();
        } catch (error) {
            toast.error('Failed to delete note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Note" size="sm">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete <strong>{note?.title}</strong>? This action cannot be undone.
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
// EMPTY STATE
// ============================================================================

const EmptyState = ({ hasFilters, onClearFilters }) => (
    <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notes found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {hasFilters
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Start by adding your first note to the library.'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
            {hasFilters && (
                <Button variant="outline" onClick={onClearFilters}>
                    Clear filters
                </Button>
            )}
            <Link to="/admin/notes/new">
                <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Note
                </Button>
            </Link>
        </div>
    </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ManageNotesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [deleteNote, setDeleteNote] = useState(null);

    const filters = useMemo(() => ({
        page: parseInt(searchParams.get('page')) || 1,
        limit: 15,
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        featured: searchParams.get('featured') || '',
        sort: searchParams.get('sort') || 'latest',
    }), [searchParams]);

    const hasActiveFilters = filters.category || filters.search || filters.featured;

    const fetchNotes = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await notesService.getAll(filters);
            setNotes(response.data || []);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleTabChange = (value) => {
        if (value === 'featured') {
            handleFilterChange('featured', 'true');
            handleFilterChange('category', '');
        } else {
            handleFilterChange('category', value);
            handleFilterChange('featured', '');
        }
    };

    const handleSearch = () => {
        handleFilterChange('search', search);
    };

    const handleClearFilters = () => {
        setSearch('');
        setSearchParams(new URLSearchParams());
    };

    const handleSelectNote = (noteId) => {
        setSelectedNotes((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId]
        );
    };

    const handleSelectAll = () => {
        if (selectedNotes.length === notes.length) {
            setSelectedNotes([]);
        } else {
            setSelectedNotes(notes.map((n) => n.id));
        }
    };

    const handleToggleFeatured = async (note) => {
        try {
            await notesService.update(note.id, { isFeatured: !note.isFeatured });
            toast.success(note.isFeatured ? 'Removed from featured' : 'Added to featured');
            fetchNotes(true);
        } catch (error) {
            toast.error('Failed to update note');
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
        try {
            await Promise.all(selectedNotes.map(id => notesService.delete(id)));
            toast.success(`${selectedNotes.length} notes deleted`);
            setSelectedNotes([]);
            fetchNotes(true);
        } catch (error) {
            toast.error('Failed to delete some notes');
        }
    };

    const handleBulkFeature = async () => {
        try {
            await Promise.all(selectedNotes.map(id => {
                const note = notes.find(n => n.id === id);
                return notesService.update(id, { isFeatured: !note?.isFeatured });
            }));
            toast.success('Featured status toggled');
            setSelectedNotes([]);
            fetchNotes(true);
        } catch (error) {
            toast.error('Failed to update some notes');
        }
    };

    const handlePageChange = (page) => {
        handleFilterChange('page', page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your study notes library
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchNotes(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                        Refresh
                    </button>
                    <Link to="/admin/notes/new">
                        <Button>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Note
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <FilterTabs
                value={filters.featured ? 'featured' : filters.category}
                onChange={handleTabChange}
            />

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] max-w-md relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by title or subject..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                    <Button onClick={handleSearch} size="sm">Search</Button>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Clear filters
                        </button>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                        {pagination?.total || 0} notes
                    </p>
                </div>
            </div>

            {/* Notes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {notes.length === 0 ? (
                    <EmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotes.length === notes.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Note
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Institute
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Price
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
                                    {notes.map((note) => (
                                        <NoteRow
                                            key={note.id}
                                            note={note}
                                            isSelected={selectedNotes.includes(note.id)}
                                            onSelect={handleSelectNote}
                                            onEdit={(n) => navigate(`/admin/notes/${n.id}/edit`)}
                                            onDelete={setDeleteNote}
                                            onToggleFeatured={handleToggleFeatured}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {notes.length} of {pagination.total} notes
                                </p>
                                <Pagination
                                    currentPage={filters.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                    compact
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                <BulkActionsBar
                    selectedCount={selectedNotes.length}
                    onClear={() => setSelectedNotes([])}
                    onBulkDelete={handleBulkDelete}
                    onBulkFeature={handleBulkFeature}
                />
            </AnimatePresence>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deleteNote}
                onClose={() => setDeleteNote(null)}
                note={deleteNote}
                onConfirm={() => fetchNotes(true)}
            />
        </div>
    );
}
