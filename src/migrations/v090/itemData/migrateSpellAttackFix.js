export default function migrateSpellAttack(itemData, updateData) {
  if (itemData.type !== 'spell') return;

  const actions = Object.entries(itemData.system.actions ?? {});
  if (!actions.length) return;

  const [actionId, action] = actions[0];

  // Replace attack type
  const attackRolls = Object.entries(action?.rolls ?? {})
    .filter(([_, { type }]) => type === 'attack');

  if (!attackRolls.length) return;
  const [rollId, attackRoll] = attackRolls[0];

  if (attackRoll.attackType) return;

  updateData[`system.actions.${actionId}.rolls.${rollId}.attackType`] = 'rangedSpellAttack';
}