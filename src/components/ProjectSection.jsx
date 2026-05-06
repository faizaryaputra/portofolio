// src/components/ProjectSection.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExternalLinkAlt, FaReact, FaNodeJs, FaHtml5, FaCss3Alt, 
  FaJsSquare, FaTools, FaFigma, FaGithub, FaTimes, FaDownload, FaLaravel, FaPhp
} from 'react-icons/fa';
import { 
  SiTailwindcss, SiNextdotjs, SiVercel, SiMongodb, SiMysql, SiFirebase,
  SiExpress, SiPostgresql, SiGoland, SiVuedotjs, SiVite
} from 'react-icons/si';
import { PiCodeBold } from "react-icons/pi";
import { LuBadge } from "react-icons/lu";
import { LiaLayerGroupSolid } from "react-icons/lia";
import { useNavbar } from '../contexts/NavbarContext';

// ===================================
// DATA PROYEK (CONTOH)
// ===================================
const dummyProjects = [
    {
    title: "5ZCafeshop",
    description: "Aplikasi web pemesanan dan manajemen kafe berbasis Laravel, dengan fitur keranjang belanja, pemesanan menu, login, dan integrasi pembayaran.",
    tech: ["Next.js", "React", "TailwindCSS", "Laravel", "Mysql"],
    link: "https://github.com/faizaryaputra/5Z_shop",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/5ZCafeshop1.jpg" },
      { type: "image", src: "/project/5ZCafeshop2.jpg" },
      { type: "video", src: "/project/5ZCafeshop.mp4" },
    ],
  },
  {
    title: "5ZEternity",
    description: "Aplikasi web AI chatbot seperti ChatGPT yang dibangun dengan Ollama dan model Gemma 2B, mendukung percakapan interaktif dan respons cerdas.",
    tech: ["Node.js", "Express", "MongoDB", "TailwindCSS"],
    link: "https://github.com/faizaryaputra/5ZEternity",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/5ZEternity.jpg" },
    ],
  },
  {
    title: "5ZHotel",
    description: "Sistem reservasi hotel berbasis Laravel dengan manajemen kamar, pemesanan, dan dashboard admin.",
    tech: ["Next.js", "TailwindCSS", "Laravel"],
    link: "https://github.com/faizaryaputra/5ZHotel",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/5ZHotel1.jpg" },
      { type: "image", src: "/project/5ZHotel2.jpg" },
      { type: "image", src: "/project/5ZHotel3.jpg" },
      { type: "image", src: "/project/5ZHotel4.jpg" },
      { type: "image", src: "/project/5ZHotel5.jpg" },
      { type: "video", src: "/project/5ZHotel.mp4" },
    ],
  },
  {
    title: "5ZAgency",
    description: "Platform website agency modern yang menampilkan layanan digital seperti pembuatan website, desain UI/UX, dan branding. Dilengkapi dengan tampilan interaktif, animasi halus, serta halaman showcase untuk meningkatkan daya tarik klien.",
    tech: ["React.js", "TailwindCSS"],
    link: "https://github.com/faizaryaputra/5ZHotel",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/5ZAgency1.jpg" },
      { type: "image", src: "/project/5ZAgency2.jpg" },
      { type: "image", src: "/project/5ZAgency3.jpg" },
      { type: "image", src: "/project/5ZAgency4.jpg" },
      { type: "video", src: "/project/5ZAgency.mp4" },
    ],
  },
  {
    title: "5ZNexa",
    description: "Platform HRIS modern yang mengintegrasikan manajemen karyawan, sistem absensi digital, dan monitoring kehadiran dalam satu sistem terpusat. Dirancang untuk meningkatkan efisiensi operasional perusahaan melalui dashboard yang informatif dan real-time data tracking.",
    tech: ["Next.js", "TailwindCSS", "PostgreeSQL", "Node.js"],
    link: "https://github.com/faizaryaputra/5ZHotel",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/5ZNexa1.jpg" },
      { type: "image", src: "/project/5ZNexa2.jpg" },
      { type: "image", src: "/project/5ZNexa3.jpg" },
      { type: "image", src: "/project/5ZNexa4.jpg" },
      { type: "image", src: "/project/5ZNexa5.jpg" },
      { type: "image", src: "/project/5ZNexa6.jpg" },
      { type: "image", src: "/project/5ZNexa7.jpg" },
    ],
  },
  {
    title: "TopUp5Z",
    description: "Platform top up digital modern untuk game dan layanan online dengan sistem transaksi cepat, integrasi pembayaran, dan pengalaman pengguna yang sederhana serta responsif.",
    tech: ["React.js", "TailwindCSS", "Node.js"],
    link: "https://github.com/faizaryaputra/5ZHotel",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/TopUp5Z1.jpg" },
      { type: "image", src: "/project/TopUp5Z2.jpg" },
      { type: "image", src: "/project/TopUp5Z3.jpg" },
      { type: "image", src: "/project/TopUp5Z4.jpg" },
      { type: "video", src: "/project/TopUp5Z.mp4" },
    ],
  },
  {
    title: "Birthday-Generator",
    description: "Aplikasi generator ucapan ulang tahun interaktif dengan animasi dan visual menarik, memungkinkan pengguna membuat pesan personal yang unik dan membagikannya secara digital.",
    tech: ["React.js", "TailwindCSS", "Laravel"],
    link: "https://github.com/faizaryaputra/5ZHotel",
    category: "Web/Apps",
    media: [
      { type: "image", src: "/project/ucapin1.jpg" },
      { type: "image", src: "/project/ucapin2.jpg" },
      { type: "image", src: "/project/ucapin3.jpg" },
      { type: "image", src: "/project/ucapin4.jpg" },
      { type: "image", src: "/project/ucapin5.jpg" },
      { type: "video", src: "/project/ucapin1.mp4" },
      { type: "video", src: "/project/ucapin2.mp4" },
      { type: "video", src: "/project/ucapin3.mp4" },
    ],
  },
  {
    title: "5ZEternity Trade",
    description: "Portofolio interaktif 3D dengan model GLB, animasi fisika, dan interaksi mouse menggunakan React Three Fiber dan Rapier Physics.",
    tech: ["Figma"],
    link: "https://www.figma.com/proto/zPzwkeMku5hV06vzbQcP0m/Aplikasi-5Z-Eternity?node-id=427-6&t=z2CYnkClQrgYpiub-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=427%3A6",
    category: "Design",
    media: [
      { type: "image", src: "/project/5ZEternity Trade.jpg" },
    ],
  },
];

