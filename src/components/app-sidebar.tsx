"use client"
import { ChevronRight, Command } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "@/components/ui/sidebar"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { sideBarList } from "@/constant/app-menu"
import { usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

export function AppSidebar() {
     const pathname = usePathname()
    const user = {
        name: "Test User",
        email: "test@gmail.com",
        avatar: "https://www.flaticon.com/free-icon/man-avatar_5556468",
    }
    const isActive = (url?: string) => !!url && pathname === url
    const isParentActive = (base: string) => pathname.startsWith(base)
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Keuanganku</span>

                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sideBarList.map((item) => {
                                const hasChildren = item.children && item.children.length > 0

                                if (!hasChildren) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild data-active={isActive(item.url) ? "" : undefined}>
                                                <Link href={item.url ?? "#"} aria-current={isActive(item.url) ? "page" : undefined}>
                                                    {item.icon ? <item.icon /> : null}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }

                                // Collapsible parent (e.g., "Investment")
                                const base = item.children![0].url!.split("/").slice(0, 2).join("/") || "/investment"
                                const openByPath = isParentActive(base)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <Collapsible defaultOpen={openByPath}>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton data-active={openByPath ? "" : undefined}>
                                                    {item.icon ? <item.icon /> : null}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform data-[state=open]:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.children!.map((child) => (
                                                        <SidebarMenuSubItem key={child.url}>
                                                            <SidebarMenuSubButton asChild data-active={isActive(child.url) ? "" : undefined}>
                                                                <Link href={child.url} aria-current={isActive(child.url) ? "page" : undefined}>
                                                                {child.icon ? <child.icon /> : null}
                                                                    <span>{child.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>

        </Sidebar>
    )
}