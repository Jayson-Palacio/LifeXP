# 📧 Email Marketing & Onboarding Journeys (Resend & React Email)

> **Tooling**: This playbook is configured for **Resend** (using React Email components or standard HTML templates). 
> **Voice**: Founder-to-parent. Warm, authentic, helpful, and completely ad-free.

---

## 🛠️ Developer Integration Files
To help you implement this playbook quickly, we have provided two code templates in the repository:
1. **[BaseTemplate.jsx](file:///c:/Users/jayso/Projects/Kaeluma/marketing/email_templates/BaseTemplate.jsx)**: A reusable, responsive React Email component matching Kaeluma's navy/purple/gold theme.
2. **[resend_helper.js](file:///c:/Users/jayso/Projects/Kaeluma/marketing/email_templates/resend_helper.js)**: A Next.js Server Action helper script to initialize Resend, construct HTML email bodies, and process Stripe checkout webhooks to trigger email delivery automatically.

---

## 🗺️ Customer Journey Map & Trigger Logic

Every email in this sequence is triggered by user behavioral data stored in Supabase.

```
[Waitlist Submit] ──> Email 1: Waitlist Welcome (Immediate)
[Manual Blast]    ──> Email 2: Beta Access Open (June 8)
[Supabase Auth]   ──> Email 3: Welcome & Setup Guide (Immediate)
[24h, 0 Chores]   ──> Email 4: Mission Nudge (1 Day Post-Signup)
[72h, 0 Rewards]  ──> Email 5: Reward Shop Nudge (3 Days Post-Signup)
[Kid Login = 1]   ──> Email 6: Kid First Login Celebration (Immediate)
[Weekly Cron]     ──> Email 7: Weekly Family Progress Report (Every Monday)
[5 Days Inactive] ──> Email 8: Re-engagement Flame Nudge (5 Days Inactive)
[14 Days Active]  ──> Email 9: Value-for-Value Ask & Feedback (14 Days Active)
[Stripe Webhook]  ──> Email 10: Donation Thank You & Guild Rank (Immediate)
```

---

## Email 1: Waitlist Welcome
* **Trigger**: Landing page waitlist form submission.
* **Resend Segment**: `waitlist-leads`
* **Subject A/B Test**:
  * **Subject A**: ☀️ You're on the list — welcome to the Kaeluma family
  * **Subject B**: Mornings are about to get a lot quieter. Welcome to Kaeluma!
* **Preheader**: Get ready to turn your daily routine battles into real-life quests.

```html
<p>Hi {{parentName}},</p>

<p>You just joined something I am incredibly proud of.</p>

<p>I built Kaeluma because I was the dad who said "brush your teeth" eleven times every single morning before finally losing my temper at 7:45 AM. I hated starting the day that way. My son hated it too.</p>

<p>So I built a system where his daily routines became a **quest board**. Where brushing his teeth earned him **gold coins**. Where those coins bought the screen time and treats he actually wanted.</p>

<p>And it worked. On day three, he did his routine before I even woke up.</p>

<p>Kaeluma is launching on **June 17, 2026**. Because you're on this list, you'll get early beta access on **June 8** to set up your family guild before the public launch.</p>

<p><strong>One quick note</strong>: Kaeluma is 100% free with no ads, paywalls, or monthly subscriptions. It runs entirely on the honor system—supported by voluntary parent donations once they see how much it helps their home.</p>

<p>Between now and the beta, I have one question for you:</p>

<p><strong>What is the one morning routine your kid fights you on every single day?</strong></p>

<p>Just hit reply and let me know. I read and answer every single email.</p>

<p>Best,<br>
Jayson<br>
Founder, Kaeluma<br>
<a href="https://kaeluma.com">kaeluma.com</a></p>
```

---

## Email 2: Beta Access Is Open
* **Trigger**: Manual broadcast via Resend on June 8, 2026.
* **Resend Segment**: `waitlist-leads` (excluding already registered)
* **Subject A/B Test**:
  * **Subject A**: 🔓 Beta is open — skip the line and create your guild
  * **Subject B**: Your early access pass to Kaeluma is here
* **Preheader**: No credit card required. No paywalls. Just your family's first quest.

```html
<p>Hi {{parentName}},</p>

<p>Nine days before our public launch, Kaeluma's gates are open for you.</p>

<p>Beta access is officially live, and because you're on the waitlist, you can set up your family profile today before the crowd arrives.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://kaeluma.com/signup" style="background-color: #A855F7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Create Your Free Account</a>
</div>

<p>Here is how to get set up in 5 minutes:</p>

<ol>
  <li><strong>Create your Parent account</strong> and add your kids' profiles.</li>
  <li><strong>Add 3 simple Missions</strong> (start with the biggest daily bottleneck, like brushing teeth or getting dressed).</li>
  <li><strong>Add 2 Rewards</strong> to your shop (keep them simple, like "30 minutes of iPad" or "Choose what's for dinner").</li>
  <li><strong>Open the Kid Dashboard</strong> on a shared tablet or their device, show them the screen once, and let them own the rest.</li>
</ol>

<p>Kaeluma has no paywalls or feature limits. Everything is open. If you have any trouble setting up your database link, reply to this email and I'll jump in to help.</p>

<p>See you inside,<br>
Jayson</p>
```

---

## Email 3: Account Created & Quick Start
* **Trigger**: Supabase `auth.users` insert (triggered immediately upon signup).
* **Resend Segment**: `active-parents`
* **Subject A/B Test**:
  * **Subject A**: 🚀 Your family guild is ready — here is your quick start
  * **Subject B**: Welcome to Kaeluma! Let's set up quest #1
* **Preheader**: The golden rule of gamified routines: start small.

```html
<p>Hi {{parentName}},</p>

<p>Your Kaeluma account is live. Welcome to the guild! Let’s get your kid’s first mission set up.</p>

<p><strong>The #1 mistake parents make when starting</strong>: Adding 10 missions on day one. Kids get overwhelmed and lose interest. The key is starting small to build momentum.</p>

<p>Try this simple setup today:</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <tr style="background-color: rgba(168,85,247,0.1);">
    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Mission Name</th>
    <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Gold Coins</th>
    <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">XP</th>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;">🪥 Brush teeth morning & night</td>
    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">5 🪙</td>
    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">20 ⚡</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;">👟 Put shoes in the cubby</td>
    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">3 🪙</td>
    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">10 ⚡</td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <tr style="background-color: rgba(59,130,246,0.1);">
    <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Reward Name</th>
    <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Coin Cost</th>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;">🍦 Choose dessert tonight</td>
    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">8 🪙</td>
  </tr>
</table>

<p>Once they complete their tasks, they get the coins, buy the dessert, and experience that first dopamine hit. That is how the habit forms.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://kaeluma.com/parent" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go Create Your First Mission</a>
</div>

<p>Let me know how your first morning goes!</p>

<p>Jayson</p>
<p><em>P.S. If you want me to look at your setup and suggest custom missions, just reply with "check my setup"—I’ll check your dashboard and give feedback within 24 hours.</em></p>
```

---

## Email 4: First Mission Nudge
* **Trigger**: 24 hours post-signup if `missions` count is 0.
* **Resend Segment**: `inactive-setup`
* **Subject A/B Test**:
  * **Subject A**: 🎯 One mission away from peaceful mornings
  * **Subject B**: Need help creating your child's first quest?
* **Preheader**: It takes 60 seconds. Copy this template.

```html
<p>Hi {{parentName}},</p>

<p>You created your family account yesterday, but your quest board is still empty.</p>

<p>Starting a new system is hard. To help you get going, here is a pre-built <strong>Morning Routine Quest Pack</strong> you can copy in under a minute:</p>

<ul>
  <li><strong>Quest 1</strong>: "Brush Teeth" → 5 gold, 20 XP</li>
  <li><strong>Quest 2</strong>: "Get Dressed" → 5 gold, 15 XP</li>
  <li><strong>Quest 3</strong>: "Pack School Bag" → 5 gold, 15 XP</li>
  <li><strong>Reward Shop Item</strong>: "30 Minutes of Screen Time" → 15 gold coins</li>
</ul>

<p>This simple loop teaches your child that their morning efforts have immediate value.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://kaeluma.com/parent" style="background-color: #A855F7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Copy Template into Kaeluma</a>
</div>

<p>If you're stuck on the setup or have questions about how the parent PIN works, reply to this email.</p>

<p>Best,<br>
Jayson</p>
```

---

## Email 5: Reward Shop Nudge
* **Trigger**: 72 hours post-signup if `missions` count > 0 but `rewards` count is 0.
* **Resend Segment**: `incomplete-setup`
* **Subject A/B Test**:
  * **Subject A**: 🎁 Your kid has gold coins, but nowhere to spend them!
  * **Subject B**: Don't forget the Reward Shop (the most important part)
* **Preheader**: How to set up a balanced family economy in 60 seconds.

```html
<p>Hi {{parentName}},</p>

<p>Good news: your missions are set up, which means your child is ready to earn. However, your **Reward Shop** is currently empty.</p>

<p>Without rewards, kids accumulate gold coins with nothing to save for. The core engine of Kaeluma is the **economy**—working towards a goal they care about.</p>

<p>Here are the most popular rewards used by other Kaeluma families:</p>

<ul>
  <li>📱 <strong>30 Min Screen Time</strong> — 15 coins</li>
  <li>🍦 <strong>Trip to the Ice Cream Shop</strong> — 50 coins</li>
  <li>🌙 <strong>Stay up 20 minutes past bedtime</strong> — 25 coins</li>
  <li>🎨 <strong>Buy a new toy ($5 limit)</strong> — 100 coins</li>
  <li>🕺 <strong>Dad does a silly dance during dinner</strong> — 10 coins</li>
</ul>

<p>The best rewards aren't expensive items. They are privileges you would normally give them anyway—but now they earn them through contribution. It teaches basic financial literacy and effort.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://kaeluma.com/parent" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Add Rewards to Your Shop</a>
</div>

<p>Best,<br>
Jayson</p>
```

---

## Email 6: Kid First Login Celebration
* **Trigger**: Child profile first login detected.
* **Resend Segment**: `active-parents`
* **Subject A/B Test**:
  * **Subject A**: 🎮 {{childName}} has joined the guild!
  * **Subject B**: Your kid is officially a Kaeluma adventurer
* **Preheader**: Here is how to make their first quest session magical.

```html
<p>Hi {{parentName}},</p>

<p>Big milestone: <strong>{{childName}} logged into Kaeluma for the first time!</strong></p>

<p>They are officially on their first quest. To make this habit stick, here are three tips for their first week:</p>

<ol>
  <li><strong>Sit with them for the first checkoff</strong>. Let them tap "Brush Teeth" and watch the gold coins animate. That visual and audio feedback is the habit loop forming.</li>
  <li><strong>Let them pick their target reward</strong>. Ask them: "Look at the shop—what are you going to save your coins for?" Having a self-selected goal keeps them motivated.</li>
  <li><strong>Step back</strong>. Let the app act as the reminder, not you. Instead of saying "brush your teeth," just ask, "Have you checked your quest board today?"</li>
</ol>

<p>Within a few days, most kids take complete ownership of their routines.</p>

<p>I’d love to hear how {{childName}} liked the sound effects—hit reply and let me know!</p>

<p>Jayson</p>
```

---

## Email 7: Weekly Family Progress Report
* **Trigger**: Weekly CRON job (Every Monday at 8:00 AM local time) for families active in the last 7 days.
* **Resend Segment**: `active-parents`
* **Subject A/B Test**:
  * **Subject A**: 📊 Weekly Report: {{childName}}'s quest progress
  * **Subject B**: See how {{childName}} leveled up this week!
* **Preheader**: Completed missions, earned coins, and active streaks.

```html
<p>Hi {{parentName}},</p>

<p>Here is your weekly recap for <strong>{{familyName}}</strong>:</p>

<div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB; margin-bottom: 20px;">
  <h3 style="margin-top: 0; color: #1E1B4B;">🏆 {{childName}}'s Stats</h3>
  <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
    <li>⚡ <strong>XP Earned This Week</strong>: {{xpEarned}} XP</li>
    <li>🪙 <strong>Gold Coins Earned</strong>: {{coinsEarned}} coins</li>
    <li>🎯 <strong>Missions Completed</strong>: {{completedCount}} quests</li>
    <li>🔥 <strong>Active Streak</strong>: {{streakDays}} Days</li>
  </ul>
</div>

<p>{{streakMessage}}</p>

<p>Remember, Kaeluma is 100% free and runs entirely on donations. If the app saved you some morning stress this week, consider tossing a voluntary tip into our jar to keep the servers running.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Support Kaeluma 💖</a>
</div>

<p>Have a great week of questing!<br>
Jayson</p>
```

---

## Email 8: Re-engagement Flame Nudge
* **Trigger**: No user activity (parent or child) for 5 days.
* **Resend Segment**: `slipping-retention`
* **Subject A/B Test**:
  * **Subject A**: 👀 {{childName}}'s quest board is waiting
  * **Subject B**: Need a routine reset? Let's restart the loop
* **Preheader**: Use the "Double Coin" trick to get back on track.

```html
<p>Hi {{parentName}},</p>

<p>It has been five days since {{childName}} checked in to Kaeluma.</p>

<p>Routines are hard. Life gets busy, kids get sick, schedules slip. That is completely normal.</p>

<p>If you're ready to restart the habit, try the <strong>"Double Coins Weekend"</strong> trick: tell {{childName}} that for the next two days, every routine mission is worth double gold coins. You don't need to change anything in the app—just announce the event and watch them sprint to complete their tasks.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://kaeluma.com/login" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log Back In to Kaeluma</a>
</div>

<p>If you stopped using Kaeluma because something was confusing or buggy, please reply and tell me. I build this app by hand and want to make it work for you.</p>

<p>Best,<br>
Jayson</p>
```

---

## Email 9: Value-for-Value Ask & Feedback
* **Trigger**: User has been active for 14 days and child has completed ≥ 15 missions.
* **Resend Segment**: `highly-engaged`
* **Subject A/B Test**:
  * **Subject A**: ☀️ Two weeks with Kaeluma — how are your mornings?
  * **Subject B**: An honest question from the developer of Kaeluma
* **Preheader**: A quick check-in, a request, and a donation link.

```html
<p>Hi {{parentName}},</p>

<p>You’ve been using Kaeluma for two weeks now, and {{childName}} has checked off {{completedCount}} missions. That is a real, measurable change in your household routine.</p>

<p>Since the app is working, I have two quick favors to ask:</p>

<h3>1. Share your feedback or a quick testimonial</h3>
<p>How have your mornings changed since day one? Simply reply to this email and let me know. Knowing that this code helps real families is the fuel that keeps me building.</p>

<h3>2. Consider supporting Kaeluma</h3>
<p>Kaeluma has no paywalls, subscriptions, or ads. I want to keep it accessible to every parent regardless of budget. However, server and database hosting costs money.</p>

<p>If Kaeluma has saved your sanity in the mornings, please consider making a voluntary, one-time donation to keep the project alive.</p>

<div style="margin: 24px 0; text-align: center;">
  <a href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00" style="background-color: #635BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Support Kaeluma on Stripe</a>
</div>

<p>Thank you for being part of our early family of users.</p>

<p>Jayson<br>
Founder, Kaeluma</p>
```

---

## Email 10: Donation Thank You & Guild Rank
* **Trigger**: Stripe checkout webhook for `donate.stripe.com` successful payment.
* **Resend Segment**: `donors`
* **Subject A/B Test**:
  * **Subject A**: 💖 Thank you for supporting Kaeluma!
  * **Subject B**: You're officially a Kaeluma Guild Patron
* **Preheader**: You're keeping the lights on for family productivity.

```html
<p>Hi {{parentName}},</p>

<p>I just received your donation to Kaeluma, and I wanted to send a personal thank you. You are officially an early Patron of our project!</p>

<p>Your contribution directly covers the database and server hosting fees that keep Kaeluma running fast and ad-free for everyone. Because of you, other parents can access this system without worry.</p>

<p>I've noted your email in our database. You will get priority support, early access to new customization features, and a direct line to request new features.</p>

<p>Thank you for believing in indie, parent-supported software.</p>

<p>With gratitude,<br>
Jayson<br>
Founder, Kaeluma</p>
```
