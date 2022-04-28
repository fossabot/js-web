import { ReactNode } from 'react';
import HeroBackground from '../shared/HeroBackground';

interface ILearningTrackDetailContainer {
  children: ReactNode;
}

export default function LearningTrackDetailContainer({
  children,
}: ILearningTrackDetailContainer) {
  return (
    <div className="-mx-6 -mt-6 lg:-mx-8 lg:pt-2">
      <HeroBackground />
      <div className="relative z-10 my-6 w-full bg-white py-2 lg:my-8 lg:mx-auto lg:w-256 lg:rounded-t-3xl lg:py-6 lg:px-6">
        {children}
      </div>
    </div>
  );
}
