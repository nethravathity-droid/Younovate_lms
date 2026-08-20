import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { register, selectIsAuthenticated, selectAuthStatus, selectAuthError, clearError } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    college: '',
    qualification: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    role: 'trainee',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) e.acceptTerms = 'Please accept terms';
    return e;
  };

  const onChange = (ev) => {
    const { name, value, type, checked } = ev.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    // Reuse existing auth register thunk.
    const res = await dispatch(
      register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'trainee',
      })
    );

    if (register.fulfilled.match(res)) {
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    }
  };

  const isLoading = status === 'loading';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(115deg, #1f3d63 0%, #315f83 58%, #4b8eaa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 18, padding: 30, boxShadow: '0 24px 62px rgba(20,46,75,0.25)' }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1f3d63' }}>Create account</h1>
        <p style={{ marginTop: 8, color: '#536987', fontWeight: 700, lineHeight: 1.7 }}>Join YouVA OS and start learning.</p>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: '#536987' }}>Full Name</label>
            <input name="name" value={form.name} onChange={onChange} style={{ marginTop: 8, width: '100%', borderRadius: 12, border: '1.5px solid rgba(219,227,237,0.9)', padding: '12px 14px', fontWeight: 700 }} placeholder="John Doe" />
            {errors.name && <div style={{ color: '#e12e2a', fontWeight: 800, fontSize: 12, marginTop: 6 }}>{errors.name}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: '#536987' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} style={{ marginTop: 8, width: '100%', borderRadius: 12, border: '1.5px solid rgba(219,227,237,0.9)', padding: '12px 14px', fontWeight: 700 }} placeholder="you@example.com" />
            {errors.email && <div style={{ color: '#e12e2a', fontWeight: 800, fontSize: 12, marginTop: 6 }}>{errors.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: '#536987' }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} style={{ marginTop: 8, width: '100%', borderRadius: 12, border: '1.5px solid rgba(219,227,237,0.9)', padding: '12px 14px', fontWeight: 700 }} />
            {errors.password && <div style={{ color: '#e12e2a', fontWeight: 800, fontSize: 12, marginTop: 6 }}>{errors.password}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: '#536987' }}>Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} style={{ marginTop: 8, width: '100%', borderRadius: 12, border: '1.5px solid rgba(219,227,237,0.9)', padding: '12px 14px', fontWeight: 700 }} />
            {errors.confirmPassword && <div style={{ color: '#e12e2a', fontWeight: 800, fontSize: 12, marginTop: 6 }}>{errors.confirmPassword}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, color: '#1f3d63' }}>
              <input name="acceptTerms" type="checkbox" checked={form.acceptTerms} onChange={onChange} />
              Accept terms
            </label>
            {errors.acceptTerms && <div style={{ color: '#e12e2a', fontWeight: 800, fontSize: 12, marginTop: 6 }}>{errors.acceptTerms}</div>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: 18, width: '100%', borderRadius: 12, border: 'none', padding: '12px 14px', background: 'linear-gradient(135deg, #1f3d63, #3f7da0)', color: '#fff', fontWeight: 900, cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Creating…' : 'Create Account'}
        </button>

        <div style={{ marginTop: 14, textAlign: 'center', fontWeight: 800, color: '#536987' }}>
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#2f6f9b', fontWeight: 900, cursor: 'pointer' }}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}

