'use client';

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface ListingReportButtonProps {
  listingId: string;
  sellerId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Inappropriate content",
  "Fraud or scam",
  "Duplicate listing",
  "Wrong category",
  "Other"
];

export function ListingReportButton({ listingId, sellerId, currentUserId, isOwner }: ListingReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReport = async () => {
    if (!currentUserId) {
      // Redirect to login
      window.location.href = "/auth/login";
      return;
    }

    if (!selectedReason) {
      alert("Please select a reason");
      return;
    }

    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (!reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await (supabase
        .from("reports") as any)
        .insert({
          reporter_id: currentUserId,
          item_id: listingId,
          reported_user_id: sellerId,
          reason: reason,
          status: "pending"
        });

      if (error) {
        console.error("Failed to submit report:", error);
        alert("Failed to submit report. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSelectedReason("");
        setCustomReason("");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return null; // Don't show report button for own listings
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
      >
        <Flag className="h-4 w-4" />
        Report
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Report Listing</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReason("");
                  setCustomReason("");
                  setSuccess(false);
                }}
                className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <p className="text-emerald-600 font-medium">Report submitted successfully!</p>
                <p className="mt-2 text-sm text-zinc-600">Thank you for your report. We'll review it shortly.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-zinc-600">
                  Please select a reason for reporting this listing:
                </p>

                <div className="mb-4 space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 p-3 transition hover:bg-zinc-50"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="h-4 w-4 text-emerald-600"
                      />
                      <span className="text-sm text-zinc-700">{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Other" && (
                  <div className="mb-4">
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please provide details..."
                      className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedReason("");
                      setCustomReason("");
                    }}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={loading || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

