import HeroBackground from '../../shared/HeroBackground';

export default function CourseListContainer({ children }) {
  return (
    <div className="-mx-6 -mt-6 lg:-mx-8 lg:pt-2">
      <HeroBackground />
      <div className="relative z-10 w-full overflow-hidden rounded-t-2xl rounded-r-2xl bg-white lg:my-12 lg:mx-auto lg:w-256 lg:rounded-t-3xl lg:rounded-r-3xl lg:px-5">
        {children}
      </div>
    </div>
  );
}
