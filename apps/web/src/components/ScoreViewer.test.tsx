import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { deferred } from "../content/catalogFixture";
import { i18n, initializeI18n } from "../i18n";
import { ScoreViewer } from "./ScoreViewer";

const mock = vi.hoisted(() => ({ instances: [] as any[], waits: new Map<string, Promise<void>>() }));
vi.mock("opensheetmusicdisplay", () => ({ OpenSheetMusicDisplay: class {
  zoom = 1; position = 0; host: HTMLElement; xml = "";
  cursor = {
    Iterator: { EndReached: false },
    reset: () => { this.position = 0; this.cursor.Iterator.EndReached = false; this.paint(); },
    next: () => { this.position++; this.cursor.Iterator.EndReached = this.position >= 5; this.paint(); },
    show: () => { this.host.dataset.hidden = "false"; this.paint(); },
    hide: () => { this.host.dataset.hidden = "true"; },
    NotesUnderCursor: () => [{ isRest: () => false }],
  };
  constructor(host: HTMLElement) { this.host = host; mock.instances.push(this); }
  async load(xml: string) { this.xml = xml; await mock.waits.get(xml); }
  paint() { this.host.dataset.position = String(this.position); }
  render() { if (this.xml.includes("Bad rendering")) throw Error("render failed"); this.host.dataset.zoom = String(this.zoom); this.host.textContent = this.xml; }
} }));
const en = "/generated/en/scores/method-level-1a/one.musicxml";
const itPath = en.replace("/en/", "/it/");
const xml = (lang: string) => `<score-partwise><work><work-title>${lang}</work-title></work></score-partwise>`;
beforeAll(() => initializeI18n("en"));
beforeEach(async () => {
  await i18n.changeLanguage("en"); mock.instances.length = 0; mock.waits.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(callback, 0));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("score continuity", () => {
  it("restores zoom and current session cursor after replacement with no new MIDI event", async () => {
    vi.stubGlobal("fetch", vi.fn(async (path: string) => new Response(xml(path))));
    const view = render(<ScoreViewer scorePath={en} matchedCount={3} />);
    await screen.findByRole("button", { name: "Zoom in" });
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(mock.instances[0].host.dataset).toMatchObject({ position: "3", zoom: "1.15" });
    view.rerender(<ScoreViewer scorePath={itPath} matchedCount={3} />);
    await waitFor(() => expect(mock.instances[1]?.host.isConnected).toBe(true));
    await waitFor(() => expect(mock.instances[1].host.dataset).toMatchObject({ position: "3", zoom: "1.15", hidden: "false" }));
    expect(screen.getByText("115%")).toBeTruthy();
  });
  it("ignores stale OSMD loads, restores latest position and keeps completed cursors hidden", async () => {
    vi.stubGlobal("fetch", vi.fn(async (path: string) => new Response(xml(path))));
    const slow = deferred<void>(); mock.waits.set(xml(itPath), slow.promise);
    const view = render(<ScoreViewer scorePath={en} matchedCount={2} />);
    await screen.findByRole("button", { name: "Zoom in" });
    view.rerender(<ScoreViewer scorePath={itPath} matchedCount={2} />);
    await waitFor(() => expect(mock.instances).toHaveLength(2));
    view.rerender(<ScoreViewer scorePath={en} matchedCount={5} />);
    await screen.findByRole("button", { name: "Zoom in" });
    await act(async () => { slow.resolve(); });
    expect(mock.instances[1].host.isConnected).toBe(false);
    expect(mock.instances[2].host.isConnected).toBe(true);
    expect(mock.instances[2].host.dataset.hidden).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(mock.instances[2].host.dataset.hidden).toBe("true");
  });
  it("falls back after localized rendering errors and exposes recovery when both scores fail", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(xml("Bad rendering"))).mockResolvedValueOnce(new Response(xml("English")))
      .mockResolvedValueOnce(new Response("missing", { status: 404 })).mockResolvedValueOnce(new Response("SPA"))
      .mockResolvedValueOnce(new Response(xml("Recovered")));
    vi.stubGlobal("fetch", fetcher);
    render(<ScoreViewer scorePath={itPath} matchedCount={2} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry localized score" }));
    const retry = await screen.findByRole("button", { name: "Try again" });
    fireEvent.click(retry);
    await screen.findByText(xml("Recovered"));
    expect(mock.instances.at(-1).host.dataset.position).toBe("2");
  });
  it("falls back on HTML 200, preserves position, explains fallback and retries localized score", async () => {
    await i18n.changeLanguage("it");
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("<!doctype html><html>SPA</html>"))
      .mockResolvedValueOnce(new Response(xml("English"))).mockResolvedValueOnce(new Response(xml("Italiano")));
    vi.stubGlobal("fetch", fetcher);
    render(<ScoreViewer scorePath={itPath} matchedCount={2} />);
    const retry = await screen.findByRole("button", { name: "Riprova lo spartito localizzato" });
    expect(screen.getByRole("status").textContent).toContain("corrispondente spartito inglese");
    expect(mock.instances[0].host.dataset.position).toBe("2");
    expect(fetcher.mock.calls.map(c => c[0])).toEqual([itPath, en]);
    fireEvent.click(retry);
    await screen.findByText(xml("Italiano"));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(mock.instances[1].host.dataset.position).toBe("2");
  });
});
