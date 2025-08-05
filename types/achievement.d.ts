export interface AchievementData {
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden: boolean;
  playersCompletedPercent: number;
  adjustedPlayersCompletedPercent: number;
  side: string;
  normalizedSide: string;
  rarity: string;
  normalizedRarity: string;
  imageLink: string;
}
