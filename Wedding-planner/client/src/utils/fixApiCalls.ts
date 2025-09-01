// This file contains instructions for fixing API calls
// Replace all direct fetch calls with apiUrl function

// Example:
// OLD: fetch('/api/users', { ... })
// NEW: fetch(apiUrl('/api/users'), { ... })

// Files that need to be updated:
// 1. Wedding-planner/client/src/pages/BudgetPage.tsx
// 2. Wedding-planner/client/src/pages/BudgetOverview.tsx
// 3. Wedding-planner/client/src/pages/GuestListPage.tsx
// 4. Wedding-planner/client/src/pages/CheckListPage.tsx
// 5. Wedding-planner/client/src/pages/VendorPage.tsx
// 6. Wedding-planner/client/src/pages/VendorComparisonPage.tsx
// 7. Wedding-planner/client/src/pages/VenueComparisonPage.tsx
// 8. Wedding-planner/client/src/pages/WeedingPage.tsx
// 9. Wedding-planner/client/src/pages/MyWeddings.tsx
// 10. Wedding-planner/client/src/pages/FirstPage.tsx
// 11. Wedding-planner/client/src/pages/ImportantThingsPage.tsx
// 12. Wedding-planner/client/src/pages/WeddingDayPage.tsx
// 13. Wedding-planner/client/src/pages/account/AccountSettings.tsx
// 14. Wedding-planner/client/src/pages/invite/InviteAcceptPage.tsx
// 15. Wedding-planner/client/src/components/Login/LoginPopup.tsx

// Steps for each file:
// 1. Add import: import { apiUrl } from '../utils/api';
// 2. Replace all fetch('/api/...') with fetch(apiUrl('/api/...'))
