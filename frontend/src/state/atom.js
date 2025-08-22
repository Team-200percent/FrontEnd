import { atom } from "recoil";

export const selectedPlaceState = atom({
  key: "selectedPlaceState",
  default: null,
});

export const isPlaceSheetOpenState = atom({
  key: "isPlaceSheetOpenState",
  default: false,
});

export const placeForGroupState = atom({
  key: "placeForGroupState",
  default: null,
});

export const isGroupSheetOpenState = atom({
  key: "isGroupSheetOpenState",
  default: false,
});

export const onGroupSheetSaveState = atom({
  key: "onGroupSheetSaveState",
  default: null, // 저장 완료 시 실행할 콜백 함수
});

export const favoriteStateChanged = atom({
  key: "favoriteStateChanged",
  default: 0,
});
