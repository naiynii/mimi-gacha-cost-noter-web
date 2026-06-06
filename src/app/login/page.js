'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { LogIn } from 'lucide-react';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }

    const error = searchParams.get('error');
    if (error === 'AccessDenied' || error === 'Signin') {
      setErrorMsg('❌ ขอโทษด้วยนะมิว! คลังความทรงจำนี้เปิดให้เฉพาะผู้บุกเบิกเจ้าของบอทเข้าถึงได้เท่านั้นมิว~');
    }
  }, [status, router, searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="w-16 h-16 border-4 border-t-pink-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-fredoka text-lg text-pink-300">กำลังเดินทางผ่านห้วงอวกาศมิว...</p>
      </div>
    );
  }

  return (
    <div className="app-container relative flex items-center justify-center min-h-screen p-4">
      {/* Background Layer */}
      <div className="bg-nebula-mesh"></div>
      <div className="noise-overlay"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 text-center relative border border-white/10 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,117,181,0.15)]">
        {/* Animated Memosprite Sprite */}
        <div className="relative mx-auto w-32 h-32 mb-6 animate-float">
          <img 
            src="/assets/Profile_Picture_Mem.webp" 
            alt="Memosprite" 
            className="w-full h-full rounded-full object-cover shadow-[0_0_20px_rgba(255,117,181,0.4)] border-2 border-white/10"
          />
        </div>

        {/* Bubble Text */}
        <div className="bg-indigo-950/60 border border-pink-400/30 rounded-2xl py-3 px-4 mb-8 relative inline-block max-w-full">
          <p className="font-sans text-sm text-pink-200">
            "มิว! ยินดีต้อนรับผู้บุกเบิกเข้าสู่สมุดจดเปย์มิว~ กรุณาลงทะเบียนผ่าน Discord เพื่อเข้าใช้งานมิว!"
          </p>
          {/* Bubble triangle pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-indigo-950/60"></div>
        </div>

        <h1 className="font-fredoka text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 mb-2">
          Mimi Cost Tracker
        </h1>
        <p className="font-sans text-xs text-indigo-200/60 mb-8 tracking-wider">
          คลังความทรงจำการเปย์ของเมม
        </p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs py-3 px-4 rounded-xl mb-6 font-sans">
            {errorMsg}
          </div>
        )}

        <button
          onClick={() => signIn('discord')}
          className="w-full font-fredoka py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-600 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-700 shadow-[0_4px_20px_rgba(112,18,255,0.3)] hover:shadow-[0_4px_25px_rgba(255,117,181,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          <LogIn size={18} />
          เข้าสู่ระบบด้วย Discord มิว!
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#090A1A]">
        <div className="w-16 h-16 border-4 border-t-pink-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
