import React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CloudSun,
    CreditCard,
    ClipboardList,
    Zap,
    Scale,
    FileText,
    BarChart,
    ReceiptText,
    Fan,
    Settings,
    ChevronRight,
    Wind,
    Activity,
    Users,
    PieChart,
    LogOut,
    ShieldCheck,
    Layers
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state, setOpen } = useSidebar();

    const handleLogout = async () => {
        const token = localStorage.getItem("access_token");
        const sessionId = localStorage.getItem("session_id");

        // Clear all session data immediately for UI responsiveness
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("session_id");

        // Call logout endpoint in the background
        if (token) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ session_id: sessionId ? parseInt(sessionId) : null }),
            }).catch(err => console.warn("Background logout call failed", err));
        }

        // Hard redirect to login to ensure clean state
        window.location.href = "/energymatrix/uat/login";
    };

    // RBAC: Get user rights from localStorage
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const rights = user?.rights || [];

    const allItems = [
        {
            title: "Master",
            url: "#",
            icon: Settings,
            items: [
                {
                    title: "Transmission Loss",
                    url: "/master/transmission-loss",
                    icon: Activity,
                },
                {
                    title: "EDC Circle",
                    url: "/master/edc-circle",
                    icon: ClipboardList,
                },
                {
                    title: "Capacity",
                    url: "/master/capacity",
                    icon: Zap,
                },
                {
                    title: "Windmill",
                    url: "/master/windmill",
                    icon: Wind,
                },
                {
                    title: "Customers",
                    url: "/master/customers",
                    icon: Users,
                },
                {
                    title: "Company Shares",
                    url: "/master/company-shares",
                    icon: PieChart,
                },
                {
                    title: "Investors",
                    url: "/master/investors",
                    icon: Users,
                },
                {
                    title: "Share Holdings",
                    url: "/master/share-holdings",
                    icon: PieChart,
                },

                {
                    title: "Consumption Charges",
                    url: "/master/consumption-charges",
                    icon: Zap,
                },
                {
                    title: "Email",
                    url: "/master/email",
                    icon: Zap,
                },

            ]
        },
        {
            title: "Windmill",
            url: "#",
            icon: Fan,
            items: [
                {
                    title: "Daily Generation",
                    url: "/windmill",
                    icon: CloudSun,
                },
                {
                    title: "EB Statement",
                    url: "/eb-statement",
                    icon: FileText,
                },
                {
                    title: "Cust Cons Req",
                    url: "/consumption-request",
                    icon: ClipboardList,
                },
                {
                    title: "Energy Allotment",
                    url: "/energy-allotment",
                    icon: Zap,
                },
                {
                    title: "Client EB Bill",
                    url: "/windmill/eb-bill",
                    icon: CreditCard,
                },
                {
                    title: "Actual Allotment",
                    url: "/windmill/actuals",
                    icon: CreditCard,
                },
                {
                    title: "Client Invoice",
                    url: "/windmill/client-invoice",
                    icon: ReceiptText,
                },
            ]
        },
        {
            title: "Solar",
            url: "#",
            icon: CloudSun,
            items: [
                {
                    title: "EB Statement-Solar",
                    url: "/eb-statement-solar",
                    icon: CreditCard,
                },
            ]
        },
        {
            title: "Reports",
            url: "#",
            icon: FileText,
            items: [
                {
                    title: "Banking",
                    url: "/reports/banking",
                    icon: CreditCard,
                },
            ]
        },
        {
            title: "Logs",
            url: "#",
            icon: ShieldCheck,
            items: [
                {
                    title: "User Sessions",
                    url: "/admin/sessions",
                    icon: Users,
                },
                {
                    title: "Error Logs",
                    url: "/admin/error-logs",
                    icon: Layers,
                },
            ]
        },
    ];

    // Filter items based on can_read permission
    const items = allItems.map(group => {
        const filteredSubItems = group.items.filter(subItem => {
            // Find the right for this screen
            // Normalize: lowercase, remove dashes, remove extra spaces
            const normalize = (s: string) => s.toLowerCase().replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
            const right = rights.find((r: any) =>
                normalize(r.screen_name) === normalize(subItem.title)
            );
            return right ? right.can_read === 1 : false;
        });

        return {
            ...group,
            items: filteredSubItems
        };
    }).filter(group => group.items.length > 0);

    const isChildActive = (itemItems: any[]) => {
        return itemItems?.some(subItem =>
            subItem.url === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(subItem.url)
        );
    };

    return (
        <Sidebar collapsible="icon" className="border-r-sidebar-border/50">
            <SidebarHeader className="border-b border-sidebar-border/50 px-6 py-4 bg-sidebar-accent/30 group-data-[collapsible=icon]:px-2">
                <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
                    {/* clicking logo clears token and sends to login */}
                    <button
                        onClick={handleLogout}
                        className="text-xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden text-left"
                    >
                        EnergyMatrix
                    </button>
                    <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-sidebar">
                <SidebarGroup className="pt-0">
                    <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                        {items.map((item) => (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isChildActive(item.items)}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className="h-11 hover:bg-sidebar-accent/50 text-sidebar-foreground data-[state=open]:bg-sidebar-accent/40 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                                            onClick={() => {
                                                if (state === "collapsed") {
                                                    setOpen(true);
                                                }
                                            }}
                                        >
                                            <div className="p-1.5 rounded-md bg-white/10">
                                                <item.icon className="w-4 h-4 text-sidebar-foreground" />
                                            </div>
                                            <span className="font-semibold group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l-0 ml-0 pl-4 pr-2 space-y-1 mt-1">
                                            {item.items?.map((subItem: any) => {
                                                const splitPath = location.pathname.split('/');
                                                const splitUrl = subItem.url.split('/');
                                                const isActive = subItem.url === "/"
                                                    ? location.pathname === "/"
                                                    : location.pathname === subItem.url ||
                                                    (location.pathname.startsWith(subItem.url + "/") && splitPath[splitUrl.length] !== 'eb-bill' && splitPath[splitUrl.length] !== 'client-invoice' && splitPath[splitUrl.length] !== 'actuals') && subItem.url !== "#";

                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isActive}
                                                            className={cn(
                                                                "h-9 rounded-lg transition-all duration-200",
                                                                isActive
                                                                    ? "bg-white/20 text-white shadow-sm"
                                                                    : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white"
                                                            )}
                                                        >
                                                            <Link to={subItem.url} className="flex items-center gap-3" onClick={() => {
                                                                if (subItem.title === "Energy Allotment" || subItem.title === "Banking") {
                                                                    setOpen(false);
                                                                }
                                                            }}>
                                                                <subItem.icon className={cn(
                                                                    "w-4 h-4 transition-colors",
                                                                    isActive ? "text-white" : "text-sidebar-foreground/60"
                                                                )} />
                                                                <span className="font-medium">
                                                                    {subItem.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* logout button at bottom */}
                <SidebarGroup className="mt-auto">
                    <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                className="h-11 hover:bg-red-600/20 text-sidebar-foreground group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                            >
                                <div className="p-1.5 rounded-md bg-white/10">
                                    <LogOut className="w-4 h-4 text-sidebar-foreground" />
                                </div>
                                <span className="font-semibold group-data-[collapsible=icon]:hidden">Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <div className="px-4 py-2 text-xs text-sidebar-foreground/70 text-center group-data-[collapsible=icon]:hidden">
                        version 1.1.37
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
