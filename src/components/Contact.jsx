// src/components/Contact.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane,
  FaUser,
  FaEnvelope,
  FaComment,
  FaCamera,
  FaHeart,
  FaReply,
  FaCog,
  FaWhatsapp,
  FaTrash,
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import AdminMessages from './AdminMessages';
import AdminLogin from './AdminLogin';
import './Contact.css';
import { useAdmin } from '../contexts/AdminContext';

import { db } from '../firebaseConfig'; // ⬅️ Hapus `storage`, kita tidak pakai Firebase Storage lagi
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

// =============================
// Cloudinary Config (frontend)
// =============================
// Disarankan pindahkan ke .env.local dengan prefix NEXT_PUBLIC_
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dy5ousfah
// NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=faizaryaputra_upload
const CLOUDINARY_CLOUD_NAME = 'dy5ousfah';
const CLOUDINARY_UPLOAD_PRESET = 'faizaryaputra_upload';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function Contact() {
  // Contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Comment form
  const [commentForm, setCommentForm] = useState({
    name: '',
    message: '',
    photo: null,
    photoPreview: null,
  });
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);

  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Admin modal states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated } = useAdmin();

  // Deleting state (untuk tombol hapus)
  const [deletingId, setDeletingId] = useState(null);

  // ===== Helpers =====
  const formatTimestamp = (ts) => {
    try {
      let d;
      if (!ts) return 'Baru saja';
      if (typeof ts === 'string' || typeof ts === 'number') d = new Date(ts);
      else if (ts.toDate) d = ts.toDate();
      else if (ts.seconds) d = new Date(ts.seconds * 1000);
      else d = new Date();

      return d.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Baru saja';
    }
  };

  // Optimasi thumbnail Cloudinary (opsional)
  const cldThumb = (url, transform = 'f_auto,q_auto,c_fill,w_96,h_96,r_max') => {
    if (!url || !url.includes('/upload/')) return url;
    return url.replace('/upload/', `/upload/${transform}/`);
  };

  // Validasi file gambar
  const validateImage = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!ALLOWED.includes(file.type)) return 'Format file harus JPG, PNG, atau WEBP.';
    if (file.size > MAX_SIZE) return 'Ukuran gambar maksimal 5MB.';
    return null;
  };

  // ===== Realtime comments from Firestore =====
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComments(list);
      },
      (err) => {
        console.error('Firestore listen error:', err);
      }
    );
    return () => unsub();
  }, []);

  // ===== Contact form (localStorage seperti versi kamu) =====
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      const newMessage = {
        id: Date.now(),
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        timestamp: new Date().toISOString(),
        status: 'unread',
      };

      const saved = localStorage.getItem('portfolioContactMessages');
      const messages = saved ? JSON.parse(saved) : [];
      localStorage.setItem('portfolioContactMessages', JSON.stringify([newMessage, ...messages]));

      // Simulasi kirim email
      await new Promise((r) => setTimeout(r, 1500));

      alert('Pesan berhasil dikirim! Terima kasih telah menghubungi saya.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pesan. Coba lagi ya.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // ===== Upload preview photo =====
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const err = validateImage(file);
    if (err) {
      setUploadError(err);
      // reset input & state
      if (fileInputRef.current) fileInputRef.current.value = '';
      setCommentForm((prev) => ({ ...prev, photo: null, photoPreview: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCommentForm((prev) => ({ ...prev, photo: file, photoPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ===== Upload file ke Cloudinary (unsigned) =====
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      const msg = data?.error?.message || 'Upload ke Cloudinary gagal.';
      throw new Error(msg);
    }
    return data.secure_url; // URL gambar yang aman (https)
  };

  // ===== Submit comment to Firestore =====
  const handleCommentSubmit = async (e) => {
  e.preventDefault();

  // Validasi form
  if (!commentForm.name.trim() || !commentForm.message.trim()) return;

  setIsSubmittingComment(true);

  try {
    // Photo opsional: default null
    let photoURL = null;

    // Upload ke Cloudinary bila ada file
    if (commentForm.photo) {
      photoURL = await uploadToCloudinary(commentForm.photo);
    }

    // Simpan komentar ke Firestore
    await addDoc(collection(db, 'comments'), {
      name: commentForm.name.trim(),
      message: commentForm.message.trim(),
      photo: photoURL,       // null jika tidak ada
      likes: 0,              // wajib 0 saat create
      timestamp: serverTimestamp(), // server timestamp
    });

    // Reset form
    setCommentForm({ name: '', message: '', photo: null, photoPreview: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  } catch (err) {
    console.error(err);
    alert(`Gagal mengirim komentar: ${err.message}`);
  } finally {
    setIsSubmittingComment(false);
  }
};

  // ===== Like comment (increment + sederhana anti-spam per browser) =====
  const handleLikeComment = async (commentId) => {
    try {
      // Cegah like berulang dari user yang sama (per browser)
      const key = 'liked_comment_ids';
      const liked = JSON.parse(localStorage.getItem(key) || '[]');
      if (liked.includes(commentId)) return; // sudah like

      const refDoc = doc(db, 'comments', commentId);
      await updateDoc(refDoc, { likes: increment(1) });

      const updated = Array.from(new Set([...liked, commentId]));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      alert('Gagal menyukai komentar. Coba lagi ya.');
    }
  };

  // ===== Delete comment (admin only) =====
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) return; // guard di UI
    const ok = window.confirm('Hapus komentar ini? Tindakan tidak bisa dibatalkan.');
    if (!ok) return;

    try {
      setDeletingId(commentId);
      await deleteDoc(doc(db, 'comments', commentId));
      // onSnapshot akan update otomatis
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus komentar. Coba lagi ya.');
    } finally {
      setDeletingId(null);
    }
  };

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <FaGithub />,
      url: 'https://github.com/faizaryaputra',
      color: 'from-gray-600 to-gray-800',
      hoverColor: 'hover:shadow-gray-500/25',
    },
    {
      name: 'Whatsapp',
      icon: <FaWhatsapp />,
      url: 'https://wa.me/6285748522497?text=Halo%2C%20saya%20tertarik%20dengan%20portofolio%20Anda.',
      color: 'from-green-500 to-cyan-500',
      hoverColor: 'hover:shadow-pink-500/25',
    },
    {
      name: 'Instagram',
      icon: <FaInstagram />,
      url: 'https://instagram.com/faizz5z',
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:shadow-pink-500/25',
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin />,
      url: 'https://linkedin.com/in/faiz-arya-putra-8527542a0',
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:shadow-blue-500/25',
    },
    {
      name: 'TikTok',
      icon: <SiTiktok />,
      url: 'https://tiktok.com/@5zclipper',
      color: 'from-black to-red-600',
      hoverColor: 'hover:shadow-red-500/25',
    },
  ];

  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-orange-900/10"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20 relative"
        >
          <h2 className="text-5xl md:text-6xl font-bold font-moderniz mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">GET IN</span>{' '}
            <span className="text-white">TOUCH</span>
          </h2>
          <p className="text-xl text-slate-400 font-cascadia">Mari berkolaborasi dan ciptakan sesuatu yang amazing!</p>

          {/* Admin Button */}
          <button
            onClick={() => {
              if (isAuthenticated) setIsAdminOpen(true);
              else setIsLoginOpen(true);
            }}
            className="absolute top-0 right-0 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm p-3 rounded-full border border-slate-600/50 hover:border-orange-400/50 transition-all duration-300 group"
            title={isAuthenticated ? 'Admin Panel' : 'Admin Login'}
          >
            <FaCog className="text-slate-400 group-hover:text-orange-400 transition-colors duration-300 group-hover:rotate-90" />
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Contact & Social */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Contact Form */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-yellow-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full">
                    <FaPaperPlane className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Hubungi Saya</h3>
                    <p className="text-slate-400">Ada yang ingin didiskusikan? Kirim pesan ke saya!</p>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="group">
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400 transition-colors duration-300" />
                      <input
                        type="text"
                        placeholder="Nama Anda"
                        value={contactForm.name}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400 transition-colors duration-300" />
                      <input
                        type="email"
                        placeholder="Email Anda"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="relative">
                      <FaComment className="absolute left-4 top-6 text-slate-400 group-focus-within:text-orange-400 transition-colors duration-300" />
                      <textarea
                        placeholder="Pesan Anda"
                        rows="4"
                        value={contactForm.message}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingContact}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Kirim Pesan</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              <span className="text-slate-400 font-semibold">atau</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            </div>

            {/* Social Media */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Connect With Me</h3>
                <div className="grid gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className={`group flex items-center gap-4 p-4 bg-gradient-to-r ${social.color} rounded-xl text-white transition-all duration-300 ${social.hoverColor} hover:shadow-xl`}
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{social.icon}</div>
                      <div className="flex-1">
                        <span className="font-semibold">{social.name}</span>
                        <p className="text-sm opacity-90">Follow me on {social.name}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FaReply className="rotate-180" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Comments */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Comment Form */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full">
                    <FaComment className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Leave a Comment</h3>
                    <p className="text-slate-400">Share your thoughts!</p>
                  </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden">
                          {commentForm.photoPreview ? (
                            <img src={commentForm.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FaCamera />
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-500 transition-colors duration-300">
                          <FaCamera className="text-sm" />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {uploadError && (
                        <p className="mt-2 text-xs text-red-400 max-w-[12rem]">{uploadError}</p>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={commentForm.name}
                        onChange={(e) => setCommentForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                        required
                      />
                      <textarea
                        placeholder="Write your comment..."
                        rows="3"
                        value={commentForm.message}
                        onChange={(e) => setCommentForm((prev) => ({ ...prev, message: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingComment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50"
                  >
                    {isSubmittingComment ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaComment />
                        <span>Post Comment</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Comments Display */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <FaComment className="text-orange-400" />
                Comments ({comments.length})
              </h4>

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -100 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-orange-400/30 transition-all duration-300"
                    >
                      {/* Tombol hapus (admin only) */}
                      {isAuthenticated && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          title="Hapus komentar"
                          className="absolute top-3 right-3 p-2 rounded-lg border border-slate-600/50 text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all disabled:opacity-50"
                        >
                          {deletingId === comment.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      )}

                      <div className="flex gap-4">
                        <img
                          src={
                            comment.photo
                              ? cldThumb(comment.photo)
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  comment.name || 'User'
                                )}&background=00ffdc&color=000754&size=100`
                          }
                          alt={comment.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-white">{comment.name}</h5>
                              <p className="text-xs text-slate-400">{formatTimestamp(comment.timestamp)}</p>
                            </div>
                          </div>
                          <p className="text-slate-300 mt-2 leading-relaxed">{comment.message}</p>
                          <div className="flex items-center gap-4 mt-4">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors duration-300 group/like"
                            >
                              <FaHeart className="group-hover/like:scale-110 transition-transform duration-300" />
                              <span className="text-sm">{comment.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {comments.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <FaComment className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>Belum ada komentar. Jadilah yang pertama!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Admin Modals */}
      <AnimatePresence>
        {isAdminOpen && <AdminMessages isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isLoginOpen && <AdminLogin isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
