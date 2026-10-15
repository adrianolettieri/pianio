import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useTranslation } from "react-i18next";
import { initializeI18n, i18n } from "./index";
import { nativeErrorMessage, renderMessage } from "./messages";

let toastCreationCount = 0;
function PersistentToast() {
  const { i18n: activeI18n } = useTranslation();
  const [message] = useState(() => {
    toastCreationCount += 1;
    return { namespace: "progress" as const, key: "progress.import.success", params: { importedCount: 2 } };
  });
  return <div role="status">{renderMessage(message, activeI18n.language.startsWith("it") ? "it" : "en")}</div>;
}

describe("message descriptors", () => {
  it("maps known native MIDI error names and keeps original details separately", () => {
    expect(nativeErrorMessage(new DOMException("Permission denied by browser", "NotAllowedError"), "midi"))
      .toMatchObject({ namespace: "diagnostics", key: "midi.error.permission-denied", technicalDetail: "Permission denied by browser" });
    expect(nativeErrorMessage(new Error("opaque platform text"), "midi"))
      .toMatchObject({ key: "midi.error.unknown", technicalDetail: "opaque platform text" });
  });

  it("normalizes network and HTTP failures while retaining transport details", () => {
    expect(nativeErrorMessage(new Error("Catalog request failed with 503"), "catalog"))
      .toMatchObject({ namespace: "catalog", key: "catalog.error.http", params: { status: 503 } });
    expect(nativeErrorMessage(new TypeError("Failed to fetch"), "score"))
      .toMatchObject({ namespace: "practice", key: "score.error.network", technicalDetail: "Failed to fetch" });
  });

  it("updates a visible message after the language changes without replacing its descriptor", async () => {
    toastCreationCount = 0;
    await initializeI18n("en");
    const view = render(<PersistentToast />);
    expect(screen.getByRole("status").textContent).toBe("Imported 2 completed exercises.");
    await act(async () => { await i18n.changeLanguage("it"); });
    expect(screen.getByRole("status").textContent).toBe("Importati 2 esercizi completati.");
    expect(toastCreationCount).toBe(1);
    view.unmount();
  });
});
