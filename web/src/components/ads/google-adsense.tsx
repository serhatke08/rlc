'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

interface GoogleAdSenseProps {
  /**
   * AdSense ad unit ID (e.g., 'ca-pub-6962376212093267')
   * Get this from your AdSense dashboard after creating an ad unit
   */
  adSlot?: string;
  
  /**
   * Ad format: 'auto', 'display', 'in-article', 'in-feed', 'matched-content'
   */
  format?: string;
  
  /**
   * Ad style (for display ads)
   */
  style?: CSSProperties;
  
  /**
   * Ad type: 'display' or 'auto'
   * 'auto' uses Auto Ads (requires only meta tag)
   * 'display' uses manual ad units
   */
  type?: 'auto' | 'display';
  
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * 1. For Auto Ads: Just add the meta tag (already done in layout.tsx)
 *    Enable Auto Ads in your AdSense dashboard
 * 
 * 2. For Manual Ads: 
 *    - Create an ad unit in AdSense dashboard
 *    - Get the ad slot ID
 *    - Use this component: <GoogleAdSense adSlot="YOUR_AD_SLOT_ID" />
 */
export function GoogleAdSense({
  adSlot,
  format = 'auto',
  style = { display: 'block', width: '100%' },
  type = 'auto',
  className = '',
}: GoogleAdSenseProps) {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6962376212093267';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  // For Auto Ads, just return a placeholder div
  // Google will automatically inject ads here
  if (type === 'auto') {
    return (
      <div 
        className={`adsbygoogle-auto ${className}`}
        style={style}
        data-ad-client="ca-pub-6962376212093267"
        data-ad-slot={adSlot}
        data-ad-format={format}
      />
    );
  }

  // For manual display ads
  if (!adSlot) {
    console.warn('GoogleAdSense: adSlot is required for display ads');
    return null;
  }

  useEffect(() => {
    try {
      // Push ad to AdSense
      if ((window as any).adsbygoogle && (window as any).adsbygoogle.loaded !== true) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [adSlot]);

  return (
    <div className={`ads-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6962376212093267"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/**
 * Pre-configured AdSense components for common placements
 */

// Sidebar Ad (300x250 or 300x600)
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 ${className}`}>
      <GoogleAdSense
        type="auto"
        className="min-h-[250px]"
        style={{ display: 'block', width: '100%', minHeight: '250px' }}
      />
    </div>
  );
}

// In-Article Ad (responsive)
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <GoogleAdSense
        type="auto"
        format="fluid"
        style={{ display: 'block', width: '100%' }}
      />
    </div>
  );
}

// Banner Ad (728x90 or responsive)
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <GoogleAdSense
        type="auto"
        format="horizontal"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
      />
    </div>
  );
}

// Display Ad Card - REMOVED: This violated AdSense policy by mixing ads with content cards
// Use Auto Ads or clearly labeled ad sections instead

