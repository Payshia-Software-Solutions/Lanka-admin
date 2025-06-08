import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/admin/dashboard');
  return null; 
}
