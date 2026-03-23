import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield,
  Package,
  Users,
  Search,
  Settings,
  User as UserIcon, // Rename this to avoid conflict
  Wrench,
  FileText,
  RotateCcw,
  LayoutGrid,
  ClipboardList,
  Radio,
  Languages,
  ClipboardCheck,
  Layers, // New icon
  LogOut, // Add LogOut icon
  ChevronUp // Add ChevronUp icon
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

// Translations
const _translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    equipment: "Equipment",
    soldiers: "Soldiers",
    assignmentTool: "Assignment Tool",
    importData: "Import Data",
    // System Tools
    systemTools: "System Tools",
    inventory: "Inventory",
    dataHealth: "Data Health",
    documentGenerator: "Document Generator",
    returnTool: "Return Tool",
    staffIssueTool: "Staff Issue Tool",
    bulkRepairTool: "Bulk Repair Tool",
    settings: "Settings",
    // Management Views
    managementViews: "Management Views",
    weaponControlTable: "Weapon Control Table",
    equipmentControlTable: "Equipment Control Table",
    amralControlTable: "Amral Control Table",
    // App Info
    appName: "EquipTrack",
    appSubtitle: "Military Equipment Management",
    adminUser: "Admin User",
    equipmentManager: "Equipment Manager",
    // Navigation group
    navigation: "Navigation",

    // Assignment Tool
    assignmentToolTitle: "Assignment Tool",
    assignmentToolSubtitle: "Manage equipment assignments for soldiers",
    stepFindSoldier: "Find Soldier",
    stepEditDetails: "Edit Details",
    stepEquipmentManagement: "Manage Equipment",

    // Soldier Search
    findSoldier: "Find Soldier",
    searchByNameIdPlatoon: "Search by name, ID, or platoon...",
    addNewSoldier: "Add New Soldier",
    noSoldiersFound: "No soldiers found.",

    // Soldier Details Edit
    editSoldierInfo: "Edit Soldier Information",
    saveAndContinue: "Save & Continue",
    saving: "Saving...",
    backToSearch: "Back to Search",
    soldierId: "Soldier ID",
    fullName: "Full Name",
    rank: "Rank",
    platoon: "Platoon",
    squad: "Squad",
    phone: "Phone",
    email: "Email",
    warningIdChange: "Warning: Changing the soldier ID will affect existing records.",
    originalId: "Original ID",

    // Equipment Manager
    issuedEquipmentTitle: "Issued Equipment for",
    previouslyUsedEquipment: "Previously Used Equipment (In Storage)",
    previouslyAssignedTo: (name) => `This equipment was previously assigned to ${name} and is now in storage.`,
    issueNewOrReissue: "Issue New or Re-issue",
    changeStatus: "Change Status",
    returnToStorage: "Return to Storage",
    sendForRepair: "Send for Repair",
    reIssue: "Re-issue",
    issue: "Issue",
    back: "Back",
    getSignatureAndComplete: "Get Signature & Complete",
    processing: "Processing...",
    noEquipmentIssued: "No equipment currently issued.",
    loadingHistory: "(loading...)",
    loadingHistoricalAssignments: "Loading assignment history...",
    noPreviouslyUsedInStorage: "No previously used equipment found in storage.",
    searchAllOtherEquipment: "Search all other available equipment...",
    noOtherEquipmentMatch: "No other equipment matches your search.",
    noOtherEquipmentAvailable: "No other equipment available to issue.",
    issueEquipmentToSign: "Issue equipment to get a signature.",
    supplantingItems: "Supplanting Items",
    addSupplantingItem: "Add supplanting item...",
    warningItemIssued: (currentHolder, newHolder) => `Warning: This item is currently issued to ${currentHolder}. Are you sure you want to issue it to ${newHolder}? This will automatically clear the previous holder.`,
    warningItemRepair: (newHolder) => `Warning: This item is in repair. Are you sure you want to issue it to ${newHolder}?`,
    confirmRevert: (count) => `You have ${count} unsigned assignments. Leaving this screen will revert the changes. Are you sure?`,
    noInventoryToAssign: "No inventory available to assign.",

    // Digital Signature
    signOffTitle: "Equipment Assignment Sign-off",
    acknowledgeEquipment: "Equipment to Acknowledge",
    soldierSignature: "Soldier Signature",
    witnessName: "Witness Name (Optional)",
    witnessSignature: "Witness Signature",
    completeAssignment: "Complete Assignment",
    cancel: "Cancel",
    error: "Error",
    soldierSignatureRequired: "Soldier signature is required.",

    // Return Tool
    returnToolTitle: "Equipment Return Tool",
    returnToolSubtitle: "Return equipment to storage and generate clearance receipts",
    searchEquipmentOrSoldier: "Search equipment or soldier...",
    allPlatoons: "All Platoons",
    allSoldiers: "All Soldiers",
    allConditions: "All Conditions",
    selectAll: "Select All",
    items: "items",
    selected: "selected",
    clearSelection: "Clear Selection",
    returnNItems: (n) => `Return ${n} Items`,
    returnItems: "Return Items",
    issuedEquipment: "Issued Equipment",
    issuedTo: "Issued to",
    condition: "Condition",
    issued: "Issued",
    noIssuedEquipmentFound: "No issued equipment found.",
    tryAdjustingFilters: "Try adjusting the filters.",
    confirmReturnNItems: (n) => `Are you sure you want to return ${n} equipment items to storage and send clearance notifications?`,
    successfullyReturnedNItems: (n) => `Successfully returned ${n} items to storage. Clearance receipts have been sent where applicable.`,
    errorProcessingReturns: "Error processing returns. Please try again.",
    
    // Equipment Tool
    equipmentManagement: "Equipment Management",
    equipmentManagementSubtitle: "Track and manage all military equipment",
    addEquipment: "Add Equipment",
    exportReport: "Export Report",
    searchEquipmentByNameSerialHolder: "Search by equipment name, serial number, or current holder...",
    status: "Status",
    allStatuses: "All Statuses",
    storage: "Storage",
    repair: "Repair",
    noEquipmentFound: "No equipment found.",
    tryAdjustingSearch: "Try adjusting your search or filters.",
    viewDetails: "View Details",
    equipmentDetails: "Equipment Details",
    selectItemToSeeDetails: "Select an item from the list to see its details.",
    serialNumber: "Serial Number",
    category: "Category",
    acquisitionDate: "Acquisition Date",
    lastMaintenance: "Last Maintenance",
    currentHolder: "Current Holder",
    noHolder: "No holder",
    notes: "Notes",
    noNotesProvided: "No notes provided.",
    updateEquipment: "Update Equipment",
    assignmentHistory: "Assignment History",
    noAssignmentHistory: "No assignment history found for this item.",
    from: "From",
    to: "To",
    addNewEquipment: "Add New Equipment",
    creating: "Creating...",
    createEquipment: "Create Equipment",
    issueEquipment: "Issue Equipment",
    selectSoldierToIssue: "Select soldier to issue to",
    searchForSoldier: "Search for soldier...",
    issuing: "Issuing...",
    completeIssuance: "Complete Issuance",

    // Soldiers Tool
    soldierManagement: "Soldier Management",
    soldierManagementSubtitle: "Manage soldier profiles and their equipment assignments",
    inviteAllSoldiers: "Invite All Soldiers",
    sendingInvitations: "Sending invitations...",
    addSoldier: "Add Soldier",
    exportList: "Export List",
    searchSoldiersByNameIdPlatoon: "Search by name, ID, or platoon...",
    noSoldiersFoundMatchingSearch: "No soldiers found matching your search.",
    addNewSoldierToStart: "Add a new soldier to get started.",
    soldierDetails: "Soldier Details",
    selectSoldierToSeeDetails: "Select a soldier from the list to see their details.",
    editProfile: "Edit Profile",
    activeEquipment: "Active Equipment",
    soldierHasNoEquipment: "This soldier has no equipment assigned.",
    equipmentName: "Equipment Name",
    serial: "S/N",
    assigned: "Assigned",
    editSoldierProfile: "Edit Soldier Profile",
    saveChanges: "Save Changes",

    // Inventory Tool
    inventoryManagement: "Inventory Management",
    inventoryManagementSubtitle: "Manage non-serialized equipment stock",
    addNewInventoryItem: "Add New Inventory Item",
    searchInventoryByNameOrCategory: "Search by item name or category...",
    inventoryStock: "Inventory Stock",
    adjustQuantity: "Adjust Quantity",
    availability: "Availability",
    noInventoryItemsFound: "No inventory items found.",
    addNewInventoryItemToStart: "Add a new inventory item to get started.",
    itemName: "Item Name",
    initialQuantity: "Initial Quantity",
    createItem: "Create Item",
    adjustQuantityFor: "Adjust quantity for",
    currentTotal: "Current Total",
    currentlyAvailable: "Currently Available",
    currentlyIssued: "Currently Issued",
    newTotalQuantity: "New Total Quantity",
    updating: "Updating...",
    updateQuantity: "Update Quantity",
    inventoryDetails: "Inventory Details",
    selectInventoryItemToSeeDetails: "Select an inventory item to see details.",
    totalQuantity: "Total Quantity",
    availableQuantity: "Available Quantity",
    noAssignmentHistoryForItem: "No assignment history for this item.",

    // New for Logout
    myProfile: "My Profile",
    confirmLogout: "Are you sure you want to log out?",
    errorLoggingOut: "Error logging out. Please try again.",
    signOut: "Sign Out",
  },
  he: {
    // Navigation
    dashboard: "לוח בקרה",
    equipment: "ציוד",
    soldiers: "חיילים",
    assignmentTool: "כלי החתמה",
    importData: "יבוא נתונים",
    // System Tools
    systemTools: "כלי מערכת",
    inventory: "מלאי", // New translation
    dataHealth: "תקינות נתונים",
    documentGenerator: "מחולל מסמכים",
    returnTool: "כלי החזרה",
    staffIssueTool: "החתמת סגל",
    bulkRepairTool: "שליחה לתיקון",
    settings: "הגדרות",
    // Management Views
    managementViews: "תצוגות ניהול",
    weaponControlTable: "טבלת שליטה נשק",
    equipmentControlTable: "טבלת שליטה אמצעים",
    amralControlTable: "טבלת שליטה אמר״ל",
    // App Info
    appName: "EquipTrack",
    appSubtitle: "ניהול ציוד צבאי",
    adminUser: "משתמש מנהל",
    equipmentManager: "מנהל ציוד",
    // Navigation group
    navigation: "ניווט",

    // Assignment Tool
    assignmentToolTitle: "כלי החתמה",
    assignmentToolSubtitle: "ניהול החתמות ציוד לחיילים",
    stepFindSoldier: "חיפוש חייל",
    stepEditDetails: "עריכת פרטים",
    stepEquipmentManagement: "ניהול ציוד",

    // Soldier Search
    findSoldier: "מצא חייל",
    searchByNameIdPlatoon: "חפש לפי שם, מ.א, או פלוגה...",
    addNewSoldier: "הוסף חייל חדש",
    noSoldiersFound: "לא נמצאו חיילים.",

    // Soldier Details Edit
    editSoldierInfo: "עריכת פרטי חייל",
    saveAndContinue: "שמור והמשך",
    saving: "שומר...",
    backToSearch: "חזור לחיפוש",
    soldierId: "מספר אישי",
    fullName: "שם מלא",
    rank: "דרגה",
    platoon: "פלוגה",
    squad: "מחלקה",
    phone: "טלפון",
    email: "אימייל",
    warningIdChange: "אזהרה: שינוי המספר האישי ישפיע על רשומות קיימות.",
    originalId: "מ.א מקורי",

    // Equipment Manager
    issuedEquipmentTitle: "ציוד מוצמד של",
    previouslyUsedEquipment: "ציוד שהיה בשימוש בעבר ונמצא במחסן",
    previouslyAssignedTo: (name) => `ציוד זה הוצמד בעבר ל${name} וכעת זמין במחסן.`,
    issueNewOrReissue: "הצמד חדש או הצמד מחדש",
    changeStatus: "שנה סטטוס",
    returnToStorage: "החזר למחסן",
    sendForRepair: "שלח לתיקון",
    reIssue: "הצמד מחדש",
    issue: "הצמד",
    back: "חזור",
    getSignatureAndComplete: "קבל חתימה וסיים",
    processing: "מעבד...",
    noEquipmentIssued: "אין ציוד מוצמד כעת",
    loadingHistory: "(טוען...)",
    loadingHistoricalAssignments: "טוען היסטוריית החתמות...",
    noPreviouslyUsedInStorage: "לא נמצא ציוד שהיה בשימוש בעבר במחסן",
    searchAllOtherEquipment: "חפש בכל הציוד הזמין...",
    noOtherEquipmentMatch: "לא נמצא ציוד אחר התואם לחיפושך",
    noOtherEquipmentAvailable: "אין ציוד אחר זמין להצמדה",
    issueEquipmentToSign: "הצמד ציוד כדי לקבל חתימה",
    supplantingItems: "פריטים נלווים",
    addSupplantingItem: "הוסף פריט נלווה...",
    warningItemIssued: (currentHolder, newHolder) => `אזהרה: פריט זה מוצמד כעת ל${currentHolder}. האם אתה בטוח שברצונך להצמיד אותו ל${newHolder}? פעולה זו תזכה את המחזיק הקודם באופן אוטומטי.`,
    warningItemRepair: (newHolder) => `אזהרה: פריט זה נמצא בתיקון. האם אתה בטוח שברצונך להצמיד אותו ל${newHolder}?`,
    confirmRevert: (count) => `יש לך ${count} הצמדות שלא נחתמו. יציאה ממסך זה תבטל את השינויים. האם אתה בטוח?`,
    noInventoryToAssign: "אין מלאי זמין להצמדה.",

    // Digital Signature
    signOffTitle: "אישור וחתימה על הצמדת ציוד",
    acknowledgeEquipment: "ציוד לאישור",
    soldierSignature: "חתימת חייל",
    witnessName: "שם העד (אופציונלי)",
    witnessSignature: "חתימת העד",
    completeAssignment: "סיים הצמדה",
    cancel: "ביטול",
    error: "שגיאה",
    soldierSignatureRequired: "נדרשת חתימת חייל.",

    // Return Tool
    returnToolTitle: "כלי החזרת ציוד",
    returnToolSubtitle: "החזר ציוד למחסן והפק אישורי זיכוי",
    searchEquipmentOrSoldier: "חפש ציוד או חייל...",
    allPlatoons: "כל הפלוגות",
    allSoldiers: "כל החיילים",
    allConditions: "כל המצבים",
    selectAll: "בחר הכל",
    items: "פריטים",
    selected: "נבחרו",
    clearSelection: "נקה בחירה",
    returnNItems: (n) => `החזר ${n} פריטים`,
    returnItems: "החזר פריטים",
    issuedEquipment: "ציוד מוצמד",
    issuedTo: "מוצמד ל",
    condition: "מצב",
    issued: "מוצמד",
    noIssuedEquipmentFound: "לא נמצא ציוד מוצמד",
    tryAdjustingFilters: "נסה לשנות את המסננים",
    confirmReturnNItems: (n) => `האם להחזיר ${n} פריטי ציוד למחסן ולשלוח התראות זיכוי?`,
    successfullyReturnedNItems: (n) => `החזרה של ${n} פריטים למחסן בוצעה בהצלחה. אישורי זיכוי נשלחו במייל במידת האפשר.`,
    errorProcessingReturns: "שגיאה בעיבוד ההחזרות. אנא נסה שוב.",
    
    // Equipment Tool
    equipmentManagement: "ניהול ציוד",
    equipmentManagementSubtitle: "מעקב וניהול כל הציוד הצבאי",
    addEquipment: "הוסף ציוד",
    exportReport: "יצא דוח",
    searchEquipmentByNameSerialHolder: "חפש לפי שם ציוד, מספר סידורי, או שם חייל מוצמד...",
    status: "סטטוס",
    allStatuses: "כל הסטטוסים",
    storage: "מחסן",
    repair: "תיקון",
    noEquipmentFound: "לא נמצא ציוד.",
    tryAdjustingSearch: "נסה לשנות את החיפוש או המסננים.",
    viewDetails: "צפה בפרטים",
    equipmentDetails: "פרטי ציוד",
    selectItemToSeeDetails: "בחר פריט מהרשימה כדי לראות את פרטיו.",
    serialNumber: "מספר סידורי",
    category: "קטגוריה",
    acquisitionDate: "תאריך רכישה",
    lastMaintenance: "תחזוקה אחרונה",
    currentHolder: "מחזיק נוכחי",
    noHolder: "אין מחזיק",
    notes: "הערות",
    noNotesProvided: "אין הערות.",
    updateEquipment: "עדכן ציוד",
    assignmentHistory: "היסטוריית הצמדות",
    noAssignmentHistory: "לא נמצאה היסטוריית הצמדות לפריט זה.",
    loadingHistory: "טוען היסטוריה...",
    from: "מ-",
    to: "עד",
    addNewEquipment: "הוסף ציוד חדש",
    creating: "יוצר...",
    createEquipment: "צור ציוד",
    issueEquipment: "הצמד ציוד",
    selectSoldierToIssue: "בחר חייל להצמדה",
    searchForSoldier: "חפש חייל...",
    issuing: "מצמיד...",
    completeIssuance: "סיים הצמדה",

    // Soldiers Tool
    soldierManagement: "ניהול חיילים",
    soldierManagementSubtitle: "נהל פרופילי חיילים והצמדות ציוד",
    inviteAllSoldiers: "הזמן את כל החיילים",
    sendingInvitations: "שולח הזמנות...",
    addSoldier: "הוסף חייל",
    exportList: "יצא רשימה",
    searchSoldiersByNameIdPlatoon: "חפש לפי שם, מ.א, או פלוגה...",
    noSoldiersFoundMatchingSearch: "לא נמצאו חיילים התואמים לחיפושך.",
    addNewSoldierToStart: "הוסף חייל חדש כדי להתחיל.",
    soldierDetails: "פרטי חייל",
    selectSoldierToSeeDetails: "בחר חייל מהרשימה כדי לראות את פרטיו.",
    editProfile: "ערוך פרופיל",
    activeEquipment: "ציוד פעיל",
    soldierHasNoEquipment: "לחייל זה אין ציוד מוצמד.",
    equipmentName: "שם ציוד",
    serial: "מ.ס",
    assigned: "הוצמד",
    editSoldierProfile: "ערוך פרופיל חייל",
    saveChanges: "שמור שינויים",

    // Inventory Tool
    inventoryManagement: "ניהול מלאי",
    inventoryManagementSubtitle: "נהל מלאי של ציוד לא ממוספר",
    addNewInventoryItem: "הוסף פריט מלאי חדש",
    searchInventoryByNameOrCategory: "חפש לפי שם פריט או קטגוריה...",
    inventoryStock: "מלאי",
    adjustQuantity: "התאם כמות",
    availability: "זמינות",
    noInventoryItemsFound: "לא נמצאו פריטי מלאי.",
    addNewInventoryItemToStart: "הוסף פריט מלאי חדש כדי להתחיל.",
    itemName: "שם פריט",
    initialQuantity: "כמות התחלתית",
    createItem: "צור פריט",
    adjustQuantityFor: "התאם כמות עבור",
    currentTotal: "סך הכל נוכחי",
    currentlyAvailable: "זמין כעת",
    currentlyIssued: "מוצמד כעת",
    newTotalQuantity: "כמות כוללת חדשה",
    updating: "מעדכן...",
    updateQuantity: "עדכן כמות",
    inventoryDetails: "פרטי מלאי",
    selectInventoryItemToSeeDetails: "בחר פריט מלאי כדי לראות את פרטיו.",
    totalQuantity: "כמות כוללת",
    availableQuantity: "כמות זמינה",
    noAssignmentHistoryForItem: "אין היסטוריית הצמדות לפריט זה.",

    // New for Logout
    myProfile: "הפרופיל שלי",
    confirmLogout: "האם אתה בטוח שברצונך להתנתק?",
    errorLoggingOut: "שגיאה בהתנתקות. אנא נסה שוב.",
    signOut: "התנתק",
  }
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') || 'en';
    setLanguage(savedLanguage);
    setIsRTL(savedLanguage === 'he');
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'he');
    localStorage.setItem('app-language', newLanguage);
  };

  const t = translations[language];

  // Handler for logout functionality
  const handleLogout = async () => {
    if (confirm(t.confirmLogout)) {
      try {
        // Simulate an asynchronous logout action (e.g., API call)
        console.log("Attempting to log out...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call delay

        // Assuming a successful logout, redirect to a login or home page.
        // In a real app, this would clear authentication tokens/session.
        console.log("User logged out successfully.");
        window.location.href = createPageUrl("Login"); // Redirect to a login page, adjust as needed
      } catch (error) {
        console.error("Error logging out:", error);
        alert(t.errorLoggingOut);
      }
    }
  };

  const navigationItems = [
    {
      title: t.dashboard,
      url: createPageUrl("Dashboard"),
      icon: Shield,
    },
    {
      title: t.assignmentTool,
      url: createPageUrl("AssignmentTool"),
      icon: Search,
    },
    {
      title: t.returnTool,
      url: createPageUrl("ReturnTool"),
      icon: RotateCcw,
    },
  ];

  const systemToolsItems = [
    {
      title: t.equipment,
      url: createPageUrl("Equipment"),
      icon: Package,
    },
    {
      title: t.inventory,
      url: createPageUrl("Inventory"),
      icon: Layers,
    },
    {
      title: t.soldiers,
      url: createPageUrl("Soldiers"),
      icon: Users,
    },
    {
      title: t.supplantingItems, // Using translation key for consistency
      url: createPageUrl("SupplantingItems"),
      icon: ClipboardCheck,
    },
    {
      title: t.staffIssueTool,
      url: createPageUrl("StaffIssueTool"),
      icon: ClipboardCheck,
    },
    {
      title: t.bulkRepairTool,
      url: createPageUrl("BulkRepairTool"),
      icon: Wrench,
    },
    {
      title: t.dataHealth,
      url: createPageUrl("DataHealth"),
      icon: Wrench,
    },
    {
      title: t.documentGenerator,
      url: createPageUrl("DocumentGenerator"),
      icon: FileText,
    },
    {
      title: t.settings,
      url: createPageUrl("Settings"),
      icon: Settings,
    },
  ];

  const controlTableItems = [
    {
      title: t.weaponControlTable,
      url: createPageUrl("WeaponControlTable"),
      icon: LayoutGrid,
    },
    {
      title: t.equipmentControlTable,
      url: createPageUrl("EquipmentControlTable"),
      icon: ClipboardList,
    },
    {
      title: t.amralControlTable,
      url: createPageUrl("AmralControlTable"),
      icon: Radio,
    }
  ];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      <div className={`min-h-screen flex w-full bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <SidebarProvider>
          <Sidebar className={`border-slate-200 bg-white w-72 ${isRTL ? 'border-l' : 'border-r'}`}>
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

          <main className={`flex-1 flex flex-col min-w-0 ${isRTL ? 'md:mr-72' : 'md:ml-72'}`}>
            <header className="bg-white border-b border-slate-200 px-4 py-3 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-lg font-bold text-slate-900">{t.appName}</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </div>
    </LanguageContext.Provider>
  );
}