export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  start_date?: string | null;
  end_date?: string | null;
}