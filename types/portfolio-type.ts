export type PortfolioType = "Reksadana" | "Saham" | "Crypto" | "Emas";

export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  target: number;
  invested: number;
  current_value: number;
};

export interface PortfolioDto {
  name: string;
  type: PortfolioType;
  target: number;
  invested: number;
  current_value: number;
}
