import { isSetupComplete, getChildren } from '../lib/api';
import { redirect } from 'next/navigation';
import RoleSelectClient from '../components/RoleSelectClient';

export default async function RoleSelectPage() {
  const setupComplete = await isSetupComplete();
  
  if (!setupComplete) {
    redirect('/setup');
  }

  const children = await getChildren();

  return <RoleSelectClient childrenData={children} />;
}
