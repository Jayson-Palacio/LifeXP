"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavLink from './NavLink';
import { supabase } from '../lib/supabase';
import { showToast, showConfetti, showFloat } from '../lib/ui';

export default function RewardShopClient({ initialChild, rewards }) {
  const router = useRouter();
  const [child, setChild] = useState(initialChild);

  // Set body class for theme
  useEffect(() => {
    document.body.className = `theme-${child.theme || 'indigo'}`;
    return () => { document.body.className = ''; };
  }, [child.theme]);

  const handleRedeem = async (r, e) => {
    e.target.disabled = true;
    e.target.textContent = '...';

    if (child.coins < r.cost) {
      e.target.disabled = false;
      e.target.textContent = 'Need more 🪙';
      return showToast('Not enough coins!', 'error');
    }

    try {
      const newCoins = child.coins - r.cost;
      
      const redemption = {
        reward_id: r.id,
        child_id: child.id
      };
      
      await supabase.from('redemptions').insert([redemption]);
      await supabase.from('children').update({ coins: newCoins }).eq('id', child.id);

      setChild({ ...child, coins: newCoins });
      
      showConfetti();
      const rect = e.target.getBoundingClientRect();
      showFloat(`-${r.cost} 🪙`, '#f59e0b', rect.left + rect.width / 2, rect.top);
      showToast(`🎉 Redeemed: ${r.name}!`);

    } catch (err) {
      console.error(err);
      showToast('Error redeeming reward', 'error');
    }
  };

  return (
    <div className="page page-enter">
      <div className="page-header">
        <NavLink href={`/kid/${child.id}`} className="back-btn">←</NavLink>
        <h1 className="page-title">Reward Shop</h1>
        <div className="stat-item" style={{ marginLeft: 'auto' }}>
          <span className="stat-icon">🪙</span>
          <span className="stat-value-amber" id="coin-count">{child.coins}</span>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🛒</div>
          <p className="empty-state-text">No rewards yet!<br/>Ask your parent to add some.</p>
        </div>
      ) : (
        <div className="reward-grid">
          {rewards.map(r => {
            const canAfford = child.coins >= r.cost;
            return (
              <div key={r.id} className="reward-card" style={{ borderTop: `2px solid ${canAfford ? 'var(--primary)' : 'transparent'}` }}>
                <div className="reward-icon">{r.icon}</div>
                <div className="reward-name">{r.name}</div>
                <div className="reward-cost">🪙 {r.cost}</div>
                <button 
                  className={`btn ${canAfford ? 'btn-gold' : 'btn-ghost'} btn-sm btn-block`}
                  disabled={!canAfford}
                  onClick={(e) => handleRedeem(r, e)}
                >
                  {canAfford ? 'Redeem!' : 'Need more 🪙'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
