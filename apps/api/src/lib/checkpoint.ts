export interface ShuffledChoice {
  choiceId: number; // original index into the stored choices array; NOT the display position
  text: string;
}

// Fisher-Yates using crypto for unbiased shuffling. Re-shuffled on every fetch so a
// student can't memorize "the 2nd option is always right" across attempts.
export function shuffleChoices(choicesJson: string): ShuffledChoice[] {
  const choices: string[] = JSON.parse(choicesJson);
  const tagged: ShuffledChoice[] = choices.map((text, choiceId) => ({ choiceId, text }));

  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
  }

  return tagged;
}
