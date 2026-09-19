# 📋 Kaeluma Launch Checklists

> **Focus**: Rebuild mornings for families through organic, video-led reach, Resend automation, and a community-funded donation model.

### Priority Key
| Label | Meaning | Rule |
|---|---|---|
| 🔴 P1 | **Must-do** — launch depends on it | Do these first, no exceptions |
| 🟡 P2 | **Important** — significantly boosts launch quality | Do after all P1s are complete |
| 🟢 P3 | **Nice-to-have** — builds long-term momentum | Skip if running behind schedule |

---

## 🛠️ WEEK 0: Analytics & Tracking Setup (May 26 – May 28)

> [!IMPORTANT]
> Complete tracking setup BEFORE any marketing activity begins. Without this, you can't measure what's working.

- [ ] **[🔴 P1 · ~1h]** Set up Vercel Web Analytics with custom events for `signup_started`, `signup_completed`, `first_quest_created`.
- [ ] **[🔴 P1 · ~30m]** Configure UTM parameter parsing — ensure `utm_source`, `utm_medium`, and `utm_campaign` values are captured on the signup page and stored in Supabase user metadata.
- [ ] **[🟡 P2 · ~1h]** Create a Google Sheet "Launch Dashboard" with tabs: Daily Signups, Channel Attribution (by UTM source), Product Hunt Rank, Email Open Rates, Social Video Views.
- [ ] **[🟡 P2 · ~30m]** Set up Google Search Console and submit sitemap.xml for indexing.

**⏱️ Week 0 Total: ~3 hours**

---

## ⚡ URGENT: Pre-Launch (May 28 – May 31) — DO THIS WEEK

- [ ] **Social Handle Registration** 
  - [ ] **[🔴 P1 · ~30m]** TikTok: `@kaeluma_app`
  - [ ] **[🔴 P1 · ~15m]** Instagram: `@kaeluma.app`
  - [ ] **[🔴 P1 · ~15m]** Twitter/X: `@KaelumaApp`
  - [ ] **[🟡 P2 · ~15m]** YouTube: `Kaeluma` (for Shorts & product guides)

