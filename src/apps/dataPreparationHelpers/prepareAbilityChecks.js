export default function prepareAbilityChecks(rolls) {
  const counts = {};

  if (!rolls.length) return [];

  return rolls.map(([key, roll]) => {
    if (roll.label) return [key, roll.label];

    roll.ability ??= 'str';

    const label = game.i18n.format('A5E.AbilityCheckSpecific', {
      ability: game.i18n.localize(CONFIG.A5E.abilities[roll.ability])
    });

    counts[roll.ability] ??= 0;
    counts[roll.ability] += 1;

    return [key, `${label} #${counts[roll.ability]}`];
  });
}
