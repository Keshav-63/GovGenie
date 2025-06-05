"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-9xl font-extrabold tracking-tight">404</h1>
      <p className="mb-4 text-2xl font-medium">Page Not Found</p>
      <p className="mb-8 max-w-md text-muted-foreground">
        Sorry, we couldn't find the page you're looking for. The page might have been removed or the URL might be
        incorrect.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Go Back</span>
        </Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>
    </div>
  )
}

export default NotFound

