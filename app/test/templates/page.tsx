'use client';
// src/app/test/template/page.tsx
import LeftSection from '@/components/test-template/LeftSection';
import RightSection from '@/components/test-template/RightSection';

export default function TemplatePage() {
  return (
    // 전체 영역에 적당한 여백(p-6)을 주어 박스들이 화면 끝에 붙지 않게 했습니다.
    <div className="flex w-full min-h-[calc(100vh-72px)] gap-[20px] p-6 text-black">
      
      {/* 좌측 섹션 (1) */}
      <section className="flex-[1] bg-white p-[30px] rounded-[15px] shadow-xl">
        <LeftSection />
      </section>

      {/* 우측 섹션 (4) */}
      <section className="flex-[4] bg-white p-[30px] rounded-[15px] shadow-xl">
        <RightSection />
      </section>

    </div>
  );
}