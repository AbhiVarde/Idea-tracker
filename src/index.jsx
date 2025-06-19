import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { LingoProviderWrapper, loadDictionary } from "lingo.dev/react/client";

const MemoizedLingoProvider = React.memo(({ children }) => {
  const dictionaryLoader = useMemo(
    () => (locale) => loadDictionary(locale),
    []
  );

  return (
    <LingoProviderWrapper loadDictionary={dictionaryLoader}>
      {children}
    </LingoProviderWrapper>
  );
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MemoizedLingoProvider>
      <App />
    </MemoizedLingoProvider>
  </React.StrictMode>
);
