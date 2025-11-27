'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const testSections = [
  {
    id: 0,
    title: '🧪 Comprehensive Test Suite',
    description: 'Automated testing for all platform functionality',
    href: '/test-suite',
    color: 'from-orange-500 to-orange-600',
    featured: true,
  },
  {
    id: 1,
    title: '🔐 Authentication & OTP',
    description: 'Test OTP generation, verification, and login flow',
    href: '/test-otp',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    title: '💼 Escrow Management',
    description: 'Create, track, update status, cancel escrows',
    href: '/test-escrow',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 3,
    title: '💳 Payments',
    description: 'Initialize payments, check payment status',
    href: '/test-payments',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 4,
    title: '💰 Payouts',
    description: 'Check payout status and details',
    href: '/test-payouts',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 5,
    title: '👤 User Management',
    description: 'View and update user profile information',
    href: '/test-users',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 6,
    title: '📧 Notifications',
    description: 'Send and test notifications (WhatsApp/Email)',
    href: '/test-notifications',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function TestHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🧪 Testing Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive testing interface for all platform features.
            Select a section below to test specific functionality.
          </p>
        </div>

        {/* Featured Test Suite */}
        {testSections.find(s => s.featured) && (
          <div className="mb-8">
            <Link href={testSections.find(s => s.featured)!.href}>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold mb-2">⭐ RECOMMENDED</div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {testSections.find(s => s.featured)!.title}
                    </h2>
                    <p className="text-orange-100 text-lg mb-4">
                      {testSections.find(s => s.featured)!.description}
                    </p>
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold">
                      Run Comprehensive Tests →
                    </Button>
                  </div>
                  <div className="text-6xl ml-4">🧪</div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Test Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testSections.filter(s => !s.featured).map((section) => (
            <Link key={section.id} href={section.href}>
              <div
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200 cursor-pointer h-full flex flex-col`}
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl mb-4`}>
                  {section.title.split(' ')[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {section.title.replace(/^[^\s]+\s/, '')}
                </h2>
                <p className="text-gray-600 flex-grow">
                  {section.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90`}
                  >
                    Test Now →
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ Testing Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Make sure the backend server is running on port 3001</li>
            <li>You may need to authenticate first using the OTP test page</li>
            <li>Each test page includes detailed instructions and examples</li>
            <li>Check browser console (F12) for detailed API responses</li>
            <li>All test pages work in development mode with enhanced debugging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

