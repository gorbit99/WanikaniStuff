export function katakanaToHiragana(katakana: string): string {
  const katakanaFirst = "ァ".codePointAt(0) ?? 0;
  const katakanaLast = "ヶ".codePointAt(0) ?? 0;
  const hiraganaFirst = "ぁ".codePointAt(0) ?? 0;

  return [...katakana]
    .map((chr) => {
      const chrCodePoint = chr.codePointAt(0) ?? 0;

      if (chrCodePoint >= katakanaFirst && chrCodePoint <= katakanaLast) {
        return String.fromCodePoint(
          chrCodePoint - katakanaFirst + hiraganaFirst
        );
      } else {
        return chr;
      }
    })
    .join("");
}

export function titleCase(str: string): string {
  return str
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase())
    .join(" ");
}
