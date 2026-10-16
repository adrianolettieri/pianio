import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MidiAdapterSubscription, ParsedMidiEvent } from "@pianio/midi-web";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { i18n, initializeI18n } from "./i18n";
import { createCatalogLoader } from "./content/catalogLoader";
import { catalogFixture, deferred } from "./content/catalogFixture";

const mock = vi.hoisted(() => ({ subscriptions: new Set<MidiAdapterSubscription>(), request: vi.fn(async () => ({})), playback: vi.fn(), stop: vi.fn(), scoreMounts: 0 }));
vi.mock("./audio/pianoSampler", () => ({ startAudio: vi.fn(async () => {}), playNote: vi.fn(), releaseNote: vi.fn(), stopMetronome: mock.stop, startMetronome: vi.fn(), startPerformanceCountIn: vi.fn(), scheduleExercisePlayback: mock.playback }));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("@pianio/midi-web", async importOriginal => ({
  ...await importOriginal<typeof import("@pianio/midi-web")>(),
  describeMidiSupport: () => ({ available: true, code: "available" }), requestMidiAccess: mock.request,
  createMidiAccessAdapter: () => ({ getInputs: () => [{ id: "sim", name: "Simulated keyboard", state: "connected", connection: "open" }], subscribe: (sub: MidiAdapterSubscription) => { mock.subscriptions.add(sub); return () => mock.subscriptions.delete(sub); } }),
}));
vi.mock("./components/ScoreViewer", async () => {
  const { useEffect } = await import("react");
  return { ScoreViewer: ({ matchedCount, scorePath }: { matchedCount: number; scorePath: string }) => {
    useEffect(() => { mock.scoreMounts++; }, []);
    return <output data-testid="score" data-position={matchedCount}>{scorePath}</output>;
  } };
});
beforeAll(() => initializeI18n("en"));
beforeEach(async () => {
  await i18n.changeLanguage("en"); localStorage.clear(); mock.scoreMounts = 0;
  mock.request.mockClear(); mock.playback.mockClear(); mock.stop.mockClear();
  window.location.hash = "#/courses/method-level-1a/exercises/one";
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
function startApp() {
  const loader = createCatalogLoader(vi.fn(async (url: string | URL | Request) => new Response(JSON.stringify(catalogFixture(String(url).includes("/it/") ? "it" : "en")))));
  return render(<LanguageProvider loader={loader} initialLanguage="en"><App /></LanguageProvider>);
}
async function ready() { await screen.findByTestId("score"); await act(async () => {}); }
async function change(language: "en" | "it") {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: language } });
  await act(async () => {});
}
function note(note = 60) {
  act(() => { for (const sub of mock.subscriptions) sub.onMidiEvent({ type: "note-on", note, velocity: 80, timestamp: performance.now(), channel: 0, source: { id: "sim", name: "Simulated keyboard", manufacturer: null }, rawData: [144, note, 80] } as ParsedMidiEvent); });
}
const position = () => screen.getByTestId("score").getAttribute("data-position");
describe("language changes in the actual app with simulated MIDI/audio", () => {
  it.each([1, 2])("renders %s perfect completions with the Italian singular/plural after switching language", async count => {
    window.location.hash = "#/progress";
    const keys = ["method-level-1a/one", "method-level-1a/two"].slice(0, count);
    localStorage.setItem("pianio:completed", JSON.stringify(keys));
    localStorage.setItem("pianio:stars", JSON.stringify(Object.fromEntries(keys.map(key => [key, 3]))));
    startApp();
    expect(await screen.findByText(`${count} perfect`)).toBeTruthy();
    await change("it");
    expect(screen.getByText(`${count} ${count === 1 ? "perfetto" : "perfetti"}`)).toBeTruthy();
  });
  it("offers progress import/export on a clean profile in both languages", async () => {
    window.location.hash = "#/progress";
    startApp();
    expect(await screen.findByRole("button", { name: "Import" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export" })).toBeTruthy();
    await change("it");
    expect(screen.getByRole("button", { name: "Importa" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Esporta" })).toBeTruthy();
  });
  it("starts and changes language/theme when storage reads and writes are denied", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    startApp(); await ready();
    await change("it");
    expect(screen.getByRole("button", { name: "Esercitazione" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Passa al tema scuro" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: /Strumenti/ }));
    fireEvent.click(screen.getByRole("button", { name: "75%" }));
    await change("en");
    expect(document.querySelector(".tempo-select-btn.active")?.textContent).toBe("75%");
    expect(screen.getByRole("button", { name: "Practice" })).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
  it("preserves matcher, errors, speed, section loop and MIDI subscription; protects selector/editable keyboard input", async () => {
    startApp(); await ready();
    fireEvent.click(screen.getByRole("button", { name: "Connect MIDI" })); await act(async () => {});
    const requests = mock.request.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /Tools/ }));
    fireEvent.click(screen.getByRole("button", { name: "75%" }));
    fireEvent.click(screen.getByRole("button", { name: "Section" }));
    note(61); note();
    expect(position()).toBe("1");
    const score = screen.getByTestId("score");
    await change("it");
    expect(screen.getByTestId("score")).toBe(score);
    expect(mock.scoreMounts).toBe(1);
    expect(position()).toBe("1");
    expect(screen.getByText("Simulated keyboard")).toBeTruthy();
    expect(document.querySelector(".wrong-tally-chip")?.textContent).toContain("1");
    expect(document.querySelector(".tempo-select-btn.active")?.textContent).toBe("75%");
    expect(document.querySelector(".loop-section-btn.active")).toBeTruthy();
    const select = screen.getByRole("combobox");
    select.focus(); expect(document.activeElement).toBe(select);
    fireEvent.keyDown(select, { key: "ArrowRight" }); fireEvent.keyDown(select, { key: "R" });
    const editable = document.createElement("div"); editable.contentEditable = "true"; editable.setAttribute("contenteditable", "true"); document.body.append(editable);
    fireEvent.keyDown(editable, { key: "r" }); fireEvent.keyDown(editable, { key: "ArrowLeft" }); editable.remove();
    expect(position()).toBe("1"); expect(window.location.hash).toContain("/one");
    await change("en");
    expect(position()).toBe("1"); expect(mock.request).toHaveBeenCalledTimes(requests);
    note(); note(); expect(position()).toBe("0"); // section loop survives the text changes
    fireEvent.keyDown(window, { key: "R" }); expect(position()).toBe("0");
  });
  it("does not restart the auto-loop timer when localized text arrives", async () => {
    startApp(); await ready();
    fireEvent.click(screen.getByRole("button", { name: /MIDI/ })); await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: /Tools/ }));
    fireEvent.click(screen.getByTitle("Auto-repeat exercise on completion"));
    vi.useFakeTimers(); note(); note(); note(); expect(position()).toBe("3");
    await act(async () => { vi.advanceTimersByTime(800); });
    await change("it"); expect(position()).toBe("3");
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(position()).toBe("0"); expect(mock.scoreMounts).toBe(1);
  });
  it("defers the last choice through preview and applies when preview finishes, without stopping audio", async () => {
    startApp(); await ready(); vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Preview" })); await act(async () => {});
    await change("it"); await change("en"); await change("it");
    expect(i18n.language).toBe("en"); expect(screen.getByText(/will apply when audio finishes/)).toBeTruthy();
    const stops = mock.stop.mock.calls.length;
    await act(async () => { vi.advanceTimersByTime(5299); }); expect(i18n.language).toBe("en");
    await act(async () => { vi.advanceTimersByTime(1); }); expect(i18n.language).toBe("it");
    expect(mock.playback).toHaveBeenCalledTimes(1); expect(mock.stop).toHaveBeenCalledTimes(stops);
  });
  it("defers through count-in and playing, then preserves performance mode and results", async () => {
    startApp(); await ready();
    fireEvent.click(screen.getByRole("button", { name: "Performance" }));
    vi.useFakeTimers(); fireEvent.click(screen.getByRole("button", { name: "Start Performance" })); await act(async () => {});
    await change("it"); expect(screen.getByText("Get ready…")).toBeTruthy(); expect(i18n.language).toBe("en");
    await act(async () => { vi.advanceTimersByTime(2000); }); expect(screen.getByText(/Playing/)).toBeTruthy();
    await change("en"); await change("it"); expect(i18n.language).toBe("en");
    const requests = mock.request.mock.calls.length;
    await act(async () => { vi.advanceTimersByTime(6000); }); expect(i18n.language).toBe("it");
    expect(document.querySelector(".perform-score")).toBeTruthy(); expect(document.querySelector(".mode-tab.active")?.textContent).toBe("Esecuzione");
    await change("en"); expect(document.querySelector(".perform-score")).toBeTruthy(); expect(mock.request).toHaveBeenCalledTimes(requests);
  });
  it("retains the pending choice across navigation while scheduled preview audio finishes", async () => {
    startApp(); await ready(); vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Preview" })); await act(async () => {}); await change("it");
    await act(async () => { window.location.hash = "#/diagnostics"; window.dispatchEvent(new HashChangeEvent("hashchange")); });
    expect(screen.queryByTestId("score")).toBeNull(); expect(i18n.language).toBe("en");
    await act(async () => { vi.advanceTimersByTime(5300); }); expect(i18n.language).toBe("it");
    expect(mock.playback).toHaveBeenCalledTimes(1);
  });
  it("keeps diagnostics events, errors and request count across EN → IT → EN", async () => {
    window.location.hash = "#/diagnostics";
    startApp();
    const request = await screen.findByRole("button", { name: "Request MIDI access" });
    fireEvent.click(request); await act(async () => {}); note();
    const session = document.querySelector(".session-grid");
    const values = Array.from(session!.querySelectorAll("strong")).map(e => e.textContent);
    const requests = mock.request.mock.calls.length;
    await change("it"); await change("en");
    expect(document.querySelector(".session-grid")).toBe(session);
    expect(Array.from(session!.querySelectorAll("strong")).map(e => e.textContent)).toEqual(values);
    expect(mock.request).toHaveBeenCalledTimes(requests);
  });
  it("keeps the mounted practice panel on double failure and explains an English-content fallback in Italian", async () => {
    const loader = { load: vi.fn().mockResolvedValueOnce(catalogFixture("en")).mockRejectedValueOnce(Error("offline")).mockRejectedValueOnce(Error("offline")).mockRejectedValueOnce(Error("missing IT")).mockResolvedValueOnce(catalogFixture("en")) };
    render(<LanguageProvider loader={loader} initialLanguage="en"><App /></LanguageProvider>);
    await ready();
    const score = screen.getByTestId("score");
    await change("it");
    expect(screen.getByRole("alert").textContent).toContain("current session is preserved");
    expect(screen.getByTestId("score")).toBe(score);
    expect(i18n.language).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await act(async () => {});
    expect(screen.getByText(/contenuti inglesi con l’interfaccia italiana/).getAttribute("role")).toBe("status");
    expect(screen.getByTestId("score")).toBe(score);
    expect(mock.scoreMounts).toBe(1);
  });
  it("releases a pending language choice on count-in unmount and never starts obsolete playback", async () => {
    startApp(); await ready();
    fireEvent.click(screen.getByRole("button", { name: "Performance" }));
    vi.useFakeTimers(); fireEvent.click(screen.getByRole("button", { name: "Start Performance" })); await act(async () => {});
    await change("it"); expect(i18n.language).toBe("en");
    await act(async () => { window.location.hash = "#/diagnostics"; window.dispatchEvent(new HashChangeEvent("hashchange")); });
    expect(i18n.language).toBe("it");
    await act(async () => { vi.advanceTimersByTime(10000); });
    expect(mock.playback).not.toHaveBeenCalled();
  });
  it("keeps a visible diagnostic failure across language changes without repeating the request", async () => {
    window.location.hash = "#/diagnostics"; mock.request.mockRejectedValueOnce(new DOMException("Simulated denial", "NotAllowedError"));
    startApp();
    fireEvent.click(await screen.findByRole("button", { name: "Request MIDI access" })); await act(async () => {});
    const requests = mock.request.mock.calls.length;
    expect(screen.getByText(/Simulated denial/)).toBeTruthy();
    await change("it"); expect(screen.getByText(/Simulated denial/)).toBeTruthy();
    await change("en"); expect(screen.getByText(/Simulated denial/)).toBeTruthy();
    expect(mock.request).toHaveBeenCalledTimes(requests);
  });
  it("handles direct exercise startup failure and recovery without a false missing-course screen", async () => {
    const wait = deferred<ReturnType<typeof catalogFixture>>();
    const loader = { load: vi.fn().mockReturnValueOnce(wait.promise).mockResolvedValueOnce(catalogFixture("en")) };
    render(<LanguageProvider loader={loader} initialLanguage="en"><App /></LanguageProvider>);
    expect(screen.queryByText("Course not found")).toBeNull();
    await act(async () => { wait.reject(Error("offline")); });
    expect(screen.getByText("The catalog could not be loaded. Try again.")).toBeTruthy();
    expect(screen.queryByText("Course not found")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await ready(); expect(position()).toBe("0");
  });
});
