'use client';
import { BookType, ChevronRight } from 'lucide-react';

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
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { NavUser } from './nav-user';
import { sideBarList } from '@/constant/app-menu';
import { usePathname } from 'next/navigation';
import { useMe } from '@/hooks/use-me';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';

export function AppSidebar() {
  const pathname = usePathname();

  const { data: user } = useMe();
  const language = useUiStore((state) => state.language);
  const sidebarLabels = LANGUAGE_MAP[language].sidebar.nav;
  const menuItems = sideBarList();

  const isActive = (url?: string) => !!url && pathname === url;
  const bgColor = 'bg-primary/30';

  const isParentActive = (base: string) => pathname.startsWith(base);
  return (
    <Sidebar
      collapsible="icon"
      className="
    [--sidebar-width:220px]
    [--sidebar-width-icon:56px]
  "
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BookType className="size-4" fill="grey" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <p className="text-xl">
                    <b>
                      <i>Keuanganku</i>
                    </b>
                  </p>
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
              {menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;

                if (!hasChildren) {
                  return (
                    <SidebarMenuItem key={item.labelKey}>
                      <SidebarMenuButton
                        tooltip={sidebarLabels[item.labelKey]}
                        asChild
                        data-active={isActive(item.url) ? '' : undefined}
                      >
                        <Link
                          href={item.url ?? '#'}
                          className={`${isActive(item.url) ? bgColor : 'bg-transparent'}`}
                          aria-current={isActive(item.url) ? 'page' : undefined}
                        >
                          {item.icon ? <item.icon /> : null}
                          <span>{sidebarLabels[item.labelKey]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Collapsible parent (e.g., "Investment")
                const base =
                  item.children![0].url!.split('/').slice(0, 2).join('/') ||
                  '/investment';
                const openByPath = isParentActive(base);

                return (
                  <SidebarMenuItem key={item.labelKey}>
                    <Collapsible defaultOpen={openByPath}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="group"
                          data-active={openByPath ? '' : undefined}
                        >
                          {item.icon ? <item.icon /> : null}
                          <span>{sidebarLabels[item.labelKey]}</span>

                          <ChevronRight
                            className="
                  ml-auto
                  transition-transform
                  group-data-[state=open]:rotate-90
      "
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children!.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton
                                asChild
                                data-active={
                                  isActive(child.url) ? '' : undefined
                                }
                              >
                                <Link className={`${isActive(child.url) ? bgColor : 'bg-transparent'}`}
                                  href={child.url}
                                  aria-current={
                                    isActive(child.url) ? 'page' : undefined
                                  }
                                >
                                  {child.icon ? <child.icon /> : null}
                                  <span>{sidebarLabels[child.labelKey]}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
    </Sidebar>
  );
}
