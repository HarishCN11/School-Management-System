import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/api';
import { toast } from 'sonner';
import {
  User, Lock, Save, Loader2, Mail, Camera,
  GraduationCap, Hash, Phone, BookOpen, Star
} from 'lucide-react';

export const UserProfile = ({ userName, userEmail, userRole, onProfileUpdate }: any) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: '',
    qualification: '',
    specialization: '',
    phone_number: '',
    experience_years: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfileData(data);
      setFormData(prev => ({
        ...prev,
        name: data.name,
        email: data.email,
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        gender: data.gender || '',
        address: data.address || '',
        qualification: data.qualification || '',
        specialization: data.specialization || '',
        phone_number: data.phone_number || '',
        experience_years: data.experience_years || ''
      }));
      if (data.profile_photo) {
        setPhotoPreview(`http://localhost:3000${data.profile_photo}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('currentPassword', formData.currentPassword);
    if (formData.newPassword) submitData.append('newPassword', formData.newPassword);
    if (photo) submitData.append('profile_photo', photo);

    // Append all extra role-specific fields
    const extraFields = ['dob', 'gender', 'address', 'qualification', 'specialization', 'phone_number', 'experience_years'];
    extraFields.forEach(field => {
      const val = formData[field as keyof typeof formData];
      if (val) submitData.append(field, val);
    });

    setLoading(true);
    try {
      const resp = await authService.updateProfile(submitData);
      toast.success('Profile updated successfully!');
      if (onProfileUpdate) {
        onProfileUpdate({ name: formData.name, email: formData.email, profile_photo: resp.profile_photo });
      }
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setPhoto(null);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const role = userRole?.toLowerCase() || '';

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16">
      {/* Header / Identity Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 p-10 shadow-2xl shadow-slate-900/20 text-white group">
        {/* Abstract Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl mix-blend-overlay transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%239C92AC\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* Avatar with Glow & Float Effect */}
          <div className="relative group/avatar">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.2rem] blur opacity-30 group-hover/avatar:opacity-70 transition duration-500 hidden sm:block"></div>
            <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 group-hover/avatar:scale-105 hover:-translate-y-2">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition duration-700 group-hover/avatar:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400/80 to-indigo-500/80">
                  <span className="text-6xl font-black text-white/90 drop-shadow-lg">{profileData?.name?.charAt(0) || formData.name.charAt(0) || 'U'}</span>
                </div>
              )}
            </div>
            {/* Edit button */}
            <label className="absolute -bottom-3 -right-3 p-3.5 bg-white text-indigo-600 rounded-2xl shadow-xl cursor-pointer hover:bg-blue-50 transition-all duration-300 transform group-hover/avatar:scale-110 hover:-rotate-6 hover:shadow-indigo-500/30 border-2 border-indigo-50">
              <Camera size={22} className="drop-shadow-sm" />
              <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
            </label>
          </div>

          {/* Identity Info */}
          <div className="flex-1 text-center md:text-left space-y-4 mt-4 md:mt-0">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-blue-100 shadow-lg mb-1 shadow-black/10">
              {userRole} Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
              {profileData?.name || formData.name}
            </h1>

            {/* Dynamic Role Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium text-blue-50/90 mt-4">
              <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <Mail size={15} className="text-blue-400" /> {profileData?.email || formData.email}
              </span>
              {role === 'student' && profileData?.admission_number && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <Hash size={15} className="text-indigo-400" /> {profileData.admission_number}
                </span>
              )}
              {role === 'student' && profileData?.class_name && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <GraduationCap size={15} className="text-indigo-400" /> {profileData.class_name}
                </span>
              )}
              {role === 'teacher' && profileData?.qualification && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <BookOpen size={15} className="text-blue-400" /> {profileData.qualification}
                </span>
              )}
              {role === 'teacher' && profileData?.managed_class_name && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <GraduationCap size={15} className="text-emerald-400" /> Class: {profileData.managed_class_name}
                </span>
              )}
              {role === 'principal' && profileData?.experience_years && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <Star size={15} className="text-amber-400" /> {profileData.experience_years} yrs exp.
                </span>
              )}
              {role === 'parent' && profileData?.phone_number && (
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <Phone size={15} className="text-emerald-400" /> {profileData.phone_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-transparent rounded-full -z-10 group-hover:scale-150 transition-transform duration-700 opacity-50" />

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform duration-300">
              <User size={22} className="drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Details</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Basic Identification</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2 group/field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-blue-500 transition-colors">Full Name</label>
              <div className="relative">
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="space-y-2 group/field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-blue-500 transition-colors">Email Address</label>
              <div className="relative">
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Credentials Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500">
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full -z-10 group-hover:scale-150 transition-transform duration-700 opacity-50" />

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:-rotate-6 transition-transform duration-300">
              <Lock size={22} className="drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Credentials Setup</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2 group/field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">Current Password</label>
              <input
                type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required
                placeholder="Required to save changes"
                className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 group/field">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">New Password</label>
                <input
                  type="password" name="newPassword" value={formData.newPassword} onChange={handleChange}
                  placeholder="Leave empty if unchanged"
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                />
              </div>
              <div className="space-y-2 group/field">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">Confirm Password</label>
                <input
                  type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Repeat new password"
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="lg:col-span-2 flex justify-end mt-4">
          <button
            type="submit" disabled={loading}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-3xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/30 disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <div className="relative flex items-center gap-3">
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <Save size={22} className="group-hover:animate-bounce drop-shadow" />
              )}
              <span className="tracking-widest text-sm drop-shadow-md">SAVE PROFILE CHANGES</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
