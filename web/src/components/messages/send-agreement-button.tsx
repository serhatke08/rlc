'use client';

import { useState } from "react";
import { Handshake } from "lucide-react";

interface SendAgreementButtonProps {
  listingId: string;
  buyerId: string;
}

export function SendAgreementButton({ listingId, buyerId }: SendAgreementButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendAgreement = async () => {
    if (loading || sent) return;

    setLoading(true);
    try {
      const response = await fetch('/api/agreements/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          buyerId,
          type: 'verification_request', // verification_requests kullanıyoruz
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Anlaşma gönderilemedi: ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      if (data.success) {
        setSent(true);
        alert('Anlaşma başarıyla gönderildi!');
      } else {
        alert('Anlaşma gönderilemedi. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Bir hata oluştu: ${error?.message || JSON.stringify(error)}`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendAgreement}
      disabled={loading || sent}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition flex-shrink-0 ${
        sent
          ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#9c6cfe] to-[#0ad2dd] text-white hover:scale-105 disabled:opacity-50'
      }`}
    >
      <Handshake className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{sent ? 'Anlaşma Gönderildi' : 'Anlaşma Gönder'}</span>
    </button>
  );
}

