import React from 'react';

const FloorPlan = ({ rooms, onRoomSelect, selectedRoomId, roomDeviceStats }) => {
    if (!rooms || rooms.length === 0) {
        return <div className="text-center text-slate-400 p-8">جاري تحميل مخطط المنزل...</div>;
    }
  return (
    <div
      className="w-full bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 p-4 sm:p-6 backdrop-blur-sm"
    >
      <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="smallGridFloorPlan" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="gridFloorPlan" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#smallGridFloorPlan)"/>
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridFloorPlan)" />
        </svg>
      </div>

      {/* حاوية الشبكة للغرف */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rooms.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isAnyRoomSelected = selectedRoomId !== null;
          const stats = roomDeviceStats[room.id] || { count: 0, cost: 0 };

          return (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`relative flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-3 border-2 aspect-square
                              ${isSelected
                                  ? 'bg-sky-500/90 border-sky-400 shadow-2xl scale-105 z-20 ring-4 ring-sky-500/50'
                                  : isAnyRoomSelected
                                      ? 'bg-slate-600/60 border-slate-700 opacity-70 hover:opacity-100 hover:bg-slate-500/70 hover:border-slate-500'
                                      : 'bg-slate-600/80 border-slate-700 hover:bg-sky-600/70 hover:border-sky-500 shadow-lg hover:scale-105'
                              }`}
              aria-label={`اختر ${room.name}`}
            >
              <span
                className={`text-2xl sm:text-3xl mb-1 transition-transform duration-300 ease-in-out
                                    ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                role="img"
                aria-hidden="true"
              >
                {room.icon || '🏠'}
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold text-center leading-tight px-1 transition-opacity duration-300
                                    ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}
              >
                {room.name}
              </span>
              {stats.count > 0 && (
                <div
                  className={`mt-1.5 text-[8px] sm:text-[10px] leading-tight p-1 rounded-md transition-all duration-300 ease-in-out
                                      ${isSelected ? 'bg-sky-700/80 text-white' : 'bg-slate-700/70 text-sky-300 group-hover:bg-sky-700/70 group-hover:text-white'}`}
                >
                  <span>{stats.count} {stats.count === 1 || (stats.count % 10 === 1 && stats.count !== 11) ? "عنصر" : (stats.count === 2 || (stats.count % 10 === 2 && stats.count !== 12)) ? "عنصران" : (stats.count >=3 && stats.count <=10) ? "عناصر" : "عنصر"}</span>
                  <span className="mx-1">|</span>
                  <span className="whitespace-nowrap">{stats.cost.toLocaleString('ar-EG')} ج.م</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="relative z-10 mt-4 text-center text-[10px] sm:text-xs text-slate-300 p-1 bg-slate-900/80 rounded-md shadow-md">
        {selectedRoomId ? `تم تحديد: ${rooms.find(r=>r.id === selectedRoomId)?.name}` : "اختر غرفة للبدء"}
      </div>
    </div>
  );
};
export default FloorPlan;