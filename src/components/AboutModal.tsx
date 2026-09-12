// src/components/AboutModal.tsx
import React, { useState } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const email = "iamtamyansari@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-gray-200 font-['Inter',sans-serif] space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          title="Close Modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Creator Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff7000] to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#ff7000]/20">
            TA
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Taimoor Ansari</h2>
            <p className="text-xs text-[#ff7000] font-semibold">Creator & Developer of ProofMock</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-300 leading-relaxed bg-[#181818] p-3 rounded-xl border border-[#2a2a2a]">
          ProofMock is an open-source 3D perspective mockup generator designed for designers & developers to create stunning device representations with real-time homography, green screen warping, and vector pen masking.
        </p>

        {/* Author Links */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            CONNECT & PORTFOLIO
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Website Link */}
            <a
              href="https://taimooransari.framer.website/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#252525] hover:bg-[#2e2e2e] border border-[#333333] hover:border-[#ff7000]/50 transition-all text-xs font-medium text-gray-200 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🌐</span>
                <span>Personal Website & Portfolio</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#ff7000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* LinkedIn Link */}
            <a
              href="https://www.linkedin.com/in/taimur-ansarii/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#252525] hover:bg-[#2e2e2e] border border-[#333333] hover:border-[#ff7000]/50 transition-all text-xs font-medium text-gray-200 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">💼</span>
                <span>LinkedIn Profile</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#ff7000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Email Contact Button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#252525] border border-[#333333] text-xs font-medium text-gray-200">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-base flex-shrink-0">✉️</span>
                <span className="truncate">{email}</span>
              </div>
              <button
                onClick={handleCopyEmail}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#ff7000] hover:bg-[#ff801a] text-white text-[11px] font-semibold transition-colors flex-shrink-0"
              >
                {copiedEmail ? "Copied! ✓" : "Copy Email"}
              </button>
            </div>
          </div>
        </div>

        {/* Software Version Footer */}
        <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-gray-500">
          <span>ProofMock Studio v1.0.0</span>
          <span>Open Source Software</span>
        </div>
      </div>
    </div>
  );
}
