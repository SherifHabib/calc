import React from 'react';

const QuantityInputControl = ({ value, min, max, onIncrement, onDecrement, ariaLabel }) => {
    return (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
                type="button"
                onClick={onDecrement}
                disabled={value <= min}
                className="p-2 w-10 h-10 flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-2xl leading-none"
                aria-label={`تقليل ${ariaLabel}`}
            >
                -
            </button>
            <span
                className="px-4 py-2 w-16 text-center bg-slate-800 border border-slate-600 rounded-md text-slate-100 text-lg font-medium"
                aria-live="polite"
            >
                {value}
            </span>
            <button
                type="button"
                onClick={onIncrement}
                disabled={value >= max}
                className="p-2 w-10 h-10 flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-2xl leading-none"
                aria-label={`زيادة ${ariaLabel}`}
            >
                +
            </button>
        </div>
    );
};

export default QuantityInputControl;