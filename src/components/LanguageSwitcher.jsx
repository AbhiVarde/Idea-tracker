import { LocaleSwitcher } from "lingo.dev/react/client";

export function LanguageSwitcher() {
  return (
    <div className="custom-locale-switcher">
      <LocaleSwitcher
        locales={["en", "es", "fr", "ru", "de"]}
        defaultLocale="en"
        className="lingo-switcher"
      />
    </div>
  );
}
