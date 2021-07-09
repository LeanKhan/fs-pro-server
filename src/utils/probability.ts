function compareValues(a: number, b: number): boolean {
  const universe = 1000;

  /**
   * Weight based simulation
   */
  const winningChanceA = Math.round((a / (a + b)) * 100);

  const winningChanceB = Math.round((b / (a + b)) * 100);

  const fulcrumNumber =
    winningChanceA <= winningChanceB
      ? (winningChanceA / 100) * universe
      : (winningChanceB / 100) * universe;

  const random = Math.round(Math.random() * 1000);

  return random <= fulcrumNumber;
}

/**
 * GimmeAChance - _just give me a chance!_
 *
 * Returns a random percentage
 * @returns {number} chance threshold
 */
export function gimmeAChance(): number {
  return Math.round(Math.random() * 100);
}

// TODO: write helper function and also include weights!
/**
 * Make two players battle it out!
 *
 * let the array either be:
 * [30,40,78] or [{v: 80, p: 50}, {v: 80, p: 50}]
 */
export function getResult(
  a_attributes: number[] | { v: number; p: number }[],
  b_attributes: number[] | { v: number; p: number }[],
  a_chance_threshold: number,
  b_chance_threshold: number
) {
  const a_chance = gimmeAChance();
  const b_chance = gimmeAChance();

  // this assumes that the distribution of points is equal!

  const $a =
    sum(a_attributes) * (a_chance_threshold / 100) +
    a_chance * ((100 - a_chance_threshold) / 100);
  const $b =
    sum(b_attributes) * (b_chance_threshold / 100) +
    b_chance * ((100 - b_chance_threshold) / 100);

  return $a > $b;
}

/**
 * Sum up attributes
 */
function sum(array: any[]): number {
  // if the array is composed of numbers then...
  if (!array.some(isNaN))
    return array.reduce((sum, a) => (sum += a), 0) / array.length;

  // else multiply each kini by its percentage: [{v: 80, p: 50}, {v: 80, p: 50}]
  return array.reduce((sum, a) => (sum += a.v * (a.p / 100)), 0);
}

export { compareValues };
