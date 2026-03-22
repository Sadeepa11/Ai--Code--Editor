'use client';

import { useEffect, useState } from 'react';
import { Trash2, Users, Database, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `All files for user "${name}" will be deleted!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin?id=${id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        fetchUsers();
      } catch (err: any) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const clearAll = async () => {
    const result = await Swal.fire({
      title: 'CLEAR EVERYTHING?',
      text: "You won't be able to revert this! All users and files will be gone.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'YES, DELETE ALL DATA'
    });

    if (result.isConfirmed) {
      try {
        await fetch('/api/admin?action=clear_all', { method: 'DELETE' });
        Swal.fire('Wiped!', 'The database is now empty.', 'success');
        fetchUsers();
      } catch (err: any) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 bg-[#1a1d23] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Database size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Admin</h1>
              <p className="text-gray-400 text-sm mt-1">Manage users and database persistence</p>
            </div>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl border border-red-500/20 transition-all font-semibold"
          >
            <AlertTriangle size={20} />
            Reset Database
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1d23] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Total Users</p>
              <h2 className="text-4xl font-bold mt-1">{users.length}</h2>
            </div>
            <Users size={48} className="text-gray-700" />
          </div>
          <div className="bg-[#1a1d23] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Total Files</p>
              <h2 className="text-4xl font-bold mt-1">
                {users.reduce((acc, u) => acc + (u.file_count || 0), 0)}
              </h2>
            </div>
            <Database size={48} className="text-gray-700" />
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[#1a1d23] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">User Management</h3>
            <button onClick={fetchUsers} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Refresh List</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm uppercase font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Files Count</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-gray-500 font-mono">#{user.id}</td>
                    <td className="px-6 py-4 font-semibold text-lg">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                        {user.file_count || 0} files
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No users found. Start by signing up!
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                      Fetching user data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
