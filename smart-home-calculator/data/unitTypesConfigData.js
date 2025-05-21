// src/data/unitTypesConfigData.js
export const unitTypesConfig = {
  apartment: {
    id: 'apartment',
    name: 'شقة',
    icon: '🏢',
    fixedRooms: [
      { id: 'reception_room_template', count: 1 },
      { id: 'living_room_template', count: 1 },
      { id: 'kitchen_template', count: 1 },
      { id: 'entrance_template', count: 1 },
    ],
    countableRooms: [
      { id: 'bedroom_template', name: 'غرفة نوم', defaultCount: 2, min: 1, max: 4 },
      { id: 'bathroom_template', name: 'حمام', defaultCount: 1, min: 1, max: 3 },
      { id: 'hallway_template', name: 'طرقة', defaultCount: 1, min: 0, max: 2 },
    ],
  },
  duplex: {
    id: 'duplex',
    name: 'دوبلكس',
    icon: '🏡',
    fixedRooms: [
      { id: 'reception_room_template', count: 1 },
      { id: 'living_room_template', count: 1 },
      { id: 'kitchen_template', count: 1 },
      { id: 'entrance_template', count: 1 },
    ],
    countableRooms: [
      { id: 'bedroom_template', name: 'غرفة نوم', defaultCount: 3, min: 2, max: 5 },
      { id: 'bathroom_template', name: 'حمام', defaultCount: 2, min: 1, max: 4 },
      { id: 'hallway_template', name: 'طرقة', defaultCount: 2, min: 1, max: 3 },
    ],
  },
  villa: {
    id: 'villa',
    name: 'فيلا',
    icon: '🏰',
    fixedRooms: [
      { id: 'reception_room_template', count: 1 },
      { id: 'living_room_template', count: 1 },
      { id: 'kitchen_template', count: 1 },
      { id: 'entrance_template', count: 1 },
    ],
    countableRooms: [
      { id: 'bedroom_template', name: 'غرفة نوم', defaultCount: 4, min: 2, max: 7 },
      { id: 'bathroom_template', name: 'حمام', defaultCount: 3, min: 2, max: 6 },
      { id: 'hallway_template', name: 'طرقة', defaultCount: 2, min: 1, max: 4 },
    ],
    hasGardenOption: true,
    gardenRoomId: 'garden_template',
  },
};