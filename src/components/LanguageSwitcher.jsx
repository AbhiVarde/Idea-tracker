import { LocaleSwitcher } from "lingo.dev/react/client";

export function LanguageSwitcher() {
  return (
    <div className="language-switcher-container">
      <LocaleSwitcher
        locales={["en", "es", "fr", "ru", "de"]}
        defaultLocale="en"
        className="themed-language-switcher"
      />
    </div>
  );
}
