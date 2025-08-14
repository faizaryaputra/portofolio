import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaTimes,
  FaSignOutAlt,
  FaClock,
  FaShieldAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useAdmin } from '../contexts/AdminContext';

// ==== Firebase imports ====
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

const AdminMessages = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sessionTime, setSessionTime] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null); // 'not-logged-in' | 'not-admin' | 'permission-denied' | null
  const [loading, setLoading] = useState(true);

  const { logout, getSessionTimeRemaining, extendSession } = useAdmin();

  // Hitung unread
  const unreadCount = useMemo(
    () => messages.filter((msg) => msg.status === 'unread').length,
    [messages]
  );

  // ==== Auth + Read guard ====
  useEffect(() => {
    if (!isOpen) return;
    let unsubAuth = null;
    let unsubFirestore = null;

    const attachFirestoreListener = () => {
      const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
      return onSnapshot(
        q,
        (snap) => {
          const data = snap.docs.map((d) => {
            const raw = d.data();

            // Normalisasi timestamp -> ms
            let tsMs = Date.now();
            if (raw?.timestamp?.toMillis) {
              tsMs = raw.timestamp.toMillis();
            } else if (raw?.timestamp?.seconds) {
              tsMs = raw.timestamp.seconds * 1000;
            } else if (typeof raw?.timestamp === 'number') {
              tsMs = raw.timestamp;
            }

            return {
              id: d.id,
              name: raw?.name ?? 'Anonymous',
              email: raw?.email ?? '',
              message: raw?.message ?? '',
              status: raw?.status ?? 'unread',
              timestamp: tsMs,
            };
          });
          setMessages(data);
          // sinkronkan detail yang sedang dibuka
          if (selectedMessage) {
            const still = data.find((x) => x.id === selectedMessage.id);
            setSelectedMessage(still || null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('onSnapshot error:', err);
          setAuthError(err?.code === 'permission-denied' ? 'permission-denied' : 'not-admin');
          setMessages([]);
          setSelectedMessage(null);
          setLoading(false);
        }
      );
    };

    unsubAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      // bersihkan listener lama
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (!user) {
        setIsAdmin(false);
        setAuthError('not-logged-in');
        setMessages([]);
        setSelectedMessage(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      try {
        // Force refresh supaya klaim terbaru terbaca
        const token = await getIdTokenResult(user, true);
        const adminClaim = token?.claims?.admin === true;
        setIsAdmin(adminClaim);
        setAuthError(adminClaim ? null : 'not-admin');
        setAuthChecked(true);

        if (adminClaim) {
          unsubFirestore = attachFirestoreListener();
        } else {
          setMessages([]);
          setSelectedMessage(null);
          setLoading(false);
        }
      } catch (e) {
        console.error('getIdTokenResult error:', e);
        setIsAdmin(false);
        setAuthError('not-admin');
        setMessages([]);
        setSelectedMessage(null);
        setAuthChecked(true);
        setLoading(false);
      }
    });

    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Session timer
  useEffect(() => {
    const updateSessionTime = () => {
      const remaining = getSessionTimeRemaining();
      const minutes = Math.max(0, Math.floor(remaining / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((remaining % (1000 * 60)) / 1000));
      setSessionTime(`${minutes}:${String(seconds).padStart(2, '0')}`);

      if (remaining <= 0) {
        handleLogout();
      }
    };

    if (isOpen) {
      updateSessionTime();
      const timer = setInterval(updateSessionTime, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, getSessionTimeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Mark as read (Admin only) ===
  const markAsRead = async (messageId, currentStatus) => {
    if (!isAdmin) {
      alert('Aksi ini khusus admin.');
      return;
    }
    if (currentStatus === 'read') return;
    try {
      await updateDoc(doc(db, 'comments', messageId), { status: 'read' });
      // onSnapshot akan update state otomatis
    } catch (e) {
      console.error('markAsRead error:', e);
      alert('Gagal menandai sebagai dibaca. Pastikan akun ini admin.');
    }
  };

  // === Delete (Admin only) ===
  const deleteMessage = async (messageId) => {
    if (!isAdmin) {
      alert('Aksi ini khusus admin.');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      await deleteDoc(doc(db, 'comments', messageId));
      setSelectedMessage(null);
    } catch (e) {
      console.error('deleteMessage error:', e);
      alert('Gagal menghapus komentar. Pastikan akun ini admin.');
    }
  };

  // Open message details
  const openMessage = (message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      markAsRead(message.id, message.status);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  const renderAccessBanner = () => {
    if (!authChecked || loading) {
      return (
        <div className="bg-slate-800/50 px-2 py-1 rounded-full border border-slate-600/30">
          <span className="text-slate-300 text-xs font-semibold">CHECKING…</span>
        </div>
      );
    }
    if (isAdmin) {
      return (
        <div className="bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-400/30">
          <span className="text-emerald-300 text-xs font-semibold">ADMIN VERIFIED</span>
        </div>
      );
    }
    return (
      <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-400/30">
        <span className="text-red-300 text-xs font-semibold">NO ADMIN ACCESS</span>
      </div>
    );
  };

  const renderGuard = () => {
    if (loading) return null;
    if (isAdmin) return null;

    const msg =
      authError === 'not-logged-in'
        ? 'Anda belum login. Silakan login sebagai admin untuk melihat pesan.'
        : authError === 'permission-denied'
        ? 'Izin ditolak oleh Firestore rules. Pastikan akun Anda memiliki klaim admin.'
        : 'Akses terbatas. Hanya admin yang dapat membaca pesan.';

    return (
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-10">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-600/40 rounded-2xl p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <FaExclamationTriangle className="text-red-300" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Admin Access Required</h3>
          <p className="text-slate-300 text-sm mb-4">{msg}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={async () => {
                // paksa refresh klaim
                if (auth.currentUser) {
                  await auth.currentUser.getIdToken(true);
                }
              }}
              className="px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-700/40 text-slate-200 hover:bg-slate-700/60 transition"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-6xl w-full bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Guard overlay (non-admin) */}
        {renderGuard()}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
                {renderAccessBanner()}
              </div>
              <p className="text-slate-400">
                {messages.length} messages, {unreadCount} unread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Session Timer */}
            <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600/50 flex items-center gap-2">
              <FaClock className="text-slate-400" />
              <span className="text-slate-300 text-sm font-mono">{sessionTime}</span>
              <button
                onClick={extendSession}
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors duration-300"
                title="Extend session"
              >
                +15m
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-md p-3 rounded-full border border-orange-400/30 transition-all duration-300 group"
              title="Logout"
            >
              <FaSignOutAlt className="text-orange-300 group-hover:text-orange-200" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md p-3 rounded-full border border-red-400/30 transition-all duration-300 group"
            >
              <FaTimes className="text-red-300 group-hover:text-red-200" />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Messages List */}
          <div className="w-1/2 border-r border-slate-700/50 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="animate-pulse">Loading…</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FaEnvelope className="text-6xl mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => openMessage(message)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      message.status === 'unread'
                        ? 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-900/30'
                        : 'bg-slate-800/50 border-slate-600/30 hover:bg-slate-700/50'
                    } ${selectedMessage?.id === message.id ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {message.status === 'unread' ? (
                            <FaEnvelope className="text-orange-400 text-sm flex-shrink-0" />
                          ) : (
                            <FaEnvelopeOpen className="text-slate-400 text-sm flex-shrink-0" />
                          )}
                          <h4
                            className={`font-semibold truncate ${
                              message.status === 'unread' ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {message.name}
                          </h4>
                        </div>
                        <p className="text-slate-400 text-sm truncate mb-2">{message.email}</p>
                        <p className="text-slate-300 text-sm line-clamp-2">{message.message}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(message.timestamp).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {message.status === 'unread' && (
                        <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Message Details */}
          <div className="w-1/2 flex flex-col">
            {selectedMessage ? (
              <div className="flex-1 flex flex-col">
                {/* Message Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedMessage.name}</h3>
                      <p className="text-orange-400 mb-1">{selectedMessage.email}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(selectedMessage.timestamp).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedMessage.status === 'unread'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-slate-600/20 text-slate-300 border border-slate-600/30'
                        }`}
                      >
                        {selectedMessage.status === 'unread' ? 'Unread' : 'Read'}
                      </div>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        disabled={!isAdmin}
                        className={`p-2 rounded-full transition-all duration-300 group ${
                          isAdmin
                            ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/30'
                            : 'bg-slate-700/40 border border-slate-600/40 opacity-60 cursor-not-allowed'
                        }`}
                        title={isAdmin ? 'Delete' : 'Admin only'}
                      >
                        <FaTrash className="text-red-300 group-hover:text-red-200 text-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FaEnvelopeOpen className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminMessages;
