export interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

export interface WalletDto {
  name: string;
  type: string;
  balance: number;
}