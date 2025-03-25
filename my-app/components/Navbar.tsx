import React from 'react'
import Link from 'next/link';

const Navbar = () => {
  return (
    <div>
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-xl font-bold">User Management</h1>
                <ul className="flex space-x-6">
                    <li><Link href="/" className="text-white hover:underline">Home</Link></li>
                    <li><Link href="/create-user" className="text-white hover:underline">Create Users</Link></li>
                    {/* <li><Link href="/update-user" className="text-white hover:underline">Update Users</Link></li> */}
                    <li><Link href="/user-list" className="text-white hover:underline">User List</Link></li>
                </ul>
            </div>
        </nav>
    </div>
  )
}

export default Navbar
