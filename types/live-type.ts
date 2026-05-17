export type LiveType = "Lembur" | "Biasa";

export interface Live {
  id: string;
  date: string;
  type: LiveType;
  tiktok: number;
  shopee: number;
};

export interface LiveDto {
  date: string;
  type: LiveType;
  tiktok: number;
  shopee: number;
}