// ===================================
// DATA SERTIFIKAT FAIZ ARYA PUTRA
// ===================================
const userCertificates = [
    {
        title: "CSS Introduction MySkill",
        issuer: "MySkill",
        date: "Okt 2024",
        link: "/certificates/CSS Introduction MySkill.pdf",
        image: "/certificate-images/CSS Introduction MySkill.jpg",
    },
    {
        title: "UI UX Figma Introduction MySkill x Lion Parcel",
        issuer: "MySkill",
        date: "Sep 2024",
        link: "/certificates/UI_UX Figma Introduction MySkill x Lion Parcel.pdf",
        image: "/certificate-images/UI_UX Figma Introduction MySkill x Lion Parcel.jpg",
    },
    {
        title: "Creating Marketing Campaign MySkill",
        issuer: "MySkill",
        date: "Sep 2024",
        link: "/certificates/Creating Marketing Campaign MySkill.pdf",
        image: "/certificate-images/Creating Marketing Campaign MySkill.jpg",
    },
    {
        title: "Color and Typography MySkill",
        issuer: "MySkill",
        date: "Sep 2024",
        link: "/certificates/Color and Typography MySkill.pdf",
        image: "/certificate-images/Color and Typography MySkill.jpg",
    },
    {
        title: "Backend Development Fundamental MySkill",
        issuer: "MySkill",
        date: "Sep 2024",
        link: "/certificates/Backend Development Fundamental MySkill.pdf",
        image: "/certificate-images/Backend Development Fundamental MySkill.jpg",
    },
    {
        title: "Sertifikat Pelatihan",
        issuer: "Workshop",
        date: "Agt 2025",
        link: "/certificates/Sertifikat Pelatihan.pdf",
        image: "/certificate-images/Sertifikat Pelatihan.jpg",
    },
];

