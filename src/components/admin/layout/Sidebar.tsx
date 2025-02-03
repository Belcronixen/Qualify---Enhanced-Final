import { LayoutDashboard, Settings, Activity, Users, LogOut, UserCog, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin'
  },
  {
    title: 'Aplicantes',
    icon: Users,
    path: '/admin/applicants'
  },
  {
    title: 'Control de Calificación',
    icon: Activity,
    path: '/admin/scoring'
  },
  {
    title: 'Administradores',
    icon: UserCog,
    path: '/admin/admins'
  },
  {
    title: 'Configuración',
    icon: Settings,
    path: '/admin/settings'
  }
];

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-full flex-col border-r border-neutral-700 bg-neutral-800 shadow-lg">
      <div className="flex h-16 items-center justify-between border-b border-neutral-700 px-4">
        <Link to="/" className="flex items-center">
          <img
            src="https://40125997.fs1.hubspotusercontent-na1.net/hubfs/40125997/Other%20projects/Untitled-2.png"
            alt="Logo"
            className="h-8 w-auto"
          />
        </Link>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5 text-neutral-300" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={item.path}
              initial={mobile ? { x: -20, opacity: 0 } : false}
              animate={mobile ? { x: 0, opacity: 1 } : false}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                onClick={mobile ? onClose : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      
      <div className="border-t border-neutral-700 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-neutral-300 hover:bg-white/5 hover:text-white"
          onClick={() => {
            handleLogout();
            if (mobile && onClose) onClose();
          }}
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
