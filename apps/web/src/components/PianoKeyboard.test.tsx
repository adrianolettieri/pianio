import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { initializeI18n, i18n } from "../i18n";
import { PianoKeyboard } from "./PianoKeyboard";

describe("PianoKeyboard note labels", () => {
  it("keeps the C labels visible and updates their spelling with the active language", async () => {
    await initializeI18n("it");
    render(<PianoKeyboard />);
    expect(screen.getByText("Do2")).toBeTruthy();
    await act(async () => { await i18n.changeLanguage("en"); });
    expect(screen.getByText("C2")).toBeTruthy();
  });
});
