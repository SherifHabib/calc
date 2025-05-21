import React from 'react';

const ProgressTracker = ({ currentStepId, stepsConfig }) => {
    const currentStepIndex = stepsConfig.findIndex(step => step.id === currentStepId);

    return (
        <nav aria-label="Progress" className="mb-8 py-4">
            <ol role="list" className="flex items-center justify-around space-x-2 rtl:space-x-reverse sm:space-x-4">
                {stepsConfig.map((step, stepIdx) => (
                    <li key={step.name} className={`flex-1 ${stepIdx > 0 ? 'hidden sm:block' : ''}`}>
                        {stepIdx <= currentStepIndex ? (
                            <div className={`group flex w-full flex-col border-l-4 rtl:border-r-4 rtl:border-l-0 ${stepIdx === currentStepIndex ? 'border-sky-600' : 'border-green-600'}  py-2 pl-3 rtl:pr-3 rtl:pl-0 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-3`}>
                                <span className={`text-xs sm:text-sm font-medium ${stepIdx === currentStepIndex ? 'text-sky-500' : 'text-green-500'} transition-colors`}>
                                    {`خطوة ${step.id}`}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-slate-100">{step.name}</span>
                            </div>
                        ) : (
                            <div className="group flex w-full flex-col border-l-4 rtl:border-r-4 rtl:border-l-0 border-slate-700 py-2 pl-3 rtl:pr-3 rtl:pl-0 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-3">
                                <span className="text-xs sm:text-sm font-medium text-slate-500 transition-colors">
                                    {`خطوة ${step.id}`}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-slate-400">{step.name}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default ProgressTracker;