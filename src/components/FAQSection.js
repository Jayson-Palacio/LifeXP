"use client";

import { useState } from 'react';
import { playPop } from '../lib/sounds';

const faqs = [
  {
    question: "What is Kaeluma?",
    answer: "Kaeluma is a family of apps under one login. Quests helps kids own chores and habits. Vital is household health. Ledger tracks monthly spending and the yearly savings you are on pace for. After you sign in, you choose the app you need."
  },
  {
    question: "Who is it for?",
    answer: "The whole household. Parents run the account. Kids use Quests. Everyone can use Vital for health and Ledger for money. More apps will join the same family hub over time."
  },
  {
    question: "What is Vital?",
    answer: "Vital is household health. Eat logs meals in a couple taps, including usual plates. Move is walks and lifts, and does not add calories back. Adults can set a weight plan. Kids are treated as growing — we track meals, not diets."
  },
  {
    question: "What is Ledger?",
    answer: "Ledger is household money. You set monthly take-home, split it into category envelopes, log spending, and see what you are on pace to keep in a year."
  },
  {
    question: "Do I need to download anything?",
    answer: "No. Kaeluma is a Progressive Web App. Open it in your browser, and on a phone you can add it to the home screen."
  },
  {
    question: "Is our family data private?",
    answer: "Yes. We do not sell your data, run ads, or collect extra personal information. Household data stays on your account."
  },
  {
    question: "How much does it cost?",
    answer: "Kaeluma is free. No subscriptions and no feature lockouts. If it helps your home, you can leave a voluntary tip to cover hosting."
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
      <h2 className="faq-title">Questions. Answers.</h2>
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
