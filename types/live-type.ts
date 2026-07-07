export type LiveType = "Lembur" | "Biasa";

export interface Live {
  id: string;
  date: string;
  type: LiveType;
  tiktok: number;
  shopee: number;
  remark?: string;
  created_at?: string;
};

export interface LiveDto {
  date: string;
  type: LiveType;
  tiktok: number;
  shopee: number;
  remark?: string;
  created_at?: string;
}
