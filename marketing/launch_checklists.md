# 📋 Kaeluma Launch Checklists

> **Focus**: Rebuild mornings for families through organic, video-led reach, Resend automation, and a community-funded donation model.

---

## ⚡ URGENT: Pre-Launch (May 26 – May 31) — DO THIS WEEK

- [ ] **Social Handle Registration**
  - [ ] TikTok: `@kaeluma_app`
  - [ ] Instagram: `@kaeluma.app`
  - [ ] Twitter/X: `@KaelumApp`
  - [ ] YouTube: `Kaeluma` (for Shorts & product guides)

- [ ] **Resend & Email Configuration**
  - [ ] Set up a free account at [Resend](https://resend.com).
  - [ ] Verify your custom domain (`kaeluma.com`) using DNS records (DKIM, SPF).
  - [ ] Import existing contacts into a `waitlist-leads` audience segment.
  - [ ] Set up the first automated sequence: **Welcome & Quick Start** triggered immediately upon email signup.
  - [ ] Test the database integration: verify new Supabase users are auto-subscribed to the Resend database group.

- [ ] **Stripe Donation Verification**
  - [ ] Test the Stripe Donation link: `https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00` is active.
  - [ ] Configure a Stripe webhook in Vercel to catch successful donations (`checkout.session.completed`).
  - [ ] Map the webhook to Resend to trigger the **Donation Thank You & Guild Rank** email (Email 10).

- [ ] **Adobe Asset Pack Creation**
  - [ ] **Photoshop**: Export transparent PNGs of the Kaeluma logo, coin icons, and badge icons (`branding/`).
  - [ ] **Figma / Photoshop**: Design a 16:9 banner for Product Hunt and Twitter (`branding/banner.png`).
  - [ ] Record a 60-second screen capture of Kaeluma (parent setting a mission → child checking it on the dashboard → clink sound → reward shop redemption).
  - [ ] **Premiere Pro**: Edit the screen capture:
    - Add jump-cuts, dynamic 110% zoom-ins, and text captions (Outfit Bold).
    - Layer high-quality metallic "Coin Clink" SFX when missions are completed.
    - Export a 16:9 version (for YouTube and Product Hunt) and a 9:16 vertical version (for Shorts and Reels).

- [ ] **Technical Validation**
  - [ ] Verify the kid-parent dashboard link runs correctly on iOS Safari and Android Chrome (since mobile web traffic is 90% of social clicks).
  - [ ] Confirm parent PIN settings block access to reward editing.
  - [ ] Set up Vercel Web Analytics to track landing page signup conversions.

---

## 🔴 WEEK 1: Warm Up & Channel Setup (June 1 – June 7)

### June 1 (Monday)
- [ ] Post TikTok Day 1 video: "Before vs. After Morning" (see `social_media_templates.md`).
- [ ] Post same video as Instagram Reel and YouTube Short.
- [ ] Post r/SideProject thread: "I built a gamified chore app to stop yelling at my 5-year-old. It's free and ad-free."
- [ ] DM 5 parenting micro-influencers.

### June 2 (Tuesday)
- [ ] Post TikTok Day 2: "The Screen Time Economy".
- [ ] Update the descriptions of the **top 3 videos** on the *Adventures with Amiga* YouTube channel to include: *"Struggling with morning routines? Try Kaeluma for free: kaeluma.com"*.
- [ ] DM 5 micro-influencers.

### June 3 (Wednesday)
- [ ] Post TikTok Day 3: "ADHD Visual Dopamine Loop".
- [ ] Comment on 10 parenting videos (authentic advice, no pitching).
- [ ] Reach out to 3 local pediatric/family clinics with the 1-page Kaeluma PDF guide.

### June 4 (Thursday)
- [ ] Post TikTok Day 4: "5 Chores to Gamify First".
- [ ] Post in r/parenting: "How do you handle morning routine battles?" (Story-first, do not pitch the app).
- [ ] Draft the Product Hunt submission (title, description, screenshots).

### June 5 (Friday)
- [ ] Post TikTok Day 5: "Founder Story: Why Kaeluma is Free".
- [ ] Send pitch emails to parenting editors (Fatherly, Scary Mommy, Romper) using your kids' content creator credentials.
- [ ] Pin a comment containing Kaeluma's link to the most popular *Adventures with Amiga* YouTube videos.

### June 6–7 (Weekend)
- [ ] Post TikTok Day 7: "What Reward Did Your Kid Choose?".
- [ ] Check Resend dashboard: verify waitlist growth rates.
- [ ] Reach out to influencers who responded to DMs and send them setup links.

**✅ Week 1 Milestone Gate**:
* 200+ waitlist email signups.
* At least 1 video over 10K organic views.
* Product Hunt draft completed.

---

## 🟡 WEEK 2: Soft Launch & Beta Access (June 8 – June 14)

### June 8 (Monday) — Beta Access Opens
- [ ] Trigger the **Beta Access Open** campaign via Resend to the full waitlist.
- [ ] Open signups at `kaeluma.com/signup`.
- [ ] Post TikTok: "We just opened the beta. Here is how parents are setting it up."
- [ ] Monitor Supabase logs for signup errors.

### June 9 (Tuesday)
- [ ] Personally email (via Resend) everyone who registered on day one to check if onboarding was smooth.
- [ ] Post TikTok: Video response to a comments question from yesterday's launch.

### June 10 (Wednesday)
- [ ] **Media Pitch**: Email local news stations ("Local kids' media creator builds routine app for families").
- [ ] Monitor Vercel web metrics for traffic spikes.

### June 11 (Thursday)
- [ ] Check DB statistics: calculate the Activation Rate (chores created/registered users).
- [ ] Post on Indie Hackers: "Building a free, donation-supported SaaS in public: Week 1 numbers."
- [ ] Collect 3 testimonials from active beta families.

### June 12–14 (Weekend)
- [ ] Complete Product Hunt submission (confirm Hunter, upload thumbnails, add first comment draft).
- [ ] Run final mobile sanity checks on parent approvals and coin redemptions.
- [ ] Pre-schedule all launch day social posts.

**✅ Week 2 Milestone Gate**:
* 100 activated beta users (chores created).
* 3 testimonials gathered.
* Product Hunt listing locked and scheduled.

---

## 🚀 WEEK 3: Public Launch Week (June 15 – June 21)

### June 15 (Monday) — T-2 Days
- [ ] Send "Kaeluma launches in 2 days" teaser via Resend.
- [ ] Post teaser Reel/Short.

### June 16 (Tuesday) — T-1 Day
- [ ] Double-check the Resend launch email copy.
- [ ] Verify Stripe donation redirect URL functions properly.

### June 17 (Wednesday) — LAUNCH DAY
- [ ] **12:01 AM PST**: Product Hunt listing goes live.
- [ ] **12:05 AM PST**: Post founder comment on Product Hunt.
- [ ] **7:00 AM EST**: Send Launch Day Resend email blast to waitlist.
- [ ] **8:00 AM EST**: Post Twitter/X 10-tweet launch thread.
- [ ] **9:00 AM EST**: Post Launch Day Reel/Short on socials.
- [ ] **10:00 AM EST**: Post Reddit templates in r/SideProject, r/parenting, and r/ADHD_parents.
- [ ] **11:00 AM EST**: **YouTube Crossover**: Post the launch announcement on the *Adventures with Amiga* channel Community Tab.
- [ ] **All Day**: Monitor and reply to every Product Hunt comment and support ticket.

### June 18–21 (Post-Launch)
- [ ] Post a "Launch Day Results" thread on Twitter/X and Indie Hackers.
- [ ] Send a personal thank-you to all early donors.
- [ ] Follow up on any press/media inquiries.

**✅ Week 3 Milestone Gate**:
* Top 5 on Product Hunt.
* 500+ signups.
* 15+ Stripe donation transactions.

---

## 📈 WEEK 4: Growth & Retention (June 22 – June 30)

- [ ] **Advocacy**: Nudge active families to use the "Share a Win" button when kids level up or build streaks.
- [ ] **Weekly Reports**: Check automated Monday report triggers in Resend.
- [ ] **Feedback Survey**: Send a 3-question survey via Resend to parents active for 7+ days: "What routine did Kaeluma fix? What feature should I build next?"
- [ ] **Donation Ask**: Check that the 14-day engaged user donation prompt is triggering correctly in Resend.
- [ ] **Retrospective**: Write and share a "How we built and launched a free, ad-free family app" build-in-public summary.

**✅ Week 4 Milestone Gate**:
* 1,000+ total families registered.
* 30+ donation gifts.
* Day-14 retention rate ≥ 30%.
