// apps/web/src/app/page.tsx
'use client';

import Main from '@/components/home/Main';
import Marquee from '@/components/home/Marquee';
import FadeIn from '@/components/common/Main';

export default function HomePage() {
  return (
    <>
      {/* 배경 장식 */}
      <FadeIn>
        <Main />
        <Marquee />
      </FadeIn>
    </>
  );
}