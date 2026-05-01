"use server"

import { createClient } from '../../utils/supabase/server';

export async function submitTicket(type, message) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'You must be logged in to submit a ticket.' };
  }

  if (!type || !message || !message.trim()) {
    return { success: false, error: 'Please provide a valid message.' };
  }

  const { error } = await supabase.from('support_tickets').insert([
    {
      user_id: session.user.id,
      ticket_type: type,
      message: message.trim()
    }
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
