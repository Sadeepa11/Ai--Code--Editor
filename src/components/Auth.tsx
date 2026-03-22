"use client";
import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Github, 
  Chrome,
  Zap,
  ShieldCheck,
  Code2
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Auth({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'signup',
          username,
          password
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: isLogin ? 'Welcome Back!' : 'Account Created!',
          text: isLogin ? 'Redirecting to your workspace...' : 'You can now log in.',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e1e1e',
          color: '#fff'
        });
        
        if (isLogin) {
          onLoginSuccess(data);
        } else {
          setIsLogin(true);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: data.error || 'Something went wrong',
          background: '#1e1e1e',
          color: '#fff'
        });
      }
    } catch (err) {
      Swal.fire('Error', 'Connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1e1e1e]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="text-center space-y-2 mb-8 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
              <Code2 size={28} className="text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join MVS Code'}
            </h1>
            <p className="text-gray-400 text-sm">
              The AI-powered IDE for modern developers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="space-y-4">
              <div className="relative group/field">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/field:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative group/field">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/field:text-accent transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />

              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="my-8 flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Or continue with</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[13px] text-gray-300 transition-all">
              <Github size={16} />
              <span>Github</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[13px] text-gray-300 transition-all">
              <Chrome size={16} />
              <span>Google</span>
            </button>
          </div>

          {/* Toggle Footer */}
          <div className="mt-8 text-center relative pt-6 border-t border-white/5">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:text-accent-hover font-semibold transition-colors outline-none"
              >
                {isLogin ? 'Join now' : 'Log in instead'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 px-4 overflow-hidden">
          <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <Zap size={16} className="text-yellow-500" />
            <span className="text-[10px] text-gray-400 font-medium">Lightning Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <ShieldCheck size={16} className="text-green-500" />
            <span className="text-[10px] text-gray-400 font-medium">Secure Storage</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <Sparkles size={16} className="text-purple-500" />
            <span className="text-[10px] text-gray-400 font-medium">AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
