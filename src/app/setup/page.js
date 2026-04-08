import { isSetupComplete } from '../../lib/api';
import { redirect } from 'next/navigation';
import SetupClient from '../../components/SetupClient';

export default async function SetupPage() {
  const setupComplete = await isSetupComplete();
  
  if (setupComplete) {
    redirect('/');
  }

  return <SetupClient />;
}
