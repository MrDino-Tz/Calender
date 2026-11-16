import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LangProvider, ThemeProvider } from './context.jsx';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Calendar from './pages/Calendar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Templates from './pages/Templates.jsx';
import Letters from './pages/Letters.jsx';
import Account from './pages/Account.jsx';
import Builder from './pages/Builder.jsx';
import { NotFound, Signin, Signup } from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import AdminStatus from './pages/AdminStatus.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Pricing from './pages/Pricing.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <Routes>
          {/* Calendar shell — Google Calendar-style arrangement. */}
          <Route path="/calendar" element={<Calendar />} />
          {/* Root redirects to calendar. */}
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          {/* Remaining app routes. */}
          <Route path="/account" element={<Account />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/letters" element={<Letters />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/status" element={<AdminStatus />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LangProvider>
    </ThemeProvider>
  );
}