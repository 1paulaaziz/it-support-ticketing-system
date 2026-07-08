// src/auth.js
const KEY = "role";

export function loginAs(role) {
  localStorage.setItem(KEY, role);
}

export function getRole() {
  return localStorage.getItem(KEY) || "employee";
}

export function logout() {
  localStorage.removeItem(KEY);
}
