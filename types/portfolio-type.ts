export type PortfolioType = "Reksadana" | "Saham" | "Crypto" | "Emas" | "Obligasi";

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

export interface PortfolioSnapshot {
  id: string;
  created_at: string;
  invested: number;
  current_value: number;
  user_id: string;
}
