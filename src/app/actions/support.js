"use server"

import { createClient } from '../../utils/supabase/server';
import { createAdminClient } from '../../utils/supabase/admin';

export async function submitTicket(type, message) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to submit a ticket.' };
  }

  if (!type || !message || !message.trim()) {
    return { success: false, error: 'Please provide a valid message.' };
  }

  if (message.length > 5000) {
    return { success: false, error: 'Message must be 5000 characters or fewer.' };
  }
  const { error } = await supabase.from('support_tickets').insert([
    {
      user_id: user.id,
      ticket_type: type,
      message: message.trim()
    }
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitContactTicket(email, message, type = 'bug') {
  if (!email || !email.includes('@') || !message || !message.trim()) {
    return { success: false, error: 'Please enter a valid email and message.' };
  }
  
  if (message.length > 5000) {
    return { success: false, error: 'Message must be 5000 characters or fewer.' };
  }

  // Restrict to allowed database types
  const ticketType = (type === 'feature' || type === 'bug') ? type : 'bug';

  try {
    const admin = createAdminClient();
    
    // Look up the admin user or first user to associate the ticket to
    const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    let targetUserId = null;
    
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 10 });
    const adminUser = users?.find(u => allowedEmails.includes(u.email?.toLowerCase()));
    
    if (adminUser) {
      targetUserId = adminUser.id;
    } else if (users && users.length > 0) {
      targetUserId = users[0].id;
    }
    
    if (!targetUserId) {
      return { success: false, error: 'Could not find a user account to attach the ticket to.' };
    }

    const { error } = await admin.from('support_tickets').insert([
      {
        user_id: targetUserId,
        ticket_type: ticketType,
        message: `[Visitor: ${email}]\n\n${message.trim()}`
      }
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
