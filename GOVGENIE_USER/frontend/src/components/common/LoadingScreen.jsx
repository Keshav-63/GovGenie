const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-200 z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingScreen

