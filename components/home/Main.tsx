// apps/web/src/components/Hero.tsx
import { Search } from 'lucide-react';

export default function Main() {
  return (
    <section className="pt-40 pb-20 flex flex-col items-center text-center">
      <h1 className="text-[7.2rem] font-black leading-tight tracking-tighter mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
        AI 기반 차트를
        <br />
        경험해보세요
      </h1>
      <div className="relative w-full max-w-2xl flex items-center bg-white/5 border border-white/10 rounded-[10px] p-1 backdrop-blur-sm">
        <input
          className="flex-1 bg-transparent px-6 py-4 outline-none text-lg"
          placeholder="관심 종목을 입력하세요"
        />
        <button className="bg-black p-4 rounded-[8px] hover:bg-gray-900 transition-all">
          <Search className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
