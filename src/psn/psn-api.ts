import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  TrophyRarity,
  TrophyTitle,
  TrophyType,
} from "psn-api";
import { config } from "../config";

async function getAuthorizationTokens(token: string) {
  // We'll exchange your NPSSO for a special access code.
  const accessCode = await exchangeNpssoForAccessCode(token);

  // We can use the access code to get your access token and refresh token.
  return exchangeAccessCodeForAuthTokens(accessCode);
}

function getUserToken(userName: string | null) {
  const token = config.psTokens[userName ?? ""];

  if (!token)
    throw new Error(
      `Wrong user name. Please use one of: ${Object.keys(config.psTokens).join(", ")}`,
    );
  return token;
}

export const getTrophiesBySearch = async (
  userName: string | null,
  searchWord: string | null,
): Promise<{
  trophies: {
    name: string | undefined;
    details: string | undefined;
    iconUrl: string;
    trophyId: number;
    trophyHidden: boolean;
    earned?: boolean | undefined;
    earnedDateTime?: string | undefined;
    trophyType: TrophyType;
    trophyRare?: TrophyRarity | undefined;
    trophyEarnedRate?: string | undefined;
    trophyProgressTargetValue?: string | undefined;
  }[];
  gameTitle: string | null;
  trophiesProgress: number;
}> => {
  if (!searchWord) throw new Error(`Please use at least one symbol for search`);

  const token = getUserToken(userName);
  const authorization = await getAuthorizationTokens(token);

  let firstTrophy: TrophyTitle | undefined;
  let nextOffset: number | undefined;
  do {
    const userTitlesResponse = await getUserTitles(
      { accessToken: authorization.accessToken },
      "me",
      nextOffset ? { offset: nextOffset } : undefined,
    );
    nextOffset = userTitlesResponse.nextOffset;
    firstTrophy = userTitlesResponse.trophyTitles.find((tt) =>
      searchWord
        .split("_")
        .every((sw) =>
          tt.trophyTitleName.toLowerCase().includes(sw.toLowerCase()),
        ),
    );
  } while (!firstTrophy && nextOffset);

  if (!firstTrophy)
    return { gameTitle: null, trophiesProgress: 0, trophies: [] };

  const options =
    firstTrophy.trophyTitlePlatform === "PS5"
      ? ({ npServiceName: "trophy2" } as const)
      : ({ npServiceName: "trophy" } as const);
  // contain name and descriptions for all trophies in the group
  const titleTrophies = await getTitleTrophies(
    authorization,
    firstTrophy.npCommunicationId,
    "all",
    options,
  );
  const earnedForTitle = await getUserTrophiesEarnedForTitle(
    authorization,
    "me",
    firstTrophy.npCommunicationId,
    "all",
    options,
  );

  const preparedTrophies = earnedForTitle.trophies
    .filter((v) => v.earned)
    .map((v) => {
      const trophyInfo = titleTrophies.trophies.find(
        (tr) => tr.trophyId === v.trophyId,
      );
      return {
        ...v,
        name: trophyInfo?.trophyName,
        details: trophyInfo?.trophyDetail,
        iconUrl: trophyInfo?.trophyIconUrl ?? "",
      };
    });

  return {
    gameTitle: firstTrophy.trophyTitleName,
    trophiesProgress: firstTrophy.progress,
    trophies: preparedTrophies,
  };
};

export const getLatestTodayTrophies = async (
  userName: string | null,
): Promise<{
  trophies: {
    name: string | undefined;
    details: string | undefined;
    iconUrl: string;
    trophyId: number;
    trophyHidden: boolean;
    earned?: boolean | undefined;
    earnedDateTime?: string | undefined;
    trophyType: TrophyType;
    trophyRare?: TrophyRarity | undefined;
    trophyEarnedRate?: string | undefined;
    trophyProgressTargetValue?: string | undefined;
  }[];
  gameTitle: string | null;
  trophiesProgress: number;
}> => {
  const token = getUserToken(userName);
  const authorization = await getAuthorizationTokens(token);

  const userTitlesResponse = await getUserTitles(
    { accessToken: authorization.accessToken },
    "me",
  );
  const firstTrophy = userTitlesResponse.trophyTitles[0];

  if (!firstTrophy)
    return { gameTitle: null, trophiesProgress: 0, trophies: [] };

  const options =
    firstTrophy.trophyTitlePlatform === "PS5"
      ? ({ npServiceName: "trophy2" } as const)
      : ({ npServiceName: "trophy" } as const);
  // contain name and descriptions for all trophies in the group
  const titleTrophies = await getTitleTrophies(
    authorization,
    firstTrophy.npCommunicationId,
    "all",
    options,
  );
  const earnedForTitle = await getUserTrophiesEarnedForTitle(
    authorization,
    "me",
    firstTrophy.npCommunicationId,
    "all",
    options,
  );

  const preparedTrophies = earnedForTitle.trophies
    .filter((v) => v.earned)
    .map((v) => {
      const trophyInfo = titleTrophies.trophies.find(
        (tr) => tr.trophyId === v.trophyId,
      );
      return {
        ...v,
        name: trophyInfo?.trophyName,
        details: trophyInfo?.trophyDetail,
        iconUrl: trophyInfo?.trophyIconUrl ?? "",
      };
    });

  return {
    gameTitle: firstTrophy.trophyTitleName,
    trophiesProgress: firstTrophy.progress,
    trophies: preparedTrophies,
  };
};
