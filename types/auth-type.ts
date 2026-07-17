export interface LoginDto {
  email: string;
  password: string;
}

export interface Profile {
  userId: string;
  email: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  menu: string[]
}

export interface ProfileDto {
  name?: string;
  start_date?: string | null;
  end_date?: string | null;
}