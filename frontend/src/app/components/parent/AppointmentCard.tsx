// src/components/parent/AppointmentCard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar, Clock, MapPin, Video, ChevronRight } from 'lucide-react';

interface AppointmentCardProps {
  id: string;
  dateTime: string;
  location: string | null;
  isVirtual: boolean | null;
  type: string;
  status: string;
  orthophonisteName: string;
  onClick?: () => void;
}

export function AppointmentCard({
  id,
  dateTime,
  location,
  isVirtual,
  type,
  status,
  orthophonisteName,
  onClick,
}: AppointmentCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/parent/appointments/${id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {t(`appointments.type.${type}`)}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {t(`appointments.status.${status}`)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{orthophonisteName}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(dateTime)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTime(dateTime)}
            </span>
            {isVirtual ? (
              <span className="flex items-center gap-1 text-blue-600">
                <Video size={12} />
                {t('appointments.virtual')}
              </span>
            ) : location ? (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {location}
              </span>
            ) : null}
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}