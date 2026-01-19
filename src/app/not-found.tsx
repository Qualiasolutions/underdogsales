import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-8xl font-bold text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gold text-navy hover:bg-gold-dark shadow-md hover:shadow-gold h-11 px-6 rounded-xl"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link
          href="/practice"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 border-navy text-navy bg-transparent hover:bg-navy hover:text-white h-11 px-6 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to practice
        </Link>
      </div>
    </div>
  )
}
