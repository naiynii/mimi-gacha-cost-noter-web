'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  LogOut, Plus, Trash2, Search, Filter, Calendar, Info, 
  RotateCw, ZoomIn, ZoomOut, Upload, Sparkles, TrendingUp, 
  PieChart as PieIcon, HelpCircle, Shield, Moon, Sun, DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const getGameIcon = (gameName) => {
  if (!gameName) return { emoji: '🎮', imageSrc: null, colorClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  
  const lower = gameName.toLowerCase();
  if (lower.includes('genshin')) {
    return { 
      emoji: '✨', 
      imageSrc: '/assets/Genshin_Impact.webp',
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
  }
  if (lower.includes('star rail') || lower.includes('hsr')) {
    return { 
      emoji: '🚂', 
      imageSrc: null,
      colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
    };
  }
  if (lower.includes('honkai impact') || lower.includes('hi3') || lower.includes('honkai_impact')) {
    return { 
      emoji: '🪐', 
      imageSrc: '/assets/Honkai_Impact.webp',
      colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
    };
  }
  if (lower.includes('zenless') || lower.includes('zzz')) {
    return { 
      emoji: '👾', 
      imageSrc: null,
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
    };
  }
  if (lower.includes('wuthering') || lower.includes('wuwa')) {
    return { 
      emoji: '🌊', 
      imageSrc: null,
      colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
    };
  }
  if (lower.includes('arknights')) {
    return { 
      emoji: '🐰', 
      imageSrc: null,
      colorClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
    };
  }
  if (lower.includes('fate') || lower.includes('fgo')) {
    return { 
      emoji: '🛡️', 
      imageSrc: null,
      colorClass: 'bg-red-500/10 text-red-400 border-red-500/20' 
    };
  }
  if (lower.includes('blue archive')) {
    return { 
      emoji: '🏫', 
      imageSrc: null,
      colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
    };
  }
  if (lower.includes('nikke')) {
    return { 
      emoji: '🔫', 
      imageSrc: null,
      colorClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
    };
  }
  if (lower.includes('deepspace') || lower.includes('love and')) {
    return { 
      emoji: '❤️', 
      imageSrc: null,
      colorClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
    };
  }
  if (lower.includes('reverse:')) {
    return { 
      emoji: '🎩', 
      imageSrc: null,
      colorClass: 'bg-amber-600/10 text-amber-500 border-amber-600/20' 
    };
  }
  return { 
    emoji: '🎮', 
    imageSrc: null,
    colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // UI state
  const [theme, setTheme] = useState('cosmic');
  const [data, setData] = useState({ total: 0, items: [], games: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OCR state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    game: '',
    detail: '',
    remark: ''
  });
  
  // Game input helper
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchGameQuery, setSearchGameQuery] = useState('');
  
  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mem Bot State
  const [memDialogue, setMemDialogue] = useState('สวัสดีมิว! ยินดีต้อนรับผู้บุกเบิกกลับสู่หอแห่งความทรงจำนะมิว~ 🎀');
  const [memEmotion, setMemEmotion] = useState('normal'); // normal, happy, thinking, scanning, success, error
  const [showDialogue, setShowDialogue] = useState(true);

  // References
  const fileInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const memTimerRef = useRef(null);

  // Auto-hide initial welcome dialogue after 4 seconds
  useEffect(() => {
    memTimerRef.current = setTimeout(() => {
      setShowDialogue(false);
    }, 4000);

    return () => {
      if (memTimerRef.current) {
        clearTimeout(memTimerRef.current);
      }
    };
  }, []);

  // Toast & Validation States
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [invalidFields, setInvalidFields] = useState({
    game: false,
    amount: false,
    detail: false,
    date: false
  });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'error') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('mimi-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Fetch Sheets Data
  const fetchSheetsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sheets');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      if (res.ok) {
        setData(json);
        updateMemDialogue(`เมมเปิดสมุดบันทึกเรียบร้อยแล้วมิว! ตอนนี้ผู้บุกเบิกมีบันทึกความทรงจำทั้งหมด ${json.items.length} รายการนะมิว~ 📝`, 'happy');
      } else {
        setErrorMsg(json.error || 'Failed to fetch data');
        updateMemDialogue('แงง... เกิดข้อผิดพลาดในการเปิดสมุดบันทึกมิว 😭', 'error');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Cannot connect to API server');
      updateMemDialogue('มิว! ติดต่อเชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้มิว...', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSheetsData();
    }
  }, [status]);

  // Click outside autocomplete to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'cosmic' ? 'dawn' : 'cosmic';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('mimi-theme', nextTheme);

    if (nextTheme === 'dawn') {
      updateMemDialogue('✨ มิว~ รุ่งอรุณเบิกเนตรแล้ว! สบายตาขึ้นมั้ยมิว?', 'happy');
    } else {
      updateMemDialogue('🌌 มิว~ สลับกลับเข้าสู่ค่ำคืนคอสมิกแห่งความฝันแล้วมิว!', 'normal');
    }
  };

  // Dialogue helper
  const updateMemDialogue = (text, emotion = 'normal') => {
    setMemDialogue(text);
    setMemEmotion(emotion);
    setShowDialogue(true);

    if (memTimerRef.current) {
      clearTimeout(memTimerRef.current);
    }
    memTimerRef.current = setTimeout(() => {
      setShowDialogue(false);
    }, 4000);
  };

  // Handle Drag & Drop / File Input Select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('❌ มิว! สลิปต้องเป็นไฟล์รูปภาพเท่านั้นนะมิว~ 📸', 'error');
      updateMemDialogue('❌ มิว! สลิปต้องเป็นไฟล์รูปภาพเท่านั้นนะมิว~', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setZoom(1);
    setRotation(0);
    setErrorMsg('');
    setSuccessMsg('');
    
    // Auto trigger scanning
    scanSlipFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processSelectedFile(file);
  };

  // OCR API call
  const scanSlipFile = async (file) => {
    setScanning(true);
    updateMemDialogue('🔍 เพ่งมอง... เมมกำลังใช้เวทมนตร์สแกนสลิปโอนเงินให้อยู่นะมิว~!', 'scanning');
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await fetch('/api/scan-slip', {
        method: 'POST',
        body: formDataObj
      });
      const json = await res.json();

      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          amount: json.amount || '',
          date: json.date || ''
        }));
        
        if (json.amount) {
          showToast('✅ สแกนสลิปสำเร็จแล้วมิว! 📸', 'success');
          updateMemDialogue(`✨ เมมแกะเสร็จแล้วมิว! ตรวจเจอค่า ${json.amount} บาท วันที่ ${json.date} นะมิว~ ตรวจสอบฟอร์มขวาต่อเลยมิว!`, 'success');
          setSuccessMsg('สแกนสลิปสำเร็จ! กรุณาตรวจสอบข้อมูลมิว~');
        } else {
          showToast('⚠️ สแกนสำเร็จ แต่ไม่พบยอดเงินมิว! 📝', 'warning');
          updateMemDialogue(`📝 เมมอ่านวันที่เจอเป็น ${json.date} แต่ยอดเงินหาไม่เจอมิว 😭 รบกวนผู้บุกเบิกกรอกยอดเงินเองน้า~`, 'thinking');
          setSuccessMsg('สแกนสำเร็จ แต่ไม่พบยอดเงิน กรุณาตรวจสอบมิว~');
        }
      } else {
        showToast(`❌ ${json.error || 'สแกนสลิปไม่สำเร็จมิว~'}`, 'error');
        updateMemDialogue(`❌ ${json.error || 'สแกนสลิปไม่สำเร็จมิว'}`, 'error');
        setErrorMsg(json.error || 'Failed to scan slip');
      }
    } catch (error) {
      console.error(error);
      showToast('❌ แงง... มีปัญหาในการติดต่อเครื่องมือสแกนสลิปมิว', 'error');
      updateMemDialogue('แงง... มีปัญหาในการติดต่อเครื่องมือสแกนสลิปมิว', 'error');
      setErrorMsg('OCR connection error');
    } finally {
      setScanning(false);
    }
  };

  // Delete transaction
  const handleDelete = async (id, gameName, amount) => {
    if (!confirm(`ต้องการที่จะลบรายการเติมเงินเกม ${gameName} ยอด ${amount} บาท ใช่หรือไม่มิว?`)) return;

    try {
      updateMemDialogue(`🗑️ กำลังลบข้อมูลความทรงจำย่อยนี้อยู่มิว...`, 'thinking');
      const res = await fetch(`/api/sheets?id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      
      if (res.ok) {
        setSuccessMsg('ลบรายการความทรงจำสำเร็จแล้วมิว! ✅');
        updateMemDialogue(`✅ ลบข้อมูลรายการเติมเงินเรียบร้อยแล้วมิว! ยอดเงินจะถูกอัปเดตนะมิว~`, 'success');
        fetchSheetsData();
      } else {
        setErrorMsg(json.error || 'Failed to delete');
        updateMemDialogue(`แงง ลบรายการไม่สำเร็จมิว: ${json.error}`, 'error');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Delete request failed');
    }
  };

  // Submit new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setInvalidFields({ game: false, amount: false, detail: false, date: false });

    // 1. Validate Game Name
    if (!formData.game.trim()) {
      setInvalidFields(prev => ({ ...prev, game: true }));
      showToast('มิว! อย่าลืมกรอกชื่อเกมด้วยน้าผู้บุกเบิก~', 'error');
      updateMemDialogue('มิว! อย่าลืมกรอกชื่อเกมด้วยน้าผู้บุกเบิก', 'thinking');
      return;
    }

    // 2. Validate Amount
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setInvalidFields(prev => ({ ...prev, amount: true }));
      showToast('ยอดเงินผิดปกติมิว! กรอกตัวเลขยอดเงินที่มากกว่า 0 ให้เมมหน่อยน้า~', 'error');
      updateMemDialogue('จำนวนเงินผิดปกติมิว! กรอกเลขบวกให้เมมหน่อยนะมิว~', 'error');
      return;
    }

    // 3. Validate Date
    if (formData.date) {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
      if (!dateRegex.test(formData.date)) {
        setInvalidFields(prev => ({ ...prev, date: true }));
        showToast('รูปแบบวันที่ต้องเป็น วัน/เดือน/ปี ค.ศ. เช่น 12/04/2026 น้ามิว~', 'error');
        updateMemDialogue('รูปแบบวันที่ไม่ถูกต้องมิว! ต้องเป็น วัน/เดือน/ปีค.ศ. เช่น 12/04/2026 น้า', 'error');
        return;
      }
    }

    // 4. Validate Details
    if (!formData.detail.trim()) {
      setInvalidFields(prev => ({ ...prev, detail: true }));
      showToast('มิว! เติมแล้วได้อะไรมาบ้างนะ? บอกรายละเอียดให้เมมจดหน่อยมิว~', 'error');
      updateMemDialogue('มิว! เติมแล้วได้อะไรมาบ้างนะ? บอกให้เมมจดรายละเอียดหน่อยมิว~', 'thinking');
      return;
    }

    try {
      setSubmitting(true);
      updateMemDialogue('กำลังจดลงสมุดบันทึกแห่งดวงดาวมิว...', 'thinking');

      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (res.ok) {
        setSuccessMsg('บันทึกความทรงจำเสร็จสิ้นมิว! 🎉');
        showToast('บันทึกความทรงจำการเติมเงินสำเร็จแล้วมิว!', 'success');
        updateMemDialogue(`สำเร็จมิว! เมมบันทึกความทรงจำการเติมเกม ${formData.game} ยอด ${formData.amount} บาทให้แล้วน้ามิว~ ✨`, 'success');
        
        // Reset states
        setFormData({ amount: '', date: '', game: '', detail: '', remark: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setSearchGameQuery('');
        
        // Reload data
        fetchSheetsData();
      } else {
        setErrorMsg(json.error || 'Failed to save');
        showToast(`เซฟไม่สำเร็จมิว: ${json.error}`, 'error');
        updateMemDialogue(`เซฟไม่สำเร็จมิว...: ${json.error}`, 'error');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Server connection failure during post');
      showToast('มิว! บันทึกไม่สำเร็จเพราะเซิร์ฟเวอร์ขัดข้องมิว...', 'error');
      updateMemDialogue('มิว! บันทึกไม่สำเร็จเพราะเซิร์ฟเวอร์ขัดข้องมิว...', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'game') {
      setSearchGameQuery(value);
      setShowAutocomplete(true);
    }
    // Clear validation error when user types
    if (invalidFields && invalidFields[name]) {
      setInvalidFields(prev => ({ ...prev, [name]: false }));
    }
  };

  const selectGameFromAutocomplete = (gameName) => {
    setFormData(prev => ({ ...prev, game: gameName }));
    setSearchGameQuery(gameName);
    setShowAutocomplete(false);
    updateMemDialogue(`เลือกเกม ${gameName} แล้วมิว! ป้อนของที่เติมกับราคานะมิว~`, 'happy');
    // Clear game validation error on select
    setInvalidFields(prev => ({ ...prev, game: false }));
  };

  // --- Calculations for stats ---
  const getCalculatedStats = () => {
    const items = data.items || [];
    const totalSpent = data.total || 0;
    
    // Month spent calculation
    const today = new Date();
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(today.getFullYear());
    
    const monthlyItems = items.filter(item => {
      if (!item.date) return false;
      const parts = item.date.split('/');
      return parts[1] === currentMonthStr && parts[2] === currentYearStr;
    });
    
    const monthSpent = monthlyItems.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Average spent per receipt
    const averageSpent = items.length > 0 ? (totalSpent / items.length) : 0;
    
    // Most spent game
    const gameSpends = {};
    items.forEach(item => {
      if (item.game) {
        gameSpends[item.game] = (gameSpends[item.game] || 0) + item.amount;
      }
    });
    
    let topGame = '-';
    let maxGameSpend = 0;
    Object.entries(gameSpends).forEach(([game, spent]) => {
      if (spent > maxGameSpend) {
        maxGameSpend = spent;
        topGame = game;
      }
    });

    return { totalSpent, monthSpent, averageSpent, topGame };
  };

  const stats = getCalculatedStats();

  // --- Filtering & Sorting Table ---
  const getFilteredItems = () => {
    let items = [...(data.items || [])];

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        (item.game && item.game.toLowerCase().includes(q)) || 
        (item.detail && item.detail.toLowerCase().includes(q)) ||
        (item.remark && item.remark.toLowerCase().includes(q))
      );
    }

    // Game filter
    if (filterGame !== 'all') {
      items = items.filter(item => item.game === filterGame);
    }

    // Sorting
    items.sort((a, b) => {
      // Parse DD/MM/YYYY dates
      const parseDate = (dStr) => {
        if (!dStr) return 0;
        const [d, m, y] = dStr.split('/').map(Number);
        return new Date(y, m - 1, d).getTime();
      };

      if (sortBy === 'date-desc') return parseDate(b.date) - parseDate(a.date);
      if (sortBy === 'date-asc') return parseDate(a.date) - parseDate(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return items;
  };

  const filteredItems = getFilteredItems();
  
  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGame, sortBy]);

  // --- Charts Data preparation ---
  const getPieChartData = () => {
    const gameSpends = {};
    (data.items || []).forEach(item => {
      if (item.game) {
        gameSpends[item.game] = (gameSpends[item.game] || 0) + item.amount;
      }
    });

    const colors = [
      '#FF75B5', '#7012FF', '#00F5D4', '#F39C12', '#3B82F6', 
      '#E74C3C', '#2ECC71', '#9B59B6', '#1ABC9C', '#34495E'
    ];

    return Object.entries(gameSpends).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  };

  const getLineChartData = () => {
    // Group by month-year
    const monthlyGroups = {};
    (data.items || []).forEach(item => {
      if (!item.date) return;
      const parts = item.date.split('/');
      if (parts.length === 3) {
        const monthKey = `${parts[2]}-${parts[1]}`; // YYYY-MM for sorting
        const label = `${parts[1]}/${parts[2]}`; // MM/YYYY
        
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = { sortKey: monthKey, label, amount: 0 };
        }
        monthlyGroups[monthKey].amount += item.amount;
      }
    });

    return Object.values(monthlyGroups)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6); // Last 6 months
  };

  const pieChartData = getPieChartData();
  const lineChartData = getLineChartData();

  // Loading Screen if initial load
  if (status === 'loading' || (status === 'authenticated' && loading && data.items.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#090A1A]">
        {/* Loading Animated Memosprite */}
        <div className="w-20 h-20 rounded-full overflow-hidden animate-bounce shadow-[0_0_30px_rgba(255,117,181,0.5)] border-2 border-cosmic-pink/40">
          <img 
            src="/assets/Profile_Picture_Mem.webp" 
            alt="Memosprite" 
            className="w-full h-full object-cover select-none"
          />
        </div>
        <p className="mt-6 font-ibm-plex-sans-thai text-lg text-pink-300">เมมกำลังเปิดหน้าต่างเชื่อมต่อ Google Sheets มิว...</p>
        <p className="mt-2 text-xs text-indigo-300/60 font-sans tracking-wide">
          "รอแป๊บนึงน้าผู้บุกเบิก เมมกำลังเพ่งสมาธิอยู่มิว! ✨"
        </p>
      </div>
    );
  }

  // If redirecting, don't flash content
  if (!session) return null;

  return (
    <div className="app-container" data-theme={theme}>
      {/* Dynamic Background layers */}
      <div className="bg-nebula-mesh"></div>
      <div className="bg-dawn-sky"></div>
      
      {/* Cloud overlay for dawn theme */}
      {theme === 'dawn' && (
        <div className="absolute inset-0 z-2 pointer-events-none opacity-40 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 viewBox=%220 0 1000 1000%22%3E%3Cpath d=%22M0,400 Q200,450 400,400 T800,400 T1000,400 L1000,1000 L0,1000 Z%22 fill=%22%23ffffff%22 opacity=%220.3%22/%3E%3C/svg%3E')] bg-bottom bg-repeat-x bg-[length:100%_auto] animate-clouds"></div>
      )}
      
      <div className="noise-overlay"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 flex flex-col gap-6 md:gap-8 min-h-screen">
        
        {/* --- 1. HEADER --- */}
        <header className="glass-panel rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name} 
                className="w-12 h-12 rounded-full border-2 border-cosmic-pink/40 shadow-md object-cover select-none"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-purple-600 flex items-center justify-center text-white shadow font-bold text-lg select-none animate-float">
                🎀
              </div>
            )}
            <div>
              <h1 className={`font-fredoka text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dawn' ? 'from-indigo-950 to-blue-800' : 'from-pink-400 to-purple-500'
              }`}>
                The Astral Memory Vault (?)
              </h1>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                ยินดีต้อนรับกลับมานะมิว! คุณผู้บุกเบิก <span className="font-bold text-cosmic-pink">{session.user.name}</span> 
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-2xl border hover:border-cosmic-pink/30 hover:scale-105 transition-all text-text-main flex items-center gap-2 cursor-pointer shadow ${
                theme === 'dawn' ? 'bg-white/50 border-amber-500/20' : 'bg-indigo-950/20 border-white/5'
              }`}
              title="สลับธีม"
            >
              {theme === 'cosmic' ? (
                <>
                  <Sun size={18} className="text-amber-400" />
                  <span className="text-xs font-fredoka hidden md:inline">Teyvat Dawn</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-indigo-900" />
                  <span className="text-xs font-fredoka hidden md:inline">Cosmic</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 flex items-center gap-2 text-xs font-sans font-bold cursor-pointer transition-all shadow"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* --- 2. STATS SECTION --- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Spent */}
          <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs md:text-sm font-sans">ยอดเปย์สะสมทั้งหมด</span>
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-cosmic-pink">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="font-fredoka text-2xl md:text-3xl font-extrabold text-cosmic-pink">
                {stats.totalSpent.toLocaleString()} <span className="text-xs font-sans font-medium text-text-muted">THB</span>
              </h2>
              <p className="text-[10px] text-text-muted mt-1 font-sans">ตั้งแต่เริ่มบันทึกเป็นต้นมามิว~</p>
            </div>
          </div>

          {/* Card 2: Current Month Spent */}
          <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs md:text-sm font-sans">ยอดเปย์เดือนปัจจุบัน</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-cosmic-purple">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="font-fredoka text-2xl md:text-3xl font-extrabold text-cosmic-purple">
                {stats.monthSpent.toLocaleString()} <span className="text-xs font-sans font-medium text-text-muted">THB</span>
              </h2>
              <p className="text-[10px] text-text-muted mt-1 font-sans">
                {stats.monthSpent > 5000 ? '⚠️ เริ่มกระเป๋าฉีกแล้วนะมิว!' : '✅ ปลอดภัยดีอยู่มิว~'}
              </p>
            </div>
          </div>

          {/* Card 3: Average Spent */}
          <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs md:text-sm font-sans">เฉลี่ยต่อการเติมสลิป</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cosmic-mint">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="font-fredoka text-2xl md:text-3xl font-extrabold text-cosmic-mint">
                {Math.round(stats.averageSpent).toLocaleString()} <span className="text-xs font-sans font-medium text-text-muted">THB</span>
              </h2>
              <p className="text-[10px] text-text-muted mt-1 font-sans">อิงจากยอดเฉลี่ยทั้งหมดมิว~</p>
            </div>
          </div>

          {/* Card 4: Most Played Game */}
          <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-row items-center justify-between min-h-[120px] transition-all hover:scale-[1.02] gap-4">
            <div className="flex-1 flex flex-col justify-between h-full min-w-0">
              <div className="flex items-center gap-1.5 text-text-muted">
                <span className="text-xs md:text-sm font-sans">เกมที่ดูดเงินสูงสุด</span>
                <Sparkles size={14} className="text-cosmic-gold shrink-0" />
              </div>
              <div className="mt-3">
                <h2 className="font-fredoka text-lg md:text-xl font-extrabold text-cosmic-gold truncate" title={stats.topGame}>
                  {stats.topGame || 'ไม่มีข้อมูล'}
                </h2>
                <p className="text-[10px] text-text-muted mt-2 font-sans">เปย์เกมนี้กี่ครั้งก็ไม่เข็ดมิว!</p>
              </div>
            </div>
            
            {/* Game matching icon badge */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border overflow-hidden flex-shrink-0 animate-float relative ${
              getGameIcon(stats.topGame).imageSrc ? 'border-white/10 bg-white/[0.03]' : getGameIcon(stats.topGame).colorClass
            }`}>
              {getGameIcon(stats.topGame).imageSrc ? (
                <img 
                  src={getGameIcon(stats.topGame).imageSrc} 
                  alt={stats.topGame} 
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <span className="text-3xl select-none">{getGameIcon(stats.topGame).emoji}</span>
              )}
            </div>
          </div>

        </section>

        {/* --- 3. SIDE-BY-SIDE OCR SCANNER & ENTRY --- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: SLIP UPLOADER (7 cols on lg) */}
          <div className="glass-panel rounded-3xl p-6 lg:col-span-7 flex flex-col gap-5 min-h-[420px]">
            <div>
              <h3 className="font-ibm-plex-sans-thai text-lg font-bold flex items-center gap-2">
                <span>📸</span> แนบสลิปเปย์ของความทรงจำ
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                ลากวางสลิปเพื่อใช้เวทมนตร์ OCR ดึงตัวเลขยอดโอนและวันที่ให้อัตโนมัติมิว~
              </p>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all relative overflow-hidden group min-h-[260px]
                ${selectedFile ? 'border-cosmic-pink/40 bg-indigo-950/10' : `hover:border-cosmic-pink/50 hover:bg-cosmic-pink/5 ${theme === 'dawn' ? 'border-amber-500/20' : 'border-indigo-950/20'}`}`}
            >
              {/* Invisible File Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />

              {previewUrl ? (
                // Image Preview Mode
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <img 
                    src={previewUrl} 
                    alt="Slip preview" 
                    className="max-h-[300px] w-auto object-contain rounded-xl shadow-lg transition-transform duration-300"
                    style={{ 
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                  
                  {/* Laser Scan line effect during OCR */}
                  {scanning && <div className="animate-laser"></div>}
                </div>
              ) : (
                // Empty dropzone mode
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-text-muted group-hover:scale-110 transition-transform shadow ${
                    theme === 'dawn' ? 'bg-white/70 border-amber-500/20' : 'bg-indigo-950/20 border-white/5'
                  }`}>
                    <Upload size={24} className="text-cosmic-pink" />
                  </div>
                  <div className="font-sans">
                    <p className="text-sm font-bold text-text-main">ลากไฟล์รูปภาพมาวางที่นี่ หรือคลิกเพื่อเปิดหาไฟล์</p>
                    <p className="text-xs text-text-muted mt-1.5">รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WEBP) และแนะนำเป็นสลิปโอนเงินเท่านั้นมิว~</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview controls */}
            {previewUrl && (
              <div className={`flex items-center justify-between border rounded-2xl p-3 ${
                theme === 'dawn' ? 'bg-white/40 border-amber-500/10' : 'bg-indigo-950/20 border-white/5'
              }`}>
                <span className="text-xs text-text-muted font-sans truncate max-w-[180px]" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(0.5, prev - 0.25)); }}
                    className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(2.5, prev + 0.25)); }}
                    className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRotation(prev => (prev + 90) % 360); }}
                    className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 text-white cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); scanSlipFile(selectedFile); }}
                    disabled={scanning}
                    className="px-3 py-2 rounded-xl bg-cosmic-pink hover:bg-cosmic-pink/80 disabled:opacity-50 text-white font-sans text-xs font-bold cursor-pointer"
                  >
                    {scanning ? 'กำลังแกะ...' : 'สแกนซ้ำ'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: MANUAL OR PREFILLED ENTRY FORM (5 cols on lg) */}
          <div className="glass-panel rounded-3xl p-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-ibm-plex-sans-thai text-lg font-bold flex items-center gap-2">
                <span>📝</span> บันทึกความทรงจำการเติมเงิน
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                กรอกหรือยืนยันรายละเอียดสลิปเพื่อส่งขึ้น Google Sheet มิว~
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3.5 flex-1 justify-center">
              
              {/* Game Input with Autocomplete */}
              <div className="relative" ref={autocompleteRef}>
                <label className="text-[11px] font-sans text-text-muted block mb-1">เกมที่เติมเงิน *</label>
                <input 
                  type="text"
                  name="game"
                  placeholder="เช่น Genshin Impact, HSR (พิมพ์เพื่อเริ่มกรอก)"
                  value={formData.game}
                  onChange={handleInputChange}
                  className={`w-full bg-input-bg border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-cosmic-pink/50 transition-all font-sans
                    ${invalidFields.game 
                      ? 'border-red-500/60 focus:border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                      : 'border-input-border'}`}
                />
                
                {/* Autocomplete Dropdown */}
                {showAutocomplete && data.games && data.games.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-dropdown-bg border border-dropdown-border backdrop-blur-md rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto font-sans">
                    {data.games
                      .filter(g => g.toLowerCase().includes(searchGameQuery.toLowerCase()))
                      .map((g, i) => (
                        <div 
                           key={i}
                           onClick={() => selectGameFromAutocomplete(g)}
                           className="px-4 py-2.5 text-sm hover:bg-dropdown-hover cursor-pointer text-dropdown-text border-b border-dropdown-divider transition-colors duration-150 flex items-center gap-2"
                        >
                           {getGameIcon(g).imageSrc ? (
                             <img 
                               src={getGameIcon(g).imageSrc} 
                               alt={g} 
                               className="w-5 h-5 rounded-md object-cover select-none shrink-0 shadow-sm border border-white/10"
                             />
                           ) : (
                             <span className="text-sm select-none shrink-0">{getGameIcon(g).emoji}</span>
                           )}
                           <span className="truncate">{g}</span>
                         </div>
                      ))}
                    {data.games.filter(g => g.toLowerCase().includes(searchGameQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-xs text-text-muted italic">
                        ไม่พบข้อมูลเดิม พิมพ์ต่อเพื่อเพิ่มชื่อเกมใหม่มิว~
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grid for Amount and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-sans text-text-muted block mb-1">ยอดเงินเปย์ (THB) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    name="amount"
                    placeholder="เช่น 150, 3700"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full bg-input-bg border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-cosmic-pink/50 transition-all font-sans font-bold text-cosmic-pink
                      ${invalidFields.amount 
                        ? 'border-red-500/60 focus:border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                        : 'border-input-border'}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-sans text-text-muted block mb-1">วันที่เติม (DD/MM/YYYY)</label>
                  <input 
                    type="text"
                    name="date"
                    placeholder="เช่น 12/04/2026 (ว่าง = วันนี้)"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full bg-input-bg border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-cosmic-pink/50 transition-all font-sans
                      ${invalidFields.date 
                        ? 'border-red-500/60 focus:border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                        : 'border-input-border'}`}
                  />
                </div>
              </div>

              {/* Items Details */}
              <div>
                <label className="text-[11px] font-sans text-text-muted block mb-1">รายละเอียดของที่ได้มา *</label>
                <input 
                  type="text"
                  name="detail"
                  placeholder="เช่น พรแห่งดวงจันทร์ x1, เพชรรายเดือน"
                  value={formData.detail}
                  onChange={handleInputChange}
                  className={`w-full bg-input-bg border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-cosmic-pink/50 transition-all font-sans
                    ${invalidFields.detail 
                      ? 'border-red-500/60 focus:border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                      : 'border-input-border'}`}
                />
              </div>

              {/* Remark */}
              <div>
                <label className="text-[11px] font-sans text-text-muted block mb-1">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <input 
                  type="text"
                  name="remark"
                  placeholder="ความรู้สึกในการสุ่มรอบนี้มิว..."
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-cosmic-pink/50 transition-all font-sans"
                />
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs mt-1 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-sans">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="text-emerald-400 text-xs mt-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg font-sans">
                  {successMsg}
                </div>
              )}

              {/* Save Button */}
              <button 
                type="submit"
                disabled={submitting || scanning}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 disabled:opacity-50 text-white font-ibm-plex-sans-thai font-bold text-sm tracking-wide shadow-[0_4px_15px_rgba(112,18,255,0.2)] cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'กำลังบันทึกมิว...' : (
                  <>
                    <Plus size={16} /> บันทึกความทรงจำมิว!
                  </>
                )}
              </button>
            </form>
          </div>

        </section>

        {/* --- 4. INTERACTIVE CHARTS --- */}
        {data.items && data.items.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Spending Distribution by Game (Pie Chart, 5 cols) */}
            <div className="glass-panel rounded-3xl p-6 md:col-span-5 flex flex-col justify-between min-h-[340px]">
              <div>
                <h3 className="font-ibm-plex-sans-thai text-lg font-bold flex items-center gap-2">
                  <PieIcon size={18} className="text-cosmic-pink" /> 
                  ยอดใช้จ่ายแยกตามรายเกม
                </h3>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  วิเคราะห์ว่าเกมไหนทำกระเป๋าฟุบที่สุดมิว~
                </p>
              </div>

              {pieChartData.length > 0 ? (
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
                  {/* Recharts Pie component */}
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toLocaleString()} THB`, 'ยอดเงิน']}
                          contentStyle={{ background: '#0F1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 flex flex-col gap-2 w-full max-h-48 overflow-y-auto pr-1">
                    {pieChartData.slice(0, 5).map((entry, index) => {
                      const gameIcon = getGameIcon(entry.name);
                      return (
                        <div key={index} className="flex items-center justify-between text-xs font-sans py-0.5 border-b border-white/5 last:border-0 pb-1.5">
                          <div className="flex items-center gap-2.5 truncate">
                            {gameIcon.imageSrc ? (
                              <img 
                                src={gameIcon.imageSrc} 
                                alt={entry.name} 
                                className="w-6 h-6 rounded-lg object-cover select-none shrink-0 shadow-sm border border-white/10"
                              />
                            ) : (
                              <span 
                                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-sm shadow-sm select-none border" 
                                style={{ 
                                  backgroundColor: `${entry.color}15`, 
                                  borderColor: `${entry.color}40`,
                                  color: entry.color
                                }}
                              >
                                {gameIcon.emoji}
                              </span>
                            )}
                            <span className="text-text-main truncate font-medium max-w-[120px]" title={entry.name}>
                              {entry.name}
                            </span>
                          </div>
                          <span className="font-bold text-text-muted shrink-0">{entry.value.toLocaleString()} THB</span>
                        </div>
                      );
                    })}
                    {pieChartData.length > 5 && (
                      <p className="text-[10px] text-text-muted italic text-right mt-1">และอื่นๆ อีก {pieChartData.length - 5} เกมมิว~</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted text-xs font-sans mt-8">
                  ไม่มีข้อมูลแสดงผลมิว
                </div>
              )}
            </div>

            {/* Right Column: Spending Trends by Month (Area Chart, 7 cols) */}
            <div className="glass-panel rounded-3xl p-6 md:col-span-7 flex flex-col justify-between min-h-[340px]">
              <div>
                <h3 className="font-ibm-plex-sans-thai text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={18} className="text-cosmic-purple" />
                  เทรนด์ความตึงของกระเป๋าตังค์ 
                </h3>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  เทรนด์ยอดเติมรวมแยกเป็นรายเดือน (แสดง 6 เดือนล่าสุดมิว~)
                </p>
              </div>

              {lineChartData.length > 0 ? (
                <div className="flex-1 w-full h-44 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7012FF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#7012FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} fontStyle="italic" />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()} THB`, 'ยอดเงิน']}
                        contentStyle={{ background: '#0F1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#7012FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted text-xs font-sans mt-8">
                  ต้องการประวัติ 1 เดือนขึ้นไปเพื่อวิเคราะห์กราฟมิว~
                </div>
              )}
            </div>

          </section>
        )}

        {/* --- 5. DETAILED TRANSACTION TABLE --- */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-ibm-plex-sans-thai text-lg font-bold flex items-center gap-2">
                <span>📚</span> สมุดบันทึกความทรงจำ
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                ประวัติการเติมเงินที่จดบันทึกไว้ใน Google Sheets มิว~
              </p>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อเกม / ไอเทม / หมายเหตุ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-input-bg/70 border border-input-border/70 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-cosmic-pink/50 font-sans"
                />
              </div>

              {/* Game filter dropdown */}
              <div className="relative">
                <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <select
                  value={filterGame}
                  onChange={(e) => setFilterGame(e.target.value)}
                  className="bg-input-bg/70 border border-input-border/70 rounded-xl pl-8 pr-6 py-2 text-xs outline-none focus:border-cosmic-pink/50 font-sans appearance-none text-text-main cursor-pointer"
                >
                  <option value="all">กรองทั้งหมดมิว~</option>
                  {data.games && data.games.map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-input-bg/70 border border-input-border/70 rounded-xl px-3 py-2 text-xs outline-none focus:border-cosmic-pink/50 font-sans text-text-main cursor-pointer"
              >
                <option value="date-desc">วันที่สลิป (ล่าสุด)</option>
                <option value="date-asc">วันที่สลิป (เก่าสุด)</option>
                <option value="amount-desc">ยอดเงิน (มากที่สุด)</option>
                <option value="amount-asc">ยอดเงิน (น้อยที่สุด)</option>
              </select>
            </div>
          </div>

          {/* Table content */}
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto mt-2">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-text-muted font-bold text-[10px] tracking-wider uppercase">
                  <th className="pb-3 pl-2">วันที่เติม</th>
                  <th className="pb-3">เกมออนไลน์</th>
                  <th className="pb-3">รายละเอียดของที่ได้มา</th>
                  <th className="pb-3">หมายเหตุ</th>
                  <th className="pb-3 text-right">จำนวนเงิน (บาท)</th>
                  <th className="pb-3 pr-2 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-2 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-cosmic-purple shrink-0" />
                      {item.date}
                    </td>
                    <td className="py-3.5 font-bold text-cosmic-pink text-xs">
                      <span className="flex items-center gap-2">
                        {getGameIcon(item.game).imageSrc ? (
                          <img 
                            src={getGameIcon(item.game).imageSrc} 
                            alt={item.game} 
                            className="w-5 h-5 rounded-md object-cover select-none shrink-0 shadow-sm border border-white/10"
                          />
                        ) : (
                          <span className="text-sm select-none shrink-0">{getGameIcon(item.game).emoji}</span>
                        )}
                        <span>{item.game}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-text-main max-w-[200px] truncate" title={item.detail}>
                      {item.detail}
                    </td>
                    <td className="py-3.5 text-text-muted italic max-w-[150px] truncate" title={item.remark}>
                      {item.remark || '-'}
                    </td>
                    <td className="py-3.5 text-right font-bold text-cosmic-mint text-xs">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-2 text-center">
                      <button 
                        onClick={() => handleDelete(item.id, item.game, item.amount)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 cursor-pointer hover:text-red-300 transition-colors"
                        title="ลบรายการนี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-text-muted italic">
                      "ไม่มีบันทึกความทรงจำการเงินตามเงื่อนไขนี้เลยมิว~ ลองป้อนข้อมูลใหม่ดูนะมิว!" 😭
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (hidden on desktop) */}
          <div className="grid grid-cols-1 gap-3 md:hidden mt-2">
            {paginatedItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 transition-all hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cosmic-pink text-xs flex items-center gap-2">
                    {getGameIcon(item.game).imageSrc ? (
                      <img 
                        src={getGameIcon(item.game).imageSrc} 
                        alt={item.game} 
                        className="w-5 h-5 rounded-md object-cover select-none shrink-0 shadow-sm border border-white/10"
                      />
                    ) : (
                      <span className="text-sm select-none shrink-0">{getGameIcon(item.game).emoji}</span>
                    )}
                    <span>{item.game}</span>
                  </span>
                  <span className="font-bold text-cosmic-mint text-xs">
                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-cosmic-purple shrink-0" />
                    <span>{item.date}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id, item.game, item.amount)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 cursor-pointer hover:text-red-300 transition-colors"
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <div className="border-t border-white/5 pt-2.5 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-start gap-1">
                    <span className="text-text-muted shrink-0">ไอเทม:</span>
                    <span className="text-text-main font-medium">{item.detail}</span>
                  </div>
                  {item.remark && (
                    <div className="flex items-start gap-1 text-[10px] text-text-muted">
                      <span className="shrink-0">หมายเหตุ:</span>
                      <span className="italic">{item.remark}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {paginatedItems.length === 0 && (
              <div className="py-10 text-center text-text-muted italic text-xs">
                "ไม่มีบันทึกความทรงจำการเงินตามเงื่อนไขนี้เลยมิว~ ลองป้อนข้อมูลใหม่ดูนะมิว!" 😭
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-sans">
              <span className="text-text-muted">
                แสดงหน้าที่ {currentPage} จาก {totalPages} (ทั้งหมด {filteredItems.length} รายการ)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-950/60 disabled:opacity-30 disabled:hover:bg-indigo-950/40 text-text-main cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-950/60 disabled:opacity-30 disabled:hover:bg-indigo-950/40 text-text-main cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* --- 6. FLOATING INTERACTIVE MEMOSPRITE WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Dialogue Bubble */}
        <div className={`bg-bubble-bg border border-bubble-border backdrop-blur-md rounded-2xl p-3 shadow-2xl max-w-[280px] hover:scale-105 transition-all duration-500
          ${showDialogue ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}>
          <div className="flex items-start gap-2">
            <Info size={14} className="text-bubble-accent shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-bubble-text font-sans">
              {memDialogue}
            </p>
          </div>
        </div>

        {/* Animated Memosprite Character */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center animate-float shadow-[0_4px_25px_rgba(255,117,181,0.45)] border border-white/20 pointer-events-auto cursor-pointer relative group">
          <img 
            src="/assets/Profile_Picture_Mem.webp" 
            alt="Memosprite" 
            className="w-full h-full rounded-full object-cover"
          />

          {/* Quick Help popup */}
          <div className="absolute right-full mr-3 bottom-0 bg-indigo-950 border border-white/5 p-2 rounded-xl text-[9px] text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none w-32 font-sans">
            "จิ้มตัวเมมเพื่อรีโหลดข้อมูล Google Sheet สดๆ ได้นะมิว! ✨"
          </div>
          
          {/* Onclick trigger fetch */}
          <div 
            onClick={() => {
              updateMemDialogue('ได้มิว! เมมกำลังเช็คข้อมูลใน Google Sheet ล่าสุดให้อยู่นะมิว~ 🔮', 'thinking');
              fetchSheetsData();
            }}
            className="absolute inset-0 rounded-full cursor-pointer"
          ></div>
        </div>

      </div>

      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500
        ${toast.show 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}
        ${theme === 'dawn'
          ? 'bg-white/90 border-amber-500/20 text-indigo-950 shadow-amber-500/10'
          : 'bg-indigo-950/90 border-cosmic-pink/30 text-white shadow-cosmic-pink/10'}`}>
        <span className="text-base shrink-0">
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
        </span>
        <span className="text-xs font-sans font-bold">{toast.message}</span>
      </div>

    </div>
  );
}
