import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/button';

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/75">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-neutral-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link to="/admin" className="flex items-center">
          <img
            src="https://40125997.fs1.hubspotusercontent-na1.net/hubfs/40125997/Other%20projects/Untitled-2.png"
            alt="Logo"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-neutral-400 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </div>
    </div>
  );
}
