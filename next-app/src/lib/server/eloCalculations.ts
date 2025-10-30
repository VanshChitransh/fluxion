import { ELO_TIERS, GAME_CONSTANTS } from '../constants';

export function getTierFromElo(elo: number) {
  return ELO_TIERS.find(
    (tier) => elo >= tier.minElo && elo <= tier.maxElo
  ) || ELO_TIERS[0];
}

export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateBattleRoyaleEloChange(
  playerElo: number,
  opponentElo: number,
  actualScore: number, // 1 for win, 0.5 for draw, 0 for loss
  gamesPlayed: number
): number {
  const kFactor = gamesPlayed < 30
    ? GAME_CONSTANTS.BATTLE_ROYALE.K_FACTOR_NEW
    : GAME_CONSTANTS.BATTLE_ROYALE.K_FACTOR_ESTABLISHED;

  const expectedScore = calculateExpectedScore(playerElo, opponentElo);
  return Math.round(kFactor * (actualScore - expectedScore));
}

export function calculatePredictBattleEloChange(
  correct: boolean,
  currentStreak: number
): number {
  if (!correct) {
    return GAME_CONSTANTS.PREDICT_BATTLE.ELO_LOSS;
  }

  // Base ELO + streak bonus (capped at 10 bonus)
  const streakBonus = Math.min(currentStreak, 10);
  return GAME_CONSTANTS.PREDICT_BATTLE.ELO_WIN_BASE + streakBonus;
}

export function detectTierChange(oldElo: number, newElo: number) {
  const oldTier = getTierFromElo(oldElo);
  const newTier = getTierFromElo(newElo);

  return {
    changed: oldTier.id !== newTier.id,
    oldTier,
    newTier,
    tierUp: newTier.id > oldTier.id,
  };
}

