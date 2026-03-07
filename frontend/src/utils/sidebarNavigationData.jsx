import {
  LayoutDashboard, Users, Settings, UserCheck, Bell, 
  ChevronRight, ChevronLeft, LogOut, X, Search, Filter,
  MoreVertical, ArrowLeft, ShieldCheck, UserMinus, Trash2,
  ToggleLeft, ToggleRight, ArrowUpDown,
   TrendingUp, Activity, Pill, CalendarDays,
  FileBarChart2, MessageCircle, ClipboardList, User,
  Plus, Footprints, Clock, Download, Weight, Heart, Droplets,
  Moon, 
  BarChart2, PlusCircle, History, ListChecks, BookOpen,
  Stethoscope, Dumbbell
  
} from "lucide-react";
const sidebarNavigationData = {
  admin: [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/admin" },
    { label: "Coaches",   icon:  <UserCheck size={16}/>, path: "/admin/coaches" },
    { label: "Users",     icon: <Users size={16}/>, path: "/admin/users" },
     { label: "Settings",     icon: <Settings size={16}/>, path: "/admin/users" },
  ],
  coach: [
    { label: "Dashboard", icon: <LayoutDashboard size={16}/>, path: "/coach" },
    { label: "My Users",  icon: <Users size={16}/>, path: "/coach/users" },
  ],
  user: [
    { label: "Dashboard", icon: <LayoutDashboard size={16}/>, path: "/" },
     // My Health
    { label: "Health Metrics",     icon: <TrendingUp size={16}/>,      path: "/user/health/metrics",          group: "My Health" },
    { label: "Health Progress",    icon: <Activity size={16}/>,        path: "/user/health/progress",         group: "My Health" },

    // Activity Tracker
    { label: "Add Activity",       icon: <Plus size={16}/>,            path: "/user/activity/add",            group: "Activity Tracker" },
    { label: "Activity History",   icon: <Footprints size={16}/>,      path: "/user/activity/history",        group: "Activity Tracker" },

    // Medicine Reminder
    { label: "Add Medicine",       icon: <Plus size={16}/>,            path: "/user/medicine/add",            group: "Medicine Reminder" },
    { label: "Medicine Schedule",  icon: <Clock size={16}/>,           path: "/user/medicine/schedule",       group: "Medicine Reminder" },
    { label: "Reminder History",   icon: <ClipboardList size={16}/>,   path: "/user/medicine/history",        group: "Medicine Reminder" },

    // Appointments
    { label: "Book Appointment",   icon: <Plus size={16}/>,            path: "/user/appointments/book",       group: "Appointments" },
    { label: "Upcoming",           icon: <CalendarDays size={16}/>,    path: "/user/appointments/upcoming",   group: "Appointments" },
    { label: "History",            icon: <History size={16}/>,         path: "/user/appointments/history",    group: "Appointments" },

    // Reports
    { label: "Weekly Report",      icon: <FileBarChart2 size={16}/>,   path: "/user/reports/weekly",          group: "Reports" },
    { label: "Monthly Report",     icon: <FileBarChart2 size={16}/>,   path: "/user/reports/monthly",         group: "Reports" },
    { label: "Download",           icon: <Download size={16}/>,        path: "/user/reports/download",        group: "Reports" },

    // Standalone bottom
    { label: "Notifications",      icon: <Bell size={16}/>,            path: "/user/notifications" },
    { label: "Doctor Chat",        icon: <MessageCircle size={16}/>,   path: "/user/chat" },
    { label: "Health History",     icon: <ClipboardList size={16}/>,   path: "/user/health/history" },
    { label: "Profile",            icon: <User size={16}/>,            path: "/user/profile" },
  
  ],
};

export default sidebarNavigationData




// // ─── USER ────────────────────────────────────────────────────────────────────
//   user: [
//     // Standalone
//     { label: "Dashboard",          icon: <LayoutDashboard size={16}/>, path: "/user" },

//     // My Health
//     { label: "Health Metrics",     icon: <TrendingUp size={16}/>,      path: "/user/health/metrics",          group: "My Health" },
//     { label: "Health Progress",    icon: <Activity size={16}/>,        path: "/user/health/progress",         group: "My Health" },

//     // Activity Tracker
//     { label: "Add Activity",       icon: <Plus size={16}/>,            path: "/user/activity/add",            group: "Activity Tracker" },
//     { label: "Activity History",   icon: <Footprints size={16}/>,      path: "/user/activity/history",        group: "Activity Tracker" },

//     // Medicine Reminder
//     { label: "Add Medicine",       icon: <Plus size={16}/>,            path: "/user/medicine/add",            group: "Medicine Reminder" },
//     { label: "Medicine Schedule",  icon: <Clock size={16}/>,           path: "/user/medicine/schedule",       group: "Medicine Reminder" },
//     { label: "Reminder History",   icon: <ClipboardList size={16}/>,   path: "/user/medicine/history",        group: "Medicine Reminder" },

//     // Appointments
//     { label: "Book Appointment",   icon: <Plus size={16}/>,            path: "/user/appointments/book",       group: "Appointments" },
//     { label: "Upcoming",           icon: <CalendarDays size={16}/>,    path: "/user/appointments/upcoming",   group: "Appointments" },
//     { label: "History",            icon: <History size={16}/>,         path: "/user/appointments/history",    group: "Appointments" },

//     // Reports
//     { label: "Weekly Report",      icon: <FileBarChart2 size={16}/>,   path: "/user/reports/weekly",          group: "Reports" },
//     { label: "Monthly Report",     icon: <FileBarChart2 size={16}/>,   path: "/user/reports/monthly",         group: "Reports" },
//     { label: "Download",           icon: <Download size={16}/>,        path: "/user/reports/download",        group: "Reports" },

