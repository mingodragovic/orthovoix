// src/components/parent/StrengthsWeaknesses.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface StrengthsWeaknessesProps {
  strengths: string[];
  areasForImprovement: string[];
}

export function StrengthsWeaknesses({ strengths, areasForImprovement }: StrengthsWeaknessesProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsUp size={16} className="text-green-600" />
          <h3 className="text-sm font-medium text-green-800">
            {t('progress.strengths', 'Strengths')}
          </h3>
        </div>
        {strengths.length === 0 ? (
          <p className="text-sm text-green-600/70">
            {t('progress.noStrengths', 'No strengths recorded yet')}
          </p>
        ) : (
          <ul className="space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm text-green-700 flex items-center gap-1">
                <span className="text-green-500">•</span>
                {strength}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Areas for Improvement */}
      <div className="bg-red-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsDown size={16} className="text-red-600" />
          <h3 className="text-sm font-medium text-red-800">
            {t('progress.areasForImprovement', 'Areas for Improvement')}
          </h3>
        </div>
        {areasForImprovement.length === 0 ? (
          <p className="text-sm text-red-600/70">
            {t('progress.noAreas', 'No areas for improvement recorded yet')}
          </p>
        ) : (
          <ul className="space-y-1">
            {areasForImprovement.map((area, index) => (
              <li key={index} className="text-sm text-red-700 flex items-center gap-1">
                <span className="text-red-500">•</span>
                {area}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}