import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// ============================================================
// PAYMENT SUCCESS PAGE  (NEW)
// ============================================================
// Stripe redirects the user here after a successful payment.
// URL format:  /payment-success?bookingId=xxx&session_id=yyy
//
// We call /api/payments/verify to confirm the payment with
// Stripe and mark the booking as paid in our database.
// ============================================================

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const { axios, getToken, navigate } = useAppContext();

    const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"

    useEffect(() => {
        const verify = async () => {
            const sessionId  = searchParams.get("session_id");
            const bookingId  = searchParams.get("bookingId");

            if (!sessionId || !bookingId) {
                setStatus("failed");
                return;
            }

            try {
                const { data } = await axios.post(
                    "/api/payments/verify",
                    { sessionId, bookingId },
                    { headers: { Authorization: `Bearer ${await getToken()}` } }
                );

                if (data.success) {
                    setStatus("success");
                } else {
                    setStatus("failed");
                    toast.error(data.message);
                }
            } catch (error) {
                setStatus("failed");
                toast.error(error.message);
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                {/* ---- Verifying ---- */}
                {status === "verifying" && (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-playfair mb-2">Verifying Payment…</h1>
                        <p className="text-gray-500">Please wait while we confirm your payment with Stripe.</p>
                    </>
                )}

                {/* ---- Success ---- */}
                {status === "success" && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-playfair mb-3 text-green-700">Payment Successful!</h1>
                        <p className="text-gray-500 mb-8">
                            Your booking is confirmed and paid. You'll receive a confirmation email shortly.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => { navigate('/my-bookings'); window.scrollTo(0, 0); }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </>
                )}

                {/* ---- Failed ---- */}
                {status === "failed" && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-playfair mb-3 text-red-600">Payment Verification Failed</h1>
                        <p className="text-gray-500 mb-8">
                            We could not confirm your payment. If money was deducted, please contact support.
                        </p>
                        <button
                            onClick={() => { navigate('/my-bookings'); window.scrollTo(0, 0); }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Go to My Bookings
                        </button>
                    </>
                )}

            </div>
        </div>
    );
};

export default PaymentSuccess;
