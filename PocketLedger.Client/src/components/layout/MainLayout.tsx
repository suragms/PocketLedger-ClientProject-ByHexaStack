import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function MainLayout() {
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sidebarWidth = isMobile ? 0 : sidebarOpen ? 256 : 80;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header />
        <main id="main-content" className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
