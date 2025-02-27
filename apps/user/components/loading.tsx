interface LoadingProps {
  loading?: boolean;
}

export default function Loading({ loading = true }: LoadingProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
        loading
          ? 'bg-background/95 pointer-events-auto opacity-100 backdrop-blur-[2px]'
          : 'pointer-events-none bg-transparent opacity-0 backdrop-blur-0'
      }`}
    >
      <div
        className={`transform-gpu transition-all duration-500 ${
          loading ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <div className='relative h-32 w-32 animate-[spin_3s_linear_infinite] overflow-hidden rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'>
          <div className='absolute inset-0 h-full w-full rounded-full bg-black shadow-inner dark:bg-white'>
            <div className='absolute right-0 top-0 h-full w-1/2 rounded-r-full bg-white shadow-sm dark:bg-black' />
            <div className='absolute left-1/2 top-0 h-1/2 w-1/2 -translate-x-1/2 rounded-full bg-white shadow-sm dark:bg-black'>
              <div className='absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-inner dark:bg-white' />
            </div>
            <div className='absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 rounded-full bg-black shadow-sm dark:bg-white'>
              <div className='absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-inner dark:bg-black' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
