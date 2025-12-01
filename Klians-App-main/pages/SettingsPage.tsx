import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { ICONS } from '../constants';
import { useAuth } from '../hooks/useAuth';

type SettingsCategory = 'profile' | 'security' | 'appearance' | 'privacy' | 'danger';

const settingsNav: { id: SettingsCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Edit Profile', icon: ICONS.profile },
    { id: 'security', label: 'Password & Security', icon: ICONS.security },
    { id: 'appearance', label: 'Appearance', icon: ICONS.sun },
    { id: 'privacy', label: 'Privacy', icon: ICONS.privacy },
    { id: 'danger', label: 'Danger Zone', icon: ICONS.danger },
];

// Helper function to validate and convert image to base64
const validateAndConvertImage = (file: File): Promise<{ base64: string; error?: string }> => {
    return new Promise((resolve) => {
        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            resolve({ base64: '', error: 'Only PNG, JPG, and JPEG formats are allowed.' });
            return;
        }

        // Validate file size (< 2 MB - accounts for base64 encoding)
        const maxSizeMB = 2;
        if (file.size > maxSizeMB * 1024 * 1024) {
            resolve({ base64: '', error: `File size must be less than ${maxSizeMB}MB. Actual size: ${(file.size / 1024 / 1024).toFixed(2)}MB` });
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
            resolve({ base64: reader.result as string });
        };
        reader.onerror = () => {
            resolve({ base64: '', error: 'Failed to read file.' });
        };
        reader.readAsDataURL(file);
    });
};

const SettingsPanel: React.FC<{title: string, description: string, children: React.ReactNode, footer?: React.ReactNode}> = ({ title, description, children, footer }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
            {children}
        </div>
        {footer && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end rounded-b-xl">
                {footer}
            </div>
        )}
    </div>
);


