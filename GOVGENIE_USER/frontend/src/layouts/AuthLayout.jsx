import { Outlet } from "react-router-dom"
import { Link } from "react-router-dom"
import ThemeToggle from "../components/common/ThemeToggle"
import NotificationContainer from "../components/common/NotificationContainer"
import Logo from "../components/common/Logo"

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-200">
    
      <header className="py-4 px-6 flex justify-between items-center bg-white dark:bg-dark-100 shadow-sm">
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

   
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-gray-700">
        <p>© {new Date().getFullYear()} GovGenie. All rights reserved.</p>
      </footer>

      <NotificationContainer />
    </div>
  )
}

export default AuthLayout

