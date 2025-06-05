import { Link } from "react-router-dom"
import Button from "../components/common/Button"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-200 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage

