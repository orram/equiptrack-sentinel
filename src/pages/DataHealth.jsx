import React, { useState } from "react";
import { Equipment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DatabaseZap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DataHealth() {
    const navigate = useNavigate();
    const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, processing, complete, error
    const [migrationResults, setMigrationResults] = useState({ scanned: 0, updated: 0, errors: 0 });

    const runEquipmentMigration = async () => {
        setMigrationStatus('processing');
        const results = { scanned: 0, updated: 0, errors: 0 };
        if (!confirm("This is a one-time process to update old equipment data fields to the new format ('assigned' -> 'issued'). This should only be run once. Are you sure you want to proceed?")) {
            setMigrationStatus('idle');
            return;
        }

        try {
            const allEquipment = await Equipment.list();
            results.scanned = allEquipment.length;

            for (const item of allEquipment) {
                let needsUpdate = false;
                const updatePayload = {};

                // Check for old status 'assigned' and migrate to 'issued'
                if (item.assignment_status === 'assigned') {
                    updatePayload.assignment_status = 'issued';
                    needsUpdate = true;
                }

                // Check for old field 'assigned_soldier_id' and migrate data
                if (item.assigned_soldier_id) {
                    updatePayload.issued_soldier_id = item.issued_soldier_id || item.assigned_soldier_id;
                    updatePayload.issued_soldier_name = item.issued_soldier_name || item.assigned_soldier_name;
                    updatePayload.assigned_soldier_id = null;
                    updatePayload.assigned_soldier_name = null;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    try {
                        await Equipment.update(item.id, updatePayload);
                        results.updated++;
                    } catch (e) {
                        console.error(`Failed to update item ${item.id}:`, e);
                        results.errors++;
                    }
                }
            }
            setMigrationResults(results);
            setMigrationStatus('complete');
        } catch (error) {
            console.error("Migration failed:", error);
            setMigrationStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Data Health & Tools</h1>
                        <p className="text-slate-600 mt-1">Run maintenance and migration tasks.</p>
                    </div>
                </div>

                {/* Migration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <DatabaseZap className="w-5 h-5"/>
                           One-Time Data Migration
                        </CardTitle>
                        <CardDescription>Update equipment data from 'assigned' to 'issued' status and fields. Run this only once after an update.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {migrationStatus === 'idle' && (
                            <Button onClick={runEquipmentMigration}>Run Equipment Data Migration</Button>
                        )}
                        {migrationStatus === 'processing' && (
                           <p className="text-slate-600">Processing... Please wait.</p>
                        )}
                        {migrationStatus === 'complete' && (
                            <div className="space-y-1">
                                <p className="font-semibold text-green-600">Migration Complete!</p>
                                <p>Items Scanned: {migrationResults.scanned}</p>
                                <p>Items Updated: {migrationResults.updated}</p>
                                <p>Errors: {migrationResults.errors}</p>
                            </div>
                        )}
                        {migrationStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred during migration. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}