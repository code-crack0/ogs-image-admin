'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function Error() {
  const router = useRouter()


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <AlertTriangle className="mx-auto h-24 w-24 text-yellow-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Oops! Something went wrong
          </h1>
          <p className="mt-2 text-base text-gray-600">
            We apologize for the inconvenience. Our team has been notified and is working on a fix.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Button>
        </div>

      </div>
    </div>
  )
}