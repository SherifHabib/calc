import React, { useState, useEffect } from 'react';
import QuantityInputControl from './QuantityInputControl';
import { quickAddMappings } from '../data/quickAddMappingsData'; // استيراد البيانات

const QuickAddModal = ({ isOpen, onClose, onSubmit, roomName, roomType, allDevicesMap }) => {
    const initialFormState = {
        numWindows: 0, numDoors: 0, numLightPoints: 0, numOutlets: 0,
        numMajorAppliances: 0, numSmallAppliances: 0, numTVs: 0,
        hasSplitAC: false, hasCentralAC: false, hasRadiator: false, needAirPurifier: false,
        hasGasStove: false,
        hasExhaustFan: false,
        needSmartLockForMainDoor: false, needVideoDoorbell: false,
        gardenNeedsIrrigation: false, gardenNeedsLighting: 0, gardenNeedsSecurityCam: false,
        curtainType: 'none',
        lightingPreference: 'neutral',
        needsZigbeeHub: false,
    };
    const [inputs, setInputs] = useState(initialFormState);
    const [modalStep, setModalStep] = useState('input');
    const [previewItems, setPreviewItems] = useState([]);


    useEffect(() => {
        if (isOpen) {
            setInputs(initialFormState);
            setModalStep('input');
            setPreviewItems([]);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value),
        }));
    };
    const handleToggleChange = (name) => {
        setInputs(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const calculatePreview = () => {
        const items = [];
        let zigbeeDeviceCount = 0;

        Object.keys(inputs).forEach(inputKey => {
            const inputValue = inputs[inputKey];
            const mappingsForKey = quickAddMappings[inputKey];

            if (mappingsForKey && ((typeof inputValue === 'number' && inputValue > 0) || (typeof inputValue === 'boolean' && inputValue) || (typeof inputValue === 'string' && inputValue !== 'none'))) {
                mappingsForKey.forEach(mapping => {
                    const deviceDetails = allDevicesMap[mapping.deviceId];
                    if (deviceDetails && (!mapping.roomTypes || mapping.roomTypes.includes(roomType))) {
                        let quantityToAdd = 0;
                        if (mapping.fixedQuantity) {
                            quantityToAdd = mapping.fixedQuantity(inputValue);
                        } else if (typeof inputValue === 'boolean' && inputValue) {
                            quantityToAdd = mapping.quantityPerItem;
                        } else if (typeof inputValue === 'number') {
                            quantityToAdd = inputValue * mapping.quantityPerItem;
                        } else if (typeof inputValue === 'string' && inputValue !== 'none' && inputKey === 'curtainType' && mapping.deviceId === 'sc3') {
                            quantityToAdd = (inputs.numWindows || 0) * mapping.quantityPerItem;
                        }

                        if (quantityToAdd > 0 && (!mapping.condition || mapping.condition(inputValue))) {
                            items.push({ name: deviceDetails.name, quantity: quantityToAdd, price: deviceDetails.price });
                            if (deviceDetails.protocol === "Zigbee") {
                                zigbeeDeviceCount += quantityToAdd;
                            }
                        }
                    }
                });
            }
        });
        if (inputs.needsZigbeeHub && zigbeeDeviceCount > 0 && allDevicesMap['zigbee_hub']) {
            items.push({ name: allDevicesMap['zigbee_hub'].name, quantity: 1, price: allDevicesMap['zigbee_hub'].price });
        }
        setPreviewItems(items);
        setModalStep('preview');
    };


    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (modalStep === 'input') {
            calculatePreview();
        } else {
            onSubmit(inputs);
        }
    };

    if (!isOpen) return null;

    const commonQuestions = [
        { name: 'numWindows', label: 'عدد النوافذ', type: 'number', min: 0 },
        { name: 'numDoors', label: 'عدد الأبواب الداخلية', type: 'number', min: 0 },
        { name: 'numLightPoints', label: 'عدد نقاط الإضاءة الرئيسية', type: 'number', min: 0 },
        { name: 'numOutlets', label: 'عدد المقابس لتحويلها لذكية', type: 'number', min: 0 },
        { name: 'numSmallAppliances', label: 'عدد الأجهزة الصغيرة (مروحة، أبجورة..)', type: 'number', min: 0 },
        { name: 'hasSplitAC', label: 'هل يوجد تكييف سبليت؟', type: 'toggle' },
        { name: 'needAirPurifier', label: 'هل تحتاج منقي هواء؟', type: 'toggle' },
        { name: 'lightingPreference', label: 'تفضيل الإضاءة', type: 'select', options: [{value: 'neutral', label: 'محايدة'},{value: 'warm', label: 'دافئة'}, {value: 'cool', label: 'باردة'}] },
    ];
    const roomSpecificQuestionsConfig = {
        reception: [
            { name: 'numTVs', label: 'عدد التلفزيونات/شاشات العرض', type: 'number', min: 0 },
            { name: 'hasCentralAC', label: 'هل يوجد تكييف مركزي؟', type: 'toggle' },
            { name: 'hasRadiator', label: 'هل يوجد تدفئة رادياتير؟', type: 'toggle' },
            { name: 'curtainType', label: 'نوع الستائر', type: 'select', options: [{value: 'none', label: 'لا يوجد / لا أريد تحكم ذكي'}, {value: 'curtain', label: 'ستائر قماشية'}, {value: 'roller', label: 'ستائر رول/معدنية'}] },
        ],
        living: [
            { name: 'numTVs', label: 'عدد التلفزيونات', type: 'number', min: 0 },
            { name: 'curtainType', label: 'نوع الستائر', type: 'select', options: [{value: 'none', label: 'لا يوجد / لا أريد تحكم ذكي'}, {value: 'curtain', label: 'ستائر قماشية'}, {value: 'roller', label: 'ستائر رول/معدنية'}] },
        ],
        kitchen: [
            { name: 'numMajorAppliances', label: 'عدد الأجهزة الكبيرة (ثلاجة، فرن..)', type: 'number', min: 0 },
            { name: 'hasGasStove', label: 'هل يوجد موقد غاز؟', type: 'toggle' },
            { name: 'hasExhaustFan', label: 'هل توجد مروحة شفط بالمطبخ؟', type: 'toggle' },
        ],
        bedroom: [
            { name: 'numTVs', label: 'عدد التلفزيونات (إن وجد)', type: 'number', min: 0 },
            { name: 'curtainType', label: 'نوع الستائر', type: 'select', options: [{value: 'none', label: 'لا يوجد / لا أريد تحكم ذكي'}, {value: 'curtain', label: 'ستائر قماشية'}, {value: 'roller', label: 'ستائر رول/معدنية'}] },
        ],
        bathroom: [
            { name: 'hasExhaustFan', label: 'هل توجد مروحة شفط بالحمام؟', type: 'toggle' },
        ],
        entrance: [
            { name: 'needSmartLockForMainDoor', label: 'هل تريد قفل باب ذكي للباب الرئيسي؟', type: 'toggle' },
            { name: 'needVideoDoorbell', label: 'هل تريد جرس باب ذكي بالفيديو؟', type: 'toggle' },
        ],
        garden: [
            { name: 'gardenNeedsIrrigation', label: 'هل تحتاج نظام ري ذكي للحديقة؟', type: 'toggle' },
            { name: 'gardenNeedsLighting', label: 'عدد وحدات الإضاءة الخارجية المطلوبة', type: 'number', min: 0 },
            { name: 'gardenNeedsSecurityCam', label: 'هل تحتاج كاميرا مراقبة للحديقة؟', type: 'toggle' },
        ]
    };

    const questionsToShow = [...commonQuestions, ...(roomSpecificQuestionsConfig[roomType] || [])];
    if (roomType !== 'garden') {
        questionsToShow.push({ name: 'needsZigbeeHub', label: 'هل تفضل استخدام أجهزة Zigbee (تحتاج موزع)؟', type: 'toggle', tooltip: 'أجهزة Zigbee تستهلك طاقة أقل وقد تكون شبكتها أكثر استقراراً وتوسعاً.' });
    }


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <form onSubmit={handleSubmitForm} className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-sky-400 mb-6 text-center">
                    {modalStep === 'input' ? `إضافة سريعة للأجهزة في ${roomName}` : `ملخص الاقتراحات لـ ${roomName}`}
                </h2>

                {modalStep === 'input' && (
                    <div className="space-y-5">
                        {questionsToShow.map(field => (
                            <div key={field.name} className="flex flex-col sm:flex-row items-center justify-between">
                                <label htmlFor={field.name} className="text-slate-200 mb-1 sm:mb-0 sm:w-2/3 flex items-center">
                                    {field.label}:
                                    {field.tooltip && (
                                        <span className="ml-2 rtl:mr-2 text-xs text-slate-400 cursor-help group relative">
                                            (؟)
                                            <span className="absolute bottom-full left-0 rtl:right-0 mb-2 w-48 p-2 bg-slate-900 text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                                                {field.tooltip}
                                            </span>
                                        </span>
                                    )}
                                </label>
                                {field.type === 'number' ? (
                                    <QuantityInputControl
                                        value={inputs[field.name]}
                                        min={field.min !== undefined ? field.min : 0}
                                        max={100}
                                        onIncrement={() => setInputs(prev => ({...prev, [field.name]: Math.min(100, (prev[field.name] || 0) + 1)}))}
                                        onDecrement={() => setInputs(prev => ({...prev, [field.name]: Math.max(field.min !== undefined ? field.min : 0, (prev[field.name] || 0) - 1)}))}
                                        ariaLabel={field.label}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        name={field.name}
                                        value={inputs[field.name]}
                                        onChange={handleChange}
                                        className="w-full sm:w-1/3 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500"
                                    >
                                        {field.options.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                ) : ( // type 'toggle'
                                    <button
                                        type="button"
                                        id={field.name}
                                        name={field.name}
                                        onClick={() => handleToggleChange(field.name)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500
                                                        ${inputs[field.name] ? 'bg-green-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out
                                                            ${inputs[field.name] ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`}/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {modalStep === 'preview' && (
                    <div className="space-y-3 text-slate-200">
                        <h3 className="text-lg font-medium text-sky-300 mb-3">الأجهزة المقترحة:</h3>
                        {previewItems.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 max-h-60 overflow-y-auto pr-4 rtl:pl-4">
                                {previewItems.map((item, index) => (
                                    <li key={index}>
                                        {item.name}: {item.quantity} {item.quantity === 1 || (item.quantity % 10 === 1 && item.quantity !== 11) ? "قطعة" : (item.quantity === 2 || (item.quantity % 10 === 2 && item.quantity !== 12)) ? "قطعتان" : (item.quantity >=3 && item.quantity <=10) ? "قطع" : "قطعة"}
                                        (التكلفة: {(item.quantity * item.price).toLocaleString('ar-EG')} ج.م)
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-400">لا توجد اقتراحات بناءً على المدخلات الحالية.</p>
                        )}
                        <p className="mt-4 pt-3 border-t border-slate-700 text-sm text-slate-400">
                            ملاحظة: هذه مجرد اقتراحات. يمكنك تعديل الكميات أو إضافة/إزالة أجهزة أخرى يدويًا بعد ذلك.
                        </p>
                    </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse">
                    <button
                        type="button"
                        onClick={modalStep === 'preview' ? () => setModalStep('input') : onClose}
                        className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md"
                    >
                        {modalStep === 'preview' ? 'تعديل المدخلات' : 'إلغاء'}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md"
                    >
                        {modalStep === 'input' ? 'عرض الاقتراحات' : 'تأكيد وإضافة الأجهزة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuickAddModal;