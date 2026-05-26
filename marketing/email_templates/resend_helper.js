import { Resend } from 'resend';

// Initialize Resend with your API key
// Make sure to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * server_action: sendKaelumaEmail
 * 
 * Server action to dispatch transactional emails via Resend.
 * 
 * @param {string} toEmail - Recipient parent email
 * @param {string} parentName - Recipient parent name
 * @param {string} templateId - The email type/trigger (e.g. 'welcome', 'nudge_mission', 'donation_thank_you')
 * @param {object} variables - Dynamic variables like childName, streakDays, coinsEarned
 */
export async function sendKaelumaEmail({ toEmail, parentName, templateId, variables = {} }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY in environment variables.');
    return { success: false, error: 'Email service configuration error.' };
  }

  const { childName, streakDays, coinsEarned, xpEarned, completedCount } = variables;

  let subject = '';
  let previewText = '';
  let emailHtml = '';
  let ctaText = null;
  let ctaUrl = null;

  switch (templateId) {
    case 'welcome':
      subject = `🚀 Your family guild is ready — welcome to Kaeluma!`;
      previewText = 'Get ready to turn your daily routine battles into quests.';
      ctaText = 'Create Your First Mission';
      ctaUrl = 'https://kaeluma.com/parent';
      emailHtml = `
        <p>Your Kaeluma account is live. Welcome to the guild!</p>
        <p><strong>The #1 mistake parents make when starting</strong>: Adding 10 missions on day one. Kids get overwhelmed and lose interest. The key is starting small to build momentum.</p>
        <p>Try this simple setup today:</p>
        <ul>
          <li><strong>Quest 1</strong>: 🪥 Brush teeth morning & night (+5 coins, +20 XP)</li>
          <li><strong>Quest 2</strong>: 👟 Put shoes in the cubby (+3 coins, +10 XP)</li>
          <li><strong>Reward Shop Item</strong>: 🍦 Choose dessert tonight (Costs 8 coins)</li>
        </ul>
        <p>Once they complete both tasks, they get the coins, buy the dessert, and experience that first dopamine hit. That is how the habit forms.</p>
      `;
      break;

    case 'nudge_mission':
      subject = `🎯 One mission away from peaceful mornings`;
      previewText = 'Setup takes 60 seconds. Copy our template.';
      ctaText = 'Copy Template Now';
      ctaUrl = 'https://kaeluma.com/parent';
      emailHtml = `
        <p>You created your family account yesterday, but your quest board is still empty.</p>
        <p>Starting a new system is hard. To help you get going, here is a pre-built <strong>Morning Routine Quest Pack</strong> you can copy in under a minute:</p>
        <ul>
          <li><strong>Quest 1</strong>: "Brush Teeth" → 5 gold, 20 XP</li>
          <li><strong>Quest 2</strong>: "Get Dressed" → 5 gold, 15 XP</li>
          <li><strong>Quest 3</strong>: "Pack School Bag" → 5 gold, 15 XP</li>
          <li><strong>Reward Shop Item</strong>: "30 Minutes of Screen Time" → 15 gold coins</li>
        </ul>
        <p>This simple loop teaches your child that their morning efforts have immediate value.</p>
      `;
      break;

    case 'weekly_report':
      subject = `📊 Weekly Report: ${childName}'s quest progress`;
      previewText = `Completed missions, earned coins, and streaks for ${childName}.`;
      ctaText = 'Open Parent Dashboard';
      ctaUrl = 'https://kaeluma.com/parent';
      emailHtml = `
        <p>Here is your weekly recap for the family guild:</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0; color: #1e1b4b; font-size: 16px;">🏆 ${childName}'s Stats</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 6px;">⚡ <strong>XP Earned</strong>: ${xpEarned || 0} XP</li>
            <li style="margin-bottom: 6px;">🪙 <strong>Gold Coins Earned</strong>: ${coinsEarned || 0} coins</li>
            <li style="margin-bottom: 6px;">🎯 <strong>Missions Completed</strong>: ${completedCount || 0} quests</li>
            <li style="margin-bottom: 0;">🔥 <strong>Streak Count</strong>: ${streakDays || 0} Days</li>
          </ul>
        </div>
        <p>Keep up the consistency! If Kaeluma saved you some morning stress this week, consider tipping us to help cover our database server hosting costs.</p>
      `;
      break;

    case 'donation_thank_you':
      subject = `💖 You're officially a Kaeluma Guild Patron!`;
      previewText = 'Thank you for supporting parent-built, ad-free software.';
      ctaText = 'Enter Guild Portal';
      ctaUrl = 'https://kaeluma.com/parent';
      emailHtml = `
        <p>I just received your donation to Kaeluma, and I wanted to send a personal thank you. You are officially an early Patron of our project!</p>
        <p>Your contribution directly covers the database and server hosting fees that keep Kaeluma running fast and ad-free for everyone. Because of you, other parents can access this system without worry.</p>
        <p>I've noted your email in our database. You will get priority support, early access to new customization features, and a direct line to request new features.</p>
      `;
      break;

    default:
      return { success: false, error: 'Unknown email template ID.' };
  }

  // Wrap the content block in the shared HTML template matching BaseTemplate.jsx
  const fullHtml = `
    <div style="background-color: #f3f4f6; padding: 24px 16px; font-family: sans-serif; color: #374151; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e1b4b; border-radius: 8px 8px 0 0; padding: 20px; text-align: center;">
        <span style="font-size: 24px;">☀️</span>
        <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin-left: 8px;">Kaeluma</span>
      </div>
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; padding: 40px 32px 32px 32px;">
        <h1 style="font-size: 20px; font-weight: 800; color: #1e1b4b; margin-top: 0; margin-bottom: 20px;">${subject}</h1>
        <p>Hi ${parentName},</p>
        <div style="color: #4b5563; font-size: 15px;">
          ${emailHtml}
        </div>
        ${ctaText && ctaUrl ? `
          <div style="margin: 32px 0; text-align: center;">
            <a href="${ctaUrl}" style="background-color: #a855f7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">
              ${ctaText}
            </a>
          </div>
        ` : ''}
        <p style="margin-top: 32px; font-size: 14px; color: #1f2937;">
          Best,<br>
          <strong>Jayson</strong><br>
          <span style="font-size: 12px; color: #6b7280;">Founder, Kaeluma</span>
        </p>
      </div>
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0 0 8px 8px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 0 32px 32px 32px; text-align: center;">
        <div style="background-color: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.15); border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
          <span style="font-size: 20px; display: block; margin-bottom: 8px;">💖</span>
          <p style="font-weight: 800; font-size: 13px; color: #312e81; margin: 0 0 6px 0; text-transform: uppercase;">Support Kaeluma</p>
          <p style="font-size: 12px; color: #4b5563; margin: 0 0 16px 0; line-height: 1.5;">Kaeluma is 100% free, ad-free, and subscription-free. We cover hosting costs entirely through parent donations.</p>
          <a href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00" style="background-color: #3b82f6; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 12px;">Support on Stripe</a>
        </div>
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} Kaeluma. Built by a dad for families.</p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Jayson from Kaeluma <jayson@kaeluma.com>',
      to: [toEmail],
      subject: subject,
      html: fullHtml,
      tags: [
        { name: 'template_id', value: templateId }
      ]
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email via Resend SDK:', error);
    return { success: false, error: error.message };
  }
}

/**
 * webhook_api_route: Next.js API Route for Stripe webhook
 * 
 * Put this in src/app/api/webhooks/donations/route.js to catch successful
 * checkouts from your donate.stripe.com donation page and send Email 10 automatically.
 */
export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Verify signature if webhook secret is configured
  // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = JSON.parse(payload);
    
    // Check if event type is successful checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'there';

      if (customerEmail) {
        // Send Email 10 (donation_thank_you) via Resend
        await sendKaelumaEmail({
          toEmail: customerEmail,
          parentName: customerName,
          templateId: 'donation_thank_you'
        });
        
        console.log(`Donation confirmation email sent to: ${customerEmail}`);
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
