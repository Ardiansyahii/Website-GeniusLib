export function validateEmail(email) {
  if (!email) return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function validateNotEmpty(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}
