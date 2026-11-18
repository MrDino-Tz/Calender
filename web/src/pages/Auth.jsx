import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoUrl from '../assets/images/logo-leaf.png';

function Brand() {
  return (
    <Link to="/" className="mb-4 d-inline-flex align-items-center text-decoration-none">
      <img src={logoUrl} alt="" width="36" height="36" />
      <span className="ms-2 fw-bold fs-4 text-primary">Calendar</span>
    </Link>
  );
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export function Signin() {
  const navigate = useNavigate();
  const [googleNotice, setGoogleNotice] = React.useState(false);

  const handleGoogleSignIn = () => {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value || '';
    const name = email.split('@')[0] || 'User';
    try {
      localStorage.setItem('cal.signedIn', 'true');
      localStorage.setItem('cal.authProvider', 'email');
      localStorage.setItem('cal.displayName', name);
      localStorage.setItem('cal.userEmail', email);
    } catch (e) { /* ignore */ }
    navigate('/');
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm border" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <Brand />
            <h1 className="card-title h5 fw-bold mb-1">Sign in to your account</h1>
            <p className="text-muted small">Sync your calendar across devices with Google or email</p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between py-2 px-3 fw-medium mb-3"
            onClick={handleGoogleSignIn}
          >
            <div className="d-flex align-items-center gap-2">
              <GoogleIcon size={18} />
              <span>Continue with Google</span>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.7rem' }}>
              Coming soon
            </span>
          </button>

          {googleNotice ? (
            <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="ti ti-clock fs-5 flex-shrink-0"></i>
              <span>Google Account Sync is coming soon! Please use email sign-in or guest mode for now.</span>
            </div>
          ) : null}

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 my-0" />
            <span className="px-2 text-muted small">or sign in with email</span>
            <hr className="flex-grow-1 my-0" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
              <input id="email" type="email" className="form-control" placeholder="name@example.com" required autoFocus />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label small fw-semibold d-flex justify-content-between">
                <span>Password</span>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }} className="small link-primary">Forgot Password?</a>
              </label>
              <input id="password" type="password" className="form-control" placeholder="Password" required minLength="6" />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input id="remember" className="form-check-input" type="checkbox" defaultChecked />
                <label className="form-check-label small" htmlFor="remember">Remember me</label>
              </div>
            </div>
            <button className="btn btn-primary w-100 py-2 fw-semibold" type="submit">Sign in</button>
          </form>
          <div className="text-center mt-3 small text-muted">
            Don&apos;t have an account? <Link to="/signup" className="link-primary fw-semibold">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [googleNotice, setGoogleNotice] = React.useState(false);
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const mismatch = pw2.length > 0 && pw !== pw2;

  const handleGoogleSignIn = () => {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mismatch) return;
    const name = document.getElementById('fullName')?.value || 'User';
    const email = document.getElementById('email')?.value || '';
    try {
      localStorage.setItem('cal.signedIn', 'true');
      localStorage.setItem('cal.authProvider', 'email');
      localStorage.setItem('cal.displayName', name);
      localStorage.setItem('cal.userEmail', email);
    } catch (e) { /* ignore */ }
    navigate('/');
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm border" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <Brand />
            <h1 className="card-title h5 fw-bold mb-1">Create your account</h1>
            <p className="text-muted small">Start syncing your calendar across all your devices</p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between py-2 px-3 fw-medium mb-3"
            onClick={handleGoogleSignIn}
          >
            <div className="d-flex align-items-center gap-2">
              <GoogleIcon size={18} />
              <span>Sign up with Google</span>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.7rem' }}>
              Coming soon
            </span>
          </button>

          {googleNotice ? (
            <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="ti ti-clock fs-5 flex-shrink-0"></i>
              <span>Google Account Sync is coming soon! Please use email sign-up or guest mode for now.</span>
            </div>
          ) : null}

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 my-0" />
            <span className="px-2 text-muted small">or sign up with email</span>
            <hr className="flex-grow-1 my-0" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label small fw-semibold">Full name</label>
              <input id="fullName" type="text" className="form-control" placeholder="Jane Doe" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
              <input id="email" type="email" className="form-control" placeholder="name@example.com" required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label small fw-semibold">Password</label>
              <input id="password" type="password" className="form-control" placeholder="Create a password" required minLength="6" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label small fw-semibold">Confirm password</label>
              <input id="confirmPassword" type="password" className={`form-control${mismatch ? ' is-invalid' : ''}`} placeholder="Repeat password" required value={pw2} onChange={(e) => setPw2(e.target.value)} />
              {mismatch ? <div className="invalid-feedback" style={{ display: 'block' }}>Passwords must match.</div> : null}
            </div>
            <button className="btn btn-primary w-100 py-2 fw-semibold" type="submit" disabled={mismatch}>Create account</button>
          </form>
          <div className="text-center mt-3 small text-muted">
            Already have an account? <Link to="/signin" className="link-primary fw-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center">
          <div className="mb-4"><Brand /></div>
          <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
          <h2 className="card-title h4 mb-3">Page Not Found</h2>
          <p className="text-muted mb-4">Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <Link to="/dashboard" className="btn btn-primary">Go to My CVs</Link>
        </div>
      </div>
    </div>
  );
}
