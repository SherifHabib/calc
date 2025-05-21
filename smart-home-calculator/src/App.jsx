// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';

// استيراد البيانات
import { masterRoomList } from './data/masterRoomData';
import { unitTypesConfig } from './data/unitTypesConfigData';
import { quickAddMappings } from './data/quickAddMappingsData';

// استيراد المكونات الفرعية
import ProgressTracker from './components/ProgressTracker';
import UnitSelectionScreen from './components/UnitSelectionScreen';
import RoomQuantityScreen from './components/RoomQuantityScreen';
import QuickAddModal from './components/QuickAddModal';
import FloorPlan from './components/FloorPlan';
import QuantityInputControl from './components/QuantityInputControl'; // تم استيراده لأنه يُستخدم داخل JSX الخاص بـ App -> roomConfiguration

// استيراد مكتبات PDF
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // يقوم بتوسيع كائن jsPDF


// --- الخط العربي لـ PDF ---
// ستحتاج إلى استبدال هذا بسلسلة Base64 الفعلية لخط Amiri-Regular.ttf
const amiriFontBase64 = "BASE64_ENCODED_AMIRI_FONT_TTF_HERE"; // placeholder


const App = () => {
  const [currentStep, setCurrentStep] = useState('unitSelection');
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [userRoomCounts, setUserRoomCounts] = useState({});
  const [unitArea, setUnitArea] = useState('');
  const [includeGarden, setIncludeGarden] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [openCategories, setOpenCategories] = useState({});
  const [allDevicesMap, setAllDevicesMap] = useState({});

  const appSteps = [
    { id: '1', name: 'اختيار الوحدة' , key: 'unitSelection' },
    { id: '2', name: 'تفاصيل الوحدة', key: 'roomQuantitySelection' },
    { id: '3', name: 'مخطط المنزل', key: 'floorPlan' },
    { id: '4', name: 'تجهيز الغرفة', key: 'roomConfiguration' }
  ];

  useEffect(() => {
    // هذا الكود الأصلي للتأكد من تحميل jsPDF قبل إضافة الخطوط
    // مع استيراد npm، يكون jsPDF متاحًا مباشرة.
    // ولكن `window.jspdf` قد لا يكون معرفًا.
    // سنقوم بتسجيل الخط مباشرة على الكائن المستورد.
    if (amiriFontBase64 !== "BASE64_ENCODED_AMIRI_FONT_TTF_HERE" && amiriFontBase64 !== "") {
        try {
            // طريقة تسجيل الخطوط في jsPDF عند استخدام imports
            // التأكد من أن هذا يتم مرة واحدة
            // قد تحتاج إلى وضع هذا في مكان يتم استدعاؤه مرة واحدة فقط عند بدء التطبيق
            // أو يتم استدعاؤه داخل handleDownloadPdf قبل إنشاء `doc`
            // الطريقة التي استخدمتها في الكود الأصلي مع events.push قد لا تعمل دائماً مع npm imports.
            // الأضمن هو إضافته مباشرة لكائن الـ doc، أو التأكد من تسجيله بشكل عام.
             console.log("Amiri font base64 is available, PDF generation can use it.");
        } catch (e) {
            console.error("Error during jsPDF font registration in useEffect:", e);
        }
    } else {
        console.warn("Amiri font base64 string is a placeholder or empty. Arabic PDF text might not render correctly.");
    }
  }, []);


  useEffect(() => {
    const map = {};
    masterRoomList.forEach(roomTemplate => {
      if (roomTemplate.categories) {
        roomTemplate.categories.forEach(category => {
          category.devices.forEach(device => {
            if (!map[device.id]) {
              map[device.id] = device;
            }
          });
        });
      } else if (roomTemplate.id && typeof roomTemplate.price === 'number') {
        if(!map[roomTemplate.id]){
            map[roomTemplate.id] = roomTemplate;
        }
      }
    });
    setAllDevicesMap(map);
  }, []);

  const activeRooms = useMemo(() => {
    if (!selectedUnitId || (currentStep !== 'floorPlan' && currentStep !== 'roomConfiguration')) return [];

    const unitConfig = unitTypesConfig[selectedUnitId];
    if (!unitConfig) return [];

    const generatedRooms = [];

    unitConfig.fixedRooms?.forEach(fixedRoomInfo => {
        const roomTemplate = masterRoomList.find(r => r.id === fixedRoomInfo.id);
        if (roomTemplate) {
            for (let i = 1; i <= fixedRoomInfo.count; i++) {
                generatedRooms.push({
                    ...JSON.parse(JSON.stringify(roomTemplate)),
                    id: `${roomTemplate.id}_fixed_${i}`,
                    name: fixedRoomInfo.count > 1 ? `${roomTemplate.name} ${i}` : roomTemplate.name,
                    roomType: roomTemplate.roomType || fixedRoomInfo.id.replace('_template', '')
                });
            }
        }
    });

    unitConfig.countableRooms?.forEach(countableRoomInfo => {
        const count = userRoomCounts[countableRoomInfo.id] || countableRoomInfo.defaultCount;
        const roomTemplate = masterRoomList.find(r => r.id === countableRoomInfo.id);
        if (roomTemplate) {
            for (let i = 1; i <= count; i++) {
                generatedRooms.push({
                    ...JSON.parse(JSON.stringify(roomTemplate)),
                    id: `${roomTemplate.id}_${i}`,
                    name: `${roomTemplate.name} ${i}`,
                    roomType: roomTemplate.roomType || countableRoomInfo.id.replace('_template', '')
                });
            }
        }
    });

    if (unitConfig.hasGardenOption && includeGarden && unitConfig.gardenRoomId) {
        const gardenTemplate = masterRoomList.find(r => r.id === unitConfig.gardenRoomId);
        if (gardenTemplate) {
            generatedRooms.push({
                ...JSON.parse(JSON.stringify(gardenTemplate)),
                id: gardenTemplate.id,
                name: gardenTemplate.name,
                roomType: gardenTemplate.roomType || unitConfig.gardenRoomId.replace('_template', '')
            });
        }
    }
    return generatedRooms;
  }, [selectedUnitId, includeGarden, userRoomCounts, currentStep]);

  const roomDeviceStats = useMemo(() => {
    const statsOutput = {};
    activeRooms.forEach(room => {
        let roomItemCount = 0;
        let roomTotalCost = 0;
        const roomQuantities = quantities[room.id] || {};

        for (const deviceId in roomQuantities) {
            const quantity = roomQuantities[deviceId] || 0;
            if (quantity > 0) {
                roomItemCount += quantity;
                const deviceDetails = allDevicesMap[deviceId];
                if (deviceDetails) {
                    roomTotalCost += quantity * deviceDetails.price;
                }
            }
        }
        statsOutput[room.id] = { count: roomItemCount, cost: roomTotalCost };
    });
    return statsOutput;
  }, [quantities, activeRooms, allDevicesMap]);


  useEffect(() => {
    let currentTotal = 0;
    for (const uniqueRoomInstanceId in quantities) {
        const roomInstanceQuantities = quantities[uniqueRoomInstanceId];
        for (const deviceId in roomInstanceQuantities) {
            if (allDevicesMap[deviceId] && roomInstanceQuantities[deviceId] > 0) {
                currentTotal += roomInstanceQuantities[deviceId] * allDevicesMap[deviceId].price;
            }
        }
    }
    setTotalCost(currentTotal);
  }, [quantities, allDevicesMap]);

  useEffect(() => {
    if (selectedRoomId) {
        const currentRoomDataFromActive = activeRooms.find(room => room.id === selectedRoomId);
        if (currentRoomDataFromActive && currentRoomDataFromActive.categories) {
            const initialOpenState = {};
            currentRoomDataFromActive.categories.forEach(category => {
                initialOpenState[category.id] = false;
            });
            setOpenCategories(initialOpenState);
        } else {
            setOpenCategories({});
        }
    } else {
        setOpenCategories({});
    }
  }, [selectedRoomId, activeRooms]);

  const handleQuantityChange = (deviceId, quantity) => {
    if (!selectedRoomId) return;

    setQuantities(prevQuantities => {
        const currentRoomInstanceQuantities = prevQuantities[selectedRoomId] || {};
        const newRoomInstanceQuantities = {
            ...currentRoomInstanceQuantities,
            [deviceId]: Math.max(0, parseInt(quantity) || 0),
        };
        return {
            ...prevQuantities,
            [selectedRoomId]: newRoomInstanceQuantities,
        };
    });
  };

  const toggleCategory = (categoryId) => {
    setOpenCategories(prevOpen => ({
        ...prevOpen,
        [categoryId]: !prevOpen[categoryId],
    }));
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(prevRoomId => (prevRoomId === roomId ? null : roomId));
    if (selectedRoomId !== roomId) {
        setCurrentStep('roomConfiguration');
    } else if (selectedRoomId === roomId) {
        setCurrentStep('floorPlan');
    }
  };

  const handleUnitSelect = (unitId) => {
    setSelectedUnitId(unitId);
    setIncludeGarden(false);
    setSelectedRoomId(null);
    setQuantities({});
    setUserRoomCounts({});
    setUnitArea('');
    const selectedUnitConfig = unitTypesConfig[unitId];
    if (selectedUnitConfig?.countableRooms?.length > 0 || selectedUnitConfig?.hasGardenOption) {
        setCurrentStep('roomQuantitySelection');
    } else {
        setCurrentStep('floorPlan');
    }
  };

  const handleConfirmRoomQuantities = (counts, area) => {
    setUserRoomCounts(counts);
    setUnitArea(area);
    setCurrentStep('floorPlan');
  };

  const handleGardenToggle = () => {
    if (selectedUnitId && unitTypesConfig[selectedUnitId]?.hasGardenOption) {
        setIncludeGarden(prev => !prev);
        setSelectedRoomId(null);
    }
  };

  const handleBackToFloorPlan = () => {
    setSelectedRoomId(null);
    setCurrentStep('floorPlan');
  };

  const handleChangeUnitType = () => {
    setSelectedUnitId(null);
    setSelectedRoomId(null);
    setQuantities({});
    setIncludeGarden(false);
    setUserRoomCounts({});
    setUnitArea('');
    setCurrentStep('unitSelection');
  };

  const handleBackToUnitSelection = () => {
    setSelectedUnitId(null);
    setUnitArea('');
    setCurrentStep('unitSelection');
  };

  const handleResetCalculator = () => {
    setQuantities({});
    setSelectedRoomId(null);
    setSelectedUnitId(null);
    setIncludeGarden(false);
    setUserRoomCounts({});
    setUnitArea('');
    setCurrentStep('unitSelection');
  };

  const openQuickAddModal = () => {
    if (selectedRoomId) {
        setIsQuickAddModalOpen(true);
    }
  };
  const closeQuickAddModal = () => setIsQuickAddModalOpen(false);

  const handleSubmitQuickAdd = (quickAddInputs) => {
    if (!selectedRoomId || !allDevicesMap || !currentRoomData) return;

    let roomQuantitiesToUpdate = { ...(quantities[selectedRoomId] || {}) };
    const currentRoomType = currentRoomData.roomType;
    let zigbeeDeviceCountInQuickAdd = 0;

    Object.keys(quickAddInputs).forEach(inputKey => {
        const inputValue = quickAddInputs[inputKey];
        const mappingsForKey = quickAddMappings[inputKey];

        if (mappingsForKey && ((typeof inputValue === 'number' && inputValue > 0) || (typeof inputValue === 'boolean' && inputValue) || (typeof inputValue === 'string' && inputValue !== 'none'))) {
            mappingsForKey.forEach(mapping => {
                const deviceDetails = allDevicesMap[mapping.deviceId];
                if (deviceDetails && (!mapping.roomTypes || mapping.roomTypes.includes(currentRoomType))) {
                    if (mapping.deviceId === 'sc3' && quickAddInputs.curtainType === 'none') {
                        return;
                    }

                    const currentQty = roomQuantitiesToUpdate[mapping.deviceId] || 0;
                    let quantityToAdd = 0;

                    if (mapping.fixedQuantity) {
                        quantityToAdd = mapping.fixedQuantity(inputValue);
                    } else if (typeof inputValue === 'boolean' && inputValue) {
                        quantityToAdd = mapping.quantityPerItem;
                    } else if (typeof inputValue === 'number') {
                        quantityToAdd = inputValue * mapping.quantityPerItem;
                    } else if (typeof inputValue === 'string' && inputValue !== 'none' && inputKey === 'curtainType' && mapping.deviceId === 'sc3') {
                        quantityToAdd = (quickAddInputs.numWindows || 0) * mapping.quantityPerItem;
                    }

                    if (quantityToAdd > 0 && (!mapping.condition || mapping.condition(inputValue))) {
                        roomQuantitiesToUpdate[mapping.deviceId] = currentQty + quantityToAdd;
                        if (deviceDetails.protocol === "Zigbee" && quantityToAdd > 0) {
                            zigbeeDeviceCountInQuickAdd += quantityToAdd;
                        }
                    }
                }
            });
        }
    });

    if (quickAddInputs.needsZigbeeHub && zigbeeDeviceCountInQuickAdd > 0 && allDevicesMap['zigbee_hub']) {
        const currentHubQty = roomQuantitiesToUpdate['zigbee_hub'] || 0;
        if (currentHubQty === 0) {
            roomQuantitiesToUpdate['zigbee_hub'] = 1;
        }
    }


    setQuantities(prevQuantities => ({
        ...prevQuantities,
        [selectedRoomId]: roomQuantitiesToUpdate,
    }));
    closeQuickAddModal();
  };

  const handleDownloadPdf = () => {
    // استخدم jsPDF المستوردة مباشرة
    const doc = new jsPDF();

    if (typeof doc.autoTable === 'undefined') {
        console.error("jsPDF-AutoTable plugin is not loaded!");
        alert("عفواً، إضافة الجداول (jspdf-autotable) غير محملة.");
        return;
    }
    
    // التأكد من أن الخط مسجل قبل استخدامه
    if (amiriFontBase64 && amiriFontBase64 !== "BASE64_ENCODED_AMIRI_FONT_TTF_HERE" && amiriFontBase64 !== "") {
        try {
            doc.addFileToVFS('Amiri-Regular.ttf', amiriFontBase64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            console.log("Amiri font added to doc instance for PDF generation.");
        } catch (fontError) {
            console.error("Error adding Amiri font directly to doc instance:", fontError);
            alert("حدث خطأ أثناء محاولة إضافة الخط العربي للـ PDF. قد لا تظهر النصوص العربية بشكل صحيح.");
        }
    } else {
        console.warn("Amiri font base64 string is a placeholder or empty. PDF Arabic text might not render correctly.");
        // يمكنك هنا إضافة تنبيه للمستخدم أو استخدام خط احتياطي إذا أردت
    }

    doc.setFont('Amiri', 'normal'); // *** تفعيل الخط العربي ***

    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    doc.setLanguage("ar");
    doc.setFont('Amiri', 'normal'); // تأكيد الخط
    doc.setFontSize(18);
    doc.text("تقرير تكلفة تجهيز المنزل الذكي", pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-EG')}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    if (selectedUnitId && unitTypesConfig[selectedUnitId]) {
        doc.setFont('Amiri', 'normal'); // Ensure font for this section
        doc.setFontSize(14);
        doc.text(`تفاصيل الوحدة: ${unitTypesConfig[selectedUnitId].name}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 7;
        doc.setFontSize(10);
        if (unitArea) {
            doc.text(`المساحة الإجمالية: ${unitArea} متر مربع`, pageWidth - margin, yPos, { align: 'right' });
            yPos += 5;
        }
        if (unitTypesConfig[selectedUnitId].hasGardenOption) {
            doc.text(`خيار الحديقة: ${includeGarden ? 'نعم' : 'لا'}`, pageWidth - margin, yPos, { align: 'right' });
            yPos += 5;
        }

        unitTypesConfig[selectedUnitId].countableRooms.forEach(roomInfo => {
            const count = userRoomCounts[roomInfo.id] || roomInfo.defaultCount;
            if (count > 0) {
                doc.text(`عدد ${roomInfo.name}: ${count}`, pageWidth - margin, yPos, { align: 'right' });
                yPos += 5;
            }
        });
        yPos += 5;
    }

    activeRooms.forEach(room => {
        const roomStats = roomDeviceStats[room.id] || { count: 0, cost: 0 };
        if (roomStats.count > 0) {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 20;
                doc.setFont('Amiri', 'normal'); // Re-apply font on new page
            }
            doc.setFontSize(12);
            doc.text(`غرفة: ${room.name}`, pageWidth - margin, yPos, { align: 'right' });
            yPos += 7;

            const roomQuantitiesData = quantities[room.id] || {};
            const tableData = [];
            Object.keys(roomQuantitiesData).forEach(deviceId => {
                const quantityValue = roomQuantitiesData[deviceId];
                if (quantityValue > 0 && allDevicesMap[deviceId]) {
                    const device = allDevicesMap[deviceId];
                    tableData.push([
                        (quantityValue * device.price).toLocaleString('ar-EG'),
                        device.price.toLocaleString('ar-EG'),
                        String(quantityValue),
                        device.name,
                    ]);
                }
            });

            if (tableData.length > 0) {
                doc.autoTable({
                    startY: yPos,
                    head: [['الإجمالي', 'سعر الوحدة', 'الكمية', 'اسم الجهاز']],
                    body: tableData,
                    theme: 'grid',
                    styles: { font: "Amiri", halign: 'center', cellPadding: 2, fontSize: 8 },
                    headStyles: { font: "Amiri", fillColor: [22, 160, 133], halign: 'center', fontStyle: 'bold' },
                    columnStyles: {
                        0: { halign: 'center' }, // الإجمالي
                        1: { halign: 'center' }, // سعر الوحدة
                        2: { halign: 'center' }, // الكمية
                        3: { halign: 'right' }  // اسم الجهاز
                    },
                    didDrawPage: (data) => { yPos = data.cursor.y + 5; } // Update yPos after table draws
                });
                yPos = doc.autoTable.previous.finalY + 10; // Correct way to get yPos after autoTable
            }
            doc.setFont('Amiri', 'normal'); // Ensure font for this text
            doc.setFontSize(10);
            doc.text(`إجمالي تكلفة الغرفة: ${roomStats.cost.toLocaleString('ar-EG')} ج.م`, margin, yPos, { align: 'left' });
            yPos += 10;
        }
    });

    if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        doc.setFont('Amiri', 'normal'); // Re-apply font on new page
    }
    doc.setFontSize(14);
    doc.text("التكلفة الإجمالية التقديرية لجميع الأجهزة:", pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text(`${totalCost.toLocaleString('ar-EG')} ج.م`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    doc.setTextColor(100); // Reset text color

    doc.setFontSize(8);
    doc.text("* هذه التكلفة هي تقديرية وقد تختلف بناءً على العروض الحالية وتكاليف التركيب الإضافية (إذا وجدت).", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`تقرير_تكلفة_المنزل_الذكي_${new Date().toISOString().slice(0,10)}.pdf`);
  };


  const currentRoomData = selectedRoomId ? activeRooms.find(room => room.id === selectedRoomId) : null;
  const currentRoomCost = selectedRoomId && roomDeviceStats[selectedRoomId] ? roomDeviceStats[selectedRoomId].cost : 0;
  const currentRoomItemCount = selectedRoomId && roomDeviceStats[selectedRoomId] ? roomDeviceStats[selectedRoomId].count : 0;

  const shouldShowGlobalActions = Object.values(quantities).some(roomQs => Object.values(roomQs).some(q => q > 0));

  const getCurrentStepIdForTracker = () => {
    if (currentStep === 'unitSelection') return '1';
    if (currentStep === 'roomQuantitySelection') return '2';
    if (currentStep === 'floorPlan') return '3';
    if (currentStep === 'roomConfiguration') return '4';
    return '1'; // Default
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8 font-sans" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <ProgressTracker currentStepId={getCurrentStepIdForTracker()} stepsConfig={appSteps} />
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-2">
            آلة حاسبة لتكلفة المنزل الذكي
          </h1>
          <p className="text-lg text-slate-300">
            {currentStep === 'unitSelection' && 'اختر نوع وحدتك لتبدأ.'}
            {currentStep === 'roomQuantitySelection' && selectedUnitId && `حدد تفاصيل ${unitTypesConfig[selectedUnitId]?.name || 'الوحدة'}.`}
            {currentStep === 'floorPlan' && (selectedUnitId && !selectedRoomId) && `اختر غرفة من مخطط ${unitTypesConfig[selectedUnitId]?.name || 'الوحدة'}.`}
            {currentStep === 'roomConfiguration' && currentRoomData && `أنت تقوم بتجهيز: ${currentRoomData.name}.`}
          </p>
        </header>

        {currentStep === 'unitSelection' && (
          <UnitSelectionScreen onSelectUnit={handleUnitSelect} unitTypesConfig={unitTypesConfig} />
        )}

        {currentStep === 'roomQuantitySelection' && selectedUnitId && unitTypesConfig[selectedUnitId] && (
            <RoomQuantityScreen
                unitConfig={unitTypesConfig[selectedUnitId]}
                onConfirmQuantities={handleConfirmRoomQuantities}
                onBack={handleBackToUnitSelection}
                initialUnitArea={unitArea}
                onUnitAreaChange={setUnitArea}
            />
        )}


        {currentStep === 'floorPlan' && selectedUnitId && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold text-sky-300 text-center sm:text-right">
                    مخطط {unitTypesConfig[selectedUnitId]?.name || 'الوحدة'}
                    {unitArea && <span className="text-lg text-slate-400"> (مساحة: {unitArea} م²)</span>}
                </h2>
                <div className="flex gap-2 flex-wrap justify-center">
                    <button
                        onClick={() => setCurrentStep('roomQuantitySelection')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-sm"
                    >
                        تعديل عدد الغرف/المساحة
                    </button>
                    <button
                        onClick={handleChangeUnitType}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-sm"
                    >
                        تغيير نوع الوحدة
                    </button>
                </div>
            </div>

            {unitTypesConfig[selectedUnitId]?.hasGardenOption && (
              <div className="mb-6 p-4 bg-slate-700/30 rounded-lg flex items-center justify-center space-x-3 rtl:space-x-reverse">
                <label htmlFor="gardenToggle" className="text-slate-200 font-medium">هل تتضمن الوحدة حديقة؟</label>
                <button
                  id="gardenToggle"
                  onClick={handleGardenToggle}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500
                                    ${includeGarden ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out
                                        ${includeGarden ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`}/>
                </button>
              </div>
            )}
            <FloorPlan
                rooms={activeRooms}
                onRoomSelect={handleSelectRoom}
                selectedRoomId={selectedRoomId}
                roomDeviceStats={roomDeviceStats}
            />
            {shouldShowGlobalActions && (
                <div className="mt-12 text-center">
                    <button
                        onClick={handleResetCalculator}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        إعادة تعيين كل شيء والبدء من جديد
                    </button>
                </div>
            )}
          </div>
        )}

        {currentStep === 'roomConfiguration' && currentRoomData && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <button
                    onClick={handleBackToFloorPlan}
                    className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    العودة إلى مخطط {unitTypesConfig[selectedUnitId]?.name || 'الوحدة'}
                </button>
                <button
                    onClick={openQuickAddModal}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                    <svg className="w-5 h-5 inline-block ml-2 rtl:mr-2 rtl:ml-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                    إضافة سريعة للأجهزة
                </button>
            </div>


            {currentRoomItemCount > 0 && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600 shadow-lg">
                    <h3 className="text-xl font-semibold text-sky-300 mb-2">ملخص تكلفة {currentRoomData.name}:</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-200">إجمالي عناصر الغرفة: {currentRoomItemCount}</span>
                        <span className="text-2xl font-bold text-amber-400">{currentRoomCost.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                </div>
            )}

            <div className="space-y-6">
              {currentRoomData.categories && currentRoomData.categories.map((category) => (
                <div key={category.id} className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden border border-slate-700">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex justify-between items-center p-5 sm:p-6 bg-slate-700 hover:bg-slate-600 transition-colors duration-200 focus:outline-none"
                  >
                    <h2 className="text-xl font-semibold text-sky-400">{category.name}</h2>
                    <svg
                      className={`w-6 h-6 text-sky-400 transform transition-transform duration-300 ${openCategories[category.id] ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openCategories[category.id] && (
                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentRoomData.categories.find(c => c.id === category.id)?.devices.map((device) => (
                        <div key={device.id} className="bg-slate-700/50 p-5 rounded-lg shadow-lg border border-slate-600 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse">
                          <img
                            src={device.image}
                            alt={device.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border-2 border-slate-500"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/7F1D1D/FFFFFF?text=خطأ+في+الصورة"; }}
                          />
                          <div className="flex-grow text-center sm:text-right rtl:sm:text-left">
                            <h3 className="text-md sm:text-lg font-medium text-slate-100">{device.name}</h3>
                            <p className="text-sky-400 text-sm sm:text-md font-semibold">
                              {allDevicesMap[device.id]?.price.toLocaleString('ar-EG') || 'N/A'} ج.م / {allDevicesMap[device.id]?.unit || ''}
                            </p>
                          </div>
                            <QuantityInputControl
                                value={(quantities[selectedRoomId] && quantities[selectedRoomId][device.id]) || 0}
                                min={0}
                                max={99}
                                onIncrement={() => handleQuantityChange(device.id, ((quantities[selectedRoomId] && quantities[selectedRoomId][device.id]) || 0) + 1)}
                                onDecrement={() => handleQuantityChange(device.id, ((quantities[selectedRoomId] && quantities[selectedRoomId][device.id]) || 0) - 1)}
                                ariaLabel={`كمية ${device.name}`}
                            />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <QuickAddModal
            isOpen={isQuickAddModalOpen}
            onClose={closeQuickAddModal}
            onSubmit={handleSubmitQuickAdd}
            roomName={currentRoomData?.name || ''}
            roomType={currentRoomData?.roomType || ''}
            allDevicesMap={allDevicesMap}
        />

        {(currentStep === 'floorPlan' || currentStep === 'roomConfiguration') && (shouldShowGlobalActions || currentRoomData) && (
            <div className="mt-10 p-6 bg-slate-800 shadow-2xl rounded-xl border border-slate-700 sticky bottom-4 sm:static z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-sky-400 mb-1 sm:mb-0">التكلفة الإجمالية التقديرية:</h2>
                        <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                        {totalCost.toLocaleString('ar-EG')} ج.م
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                        {shouldShowGlobalActions && (
                            <button
                                onClick={handleDownloadPdf}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"></path></svg>
                                تحميل التقرير (PDF)
                            </button>
                        )}
                        {shouldShowGlobalActions && (
                            <button
                                onClick={handleResetCalculator}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            >
                                إعادة تعيين كل شيء
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    * هذه التكلفة هي تقديرية وقد تختلف بناءً على العروض الحالية وتكاليف التركيب الإضافية (إذا وجدت).
                </p>
            </div>
        )}

        <footer className="mt-12 pb-4 text-center">
            <p className="text-slate-500 text-sm">
                تصميم الآلة الحاسبة بواسطة فريق عمل متجرك.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;