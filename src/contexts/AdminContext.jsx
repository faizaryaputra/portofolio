// src/contexts/AdminContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig"; // pastikan file ini mengekspor auth & db
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";

const AdminContext = createContext(null);
export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
};

/** KONFIGURASI ADMIN */
const ADMIN_UID = "2ZX5GyK6IhV6hYACVRsRkPQdhmm1";
const ADMIN_EMAIL = "admin5z@admin.com";
const ADMIN_PASSWORD = "5Zarya2904";

/** SESI ADMIN (untuk timer di UI AdminMessages) */
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 menit
const EXTEND_MINUTES_MS = 15 * 60 * 1000;   // +15 menit
const SESSION_KEY = "adminSession";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function nowMs() {
  return Date.now();
}

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Optional: fitur keamanan seperti sebelumnya
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Data comments realtime (bisa dipakai oleh komponen lain)
  const [comments, setComments] = useState([]);

  /** Monitor Firebase Auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setIsAuthenticated(false);
        clearSession();
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Refresh token untuk mengambil custom claims terbaru
      let claimsAdmin = false;
      try {
        const tokenResult = await getIdTokenResult(u, true);
        claimsAdmin = !!tokenResult.claims?.admin;
      } catch {
        claimsAdmin = false;
      }

      const uidAdmin = u.uid === ADMIN_UID;
      const adminOK = claimsAdmin || uidAdmin;

      if (!adminOK) {
        // Kalau yang login bukan admin, langsung signOut agar aman
        await signOut(auth);
        setIsAdmin(false);
        setIsAuthenticated(false);
        clearSession();
      } else {
        setIsAdmin(true);
        setIsAuthenticated(true);

        // Setup session admin kalau belum ada
        const sess = readSession();
        if (!sess || !sess.expiresAt) {
          writeSession({
            uid: u.uid,
            email: u.email,
            // default: 30 menit dari sekarang
            expiresAt: nowMs() + SESSION_DURATION_MS,
          });
        }
      }

      setIsLoading(false);
    });
    return unsub;
  }, []);

  /** Realtime subscribe ke comments saat admin aktif */
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(data);
    });
    return unsub;
  }, [isAdmin]);

  /** Auto logout jika session expire */
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setInterval(() => {
      const remaining = getSessionTimeRemaining();
      if (remaining <= 0) {
        logout(); // auto logout
      }
    }, 1000); // cek tiap detik agar timer UI akurat
    return () => clearInterval(t);
  }, [isAuthenticated]);

  /** LOGIN admin */
  const login = async (email, password) => {
    // Cek lockout
    if (lockoutTime && nowMs() < lockoutTime) {
      const sisa = Math.ceil((lockoutTime - nowMs()) / 1000 / 60);
      throw new Error(`Akun terkunci. Coba lagi dalam ${sisa} menit.`);
    }

    try {
      const emailUse = email || ADMIN_EMAIL;
      const passUse = password || ADMIN_PASSWORD;

      const cred = await signInWithEmailAndPassword(auth, emailUse, passUse);
      const u = cred.user;

      // Refresh token untuk baca custom claim admin
      const tokenResult = await getIdTokenResult(u, true);
      const claimsAdmin = !!tokenResult.claims?.admin;
      const uidAdmin = u.uid === ADMIN_UID;

      if (!(claimsAdmin || uidAdmin)) {
        await signOut(auth);
        throw new Error("Akun ini bukan admin yang diizinkan.");
      }

      // Buat/refresh sesi 30 menit dari sekarang
      writeSession({
        uid: u.uid,
        email: u.email,
        expiresAt: nowMs() + SESSION_DURATION_MS,
      });

      setIsAuthenticated(true);
      setIsAdmin(true);
      setLoginAttempts(0);
      setLockoutTime(null);
      return true;
    } catch (err) {
      // gagal login → hitung attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3) {
        const lock = nowMs() + 15 * 60 * 1000; // 15 menit
        setLockoutTime(lock);
        throw new Error(
          "Terlalu banyak percobaan gagal. Akun terkunci 15 menit."
        );
      }

      throw new Error(
        `Login gagal. Sisa percobaan: ${3 - newAttempts}${
          err?.message ? ` (${err.message})` : ""
        }`
      );
    }
  };

  /** LOGOUT admin */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {
      // ignore
    }
    clearSession();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setComments([]);
    setLoginAttempts(0);
    setLockoutTime(null);
  };

  /** EXTEND session (+15 menit dari waktu kadaluarsa saat ini) */
  const extendSession = () => {
    if (!isAuthenticated) return;
    const sess = readSession();
    const base =
      sess?.expiresAt && sess.expiresAt > nowMs() ? sess.expiresAt : nowMs();
    writeSession({
      ...(sess || {}),
      expiresAt: base + EXTEND_MINUTES_MS,
    });
  };

  /** Sisa waktu session (ms) — dipakai AdminMessages */
  const getSessionTimeRemaining = () => {
    const sess = readSession();
    if (!sess?.expiresAt || !isAuthenticated) return 0;
    return Math.max(0, sess.expiresAt - nowMs());
  };

  /** ------ Aksi Firestore untuk comments ------ */

  // Admin: tandai comment sebagai read
  const markAsRead = async (commentId) => {
    if (!isAdmin) throw new Error("Tidak memiliki hak akses.");
    await updateDoc(doc(db, "comments", commentId), { status: "read" });
  };

  // Admin: hapus comment
  const deleteComment = async (commentId) => {
    if (!isAdmin) throw new Error("Tidak memiliki hak akses.");
    await deleteDoc(doc(db, "comments", commentId));
  };

  // User login biasa: like +1 (sesuai rules kamu)
  const likeComment = async (commentId) => {
    // butuh request.auth != null sesuai rules update
    await updateDoc(doc(db, "comments", commentId), { likes: increment(1) });
  };

  const value = {
    /** auth */
    user,
    isAdmin,
    isAuthenticated,
    isLoading,

    /** login/logout */
    login,
    logout,

    /** session timer untuk AdminMessages */
    extendSession,
    getSessionTimeRemaining,

    /** keamanan tambahan */
    loginAttempts,
    lockoutTime,

    /** data & aksi comments */
    comments, // realtime array { id, name, message, ... }
    markAsRead,
    deleteComment,
    likeComment,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
