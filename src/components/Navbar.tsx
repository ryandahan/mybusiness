"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, Settings, ChevronDown, Store } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = session?.user?.role === 'admin';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle admin navigation with loading state
  const handleAdminNavigation = (path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    setAdminDropdownOpen(false);
    
    // Add a slight delay to show loading indicator
    setTimeout(() => {
      router.push(path);
      
      // Reset navigation state after a short delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    }, 100);
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-600 text-xl font-bold">
                Store Transitions
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              <Link 
                href="/map" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                Find Stores
              </Link>
              <Link 
                href="/submit" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                List Your Store
              </Link>
              <Link 
                href="/about" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                Contact
              </Link>
              
              {/* My Stores link - only visible when logged in */}
              {status === 'authenticated' && (
                <Link 
                  href="/my-stores" 
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Store size={16} className="mr-1" />
                  My Stores
                </Link>
              )}
              
              {/* Admin dropdown - only visible to admin users */}
              {isAdmin && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    disabled={isNavigating}
                    className={`inline-flex items-center px-1 pt-1 text-red-600 font-medium hover:text-red-800 ${
                      pathname?.startsWith('/admin') ? 'border-b-2 border-red-500' : ''
                    } ${isNavigating ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    Admin Dashboard
                    <ChevronDown size={16} className={`ml-1 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                    
                    {isNavigating && (
                      <span className="ml-2 w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></span>
                    )}
                  </button>
                  
                  {adminDropdownOpen && !isNavigating && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button 
                        onClick={() => handleAdminNavigation('/admin/stores')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          pathname === '/admin/stores' ? 'bg-red-50 text-red-700 font-medium' : ''
                        }`}
                      >
                        Store Management
                      </button>
                      <button 
                        onClick={() => handleAdminNavigation('/admin/blogs')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          pathname === '/admin/blogs' ? 'bg-red-50 text-red-700 font-medium' : ''
                        }`}
                      >
                        Blog Management
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'authenticated' ? (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {session.user.name || session.user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-700 hover:text-red-600"
                  >
                    <LogOut size={18} className="mr-1" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 flex items-center"
                >
                  <User size={18} className="mr-1" /> Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/map"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Find Stores
            </Link>
            <Link
              href="/submit"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              List Your Store
            </Link>
            <Link
              href="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* My Stores link for mobile - only visible when logged in */}
            {status === 'authenticated' && (
              <Link
                href="/my-stores"
                className="block pl-3 pr-4 py-2 border-l-4 border-blue-400 text-base font-medium text-blue-700 bg-blue-50"
                onClick={() => setMenuOpen(false)}
              >
                My Stores
              </Link>
            )}
            
            {/* Admin links for mobile - only visible to admin users */}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleAdminNavigation('/admin/stores');
                  }}
                  disabled={isNavigating}
                  className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 border-red-400 text-base font-medium text-red-700 bg-red-50 ${
                    isNavigating ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  Store Management
                  {isNavigating && (
                    <span className="ml-2 inline-block w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleAdminNavigation('/admin/blogs');
                  }}
                  disabled={isNavigating}
                  className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 border-red-400 text-base font-medium text-red-700 bg-red-50 ${
                    isNavigating ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  Blog Management
                </button>
              </>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {status === 'authenticated' ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm text-gray-700">
                  {session.user.name || session.user.email}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}