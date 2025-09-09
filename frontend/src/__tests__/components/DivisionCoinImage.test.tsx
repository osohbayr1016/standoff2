import { render, screen } from "@testing-library/react";
import DivisionCoinImage from "../../components/DivisionCoinImage";
import { SquadDivision } from "../../types/division";

describe("DivisionCoinImage", () => {
  it("renders bronze division coin", () => {
    render(<DivisionCoinImage division={SquadDivision.BRONZE} size={24} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Bronze Division");
  });

  it("renders silver division coin", () => {
    render(<DivisionCoinImage division={SquadDivision.SILVER} size={32} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Silver Division");
  });

  it("renders gold division coin", () => {
    render(<DivisionCoinImage division={SquadDivision.GOLD} size={40} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Gold Division");
  });

  it("renders diamond division coin", () => {
    render(<DivisionCoinImage division={SquadDivision.DIAMOND} size={48} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Diamond Division");
  });

  it("renders master division coin", () => {
    render(<DivisionCoinImage division={SquadDivision.MASTER} size={56} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Master Division");
  });

  it("renders grandmaster division coin", () => {
    render(
      <DivisionCoinImage division={SquadDivision.GRANDMASTER} size={64} />
    );
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Grandmaster Division");
  });

  it("applies correct size styling", () => {
    render(<DivisionCoinImage division={SquadDivision.GOLD} size={100} />);
    const img = screen.getByRole("img");
    expect(img).toHaveStyle({ width: "100px", height: "100px" });
  });
});
