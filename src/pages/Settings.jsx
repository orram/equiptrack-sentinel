import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { googleAuth } from "@/functions/googleAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, LogOut, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";


export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const isConnected = user?.google_access_token;

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                setError("You must be logged in to view this page.");
            }
            setIsLoading(false);
        };

        const handleAuthCallback = async (code) => {
            setIsProcessing(true);
            setError(null);
            try {
                const { data } = await googleAuth({ code });
                if (data.success) {
                    alert("Successfully connected your Gmail account!");
                    // Reload user data to reflect changes
                    const updatedUser = await User.me();
                    setUser(updatedUser);
                    // Remove code from URL
                    navigate(createPageUrl('Settings'), { replace: true });
                } else {
                    throw new Error(data.details || "Failed to connect to Google.");
                }
            } catch (e) {
                console.error(e);
                setError(e.message || "An unknown error occurred during authentication.");
            }
            setIsProcessing(false);
        };
        
        loadUser();

        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        if (code) {
            handleAuthCallback(code);
        }

    }, [location.search, navigate]);

    const handleConnect = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const { data } = await googleAuth({}); // No code, so it will return authUrl
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error("Could not get authentication URL.");
            }
        } catch (e) {
            console.error(e);
            setError(e.message || "An unknown error occurred.");
            setIsProcessing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your Gmail account? You will no longer be able to send emails from the app.")) {
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            await User.updateMyUserData({
                google_access_token: null,
                google_refresh_token: null,
                google_token_expiry: null,
            });
            const updatedUser = await User.me();
            setUser(updatedUser);
            alert("Successfully disconnected your Gmail account.");
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to disconnect.");
        }
        setIsProcessing(false);
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(createPageUrl("Dashboard"))}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600 mt-1 text-sm md:text-base">Manage your application integrations and preferences.</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Gmail Integration</CardTitle>
                        <CardDescription>Connect your Google account to send emails directly from the app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-slate-500" />
                                )}
                                <div>
                                    <p className="font-medium">Connection Status</p>
                                    <p className={`text-sm ${isConnected ? 'text-green-700' : 'text-slate-600'}`}>
                                        {isConnected ? "Connected" : "Not Connected"}
                                    </p>
                                </div>
                            </div>
                            
                            {isConnected ? (
                                <Button variant="destructive" onClick={handleDisconnect} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                                    Disconnect
                                </Button>
                            ) : (
                                <Button onClick={handleConnect} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect to Gmail"}
                                </Button>
                            )}
                        </div>
                         <p className="text-xs text-slate-500 mt-3">
                            Connecting will redirect you to a Google consent screen to grant permission. We only request permission to send emails on your behalf.
                         </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}