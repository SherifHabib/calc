import React from 'react';
import { unitTypesConfig } from '../data/unitTypesConfigData'; // استيراد البيانات

const UnitSelectionScreen = ({ onSelectUnit }) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-semibold text-sky-300 mb-8 text-center">اختر نوع وحدتك السكنية:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(unitTypesConfig).map((unit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit.id)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <div className="text-6xl mb-4 text-center">{unit.icon || '🏠'}</div>
            <h3 className="text-2xl font-semibold text-slate-100 text-center">{unit.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitSelectionScreen;