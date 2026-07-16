"use client";

// Mock user directory + session identity, frontend-only.
// ponytail: plain-text passwords in localStorage — demo only. Real credentials,
// hashing, and sessions move server-side when backend auth lands; this module's
// API (authenticate/addUser/useSessionEmail) is the seam to swap.

import { useSyncExternalStore } from "react";
import type { Role } from "./schema";
import { SEED } from "./seed";

export type UserAccount = {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "Public">;
  firm_id: string | null;
  active: boolean;
};

const USERS_KEY = "satdb.users.v1";
const SESSION_KEY = "satdb.session-email";
const USERS_EVENT = "satdb:users";
const SESSION_EVENT = "satdb:session";

const SERVER_USERS: UserAccount[] = [];
const DEMO_COMPANY_ID = "F013";
const DEMO_COMPANY_NAME = "Test";
const DEMO_EDITOR_EMAIL = "editor+f001@satdb.test";

function seedUsers(): UserAccount[] {
  const users: UserAccount[] = [
    {
      user_id: "U001",
      name: "Database administrator",
      email: "admin@satdb.test",
      password: "admin-test",
      role: "Admin",
      firm_id: null,
      active: true
    }
  ];
  users.push({
    user_id: "U002",
    name: `${DEMO_COMPANY_NAME} editor`,
    email: DEMO_EDITOR_EMAIL,
    password: "company-test",
    role: "Analyst",
    firm_id: DEMO_COMPANY_ID,
    active: true
  });
  return users;
}

let cache: UserAccount[] | null = null;

function repairUsers(users: UserAccount[]): UserAccount[] {
  return users.map((user) =>
    user.email.toLowerCase() === DEMO_EDITOR_EMAIL && user.role === "Analyst"
      ? { ...user, name: `${DEMO_COMPANY_NAME} editor`, firm_id: DEMO_COMPANY_ID }
      : user
  );
}

function loadUsers(): UserAccount[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_USERS;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (raw) {
      cache = repairUsers(JSON.parse(raw) as UserAccount[]);
      window.localStorage.setItem(USERS_KEY, JSON.stringify(cache));
      return cache;
    }
  } catch {
    // corrupted storage: reseed below
  }
  cache = seedUsers();
  window.localStorage.setItem(USERS_KEY, JSON.stringify(cache));
  return cache;
}

function writeUsers(users: UserAccount[]) {
  cache = users;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event(USERS_EVENT));
}

function subscribeUsers(cb: () => void) {
  const handler = () => {
    cache = null;
    cb();
  };
  window.addEventListener(USERS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(USERS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useUsers(): UserAccount[] {
  return useSyncExternalStore(subscribeUsers, loadUsers, () => SERVER_USERS);
}

export function authenticate(email: string, password: string): UserAccount | null {
  const normalized = email.trim().toLowerCase();
  const user = loadUsers().find((u) => u.email.toLowerCase() === normalized);
  return user && user.active && user.password === password ? user : null;
}

function tempPassword(): string {
  return Math.random().toString(36).slice(2, 10);
}

export type AddUserResult =
  | { ok: true; user: UserAccount; password: string }
  | { ok: false; reason: string };

export function addUser(input: {
  name: string;
  email: string;
  role: UserAccount["role"];
  firm_id: string | null;
}): AddUserResult {
  const users = loadUsers();
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, reason: "Email is required." };
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, reason: "An account with this email already exists." };
  }
  if (input.role === "Analyst" && !input.firm_id) {
    return { ok: false, reason: "Company editors must be assigned to a company." };
  }
  const nextNum = users.reduce((max, u) => Math.max(max, Number(u.user_id.slice(1)) || 0), 0) + 1;
  const password = tempPassword();
  const user: UserAccount = {
    user_id: `U${String(nextNum).padStart(3, "0")}`,
    name: input.name.trim() || email.split("@")[0],
    email,
    password,
    role: input.role,
    firm_id: input.role === "Admin" ? null : input.firm_id,
    active: true
  };
  writeUsers([...users, user]);
  return { ok: true, user, password };
}

export function setUserActive(userId: string, active: boolean) {
  writeUsers(loadUsers().map((u) => (u.user_id === userId ? { ...u, active } : u)));
}

export function resetUserPassword(userId: string): string {
  const password = tempPassword();
  writeUsers(loadUsers().map((u) => (u.user_id === userId ? { ...u, password } : u)));
  return password;
}

export function removeUser(userId: string) {
  writeUsers(loadUsers().filter((u) => u.user_id !== userId));
}

export function setSessionEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) window.sessionStorage.setItem(SESSION_KEY, email);
  else window.sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

function subscribeSession(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useSessionEmail(): string | null {
  return useSyncExternalStore(subscribeSession, getSessionEmail, () => null);
}
