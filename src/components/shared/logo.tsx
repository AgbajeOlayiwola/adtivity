import Link from "next/link"
import AdtivityLogo from "../assets/images/Adtivity_Full_Color_Logo_2.6"

const Logo = ({ size = "text-3xl" }: { size?: string }) => {
  return (
    <Link href="/" className="w-[15%]">
      <AdtivityLogo />
    </Link>
  )
}

export default Logo