//     // Standalone bottom
//     { label: "Notifications",      icon: <Bell size={16}/>,            path: "/user/notifications" },
//     { label: "Doctor Chat",        icon: <MessageCircle size={16}/>,   path: "/user/chat" },
//     { label: "Health History",     icon: <ClipboardList size={16}/>,   path: "/user/health/history" },
//     { label: "Profile",            icon: <User size={16}/>,            path: "/user/profile" },
//   ],

//   // ─── COACH ───────────────────────────────────────────────────────────────────
//   coach: [
//     // Standalone
//     { label: "Dashboard",          icon: <LayoutDashboard size={16}/>, path: "/coach" },

//     // My Members
//     { label: "All Members",        icon: <Users size={16}/>,           path: "/coach/members",                group: "My Members" },
//     { label: "Assign Plan",        icon: <ListChecks size={16}/>,      path: "/coach/members/assign",         group: "My Members" },
//     { label: "Member Progress",    icon: <TrendingUp size={16}/>,      path: "/coach/members/progress",       group: "My Members" },

//     // Workout Plans
//     { label: "Create Plan",        icon: <Plus size={16}/>,            path: "/coach/plans/create",           group: "Workout Plans" },
//     { label: "All Plans",          icon: <BookOpen size={16}/>,        path: "/coach/plans",                  group: "Workout Plans" },
//     { label: "Plan History",       icon: <History size={16}/>,         path: "/coach/plans/history",          group: "Workout Plans" },

//     // Diet Plans
//     { label: "Create Diet",        icon: <Plus size={16}/>,            path: "/coach/diet/create",            group: "Diet Plans" },
//     { label: "All Diets",          icon: <ClipboardList size={16}/>,   path: "/coach/diet",                   group: "Diet Plans" },

//     // Sessions
//     { label: "Schedule Session",   icon: <Plus size={16}/>,            path: "/coach/sessions/schedule",      group: "Sessions" },
//     { label: "Upcoming Sessions",  icon: <CalendarDays size={16}/>,    path: "/coach/sessions/upcoming",      group: "Sessions" },
//     { label: "Session History",    icon: <History size={16}/>,         path: "/coach/sessions/history",       group: "Sessions" },

//     // Reports
//     { label: "Member Reports",     icon: <BarChart2 size={16}/>,       path: "/coach/reports/members",        group: "Reports" },
//     { label: "Activity Reports",   icon: <Activity size={16}/>,        path: "/coach/reports/activity",       group: "Reports" },
//     { label: "Download",           icon: <Download size={16}/>,        path: "/coach/reports/download",       group: "Reports" },

//     // Standalone bottom
//     { label: "Notifications",      icon: <Bell size={16}/>,            path: "/coach/notifications" },
//     { label: "Messages",           icon: <MessageCircle size={16}/>,   path: "/coach/messages" },
//     { label: "Profile",            icon: <User size={16}/>,            path: "/coach/profile" },
//   ],

//   // ─── ADMIN ───────────────────────────────────────────────────────────────────
//   admin: [
//     // Standalone
//     { label: "Dashboard",          icon: <LayoutDashboard size={16}/>, path: "/admin" },

//     // User Management
//     { label: "All Users",          icon: <Users size={16}/>,           path: "/admin/users",                  group: "User Management" },
//     { label: "Add User",           icon: <Plus size={16}/>,            path: "/admin/users/add",              group: "User Management" },
//     { label: "User Roles",         icon: <ShieldCheck size={16}/>,     path: "/admin/users/roles",            group: "User Management" },

//     // Coach Management
//     { label: "All Coaches",        icon: <Dumbbell size={16}/>,        path: "/admin/coaches",                group: "Coach Management" },
//     { label: "Add Coach",          icon: <Plus size={16}/>,            path: "/admin/coaches/add",            group: "Coach Management" },
//     { label: "Assignments",        icon: <UserCheck size={16}/>,       path: "/admin/coaches/assignments",    group: "Coach Management" },

//     // Center Management
//     { label: "All Centers",        icon: <Stethoscope size={16}/>,     path: "/admin/centers",                group: "Center Management" },
//     { label: "Add Center",         icon: <Plus size={16}/>,            path: "/admin/centers/add",            group: "Center Management" },

//     // Memberships
//     { label: "All Plans",          icon: <ListChecks size={16}/>,      path: "/admin/memberships",            group: "Memberships" },
//     { label: "Add Plan",           icon: <Plus size={16}/>,            path: "/admin/memberships/add",        group: "Memberships" },

//     // Reports & Analytics
//     { label: "Platform Analytics", icon: <BarChart2 size={16}/>,       path: "/admin/analytics",              group: "Reports" },
//     { label: "Monthly Report",     icon: <FileBarChart2 size={16}/>,   path: "/admin/reports/monthly",        group: "Reports" },
//     { label: "Download",           icon: <Download size={16}/>,        path: "/admin/reports/download",       group: "Reports" },

//     // Standalone bottom
//     { label: "Notifications",      icon: <Bell size={16}/>,            path: "/admin/notifications" },
//     { label: "Messages",           icon: <MessageCircle size={16}/>,   path: "/admin/messages" },
//     { label: "Settings",           icon: <Settings size={16}/>,        path: "/admin/settings" },
//     { label: "Profile",            icon: <User size={16}/>,            path: "/admin/profile" },
//   ],
// };