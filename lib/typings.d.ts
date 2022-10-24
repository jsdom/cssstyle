declare module 'cssom' {
  interface CSSRuleStyle extends ReadonlyArray<string> {
    readonly getPropertyValue: (name: string) => string | null | undefined;
    readonly getPropertyPriority: (name: string) => string | undefined;
  }
  interface CSSRule {
    readonly style: CSSRuleStyle;
  }
  interface StyleSheet {
    readonly cssRules: readonly CSSRule[];
  }
  function parse(token: string): StyleSheet;
}