const techStack = {
  frontend: [
    { name: "React", icon: <FaReact className="text-[#61DAFB]" /> },
    { name: "Next.js", icon: <SiNextdotjs className="text-white" /> },
    { name: "JavaScript", icon: <FaJsSquare className="text-[#F7DF1E]" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="text-[#38B2AC]" /> },
    { name: "HTML5", icon: <FaHtml5 className="text-[#E34F26]" /> },
    { name: "CSS3", icon: <FaCss3Alt className="text-[#1572B6]" /> },
    { name: "Vue.js", icon: <SiVuedotjs className="text-[#42B883]" /> },
    { name: "Vite", icon: <SiVite className="text-[#646CFF]" /> },
  ],
  backend: [
    { name: "Node.js", icon: <FaNodeJs className="text-[#68A063]" /> },
    { name: "Express", icon: <SiExpress className="text-white" /> },
    { name: "Laravel", icon: <FaLaravel className="text-[#FF2D20]" /> },
    { name: "PHP", icon: <FaPhp className="text-[#777BB4]" /> },
    { name: "Golang", icon: <SiGoland className="text-[#00ADD8]" /> },
  ],
  database: [
  { name: "MongoDB", icon: <SiMongodb className="text-[#4DB33D]" /> },
  { name: "PostgreSQL", icon: <SiPostgresql className="text-[#336791]" /> },
  { name: "MySQL", icon: <SiMysql className="text-[#4479A1]" /> },
  { name: "Firebase", icon: <SiFirebase className="text-[#ffba1b]" /> }, // tambahan
],
  tools: [
    { name: "Git & GitHub", icon: <FaGithub className="text-white" /> },
    { name: "Vercel", icon: <SiVercel className="text-white" /> },
    { name: "Figma", icon: <FaFigma className="text-[#F24E1E]" /> },
    { name: "Tools Lain", icon: <FaTools className="text-gray-400" /> },
  ],
};
// ===================================
// HELPER & ANIMATION COMPONENTS
// ===================================
const LineShadowText = ({ children, className, shadowColor = "#ff5000", ...props }) => {
    return (
        <motion.span
            style={{ "--shadow-color": shadowColor }}
            className={`relative z-0 line-shadow-effect ${className}`}
            data-text={children}
            {...props}
        >
            {children}
        </motion.span>
    );
};

