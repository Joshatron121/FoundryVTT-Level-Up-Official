import { localize } from '#runtime/util/i18n';

export default function getManeuverSummaryData(item, options) {
  const maneuverDegree = CONFIG.A5E.maneuverDegrees[parseInt(item.system.degree, 10)];
  const tradition = CONFIG.A5E.maneuverTraditions[item.system.tradition] ?? '';
  const stance = item.system.isStance ? 'Stance' : '';

  const exertionCost = item.system.exertionCost ? `(${item.system.exertionCost}
    ${localize(item.system.exertionCost > 1 ? 'A5E.ExertionPointPlural' : 'A5E.ExertionPoint')})` : '';

  const maneuverProperties = [
    maneuverDegree,
    tradition,
    stance,
    exertionCost
  ].filter(Boolean).join(' ');

  return { maneuverProperties };
}
