// frontend/src/app/(dashboard)/kyc/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function KYCPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [docType, setDocType]   = useState<'passport' | 'national_id' | 'drivers_license'>('passport');
  const [front, setFront]       = useState<File | null>(null);
  const [back, setBack]         = useState<File | null>(null);
  const [selfie, setSelfie]     = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !selfie) { toast.error('Please upload required documents'); return; }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('front', front);
      if (back) formData.append('back', back);
      formData.append('selfie', selfie);

      await api.upload('/api/users/kyc', formData);
      await refreshUser();
      toast.success('Documents submitted! We will review within 24 hours.');
      router.push('/dashboard/seller');
    } catch (err: any) {
      toast.error(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">KYC Approved</h1>
          <p className="text-gray-400">Your identity has been verified. You can sell on the platform.</p>
        </div>
      </div>
    );
  }

  if (user?.kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Under Review</h1>
          <p className="text-gray-400">Your documents are being reviewed. This usually takes 24 hours.</p>
        </div>
      </div>
    );
  }

  if (user?.kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">KYC Rejected</h1>
          <p className="text-gray-400 mb-6">Your documents were rejected. Please resubmit with valid documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-lg mx-auto py-8">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Seller Verification (KYC)</h1>
          <p className="text-gray-400 mt-2">Submit your identity documents to start selling</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-sm">
            Your documents are encrypted and stored securely. We only use them for identity verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">Document Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'passport',         label: 'Passport',       icon: '🛂' },
                { id: 'national_id',      label: 'National ID',    icon: '🪪' },
                { id: 'drivers_license',  label: "Driver's License", icon: '🚗' },
              ].map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => setDocType(opt.id as any)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm
                    ${docType === opt.id ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  <span className="text-2xl">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Front */}
          <FileUpload
            label="Front of Document *"
            accept="image/*,.pdf"
            file={front}
            onChange={setFront}
          />

          {/* Back (not needed for passport) */}
          {docType !== 'passport' && (
            <FileUpload
              label="Back of Document *"
              accept="image/*"
              file={back}
              onChange={setBack}
            />
          )}

          {/* Selfie */}
          <FileUpload
            label="Selfie with Document *"
            accept="image/*"
            file={selfie}
            onChange={setSelfie}
            hint="Take a photo of yourself holding your document"
          />

          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all">
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FileUpload({ label, accept, file, onChange, hint }: {
  label: string; accept: string;
  file: File | null; onChange: (f: File) => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-600 mb-2">{hint}</p>}
      <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
        ${file ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900'}`}>
        {file ? (
          <>
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-sm text-green-400 font-medium">{file.name}</span>
            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-500" />
            <span className="text-sm text-gray-400">Click to upload</span>
            <span className="text-xs text-gray-600">JPG, PNG or PDF, max 5MB</span>
          </>
        )}
        <input type="file" accept={accept} className="hidden"
          onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
    </div>
  );
}