// ===================================
// KOMPONEN KARTU SERTIFIKAT
// ===================================
const CertificateCard = ({ cert, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="group relative cursor-pointer"
            whileHover={{ y: -8 }}
            onClick={() => onClick(cert)}
        >
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-400/30 transition-all duration-500">
                <div className="absolute inset-0">
                    <img src={cert.image} alt={cert.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30 group-hover:from-slate-900/95 transition-all duration-500"></div>
                </div>
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex-1 flex items-start justify-between">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                            <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">{cert.issuer}</span>
                        </div>
                        <div className="bg-red-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-400/30">
                            <span className="text-xs font-bold text-yellow-300">{cert.date}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight">{cert.title}</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-slate-300">
                                <FaDownload className="text-sm" />
                                <span className="text-sm font-medium">View Certificate</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-orange-500/20 backdrop-blur-md p-2 rounded-full border border-orange-400/30">
                                    <FaExternalLinkAlt className="text-orange-300 text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 via-transparent to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-500"></div>
            </div>
        </motion.div>
    );
};

// ===================================
// KOMPONEN PREVIEW MODAL SERTIFIKAT
// ===================================
const CertificatePreviewModal = ({ certificate, onClose }) => {
    if (!certificate) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative max-w-4xl w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md p-3 rounded-full border border-red-400/30 transition-all duration-300 group">
                        <FaTimes className="text-red-300 group-hover:text-red-200" />
                    </button>
                </div>
                <div className="p-6 sm:p-8">
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{certificate.title}</h2>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="bg-orange-500/20 px-4 py-2 rounded-full text-orange-300 font-semibold border border-orange-400/30">{certificate.issuer}</span>
                                    <span className="bg-red-500/20 px-4 py-2 rounded-full text-yellow-300 font-semibold border border-yellow-400/30">{certificate.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <img src={certificate.image} alt={certificate.title} className="w-full h-auto max-h-[60vh] object-contain" />
                    </div>
                    <div className="mt-6 flex justify-center">
                        <a href={certificate.link} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-orange-500/25">
                            <FaDownload className="group-hover:scale-110 transition-transform duration-300" />
                            <span>Download Certificate</span>
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProjectModal = ({ project, onClose }) => {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  if (!project) return null;

  const media = project.media || [];

  const paginate = (dir) => {
    setCurrentIndex(([prev]) => [
      (prev + dir + media.length) % media.length,
      dir,
    ]);
  };

  const swipeConfidenceThreshold = 10000;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center px-2 sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
  className="
    relative w-full 
    max-w-[92%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl   /* 🔥 lebih kecil */
    bg-[#0a0f1f]/90 
    border border-white/10 
    rounded-2xl md:rounded-3xl 
    overflow-hidden shadow-2xl
  "
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-white/10 hover:bg-red-500/20 backdrop-blur-md p-2 sm:p-3 rounded-full border border-white/20 transition"
        >
          <FaTimes className="text-white text-sm sm:text-base" />
        </button>

        {/* ================= SLIDER ================= */}
        <div className="
  relative w-full 
  h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]   /* 🔥 lebih pendek */
  bg-black overflow-hidden
">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              className="absolute w-full h-full"
              custom={direction}
              initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
              transition={{ duration: 0.35 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -swipeConfidenceThreshold) paginate(1);
                else if (swipe > swipeConfidenceThreshold) paginate(-1);
              }}
            >
              {media[currentIndex]?.type === "video" ? (
                <video
                  src={media[currentIndex].src}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={media[currentIndex]?.src}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* 🔥 MODERN ARROW */}
          {media.length > 1 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="
                  hidden md:flex
                  absolute left-4 top-1/2 -translate-y-1/2
                  w-11 h-11 items-center justify-center
                  rounded-full
                  bg-white/10 backdrop-blur-lg
                  border border-white/20
                  hover:bg-orange-500/30 hover:scale-110
                  transition-all duration-300
                  shadow-lg
                "
              >
                <span className="text-white text-xl">‹</span>
              </button>

              <button
                onClick={() => paginate(1)}
                className="
                  hidden md:flex
                  absolute right-4 top-1/2 -translate-y-1/2
                  w-11 h-11 items-center justify-center
                  rounded-full
                  bg-white/10 backdrop-blur-lg
                  border border-white/20
                  hover:bg-orange-500/30 hover:scale-110
                  transition-all duration-300
                  shadow-lg
                "
              >
                <span className="text-white text-xl">›</span>
              </button>
            </>
          )}

          {/* DOT */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {media.map((_, i) => (
              <div
                key={i}
                onClick={() =>
                  setCurrentIndex([i, i > currentIndex ? 1 : -1])
                }
                className={`rounded-full cursor-pointer transition ${
                  i === currentIndex
                    ? "bg-orange-400 w-3 h-3 scale-125"
                    : "bg-white/40 w-2 h-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 🔥 THUMBNAIL PREVIEW (NEW) */}
        {media.length > 1 && (
          <div className="px-3 py-2 bg-black/40 backdrop-blur-md flex gap-2 overflow-x-auto scrollbar-hide">
  {media.map((item, i) => (
    <div
      key={i}
      onClick={() =>
        setCurrentIndex([i, i > currentIndex ? 1 : -1])
      }
      className={`
        relative min-w-[60px] sm:min-w-[70px] md:min-w-[80px]
        h-[45px] sm:h-[50px] md:h-[55px]   /* 🔥 lebih kecil */
        rounded-md overflow-hidden cursor-pointer
        border transition
        ${
          i === currentIndex
            ? "border-orange-400 scale-105"
            : "border-white/10 opacity-60 hover:opacity-100"
        }
      `}
    >
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-5 md:p-6 text-white space-y-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-300">
            {project.title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {project.tech.map((t, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-xs md:text-sm px-2 py-1 bg-orange-900/60 border border-orange-700/30 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="pt-3">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold hover:scale-105 transition"
            >
              <FaGithub />
              View Source
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// ===================================
// KOMPONEN KARTU PROYEK
// ===================================
const ProjectCard = ({ project, onClick }) => {
  const techIcons = {
    "Next.js": <SiNextdotjs />, "React": <FaReact />, "TailwindCSS": <SiTailwindcss />,
    "Laravel": <FaLaravel />, "Node.js": <FaNodeJs />, "Express": <SiExpress />, 
    "MongoDB": <SiMongodb />, "JWT": "🔑", "Figma": <FaFigma />, "Mysql": <SiMysql />
    };
    const thumbnail =
  project.media?.find((m) => m.type === "image")?.src ||
  "/fallback.jpg"; // optional fallback
  return (
    <motion.div
      layout
      onClick={() => onClick(project)}
      whileHover={{ scale: 1.03 }}
      className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer"
    >

<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
  style={{ backgroundImage: `url(${thumbnail})` }}
/>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-all duration-300 flex flex-col justify-between p-5 text-white">
        
        <div>
          <h3 className="text-xl font-bold text-orange-300">
            {project.title}
          </h3>
          <p className="text-sm text-slate-300 mt-2 line-clamp-2">
            {project.description}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-orange-900/60 rounded-full border border-orange-700/30"
              >
                {t}
              </span>
            ))}
          </div>

          <FaExternalLinkAlt className="opacity-70 group-hover:opacity-100" />
        </div>
      </div>

      {/* Glow border */}
      <div className="absolute inset-0 rounded-2xl border border-orange-400/10 group-hover:border-orange-400/40 transition-all" />
    </motion.div>
  );
};

// ===================================
// KOMPONEN UTAMA SECTION PROJECT
// ===================================
function ProjectSection() {
  const [activeTab, setActiveTab] = useState('Projects');
  const [projectCategory, setProjectCategory] = useState('Web/Apps');
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { hideNavbar, showNavbar } = useNavbar();

  // === CHANGE START: State dan konstanta untuk Show More/Less ===
  const INITIAL_CERTIFICATES_TO_SHOW = 6;
  const [visibleCertificatesCount, setVisibleCertificatesCount] = useState(INITIAL_CERTIFICATES_TO_SHOW);
  // === CHANGE END ===

  useEffect(() => {
  if (previewCertificate || selectedProject) {
    hideNavbar();
  } else {
    showNavbar();
  }
}, [previewCertificate, selectedProject, hideNavbar, showNavbar]);

  useEffect(() => {
    return () => {
      showNavbar();
    };
  }, [showNavbar]);

  const tabs = [
    { id: 'Projects', label: 'Projects', icon: <PiCodeBold className="text-[1.7em] mb-1" /> },
    { id: 'Certificate', label: 'Certificates', icon: <LuBadge className="text-[1.5em] mb-1" /> },
    { id: 'Tech Stack', label: 'Tech Stack', icon: <LiaLayerGroupSolid className="text-[1.5em] mb-1" /> },
  ];

  const filteredProjects = dummyProjects.filter(
    (p) => p.category === projectCategory
  );

  // === CHANGE START: Handler untuk tombol Show More/Less ===
  const handleShowMore = () => {
    setVisibleCertificatesCount(userCertificates.length);
  };

  const handleShowLess = () => {
    setVisibleCertificatesCount(INITIAL_CERTIFICATES_TO_SHOW);
  };
  // === CHANGE END ===

  return (
    <section id="project" className="py-20">
      
      <style>{`
        @keyframes line-shadow-anim { 0% { background-position: 0 0; } 100% { background-position: 100% 100%; } }
        .line-shadow-effect::after { content: attr(data-text); position: absolute; z-index: -1; left: 0.04em; top: 0.04em; background-image: linear-gradient(45deg, transparent 45%, var(--shadow-color) 45%, var(--shadow-color) 55%, transparent 0); background-size: 0.06em 0.06em; -webkit-background-clip: text; background-clip: text; color: transparent; animation: line-shadow-anim 30s linear infinite; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl font-bold font-moderniz">
            <span style={{color: "#ff6a00"}}><LineShadowText shadowColor="#ff0000">PORTOFOLIO</LineShadowText></span>
            {' '}
            <span style={{ color: "#fff" }}><LineShadowText shadowColor="#bbbbbb">SHOWCASE</LineShadowText></span>
        </h2>
      </motion.div>

      <div className="w-full">
        <div className="flex justify-center mb-12">
          <motion.div
            layout
            className="inline-flex w-full max-w-4xl rounded-3xl p-2 shadow-lg border border-slate-800 bg-gradient-to-r from-[#101624] via-[#0a1627] to-[#0a223a] backdrop-blur-md"
            style={{ background: "linear-gradient(90deg, #101624 0%, #0a1627 50%, #0a223a 100%)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 flex-col items-center justify-center px-2 py-7 rounded-2xl font-semibold text-base transition-colors duration-300 outline-none ${activeTab === tab.id ? "text-white" : "text-slate-400 hover:text-orange-300"}`}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ zIndex: 1, minWidth: 0 }}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-0 bg-gradient-to-br from-[#0a223a] to-[#101624] rounded-2xl"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    style={{ zIndex: -1, opacity: 0.96 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-2">
                  {tab.icon}
                  <span className="font-bold">{tab.label}</span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        <div
          className="rounded-3xl p-0 md:p-6 shadow-xl border border-slate-800/60 mx-auto max-w-7xl bg-clip-padding"
          style={{ background: "rgba(17, 24, 39, 0.55)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-10"
            >
              {activeTab === 'Projects' && (
                <>
                  <div className="flex justify-center gap-4 mb-8">
                    <button className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 border ${projectCategory === 'Web/Apps' ? 'bg-orange-700/80 text-white border-yellow-500 shadow-orange-500/10 shadow-lg' : 'bg-slate-900/60 text-orange-400 border-slate-700 hover:bg-orange-800/40 hover:text-white'}`} onClick={() => setProjectCategory('Web/Apps')}>Web/Apps</button>
                    <button className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 border ${projectCategory === 'Design' ? 'bg-orange-700/80 text-white border-yellow-500 shadow-orange-500/10 shadow-lg' : 'bg-slate-900/60 text-orange-400 border-slate-700 hover:bg-orange-800/40 hover:text-white'}`} onClick={() => setProjectCategory('Design')}>Design</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((p, i) => (
  <ProjectCard key={i} project={p} onClick={setSelectedProject} />
))
                    ) : (
                      <div className="col-span-full text-center text-slate-400 py-12">No projects in this category yet.</div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'Certificate' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* === CHANGE: Menggunakan slice untuk menampilkan sertifikat yang terlihat === */}
                    <AnimatePresence>
                      {userCertificates.slice(0, visibleCertificatesCount).map((cert, i) => (
                        <CertificateCard key={i} cert={cert} onClick={setPreviewCertificate} />
                      ))}
                    </AnimatePresence>
                  </div>
                  {/* === CHANGE START: Menambahkan tombol Show More/Less secara kondisional === */}
                  {userCertificates.length > INITIAL_CERTIFICATES_TO_SHOW && (
                    <div className="flex justify-center mt-12">
                      {visibleCertificatesCount < userCertificates.length ? (
                        <motion.button
                          onClick={handleShowMore}
                          className="group bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Show More
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={handleShowLess}
                          className="group bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Show Less
                        </motion.button>
                      )}
                    </div>
                  )}
                  {/* === CHANGE END === */}
                </div>
              )}
              {activeTab === 'Tech Stack' && (
                <div className="max-w-4xl mx-auto space-y-8">
                  {Object.entries(techStack).map(([category, techs]) => (
                    <div key={category}>
                      <h3 className="text-xl font-bold text-orange-300 capitalize mb-4 border-b-2 border-slate-800 pb-2">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {techs.map((tech, i) => (
                          <div key={i} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 transition-all duration-300 hover:bg-slate-800/50 hover:border-orange-500/30">
                            <div className="text-4xl">{tech.icon}</div>
                            <p className="text-sm text-slate-300">{tech.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {previewCertificate && (
          <CertificatePreviewModal 
            certificate={previewCertificate}
            onClose={() => setPreviewCertificate(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
  {selectedProject && (
    <ProjectModal
      project={selectedProject}
      onClose={() => setSelectedProject(null)}
    />
  )}
</AnimatePresence>
    </section>
  );
}

export default ProjectSection;