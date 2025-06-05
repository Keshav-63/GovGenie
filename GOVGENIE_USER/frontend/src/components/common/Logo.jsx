import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

const Logo = ({ size = "md", withText = true }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link to="/" className="flex items-center gap-2">
      <div
        className={`bg-primary-500 text-white rounded-md flex items-center justify-center ${sizeClasses[size]}`}
      >
        <ChevronRight className="h-6 w-6 rotate-[315deg] text-primary-foreground" />
      </div>
      {withText && (
        <span
          className={`font-bold ${textSizeClasses[size]} text-gray-900 dark:text-white`}
        >
          GovGenie
        </span>
      )}
    </Link>
  );
}

export default Logo

