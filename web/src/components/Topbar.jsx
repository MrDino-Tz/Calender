import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang, useTheme } from '../context.jsx';

function Avatar({ photo, name, size }) {
  const initial = ((name || 'M').trim().charAt(0) || 'M').toUpperCase();
  if (photo) {
    return <img src={photo} alt="" className={`avatar avatar-${size} rounded-circle`} />;
  }
  return (
    <span className={`avatar avatar-${size} rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold`}>
      {initial}
    </span>
  );
}

export default function Topbar({ collapsed, onToggleSidebar, onOpenMobile }) {
  const { t } = useLang();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = React.useState(null);

  return (
    <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3${collapsed ? ' full' : ''}`}>
      <button id="toggleBtn" className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm" onClick={onToggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <i className={`ti ${collapsed ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'}`}></i>
      </button>
      <button id="mobileBtn" className="btn btn-light btn-icon btn-sm d-lg-none me-2" onClick={onOpenMobile}>
        <i className="ti ti-layout-sidebar-left-expand"></i>
      </button>
      <div>
        <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">
          <li>
            <button id="themeToggle" className="btn-icon btn-sm btn-light btn rounded-circle border-0" title="Light / dark theme" onClick={toggle}>
              <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} id="themeIcon"></i>
            </button>
          </li>
          <li className={openMenu === 'bell' ? 'dropdown' : ''}>
            <a className="position-relative btn-icon btn-sm btn-light btn rounded-circle" href="#" role="button" onClick={(e) => { e.preventDefault(); toggleMenu('bell'); }} aria-expanded={openMenu === 'bell'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
              </svg>
              {openMenu === 'bell' ? (
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-0 show" style={{ minWidth: '330px', position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 42px)' }}>
                  <ul className="list-unstyled p-0 m-0" id="notifList">
                    <li className="p-4 text-center text-secondary small">{t('notif.caughtUp')}</li>
                  </ul>
                </div>
              ) : null}
            </a>
          </li>
          <li className={`ms-3 ${openMenu === 'user' ? 'dropdown' : ''}`}>
            <a href="#" role="button" onClick={(e) => { e.preventDefault(); toggleMenu('user'); }} aria-expanded={openMenu === 'user'}>
              <span id="navAvatar"><Avatar name="User" size="sm" /></span>
            </a>
            {openMenu === 'user' ? (
              <div className="dropdown-menu dropdown-menu-end p-0 show" style={{ minWidth: '200px', position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 42px)' }}>
                <div>
                  <div className="p-3 d-flex flex-column gap-1 small lh-lg">
                    <Link to="/dashboard" onClick={() => setOpenMenu(null)}><span>{t('nav.mycvs')}</span></Link>
                    <Link to="/new-cv" onClick={() => setOpenMenu(null)}><span>{t('nav.newcv')}</span></Link>
                    <Link to="/templates" onClick={() => setOpenMenu(null)}><span>{t('nav.templates')}</span></Link>
                    <Link to="/pricing" onClick={() => setOpenMenu(null)}><span>{t('nav.pricing')}</span></Link>
                    <Link to="/account" onClick={() => setOpenMenu(null)}><span>{t('nav.myaccount')}</span></Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu(null); }}>Logout</a>
                  </div>
                </div>
              </div>
            ) : null}
          </li>
        </ul>
      </div>
    </nav>
  );
}
