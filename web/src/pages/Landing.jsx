import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Landing() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // If already on /calendar, just show the calendar title
  if (pathname === '/calendar') {
    return null;
  }

  // Otherwise redirect to calendar
  React.useEffect(() => {
    navigate('/calendar', { replace: true });
  }, [pathname, navigate]);

  return null;
}