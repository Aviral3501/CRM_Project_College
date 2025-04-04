import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../../src/pages/Dashboard';
import Leads from '../../src/pages/sales/Leads';
import Pipeline from '../../src/pages/sales/Pipeline';
import Customers from '../pages/sales/Customers';
import Quotes from '../pages/sales/Quotes';
import Projects from '../pages/projects/Projects';
import Tasks from '../pages/tasks/Tasks';
import Employees from '../pages/employees/Employees';
import Analytics from '../pages/analytics/Analytics';
import Notifications from '../pages/notifications/Notifications';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

// ... existing imports and auth-related code ...

const App = () => {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return <LoadingSpinner />;

    return (
        // <Router>
        //     <Routes>
        //         {/* Auth routes */}
        //         <Route path="/login" element={
        //             <RedirectAuthenticatedUser>
        //                 <LoginPage />
        //             </RedirectAuthenticatedUser>
        //         } />
        //         <Route path="/signup" element={
        //             <RedirectAuthenticatedUser>
        //                 <SignUpPage />
        //             </RedirectAuthenticatedUser>
        //         } />
                
        //         {/* Protected routes within Layout */}
        //         <Route path="/" element={
        //             <ProtectedRoute>
        //                 <Layout />
        //             </ProtectedRoute>
        //         }>
        //             <Route index element={<Navigate to="/dashboard" replace />} />
        //             <Route path="dashboard" element={<Dashboard />} />
                    
        //             {/* Sales routes */}
        //             <Route path="sales">
        //                 <Route path="leads" element={<Leads />} />
        //                 <Route path="pipeline" element={<Pipeline />} />
        //                 <Route path="customers" element={<Customers />} />
        //                 <Route path="quotes" element={<Quotes />} />
        //             </Route>
                    
        //             {/* Other routes */}
        //             <Route path="projects" element={<Projects />} />
        //             <Route path="tasks" element={<Tasks />} />
        //             <Route path="employees" element={<Employees />} />
        //             <Route path="analytics" element={<Analytics />} />
        //             <Route path="notifications" element={<Notifications />} />
        //         </Route>
        //     </Routes>
        //     <Toaster />
        // </Router>
        <>
        cvwklds
        </>
    );
};

export default App;