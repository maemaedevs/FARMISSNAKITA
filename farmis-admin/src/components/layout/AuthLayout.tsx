import { Outlet } from 'react-router-dom';
import { Logo } from './Logo';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Left: visual panel */}
      <div className="relative hidden overflow-hidden bg-ink-800 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.18),transparent_45%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <Logo />
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold leading-tight">
              Grow smarter farms with Farmis.
            </h2>
            <p className="mt-3 text-sm text-ink-200">
              Monitor farms, manage users, and keep produce moving — all from
              one calm, focused console.
            </p>
          </div>
          <div className="text-xs text-ink-300">
            © {new Date().getFullYear()} Farmis. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
