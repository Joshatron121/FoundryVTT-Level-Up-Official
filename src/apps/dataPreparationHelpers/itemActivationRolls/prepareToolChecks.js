export default function prepareToolChecks(rolls) {
  const counts = {};

  // Flatten the tools config object and extract just the inner tools keys
  const tools = Object.values(CONFIG.A5E.tools).reduce((acc, curr) => ({ ...acc, ...curr }), {});

  if (!rolls.length) return [];

  return rolls.map(([key, roll]) => {
    roll.tool ??= 'airVehicles';

    if (!roll.label) {
      const label = game.i18n.format('A5E.ToolCheckSpecific', {
        tool: game.i18n.localize(tools[roll.tool])
      });

      counts[roll.tool] ??= 0;
      counts[roll.tool] += 1;

      roll.label = `${label} #${counts[roll.tool]}`;
    }

    return [key, roll];
  });
}
