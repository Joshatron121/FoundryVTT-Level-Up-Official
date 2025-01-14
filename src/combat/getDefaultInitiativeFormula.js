import constructD20RollFormula from '../dice/constructD20RollFormula';
import overrideRollMode from '../utils/overrideRollMode';

import ModifierManager from '../managers/ModifierManager';

export default function getDefaultInitiativeFormula(actor, options = {}) {
  const { skillKey } = options;
  const { initiative } = actor.system.attributes;
  const abilityKey = options.abilityKey ?? 'dex';
  const defaultRollMode = options?.rollMode ?? CONFIG.A5E.ROLL_MODE.NORMAL;

  const rollMode = overrideRollMode(
    actor,
    defaultRollMode,
    { ability: abilityKey, type: 'check' }
  );

  const modifierManager = new ModifierManager(actor, {
    ability: abilityKey,
    expertiseDie: options.expertiseDice ?? initiative.expertiseDice,
    type: 'initiative',
    situationalMods: options.situationalMods,
    skill: skillKey
  });

  return constructD20RollFormula({
    actor,
    rollMode,
    modifiers: modifierManager.getModifiers()
  }).rollFormula;
}
