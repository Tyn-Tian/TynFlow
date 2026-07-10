import { createClient } from "@/lib/supabase/client";

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL!;
    }

    private async getAuthHeader(): Promise<Record<string, string>> {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {};
        }

        return { Authorization: `Bearer ${session.access_token}` };
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const authHeader = await this.getAuthHeader();

        const res = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...authHeader,
                ...options.headers,
            },
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => null);
            throw new Error(errorBody?.message || `Something went wrong...`);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : (null as T);
    }

    get<T>(path: string) {
        return this.request<T>(path, { method: "GET" });
    }

    post<T>(path: string, body: unknown) {
        return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
    }

    put<T>(path: string, body: unknown) {
        return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) });
    }

    patch<T>(path: string, body?: unknown) {
        return this.request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
    }

    delete<T>(path: string) {
        return this.request<T>(path, { method: "DELETE" });
    }
}

export const apiClient = new ApiClient();