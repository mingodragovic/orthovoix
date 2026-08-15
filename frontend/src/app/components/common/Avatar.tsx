// src/app/components/common/Avatar.tsx
import { getAvatarColor } from "../../../utils/helpers";

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: getAvatarColor(initials), 
        fontSize: size * 0.35 
      }}
    >
      {initials}
    </div>
  );
}