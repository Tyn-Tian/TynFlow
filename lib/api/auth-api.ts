import { LoginDto, UpdateProfileDto } from "@/types/auth-type";

export const authApi = {
    login: async (data: LoginDto) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || "Login failed");
        }
        return res.json();
    },
    logout: async () => {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
        });
        if (!res.ok) throw new Error("Logout failed");
        return res.json();
    },
    getProfile: async () => {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    },
    updateProfile: async (data: UpdateProfileDto) => {
        const res = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
    },
    getRangeDate: async () => {
        const res = await fetch("/api/auth/range");
        if (!res.ok) throw new Error("Failed to fetch range date");
        return res.json();
    },
    googleLogin: async () => {
        const res = await fetch("/api/auth/google-login", {
            method: "POST",
        });
        if (!res.ok) throw new Error("Google login failed");
        const { url } = await res.json();
        if (url) {
            window.location.href = url;
        }
    },
    forgotPassword: async (email: string) => {
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || "Forgot password failed");
        }
        return res.json();
    },
    resetPassword: async (password: string) => {
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || "Reset password failed");
        }
        return res.json();
    }
};
