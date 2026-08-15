// src/components/ui/DataTable.tsx
import { useState, useMemo, ReactNode } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: any;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filterOptions?: { label: string; value: string; field: keyof T }[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error,
  onRetry,
  searchPlaceholder = 'Search...',
  searchFields = [],
  filterOptions = [],
  pagination,
  emptyMessage = 'No data found',
  actions,
}: DataTableProps<T>) {
  const { t, isRTL } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search and filter
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field as string];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply filter
    if (filterValue && filterOptions.length > 0) {
      const filterOption = filterOptions.find((opt) => opt.value === filterValue);
      if (filterOption) {
        filtered = filtered.filter((item) => {
          return item[filterOption.field] === filterValue;
        });
      }
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filterValue, filterOptions, sortField, sortDirection, searchFields]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, onPageChange } = pagination;
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentPage === page
                ? 'bg-primary text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-red-500">{t('common.error')}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-primary hover:underline"
            >
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filterOptions.length > 0 && (
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <select 
                className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-white cursor-pointer"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">{t('common.filter')}</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#05807C]/10">
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider ${
                      index < columns.length - 1 ? 'border-r border-gray-200' : ''
                    } ${column.className || ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="hover:text-gray-900 transition-colors"
                        >
                          {sortField === column.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )
                          ) : (
                            <div className="w-4 h-4 text-gray-300">↕</div>
                          )}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                    {t('common.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.key}
                        className={`py-3 px-4 text-sm text-gray-700 ${
                          colIndex < columns.length - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="py-3 px-4">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
  <Pagination
    currentPage={pagination.currentPage}
    totalPages={pagination.totalPages}
    totalItems={pagination.total}
    itemsPerPage={10} // or use a prop
    onPageChange={pagination.onPageChange}
  />
)}
      </div>
    </div>
  );
}