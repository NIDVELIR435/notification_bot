export enum TrophyRarity {
  UltraRare = 0,
  VeryRare = 1,
  Rare = 2,
  Common = 3,
}

export type TrophyType = "bronze" | "silver" | "gold" | "platinum";

export interface ITrophiesResponse {
  name: string;
  details: string | null;
  iconUrl: string | null;
  trophyId: number;
  trophyHidden: boolean;
  earned: boolean;
  earnedDateTime: string | null;
  trophyType: TrophyType;
  trophyRare: TrophyRarity;
  trophyEarnedRate: string;
  trophyProgressTargetValue: string;
}

export interface ILatestTodayTrophiesResponse {
  trophies: Array<ITrophiesResponse>;
  gameTitle: string | null;
  trophiesProgress: number;
}

export class LatestTodayTrophiesResponse
  implements ILatestTodayTrophiesResponse
{
  gameTitle: string | null;
  trophies: Array<ITrophiesResponse>;

  trophiesProgress: number;

  constructor(
    gameTitle: string | null,
    trophiesProgress: number,
    trophies: Array<ITrophiesResponse>,
  ) {
    this.gameTitle = gameTitle;
    this.trophiesProgress = trophiesProgress;
    this.trophies = trophies;
  }
}

export abstract class AchievementPlatformStrategy {
  abstract todayLatestTrophies(
    userName: string | null,
  ): Promise<LatestTodayTrophiesResponse>;
}
