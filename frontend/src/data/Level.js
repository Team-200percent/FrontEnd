export const XP_THRESHOLDS = {
  1: 200,
  2: 900,
  3: 1600,
  4: 3100,
  5: 3100, // 5레벨은 최종치로 고정
};

export const MAX_LEVEL = 5;
export const MISSION_XP = 20;

export function getUnlockedLevel(xp = 0) {
  if (xp >= 3100) return 5;  // L5 해금
  if (xp >= 1600) return 4;  // L4 해금
  if (xp >= 900)  return 3;  // L3 해금
  if (xp >= 200)  return 2;  // L2 해금
  return 1;                  // 기본 L1
}

export function getNextThreshold(currentLevel) {
  if (currentLevel >= MAX_LEVEL) return null; // 만렙
  return XP_THRESHOLDS[currentLevel + 1];
}

export function calcMissionProgress(userXp, currentLevel) {
  const next = getNextThreshold(currentLevel);
  if (!next) {
    return { completed: 0, total: 0, percent: 100, nextLevelName: "MAX" };
  }
  const remainXp = Math.max(0, next - userXp);
  const missionsLeft = Math.ceil(remainXp / MISSION_XP);
  const totalMissions = Math.ceil((next - XP_THRESHOLDS[currentLevel]) / MISSION_XP);
  const doneMissions = Math.max(0, totalMissions - missionsLeft);
  const percent = totalMissions ? (doneMissions / totalMissions) * 100 : 0;

  return {
    completed: doneMissions,
    total: totalMissions,
    percent,
    nextLevelName: `LEVEL ${currentLevel + 1}`,
  };
}