import { Search, X } from 'lucide-react'

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
]

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title A-Z' },
]

const TaskFilters = ({ filters, onChange, onReset }) => {
    const hasActiveFilters =
        filters.search || filters.status || filters.priority

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            {/* Search */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filters.search || ''}
                    onChange={(e) => onChange({ search: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-2">
                {/* Status */}
                <select
                    value={filters.status || ''}
                    onChange={(e) => onChange({ status: e.target.value })}
                    className="flex-1 min-w-32.5 px-3 py-2 border border-gray-300 rounded-xl text-sm
            focus:outline-none focus:border-blue-500 bg-white"
                >
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {/* Priority */}
                <select
                    value={filters.priority || ''}
                    onChange={(e) => onChange({ priority: e.target.value })}
                    className="flex-1 min-w-32.5 px-3 py-2 border border-gray-300 rounded-xl text-sm
            focus:outline-none focus:border-blue-500 bg-white"
                >
                    {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) => onChange({ sort_by: e.target.value })}
                    className="flex-1 min-w-40 px-3 py-2 border border-gray-300 rounded-xl text-sm
            focus:outline-none focus:border-blue-500 bg-white"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {/* Reset */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600
              hover:bg-red-50 border border-red-200 rounded-xl transition-colors"
                    >
                        <X size={14} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}

export default TaskFilters