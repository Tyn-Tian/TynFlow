import { AppSidebar } from "@/components/app-sidebar";
import NotificationRegister from "@/components/NotificationRegister";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AuthLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                {children}
                <NotificationRegister />
            </SidebarInset>
        </SidebarProvider>
    )
}