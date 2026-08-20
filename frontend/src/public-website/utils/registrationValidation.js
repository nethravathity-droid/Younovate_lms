// Shared frontend validation for Workshop Registration form.
// Backend independently validates — this is UX-only.

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE  = /^[A-Za-z][A-Za-z\s'\-]{1,99}$/;
const ONLY_SYMBOLS_RE = /^[^A-Za-z0-9]+$/;

function isValidUrl(val, hostname) {
  try {
    const url = new URL(val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`);
    return url.hostname === hostname || url.hostname === `www.${hostname}`;
  } catch {
    return false;
  }
}

export function validatePhone(val) {
  const digits = val.replace(/\D/g, '');
  if (!digits) return 'Enter a valid 10-digit Indian mobile number.';
  if (digits.length !== 10) return 'Enter a valid 10-digit Indian mobile number.';
  if (!PHONE_RE.test(digits)) return 'Enter a valid 10-digit Indian mobile number.';
  return '';
}

export function validateWhatsApp(val) {
  if (!val || !val.trim()) return ''; // optional
  const digits = val.replace(/\D/g, '');
  if (digits.length !== 10) return 'Enter a valid 10-digit WhatsApp number.';
  if (!PHONE_RE.test(digits)) return 'Enter a valid 10-digit WhatsApp number.';
  return '';
}

export function validateFullName(val) {
  const trimmed = val.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Please enter a valid full name.';
  if (trimmed.length < 2) return 'Please enter a valid full name.';
  if (trimmed.length > 100) return 'Full name must be 100 characters or fewer.';
  if (!NAME_RE.test(trimmed)) return 'Please enter a valid full name.';
  return '';
}

export function validateEmail(val) {
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return 'Please enter a valid email address.';
  if (trimmed.length > 254) return 'Please enter a valid email address.';
  if (!EMAIL_RE.test(trimmed)) return 'Please enter a valid email address.';
  return '';
}

export function validateCollege(val) {
  if (!val || !val.trim()) return ''; // optional
  const trimmed = val.trim();
  if (trimmed.length > 150) return 'Institution name must be 150 characters or fewer.';
  if (ONLY_SYMBOLS_RE.test(trimmed)) return 'Please enter a valid institution name.';
  return '';
}

export function validateQualification(val) {
  if (!val || !val.trim()) return ''; // optional
  const trimmed = val.trim();
  if (trimmed.length > 100) return 'Qualification must be 100 characters or fewer.';
  if (ONLY_SYMBOLS_RE.test(trimmed)) return 'Please enter a valid qualification.';
  return '';
}

export function validateExperience(val) {
  if (!val || !val.trim()) return ''; // optional
  const trimmed = val.trim();
  if (trimmed.length > 150) return 'Experience must be 150 characters or fewer.';
  if (ONLY_SYMBOLS_RE.test(trimmed)) return 'Please enter a valid experience description.';
  return '';
}

export function validateLinkedIn(val) {
  if (!val || !val.trim()) return ''; // optional
  if (!isValidUrl(val, 'linkedin.com')) return 'Please enter a valid LinkedIn profile URL.';
  return '';
}

export function validateGitHub(val) {
  if (!val || !val.trim()) return ''; // optional
  if (!isValidUrl(val, 'github.com')) return 'Please enter a valid GitHub profile URL.';
  return '';
}

export function validateState(val) {
  if (!val || val === '') return 'Please select a state.';
  return '';
}

export function validateCity(val) {
  if (!val || val === '') return 'Please select a city.';
  return '';
}

export function validateForm(form) {
  return {
    fullName:     validateFullName(form.fullName),
    email:        validateEmail(form.email),
    phone:        validatePhone(form.phone),
    whatsapp:     validateWhatsApp(form.whatsapp),
    college:      validateCollege(form.college),
    qualification: validateQualification(form.qualification),
    state:        validateState(form.state),
    city:         validateCity(form.city),
    experience:   validateExperience(form.experience),
    linkedin:     validateLinkedIn(form.linkedin),
    github:       validateGitHub(form.github),
    acceptTerms:  form.acceptTerms ? '' : 'You must agree to the Terms and Privacy Policy.',
  };
}
