
import React, { useState, useEffect } from "react";
import { User, Soldier, Equipment, Assignment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User as UserIcon, Mail, Shield, Package, Edit, Save, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../layout";

export default function UserProfile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [soldierProfile, setSoldierProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load current user
      const currentUser = await User.me();
      setUser(currentUser);

      // Try to find soldier profile by email
      const allSoldiers = await Soldier.list();
      const matchingSoldier = allSoldiers.find(s => 
        s.email === currentUser.email || s.soldier_id === currentUser.email
      );
      
      if (matchingSoldier) {
        setSoldierProfile(matchingSoldier);
        
        // Load assignments and equipment for this soldier
        const soldierAssignments = await Assignment.filter({ 
          soldier_id: matchingSoldier.soldier_id,
          status: "active"
        });
        setAssignments(soldierAssignments);
        
        // Load equipment details
        const allEquipment = await Equipment.list();
        const soldierEquipment = allEquipment.filter(e => 
          soldierAssignments.some(a => a.equipment_id === e.serial_number)
        );
        setEquipment(soldierEquipment);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setEditData({
      full_name: user.full_name || "",
      email: user.email || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await User.updateMyUserData({
        full_name: editData.full_name
        // Note: email is typically not editable as it's tied to authentication
      });
      
      // Reload user data
      const updatedUser = await User.me();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        await User.logout();
        // The logout method should redirect automatically
      } catch (error) {
        console.error("Error logging out:", error);
        alert("Error logging out. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p>Unable to load user profile. Please try logging in again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600 mt-1">View and manage your profile information</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editData.full_name}
                        onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-sm text-slate-500">Email cannot be changed as it's linked to your account</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isProcessing}>
                        <Save className="w-4 h-4 mr-2" />
                        {isProcessing ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user.full_name || "No name set"}</h3>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Role: </span>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Soldier Profile (if exists) */}
            {soldierProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Military Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Soldier ID</Label>
                      <p className="font-mono">{soldierProfile.soldier_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Rank</Label>
                      <p>{soldierProfile.rank || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Platoon</Label>
                      <p>{soldierProfile.platoon || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Squad</Label>
                      <p>{soldierProfile.squad || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Phone</Label>
                      <p>{soldierProfile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-500">Status</Label>
                      <Badge variant={soldierProfile.status === 'active' ? 'default' : 'secondary'}>
                        {soldierProfile.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assigned Equipment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  My Equipment ({equipment.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">
                    No equipment currently assigned
                  </p>
                ) : (
                  <div className="space-y-3">
                    {equipment.map((item, index) => {
                      const assignment = assignments.find(a => a.equipment_id === item.serial_number);
                      return (
                        <div key={item.id || index} className="p-3 bg-slate-50 rounded-lg">
                          <h4 className="font-medium">{item.object_name}</h4>
                          <p className="text-sm text-slate-600">S/N: {item.serial_number}</p>
                          {assignment && (
                            <p className="text-xs text-slate-500">
                              Assigned: {new Date(assignment.assignment_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Member since:</span>
                    <span>{new Date(user.created_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gmail Connected:</span>
                    <span>{user.google_access_token ? "Yes" : "No"}</span>
                  </div>
                  {!user.google_access_token && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(createPageUrl("Settings"))}
                    >
                      Connect Gmail
                    </Button>
                  )}
                  <div className="border-t pt-3 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
