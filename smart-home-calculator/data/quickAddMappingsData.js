// src/data/quickAddMappingsData.js
export const quickAddMappings = {
  numWindows: [
    { deviceId: 'sc3', quantityPerItem: 1, name: 'محرك ستائر ذكي', roomTypes: ['bedroom', 'living', 'reception'] },
    { deviceId: 'ss6_window', quantityPerItem: 1, name: 'حساس فتح نافذة' }
  ],
  numDoors: [
    { deviceId: 'ss6_door', quantityPerItem: 1, name: 'حساس فتح باب' },
  ],
  numLightPoints: [
    { deviceId: 'sl1', quantityPerItem: 1, name: 'لمبة ذكية ملونة (افتراضي)' },
    { deviceId: 'sl_dimmer_switch', quantityPerItem: 0.5, name: 'مفتاح تعتيم (لكل نقطتي إضاءة)', roomTypes: ['bedroom', 'living', 'reception'], condition: (count) => count >=1 , fixedQuantity: (count) => Math.ceil(count/2)}
  ],
  numOutlets: [
    { deviceId: 'sa1', quantityPerItem: 1, name: 'مقبس ذكي' }
  ],
  numMajorAppliances: [
    { deviceId: 'sa1_kitchen', quantityPerItem: 1, name: 'مقبس ذكي (للأجهزة الكبيرة)' },
  ],
  numSmallAppliances: [
    { deviceId: 'sa1', quantityPerItem: 1, name: 'مقبس ذكي (للأجهزة الصغيرة)' },
  ],
  numTVs: [
    { deviceId: 'sa3', quantityPerItem: 1, name: 'ريموت كنترول شامل' },
    { deviceId: 'sa1', quantityPerItem: 1, name: 'مقبس ذكي (للتلفزيون)' },
  ],
  hasSplitAC: [
    { deviceId: 'sc2', quantityPerItem: 1, name: 'متحكم مكيف ذكي (سبليت)' }
  ],
  hasCentralAC: [
    { deviceId: 'sc1', quantityPerItem: 1, name: 'ترموستات ذكي (مركزي)' }
  ],
  hasRadiator: [
    { deviceId: 'sc_radiator_valve', quantityPerItem: 1, name: 'صمام رادياتير ذكي'}
  ],
  needAirPurifier: [
    { deviceId: 'sc_air_purifier', quantityPerItem: 1, name: 'منقي هواء ذكي'}
  ],
  hasGasStove: [
    { deviceId: 'ss_gas', quantityPerItem: 1, name: 'كاشف تسرب غاز ذكي', roomTypes: ['kitchen'] }
  ],
  hasExhaustFan: [
    { deviceId: 'sc4', quantityPerItem: 1, name: 'مروحة شفط ذكية', roomTypes: ['bathroom', 'kitchen'] }
  ],
  needSmartLockForMainDoor: [
    { deviceId: 'ss5', quantityPerItem: 1, name: 'قفل باب ذكي', roomTypes: ['entrance']}
  ],
  needVideoDoorbell: [
    { deviceId: 'ss3', quantityPerItem: 1, name: 'جرس باب ذكي بالفيديو', roomTypes: ['entrance']}
  ],
  gardenNeedsIrrigation: [
    { deviceId: 'sprinkler', quantityPerItem: 1, name: 'نظام ري ذكي', roomTypes: ['garden']}
  ],
  gardenNeedsLighting: [
    { deviceId: 'sl_garden', quantityPerItem: 1, name: 'إضاءة خارجية ذكية', roomTypes: ['garden']}
  ],
  gardenNeedsSecurityCam: [
    { deviceId: 'ss_garden_cam', quantityPerItem: 1, name: 'كاميرا مراقبة خارجية (للحديقة)', roomTypes: ['garden']}
  ],
  needsZigbeeHub: [
    { deviceId: 'zigbee_hub', quantityPerItem: 1, name: 'موزع Zigbee Hub (ضروري لأجهزة Zigbee)'}
  ]
};