- [ ] **Resend & Email Configuration**
  - [ ] **[🔴 P1 · ~30m]** Set up a free account at [Resend](https://resend.com).
  - [ ] **[🔴 P1 · ~1h]** Verify your custom domain (`kaeluma.com`) using DNS records (DKIM, SPF).
  - [ ] **[🔴 P1 · ~30m]** Import existing contacts into a `waitlist-leads` audience segment.
  - [ ] **[🔴 P1 · ~1h]** Set up the first automated sequence: **Welcome & Quick Start** triggered immediately upon email signup.
  - [ ] **[🔴 P1 · ~1h]** Test the database integration: verify new Supabase users are auto-subscribed to the Resend database group.

- [ ] **Stripe Donation Verification**
  - [ ] **[🔴 P1 · ~15m]** Test the Stripe Donation link: `https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00` is active.
  - [ ] **[🔴 P1 · ~1h]** Configure a Stripe webhook in Vercel to catch successful donations (`checkout.session.completed`).
  - [ ] **[🟡 P2 · ~30m]** Map the webhook to Resend to trigger the **Donation Thank You & Guild Rank** email (Email 10).

- [ ] **Adobe Asset Pack Creation**
  - [ ] **[🔴 P1 · ~1h]** **Photoshop**: Export transparent PNGs of the Kaeluma logo, coin icons, and badge icons (`branding/`).
  - [ ] **[🔴 P1 · ~1h]** **Figma / Photoshop**: Design a 16:9 banner for Product Hunt and Twitter (`branding/banner.png`).
  - [ ] **[🔴 P1 · ~2h]** Record a 60-second screen capture of Kaeluma (parent setting a mission → child checking it on the dashboard → clink sound → reward shop redemption).
  - [ ] **[🔴 P1 · ~4h]** **Premiere Pro**: Edit the screen capture:
    - Add jump-cuts, dynamic 110% zoom-ins, and text captions (Outfit Bold).
    - Layer high-quality metallic "Coin Clink" SFX when missions are completed.
    - Export a 16:9 version (for YouTube and Product Hunt) and a 9:16 vertical version (for Shorts and Reels).

- [ ] **Technical Validation & AEO Setup**
  - [ ] **[🔴 P1 · ~1h]** Verify the kid-parent dashboard link runs correctly on iOS Safari and Android Chrome (since mobile web traffic is 90% of social clicks).
  - [ ] **[🔴 P1 · ~30m]** Confirm parent PIN settings block access to reward editing.
  - [ ] **[🔴 P1 · ~30m]** Set up Vercel Web Analytics to track landing page signup conversions.
  - [ ] **[🔴 P1 · ~30m]** **AEO JSON-LD Schema**: Verify the structured JSON-LD `SoftwareApplication` markup is rendering correctly in `src/app/layout.js` HTML headers.
  - [ ] **[🟡 P2 · ~30m]** **Google Search Console**: Verify `kaeluma.com` ownership and request index crawls to ensure AI scraping crawlers get the latest updates.
  - [ ] **[🟡 P2 · ~1h]** **AI-Facing FAQ Layout**: Ensure the website landing page contains clear, crawlable Q&A text matches from the *AEO Playbook* for conversational RAG queries.

**⏱️ Pre-Launch Total: ~18 hours** (spread across 4 days = ~4.5h/day)

---

## 🔴 WEEK 1: Warm Up & Channel Setup (June 1 – June 7)

### June 1 (Monday) — **~3.5h**
- [ ] **[🔴 P1 · ~2h]** Post TikTok Day 1 video: "Before vs. After Morning" (see `social_media_templates.md`). Includes filming, editing, and captioning.
- [ ] **[🟡 P2 · ~30m]** Post same video as Instagram Reel and YouTube Short (re-export, adjust captions).
- [ ] **[🔴 P1 · ~30m]** Post r/SideProject thread: "I built a gamified chore app to stop yelling at my 5-year-old. It's free and ad-free."
- [ ] **[🟡 P2 · ~30m]** DM 5 parenting micro-influencers (use template from `launch_strategy.md`).

### June 2 (Tuesday) — **~3h**
- [ ] **[🔴 P1 · ~2h]** Post TikTok Day 2: "The Screen Time Economy".
- [ ] **[🟡 P2 · ~30m]** Update the descriptions of the **top 3 videos** on the *Adventures with Amiga* YouTube channel to include: *"Struggling with morning routines? Try Kaeluma for free: kaeluma.com"*.
- [ ] **[🟡 P2 · ~30m]** DM 5 micro-influencers.

### June 3 (Wednesday) — **~3.5h**
- [ ] **[🔴 P1 · ~2h]** Post TikTok Day 3: "ADHD Visual Dopamine Loop".
- [ ] **[🟡 P2 · ~45m]** Comment on 10 parenting videos (authentic advice, no pitching).
- [ ] **[🟢 P3 · ~45m]** Reach out to 3 local pediatric/family clinics with the 1-page Kaeluma PDF guide.

### June 4 (Thursday) — **~3.5h**
- [ ] **[🔴 P1 · ~2h]** Post TikTok Day 4: "5 Chores to Gamify First".
- [ ] **[🟡 P2 · ~30m]** Post in r/parenting: "How do you handle morning routine battles?" (Story-first, do not pitch the app).
- [ ] **[🔴 P1 · ~1h]** Draft the Product Hunt submission (title, description, screenshots).

### June 5 (Friday) — **~3h**
- [ ] **[🔴 P1 · ~2h]** Post TikTok Day 5: "Founder Story: Why Kaeluma is Free".
- [ ] **[🟡 P2 · ~45m]** Send pitch emails to parenting editors (Fatherly, Scary Mommy, Romper) using your kids' content creator credentials.
- [ ] **[🟢 P3 · ~15m]** Pin a comment containing Kaeluma's link to the most popular *Adventures with Amiga* YouTube videos.

### June 6–7 (Weekend) — **~2h**
- [ ] **[🔴 P1 · ~1h]** Post TikTok Day 7: "What Reward Did Your Kid Choose?".
- [ ] **[🟡 P2 · ~30m]** Check Resend dashboard: verify waitlist growth rates.
- [ ] **[🟡 P2 · ~30m]** Reach out to influencers who responded to DMs and send them setup links.

**⏱️ Week 1 Total: ~18.5 hours** (~2.6h/day average)

**✅ Week 1 Milestone Gate**:
* 200+ waitlist email signups.
* At least 1 video over 10K organic views.
* Product Hunt draft completed.

---

## 🟡 WEEK 2: Soft Launch & Beta Access (June 8 – June 14)

### June 8 (Monday) — Beta Access Opens — **~3h**
- [ ] **[🔴 P1 · ~30m]** Trigger the **Beta Access Open** campaign via Resend to the full waitlist.
- [ ] **[🔴 P1 · ~15m]** Open signups at `kaeluma.com/signup`.
- [ ] **[🔴 P1 · ~2h]** Post TikTok: "We just opened the beta. Here is how parents are setting it up."
- [ ] **[🔴 P1 · ~15m]** Monitor Supabase logs for signup errors.

### June 9 (Tuesday) — **~2.5h**
- [ ] **[🔴 P1 · ~1h]** Personally email (via Resend) everyone who registered on day one to check if onboarding was smooth.
- [ ] **[🟡 P2 · ~1.5h]** Post TikTok: Video response to a comments question from yesterday's launch.

### June 10 (Wednesday) — **~2h**
- [ ] **[🟡 P2 · ~1h]** **Media Pitch**: Email local news stations ("Local kids' media creator builds routine app for families").
- [ ] **[🔴 P1 · ~30m]** Monitor Vercel web metrics for traffic spikes.
- [ ] **[🟡 P2 · ~30m]** Check UTM attribution data — which channels drove the most signups?

### June 11 (Thursday) — **~2.5h**
- [ ] **[🔴 P1 · ~30m]** Check DB statistics: calculate the Activation Rate (chores created/registered users).
- [ ] **[🟡 P2 · ~1h]** Post on Indie Hackers: "Building a free, donation-supported SaaS in public: Week 1 numbers."
- [ ] **[🟡 P2 · ~1h]** Collect 3 testimonials from active beta families.

### June 12–14 (Weekend) — **~4h**
- [ ] **[🔴 P1 · ~2h]** Complete Product Hunt submission (confirm Hunter, upload thumbnails, add first comment draft).
- [ ] **[🔴 P1 · ~1h]** Run final mobile sanity checks on parent approvals and coin redemptions.
- [ ] **[🔴 P1 · ~1h]** Pre-schedule all launch day social posts.

**⏱️ Week 2 Total: ~14 hours** (~2h/day average)

**✅ Week 2 Milestone Gate**:
* 100 activated beta users (chores created).
* 3 testimonials gathered.
* Product Hunt listing locked and scheduled.

---

## 🚀 WEEK 3: Public Launch Week (June 15 – June 21)

### June 15 (Monday) — T-2 Days — **~1.5h**
- [ ] **[🔴 P1 · ~30m]** Send "Kaeluma launches in 2 days" teaser via Resend.
- [ ] **[🔴 P1 · ~1h]** Post teaser Reel/Short.

### June 16 (Tuesday) — T-1 Day — **~1.5h**
- [ ] **[🔴 P1 · ~30m]** Double-check the Resend Launch Day email copy (Email 2.5).
- [ ] **[🔴 P1 · ~15m]** Verify Stripe donation redirect URL functions properly.
- [ ] **[🔴 P1 · ~15m]** Pre-load all social post drafts with schedule confirmation.
- [ ] **[🟡 P2 · ~30m]** Notify beta users: "We go live publicly tomorrow — help us upvote on Product Hunt!"

### June 17 (Wednesday) — 🚀 LAUNCH DAY — **~12h (block the full day)**
- [ ] **[🔴 P1 · ~15m]** **12:01 AM PST**: Product Hunt listing goes live.
- [ ] **[🔴 P1 · ~15m]** **12:05 AM PST**: Post founder comment on Product Hunt.
- [ ] **[🔴 P1 · ~15m]** **7:00 AM EST**: Send Launch Day Resend email blast (Email 2.5) to full list.
- [ ] **[🔴 P1 · ~30m]** **8:00 AM EST**: Post Twitter/X 10-tweet launch thread.
- [ ] **[🔴 P1 · ~30m]** **9:00 AM EST**: Post Launch Day Reel/Short on socials.
- [ ] **[🔴 P1 · ~30m]** **10:00 AM EST**: Post Reddit templates in r/SideProject, r/parenting, and r/ADHD_parents.
- [ ] **[🟡 P2 · ~15m]** **11:00 AM EST**: **YouTube Crossover**: Post the launch announcement on the *Adventures with Amiga* channel Community Tab.
- [ ] **[🔴 P1 · ~8h]** **All Day**: Monitor and reply to every Product Hunt comment, support ticket, and social mention. Check server health every 2 hours.

### June 18–21 (Post-Launch) — **~4h**
- [ ] **[🔴 P1 · ~1h]** Post a "Launch Day Results" thread on Twitter/X and Indie Hackers.
- [ ] **[🟡 P2 · ~30m]** Send a personal thank-you to all early donors.
- [ ] **[🔴 P1 · ~1h]** Follow up on any press/media inquiries within 2 hours of receipt.
- [ ] **[🔴 P1 · ~30m]** Check Supabase connection pool and Vercel function logs for errors.
- [ ] **[🟡 P2 · ~1h]** Compile launch metrics: signups, PH rank, email opens, top UTM sources, donation count.

**⏱️ Week 3 Total: ~19 hours** (most concentrated on Launch Day)

**✅ Week 3 Milestone Gate**:
* Top 5 on Product Hunt.
* 500+ signups.
* 15+ Stripe donation transactions.

---

## 🚨 Launch Day Incident Response

> [!CAUTION]
> If any of these happen on June 17, follow the response protocol immediately.

| Incident | Response | Time Target |
|---|---|---|
| **Server/Vercel down** | Check Vercel dashboard → redeploy latest commit → post status on Twitter: "We're on it, back shortly!" | < 15 min |
| **Supabase rate limit** | Scale up to Pro tier temporarily ($25/mo) → clear connection pool → restart Edge functions | < 30 min |
| **Stripe webhook failure** | Check Vercel function logs → redeploy webhook endpoint → manually send donation thank-you emails | < 1 hour |
| **Signup flow broken** | Roll back to last working deployment on Vercel → hotfix → redeploy | < 30 min |
| **Negative comment/safety concern** | Respond empathetically within 30 min → "We take this seriously, we're looking into it" → escalate if needed | < 30 min |
| **Unexpected viral traffic** | Celebrate! But monitor — check Supabase connections, bump Vercel concurrency limits if needed | Ongoing |

---

## 📈 WEEK 4: Growth & Retention (June 22 – June 30)

- [ ] **[🔴 P1 · ~30m]** **Advocacy**: Nudge active families to use the "Share a Win" button when kids level up or build streaks.
- [ ] **[🔴 P1 · ~30m]** **Weekly Reports**: Check automated Monday report triggers in Resend.
- [ ] **[🟡 P2 · ~1h]** **Feedback Survey**: Send a 3-question survey via Resend to parents active for 7+ days: "What routine did Kaeluma fix? What feature should I build next?"
- [ ] **[🟡 P2 · ~30m]** **Donation Ask**: Check that the 14-day engaged user donation prompt is triggering correctly in Resend.
- [ ] **[🟡 P2 · ~2h]** **Retrospective**: Write and share a "How we built and launched a free, ad-free family app" build-in-public summary.
- [ ] **[🟡 P2 · ~1h]** **Analytics Review**: Compile full-month dashboard — chart signups, retention curve, top channels by UTM, donation conversion rate.

**⏱️ Week 4 Total: ~5.5 hours**

**✅ Week 4 Milestone Gate**:
* 1,000+ total families registered.
* 30+ donation gifts.
* Day-14 retention rate ≥ 30%.

---

## 📊 Time Budget Summary

| Phase | Hours | Days | Daily Average |
|---|---|---|---|
| Week 0: Analytics Setup | 3h | 2 | 1.5h/day |
| Pre-Launch (May 28–31) | 18h | 4 | 4.5h/day |
| Week 1 (June 1–7) | 18.5h | 7 | 2.6h/day |
| Week 2 (June 8–14) | 14h | 7 | 2h/day |
| Week 3 (June 15–21) | 19h | 7 | 2.7h/day ⚠️ |
| Week 4 (June 22–30) | 5.5h | 9 | 0.6h/day |
| **TOTAL** | **78h** | **36 days** | **~2.2h/day** |

> [!WARNING]
> The heaviest days are Pre-Launch (4.5h/day) and Launch Day itself (~12h block). Plan your schedule accordingly. The video editing tasks in Pre-Launch are the biggest time sinks — consider batching all 7 TikTok videos in a single filming session to save setup time.
