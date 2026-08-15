// src/components/parent/ChildHeader.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { User, Calendar, Activity } from 'lucide-react';

interface ChildHeaderProps {
  firstName: string;
  lastName: string;
  age: number;
  status: string;
  avatar?: string | null;
}

export function ChildHeader({ firstName, lastName, age, status, avatar }: ChildHeaderProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-yellow-100 text-yellow-700';
      case 'discharged': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={`${firstName} ${lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            `${firstName.charAt(0)}${lastName.charAt(0)}`
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {firstName} {lastName}
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar size={14} className="text-gray-400" />
              {age} {t('patients.age')}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {t(`patients.status.${status}`)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}