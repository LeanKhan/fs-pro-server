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

export { compareValues };
