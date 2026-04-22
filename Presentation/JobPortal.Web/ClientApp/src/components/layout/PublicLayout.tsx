import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../public/PublicNavbar';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { company } from '../../content/companyProfile';

function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004181]">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">{company.name}</span>
            </div>
            <p className="text-sm leading-relaxed">{company.description}</p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <a href="#services" className="text-sm hover:text-white transition-colors">Services</a>
            <a href="#projects" className="text-sm hover:text-white transition-colors">Projects</a>
            <a href="#about" className="text-sm hover:text-white transition-colors">About Us</a>
            <a href="#careers" className="text-sm hover:text-white transition-colors">Careers</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{company.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">{company.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{company.phone}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p>Built with care for the future.</p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
