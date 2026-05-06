import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield,
  Package,
  Users,
  Search,
  Settings,
  User as UserIcon,
  Wrench,
  FileText,
  RotateCcw,
  LayoutGrid,
  ClipboardList,
  Radio,
  Languages,
  ClipboardCheck,
  Layers,
  LogOut,
  ChevronUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, translations, LanguageContext } from "@/lib/language";

export { useLanguage };

export default function Layout({ children }) {
  const location = useLocation();
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') || 'en';
    setLanguage(savedLanguage);
    setIsRTL(savedLanguage === 'he');
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'he');
    localStorage.setItem('app-language', newLanguage);
  };

  const t = translations[language];

  const handleLogout = async () => {
    if (confirm(t.confirmLogout)) {
      try {
        window.location.href = createPageUrl("Login");
      } catch (error) {
        console.error("Error logging out:", error);
        alert(t.errorLoggingOut);
      }
    }
  };

  const navigationItems = [
    { title: t.dashboard, url: createPageUrl("Dashboard"), icon: Shield },
    { title: t.assignmentTool, url: createPageUrl("AssignmentTool"), icon: Search },
    { title: t.returnTool, url: createPageUrl("ReturnTool"), icon: RotateCcw },
  ];

  const controlTableItems = [
    { title: t.weaponControlTable, url: createPageUrl("WeaponControlTable"), icon: LayoutGrid },
    { title: t.equipmentControlTable, url: createPageUrl("EquipmentControlTable"), icon: ClipboardList },
    { title: t.amralControlTable, url: createPageUrl("AmralControlTable"), icon: Radio },
  ];

  const systemToolsItems = [
    { title: t.equipment, url: createPageUrl("Equipment"), icon: Package },
    { title: t.inventory, url: createPageUrl("Inventory"), icon: Layers },
    { title: t.soldiers, url: createPageUrl("Soldiers"), icon: Users },
    { title: t.supplantingItems, url: createPageUrl("SupplantingItems"), icon: ClipboardCheck },
    { title: t.staffIssueTool, url: createPageUrl("StaffIssueTool"), icon: ClipboardCheck },
    { title: t.bulkRepairTool, url: createPageUrl("BulkRepairTool"), icon: Wrench },
    { title: t.dataHealth, url: createPageUrl("DataHealth"), icon: Wrench },
    { title: t.documentGenerator, url: createPageUrl("DocumentGenerator"), icon: FileText },
    { title: t.settings, url: createPageUrl("Settings"), icon: Settings },
  ];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      <div className={`flex min-h-screen w-full bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <SidebarProvider>
          <Sidebar side={isRTL ? 'right' : 'left'} className={`border-slate-200 bg-white ${isRTL ? 'border-l' : 'border-r'}`}>
            <SidebarHeader className="border-b border-slate-200 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900 text-base md:text-lg truncate">{t.appName}</h2>
                    <p className="text-xs text-slate-500 hidden md:block">{t.appSubtitle}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-xs font-medium">{language === 'en' ? 'עב' : 'EN'}</span>
                </Button>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2 md:p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2">
                  {t.navigation}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2.5">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm md:text-base truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2 mt-4">
                  {t.managementViews}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {controlTableItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2.5">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm md:text-base truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2 mt-4">
                  {t.systemTools}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {systemToolsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2.5">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm md:text-base truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 p-3 md:p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 md:gap-3 w-full text-left hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-xs md:text-sm truncate">{t.adminUser}</p>
                      <p className="text-xs text-slate-500 truncate hidden md:block">{t.equipmentManager}</p>
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("UserProfile")} className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {t.myProfile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Settings")} className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {t.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col min-w-0">
            <header className="bg-white border-b border-slate-200 px-4 py-3 md:hidden">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-slate-100 p-3 rounded-xl transition-colors duration-200 border border-slate-200 bg-slate-50 min-w-[44px] min-h-[44px] flex items-center justify-center" />
                <h1 className="text-lg font-bold text-slate-900">{t.appName}</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </SidebarInset>
      </SidebarProvider>
      </div>
    </LanguageContext.Provider>

  );
}