import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageProvider";
import { LanguageSelector } from "../components/LanguageSelector";
import { initializeI18n, i18n } from "./index";
import { catalogFixture, deferred } from "../content/catalogFixture";
import type { LocalizedCatalog } from "@pianio/content-schema";

let release = () => {};
function Probe() {
  const state = useLanguage();
  const [instance] = useState(() => Symbol());
  return <><LanguageSelector /><output data-testid="state">{JSON.stringify({ ...state, instance: String(instance) })}</output><button onClick={() => { release = state.beginActivity(); }}>audio</button><button onClick={state.retry}>retry</button></>;
}
const state = () => JSON.parse(screen.getByTestId("state").textContent!);
afterEach(cleanup);
beforeAll(() => initializeI18n("en"));
beforeEach(async () => { await i18n.changeLanguage("en"); localStorage.clear(); });
describe("language coordination", () => {
  it("applies UI/catalog together and ignores out-of-order EN → IT → EN responses", async () => {
    const initial = catalogFixture("en"), italian = deferred<LocalizedCatalog>(), lastEnglish = deferred<LocalizedCatalog>();
    const loader = { load: vi.fn().mockResolvedValueOnce(initial).mockReturnValueOnce(italian.promise).mockReturnValueOnce(lastEnglish.promise) };
    render(<LanguageProvider loader={loader} initialLanguage="en"><Probe /></LanguageProvider>);
    await waitFor(() => expect(state().pending).toBe(false));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "it" } });
    expect(state().activeLanguage).toBe("en"); expect(state().catalog.locale).toBe("en");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
    await act(async () => { lastEnglish.resolve(initial); });
    await act(async () => { italian.resolve(catalogFixture("it")); });
    expect(state().activeLanguage).toBe("en"); expect(i18n.language).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("pianio:language")).toBe("en");
  });
  it("uses English content with Italian UI when Italian is missing", async () => {
    const loader = { load: vi.fn().mockRejectedValueOnce(new Error("404")).mockResolvedValueOnce(catalogFixture("en")) };
    render(<LanguageProvider loader={loader} initialLanguage="it"><Probe /></LanguageProvider>);
    await waitFor(() => expect(state().pending).toBe(false));
    expect(state()).toMatchObject({ activeLanguage: "it", contentLanguage: "en", error: false });
    expect(i18n.language).toBe("it");
    expect(i18n.t("language.fallback")).toContain("contenuti inglesi");
  });
  it("preserves previous data and UI on double failure, and supports recovery", async () => {
    const loader = { load: vi.fn().mockResolvedValueOnce(catalogFixture("en")).mockRejectedValueOnce(Error()).mockRejectedValueOnce(Error()).mockResolvedValueOnce(catalogFixture("it")) };
    render(<LanguageProvider loader={loader} initialLanguage="en"><Probe /></LanguageProvider>);
    await waitFor(() => expect(state().pending).toBe(false));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "it" } });
    await waitFor(() => expect(state().error).toBe(true));
    expect(state()).toMatchObject({ activeLanguage: "en", contentLanguage: "en", catalog: { locale: "en" } });
    fireEvent.click(screen.getByText("retry"));
    await waitFor(() => expect(state().activeLanguage).toBe("it"));
    expect(state().error).toBe(false);
  });
  it("keeps only the last pending selection until every activity ends", async () => {
    const loader = { load: vi.fn(async (language: "en" | "it") => catalogFixture(language)) };
    render(<LanguageProvider loader={loader} initialLanguage="en"><Probe /></LanguageProvider>);
    await waitFor(() => expect(state().pending).toBe(false));
    fireEvent.click(screen.getByText("audio")); const firstRelease = release;
    fireEvent.click(screen.getByText("audio"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "it" } });
    await act(async () => {});
    expect(state()).toMatchObject({ activeLanguage: "en", requestedLanguage: "it", pending: true, deferred: true });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "it" } });
    await act(async () => {});
    act(firstRelease); expect(state().activeLanguage).toBe("en");
    act(release); expect(state().activeLanguage).toBe("it");
  });
});