export const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, updateProfile } = useAuth();
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');
    const [mobileView, setMobileView] = useState<'menu' | SettingsCategory>('menu');
    const navigate = useNavigate();
    
    // Profile form state
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileBio, setProfileBio] = useState(user?.bio || '');
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
    const [profilePictureError, setProfilePictureError] = useState('');
    const [coverPhotoError, setCoverPhotoError] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState('');
    
    // State for password fields and validation
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const errors = { newPassword: '', confirmPassword: '' };

        if (newPassword && newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters long.';
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
        }

        setPasswordErrors(errors);
    }, [newPassword, confirmPassword]);

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfilePictureError('');
        const { base64, error } = await validateAndConvertImage(file);
        
        if (error) {
            setProfilePictureError(error);
            setProfilePicturePreview('');
        } else {
            setProfilePicturePreview(base64);
        }
    };

    const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCoverPhotoError('');
        const { base64, error } = await validateAndConvertImage(file);
        
        if (error) {
            setCoverPhotoError(error);
            setCoverPhotoPreview('');
        } else {
            setCoverPhotoPreview(base64);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        
        setIsSavingProfile(true);
        setProfileSaveMessage('');
        
        try {
            const updateData: any = {
                name: profileName,
                bio: profileBio
            };

            // Only add images if they were updated (not empty preview)
            if (profilePicturePreview) {
                updateData.avatar = profilePicturePreview; // Use 'avatar' for frontend
            }

            if (coverPhotoPreview) {
                updateData.coverPhoto = coverPhotoPreview;
            }

            console.log('Sending update data:', { 
                hasProfilePicture: !!profilePicturePreview, 
                hasCoverPhoto: !!coverPhotoPreview,
                name: updateData.name,
                bio: updateData.bio 
            });

            await updateProfile(updateData);
            setProfileSaveMessage('Profile updated successfully!');
            
            // Clear image previews after successful save
            setProfilePicturePreview('');
            setCoverPhotoPreview('');
            
            // Clear message after 3 seconds
            setTimeout(() => setProfileSaveMessage(''), 3000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setProfileSaveMessage(error.message || 'Error updating profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (!user) return null;

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/home', { replace: true });
        }
    };

    const handleMobileBackToMenu = () => setMobileView('menu');

    const isPasswordUpdateDisabled = 
        !currentPassword || 
        !newPassword || 
        !confirmPassword || 
        !!passwordErrors.newPassword || 
        !!passwordErrors.confirmPassword;

    const renderContent = (category: SettingsCategory) => {
        switch (category) {
            case 'profile':
                return (
                    <SettingsPanel
                        title="Edit Profile"
                        description="Update your name, email, and other personal details."
                        footer={
                            <div className="flex flex-col gap-2">
                                {profileSaveMessage && (
                                    <p className={`text-sm ${profileSaveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                                        {profileSaveMessage}
                                    </p>
                                )}
                                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        }
                    >
                        <Input 
                            label="Full Name" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                        />
                        <Input label="Email Address" type="email" defaultValue={user.email} disabled />
                        
                        {/* Profile Picture Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleProfilePictureChange}
                                        className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                    {profilePictureError && (
                                        <p className="text-xs text-red-500 mt-1">{profilePictureError}</p>
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, or JPEG (Max 2MB)</p>
                                </div>
                                {profilePicturePreview && (
                                    <div className="w-20 h-20">
                                        <img 
                                            src={profilePicturePreview} 
                                            alt="Profile preview" 
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Photo</label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleCoverPhotoChange}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                {coverPhotoError && (
                                    <p className="text-xs text-red-500">{coverPhotoError}</p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, or JPEG (Max 2MB)</p>
                                {coverPhotoPreview && (
                                    <div className="w-full h-32">
                                        <img 
                                            src={coverPhotoPreview} 
                                            alt="Cover preview" 
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                            <textarea
                                value={profileBio}
                                onChange={(e) => setProfileBio(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell us about yourself..."
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {profileBio.length}/500 characters
                            </p>
                        </div>
                    </SettingsPanel>
                );
            case 'security':
                return (
                    <SettingsPanel
                        title="Password & Security"
                        description="Change your password and manage your account's security."
                        footer={<Button disabled={isPasswordUpdateDisabled}>Update Password</Button>}
                    >
                        <Input 
                            label="Current Password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <div>
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {passwordErrors.newPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                        </div>
                        <div>
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {passwordErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                        </div>
                    </SettingsPanel>
                );
            case 'appearance':
                return (
                    <SettingsPanel
                        title="Appearance"
                        description="Customize how the KLIAS platform looks on your device."
                    >
                        <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <div>
                                <h3 className="font-medium">Dark Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes.</p>
                            </div>
                            <ToggleSwitch
                                checked={theme === Theme.DARK}
                                onChange={toggleTheme}
                                checkedIcon={<div className="text-yellow-300">{ICONS.moon}</div>}
                                uncheckedIcon={<div className="text-red-400">{ICONS.sun}</div>}
                            />
                        </div>
                    </SettingsPanel>
                );
            case 'privacy':
                 return (
                    <SettingsPanel
                        title="Privacy Settings"
                        description="Manage who can see your profile and information."
                        footer={<Button>Update Privacy</Button>}
                    >
                         <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <div>
                                <h3 className="font-medium">Private Profile</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">If enabled, only users you approve can see your profile.</p>
                            </div>
                            <ToggleSwitch
                                checked={false}
                                onChange={() => {}}
                            />
                        </div>
                    </SettingsPanel>
                );
            case 'danger':
                return (
                     <SettingsPanel
                        title="Danger Zone"
                        description="These actions are irreversible. Please proceed with caution."
                    >
                        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
                            <div>
                                <h3 className="font-medium text-red-800 dark:text-red-300">Delete Account</h3>
                                <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all of your content.</p>
                            </div>
                            <Button className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white">Delete Account</Button>
                        </div>
                    </SettingsPanel>
                );
            default:
                return null;
        }
    };
    
    const selectedMobileCategory = settingsNav.find(nav => nav.id === mobileView);

    return (
        <>
            {/* MOBILE VIEW */}
            <div className="md:hidden">
                {mobileView === 'menu' ? (
                    // Mobile Menu View
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={handleBack} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                                {ICONS.chevronLeft}
                            </button>
                            <h1 className="text-2xl font-bold">Settings</h1>
                        </div>
                        <nav>
                            <ul className="space-y-3">
                                {settingsNav.map(item => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => setMobileView(item.id)} 
                                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-left"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <span className="text-slate-500 dark:text-slate-400">{item.icon}</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                                            </div>
                                            <span className="text-slate-400 dark:text-slate-500">
                                                {React.cloneElement(ICONS.chevronRight, {className: "h-5 w-5"})}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-left"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-red-500 dark:text-red-400">{ICONS.logout}</span>
                                            <span className="font-medium text-red-500 dark:text-red-400">Logout</span>
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                ) : (
                    // Mobile Detail View
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={handleMobileBackToMenu} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                                {ICONS.chevronLeft}
                            </button>
                            <h1 className="text-2xl font-bold">{selectedMobileCategory?.label}</h1>
                        </div>
                        {renderContent(mobileView)}
                    </div>
                )}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:flex flex-col md:flex-row gap-8 h-full">
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>
                    <nav>
                        <ul className="space-y-2">
                            {settingsNav.map(item => {
                                const isActive = activeCategory === item.id;
                                const itemClasses = `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white shadow'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`;
                                const iconColor = isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500';

                                return (
                                    <li key={item.id}>
                                        <button onClick={() => setActiveCategory(item.id)} className={itemClasses}>
                                            <span className={iconColor}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </aside>
                
                <main className="flex-1">
                    {renderContent(activeCategory)}
                </main>
            </div>
        </>
    );
};