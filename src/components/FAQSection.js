"use client";

import { useState } from 'react';
import { playPop } from '../lib/sounds';

const faqs = [
  {
    question: "How does Kaeluma work?",
    answer: "Kaeluma turns daily chores and family habits into an engaging RPG (role-playing game) for kids. Parents assign customized missions, kids check them off on their magical dashboard to earn XP and Gold Coins, and they can then spend those coins in the parent-curated Reward Shop for real-life treats or privileges."
  },
  {
    question: "What age range is Kaeluma suitable for?",
    answer: "It is designed primarily for kids aged 4 to 15. The system scale is flexible: younger children love checking off simple tasks and unlocking colorful themes, while older kids enjoy the independence of managing their own routine and saving up coins for larger rewards."
  },
  {
    question: "Is it a mobile app I have to download?",
    answer: "Kaeluma is a Progressive Web App (PWA). You don't need to visit the App Store or Google Play Store. Simply open Kaeluma in your mobile browser, tap 'Add to Home Screen', and it will install as a full-screen, native-feeling app on your device!"
  },
  {
    question: "Is our family data safe and private?",
    answer: "Absolutely. Privacy is our top priority. We do not sell your family's data, host third-party advertisements, or collect any unnecessary personal information. All dashboard data and family interactions are private and securely stored."
  },
  {
    question: "How much does Kaeluma cost?",
    answer: "All core gamification features are 100% free to use. There are no paid lockouts or mandatory monthly subscriptions. If Kaeluma helps bring harmony to your household, you can choose to send a voluntary tip to support our hosting costs under the Parent Settings."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    try {
      if (playPop) playPop();
    } catch (e) {
      console.warn("FAQ playPop failed:", e);
    }
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <div 
              key={`faq-${index}`} 
              className={`faq-item ${isActive ? 'active' : ''}`}
            >
              <button 
                className="faq-trigger" 
                onClick={() => toggleFAQ(index)}
                aria-expanded={isActive}
              >
                <span className="faq-question">{faq.question}</span>
                <span className="faq-icon-wrapper">+</span>
              </button>
              <div className={`faq-content ${isActive ? 'open' : ''}`}>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
