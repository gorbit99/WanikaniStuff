export class KanjiUtils {
  public static katakanaToHiragana(input: string): string {
    const katakana =
      "アイウエオ" +
      "カガキギクグケゲコゴ" +
      "サザシジスズセゼソゾ" +
      "タダチヂッツヅテデトド" +
      "ナニヌネノ" +
      "ハバパヒビピフブプヘベペホボポ" +
      "マミムメモ" +
      "ャヤュユョヨ" +
      "ラリルレロ" +
      "ワン";
    const hiragana =
      "あいうえお" +
      "かがきぎくぐけげこご" +
      "さざしじすずせぜそぞ" +
      "ただちぢっつづてでとど" +
      "なにぬねの" +
      "はばぱひびぴふぶぷへべぺほぼぽ" +
      "まみむめも" +
      "ゃやゅゆょよ" +
      "らりるれろ" +
      "わん";

    return [...input]
      .map((ch) => hiragana[katakana.indexOf(ch)] as string)
      .join("");
  }

  public static isKanji(kanji: string): boolean {
    return kanji.charAt(0) >= "\u4e00" && kanji.charAt(0) <= "\u9faf";
  }
}
