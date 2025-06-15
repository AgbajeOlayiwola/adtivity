import Link from 'next/link';

const Logo = ({ size = 'text-3xl' }: { size?: string }) => {
  return (
    <Link href="/" className={`font-headline font-bold ${size} tracking-tighter bg-clip-text text-transparent bg-futuristic-gradient hover:opacity-80 transition-opacity`}>
      Adtivity
    </Link>
  );
};

export default Logo;
