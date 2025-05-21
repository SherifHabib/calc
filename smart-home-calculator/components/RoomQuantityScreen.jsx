import React, { useState } from 'react';
import QuantityInputControl from './QuantityInputControl';

const RoomQuantityScreen = ({ unitConfig, onConfirmQuantities, onBack, initialUnitArea, onUnitAreaChange }) => {
    const initialCounts = {};
    unitConfig.countableRooms.forEach(room => {
        initialCounts[room.id] = room.defaultCount;
    });
    const [roomCounts, setRoomCounts] = useState(initialCounts);
    const [unitArea, setUnitArea] = useState(initialUnitArea || '');
    const [areaError, setAreaError] = useState('');


    const updateCount = (roomId, delta) => {
        const roomSpec = unitConfig.countableRooms.find(r => r.id === roomId);
        if (!roomSpec) return;

        setRoomCounts(prev => {
            const currentVal = prev[roomId] || 0;
            let newVal = currentVal + delta;
            if (newVal < roomSpec.min) newVal = roomSpec.min;
            if (newVal > roomSpec.max) newVal = roomSpec.max;
            return { ...prev, [roomId]: newVal };
        });
    };

    const handleAreaInputChange = (e) => {
        const value = e.target.value;
        setUnitArea(value);
        if (value && (isNaN(value) || Number(value) <= 0)) {
            setAreaError('الرجاء إدخال مساحة صحيحة أكبر من صفر.');
        } else if (!value) {
            setAreaError('مساحة الوحدة حقل إجباري.');
        }
        else {
            setAreaError('');
        }
        onUnitAreaChange(value);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!unitArea || Number(unitArea) <= 0) {
            setAreaError('الرجاء إدخال مساحة صحيحة للوحدة قبل المتابعة.');
            return;
        }
        setAreaError('');
        onConfirmQuantities(roomCounts, unitArea);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-12 p-6 bg-slate-800/50 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-2xl sm:text-3xl font-semibold text-sky-300 mb-8 text-center">
                حدد تفاصيل {unitConfig.name}
            </h2>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 shadow-sm">
                    <label htmlFor="unitArea" className="text-lg text-slate-100 mb-2 sm:mb-0 sm:mr-4 rtl:sm:ml-4 flex-grow">
                        مساحة الوحدة (متر مربع): <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="unitArea"
                        value={unitArea}
                        onChange={handleAreaInputChange}
                        min="1"
                        placeholder="مثال: 150"
                        className={`w-full sm:w-40 p-2 text-center bg-slate-800 border rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${areaError ? 'border-red-500' : 'border-slate-600'}`}
                        required
                    />
                </div>
                    {areaError && <p className="text-red-500 text-sm mt-1 text-center sm:text-right rtl:sm:text-left">{areaError}</p>}


                {unitConfig.countableRooms.map(room => (
                    <div key={room.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 shadow-sm">
                        <label className="text-lg text-slate-100 mb-2 sm:mb-0 sm:mr-4 rtl:sm:ml-4 flex-grow">
                            عدد {room.name}:
                        </label>
                        <QuantityInputControl
                            value={roomCounts[room.id] || room.defaultCount}
                            min={room.min}
                            max={room.max}
                            onIncrement={() => updateCount(room.id, 1)}
                            onDecrement={() => updateCount(room.id, -1)}
                            ariaLabel={`عدد ${room.name}`}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-base"
                >
                    العودة لاختيار الوحدة
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-base"
                >
                    تأكيد وعرض المخطط
                </button>
            </div>
        </form>
    );
};

export default RoomQuantityScreen;