export class StringUtils {
  public static uppercaseFirst(input: string): string {
    if (input === "") {
      return "";
    }

    return input[0]?.toUpperCase() + input.slice(1);
  }
}
