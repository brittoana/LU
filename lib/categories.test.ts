import { describe, expect, it } from "vitest";
import { normalizeCategory } from "./categories";

describe("normalizeCategory", () => {
  it("remove espaços extras e normaliza capitalização", () => {
    expect(normalizeCategory("  alimentação   ")).toBe("Alimentação");
  });

  it("evita categoria vazia", () => {
    expect(normalizeCategory("   ")).toBe("Sem categoria");
  });
});
