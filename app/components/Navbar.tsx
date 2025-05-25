// client/app/components/Navbar.tsx
'use client' // This tells Next.js to render this component on the client side

import Link from 'next/link' // Import Next.js link component for navigation

// This is a simple navigation bar shown at the top of the page
export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm"> {/* Navbar with white background and slight shadow */}
      <div className="container mx-auto px-6 py-3"> {/* Responsive container with padding */}
        {/* Use Next.js Link for faster page transitions (instead of a regular <a> tag) */}
        <Link href="/" className="text-xl font-bold text-blue-500">
         Pollie {/* This is the clickable site name/logo */}
        </Link>
      </div>
    </nav>
  )
}
