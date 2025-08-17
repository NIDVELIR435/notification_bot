import {
  AchievementPlatformStrategy,
  ITrophiesResponse,
  LatestTodayTrophiesResponse,
  TrophyRarity,
  TrophyType,
} from "./achievement-platform-strategies.abstract";
import { getAuthorizationTokens, getUserToken } from "../psn/psn-api";
import {
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  TitleThinTrophy,
  UserThinTrophy,
  TrophyRarity as PSNTrophyRarity,
} from "psn-api";

const PSNTrophyRareToGeneral = {
  [PSNTrophyRarity.UltraRare]: TrophyRarity.UltraRare,
  [PSNTrophyRarity.VeryRare]: TrophyRarity.VeryRare,
  [PSNTrophyRarity.Rare]: TrophyRarity.Rare,
  [PSNTrophyRarity.Common]: TrophyRarity.Common,
};

class PSNTrophiesResponse implements ITrophiesResponse {
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

  constructor(
    userThinTrophy: UserThinTrophy,
    allTrophiesTitles: TitleThinTrophy[],
  ) {
    const trophyInfo = allTrophiesTitles.find(
      (tr) => tr.trophyId === userThinTrophy.trophyId,
    );

    this.name = trophyInfo?.trophyName ?? "";
    this.details = trophyInfo?.trophyDetail ?? null;
    this.iconUrl = trophyInfo?.trophyIconUrl ?? null;
    this.trophyId = userThinTrophy.trophyId;
    this.trophyHidden = userThinTrophy.trophyHidden;
    this.earned = userThinTrophy.earned ?? false;
    this.earnedDateTime = userThinTrophy.earnedDateTime ?? null;
    this.trophyType = userThinTrophy.trophyType;
    this.trophyRare =
      PSNTrophyRareToGeneral[
        userThinTrophy.trophyRare ?? PSNTrophyRarity.Common
      ];
    this.trophyEarnedRate = userThinTrophy.trophyEarnedRate ?? "";
    this.trophyProgressTargetValue =
      userThinTrophy.trophyProgressTargetValue ?? "";
  }
}

export class PSPlatformStrategy implements AchievementPlatformStrategy {
  async todayLatestTrophies(
    userName: string | null,
  ): Promise<LatestTodayTrophiesResponse> {
    const token = getUserToken(userName);
    const authorization = await getAuthorizationTokens(token);

    const userTitlesResponse = await getUserTitles(
      { accessToken: authorization.accessToken },
      "me",
    );
    const latestTrophy = userTitlesResponse.trophyTitles[0];

    if (!latestTrophy) return new LatestTodayTrophiesResponse(null, 0, []);

    const options =
      latestTrophy.trophyTitlePlatform === "PS5"
        ? ({ npServiceName: "trophy2" } as const)
        : ({ npServiceName: "trophy" } as const);
    // contain name and descriptions for all trophies in the group
    const titleTrophies = await getTitleTrophies(
      authorization,
      latestTrophy.npCommunicationId,
      "all",
      options,
    );
    const earnedForTitle = await getUserTrophiesEarnedForTitle(
      authorization,
      "me",
      latestTrophy.npCommunicationId,
      "all",
      options,
    );

    const trophies = earnedForTitle.trophies
      .filter((v) => v.earned)
      .map((v) => new PSNTrophiesResponse(v, titleTrophies.trophies));

    return new LatestTodayTrophiesResponse(
      latestTrophy.trophyTitleName,
      latestTrophy.progress,
      trophies,
    );
  }
}
