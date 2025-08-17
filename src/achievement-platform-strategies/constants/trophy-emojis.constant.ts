import { TrophyType } from "../achievement-platform-strategies.abstract";

export const TROPHY_EMOJIS: { [key: string]: string } = {
  bronze: "🥉", // Bronze medal or brown square to suggest bronze
  silver: "🥈", // Silver medal or white circle for silver
  gold: "🥇", // Gold medal or yellow star for gold
  platinum: "🏆", // Trophy for platinum
};

export const getTrophyEmoji = (trophyType: TrophyType): string => {
  return TROPHY_EMOJIS[trophyType];
};
