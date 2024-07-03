
"use client"
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/qr');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button
        onClick={handleClick}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00545B] to-[#48AC77] text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
      >
        Se connecter
      </button>
    </main>
  );
}

