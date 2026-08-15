// src/components/ui/Pagination.tsx
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  if (totalPages <= 1) return null;

  // Calculate range of items being shown
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page window
  const getPageWindow = (): Array<number | string> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const tokens: Array<number | string> = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) tokens.push('…');
    for (let p = left; p <= right; p += 1) tokens.push(p);
    if (right < totalPages - 1) tokens.push('…');

    tokens.push(totalPages);
    return tokens;
  };

  const pageWindow = getPageWindow();

  // Navigate to page
  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  };

  // Icons based on RTL
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-200 ${className}`}>
      {/* Items counter */}
      <p className="text-sm text-gray-500">
        {t('pagination.showing', 'Showing')}{' '}
        <span className="font-medium text-gray-700">{startItem}</span>
        {' – '}
        <span className="font-medium text-gray-700">{endItem}</span>
        {' '}{t('pagination.of', 'of')}{' '}
        <span className="font-medium text-gray-700">{totalItems}</span>
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Previous */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.previous', 'Previous')}
        >
          <PrevIcon size={18} />
        </button>

        {/* Page numbers */}
        {pageWindow.map((token, index) => {
          if (token === '…') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="min-w-[36px] text-center text-gray-400 select-none"
              >
                <MoreHorizontal size={18} />
              </span>
            );
          }

          const pageNum = token as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.next', 'Next')}
        >
          <NextIcon size={18} />
        </button>
      </div>
    </div>
  );
}