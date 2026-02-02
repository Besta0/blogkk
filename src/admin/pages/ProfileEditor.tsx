/**
 * Profile Editor Page
 * Admin page for editing personal profile information
 */
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, User, Briefcase, Link2, AlertCircle, CheckCircle } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../api/hooks/useProfile';
import type { Profile, Experience, SocialLinks } from '../../api/types';

interface ExperienceFormData extends Omit<Experience, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
}

export default function ProfileEditor() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<ExperienceFormData[]>([]);
  const [social, setSocial] = useState<SocialLinks>({});

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'experience' | 'social'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
      setSkills(profile.skills || []);
      setExperience(
        (profile.experience || []).map((exp) => ({
          ...exp,
          startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
          endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
        }))
      );
      setSocial(profile.social || {});
    }
  }, [profile]);

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveMessage('');

    try {
      // Clean up social links - remove empty strings
      const cleanedSocial: Partial<SocialLinks> = {};
      if (social.github && social.github.trim()) cleanedSocial.github = social.github.trim();
      if (social.linkedin && social.linkedin.trim()) cleanedSocial.linkedin = social.linkedin.trim();
      if (social.twitter && social.twitter.trim()) cleanedSocial.twitter = social.twitter.trim();
      if (social.email && social.email.trim()) cleanedSocial.email = social.email.trim();
      if (social.website && social.website.trim()) cleanedSocial.website = social.website.trim();

      const updatedProfile: Partial<Profile> = {
        name,
        title,
        bio,
        avatar,
        skills,
        experience: experience.map((exp) => ({
          ...exp,
          startDate: exp.startDate,
          endDate: exp.endDate || undefined,
        })),
        social: cleanedSocial,
      };

      await updateProfile.mutateAsync(updatedProfile);
      setSaveStatus('success');
      setSaveMessage('个人资料已保存');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err instanceof Error ? err.message : '保存失败');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false,
      },
    ]);
  };

  const updateExperience = (index: number, field: keyof ExperienceFormData, value: string | boolean) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'current' && value === true) {
      updated[index].endDate = '';
    }
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">加载个人资料失败: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">个人资料编辑</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的个人信息、技能和工作经历</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveStatus === 'saving' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          保存更改
        </button>
      </div>

      {/* Save Status Message */}
      {saveStatus !== 'idle' && saveStatus !== 'saving' && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            saveStatus === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          {saveStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {[
            { id: 'basic', label: '基本信息', icon: User },
            { id: 'skills', label: '技能', icon: Briefcase },
            { id: 'experience', label: '工作经历', icon: Briefcase },
            { id: 'social', label: '社交链接', icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        {activeTab === 'basic' && (
          <BasicInfoTab
            name={name}
            setName={setName}
            title={title}
            setTitle={setTitle}
            bio={bio}
            setBio={setBio}
            avatar={avatar}
            setAvatar={setAvatar}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            skills={skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />
        )}

        {activeTab === 'experience' && (
          <ExperienceTab
            experience={experience}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
          />
        )}

        {activeTab === 'social' && <SocialTab social={social} setSocial={setSocial} />}
      </div>
    </div>
  );
}


// Basic Info Tab Component
interface BasicInfoTabProps {
  name: string;
  setName: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatar: string;
  setAvatar: (value: string) => void;
}

function BasicInfoTab({ name, setName, title, setTitle, bio, setBio, avatar, setAvatar }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            姓名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="您的姓名"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            职位/头衔
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如: 全栈开发工程师"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          头像URL
        </label>
        <div className="flex gap-4 items-start">
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
          {avatar && (
            <img
              src={avatar}
              alt="头像预览"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
              }}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          个人简介
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="介绍一下您自己..."
        />
      </div>
    </div>
  );
}

// Skills Tab Component
interface SkillsTabProps {
  skills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  addSkill: () => void;
  removeSkill: (skill: string) => void;
}

function SkillsTab({ skills, newSkill, setNewSkill, addSkill, removeSkill }: SkillsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          添加技能
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如: React, TypeScript, Node.js"
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          当前技能 ({skills.length})
        </label>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">暂无技能，请添加</p>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Experience Tab Component
interface ExperienceFormData {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface ExperienceTabProps {
  experience: ExperienceFormData[];
  addExperience: () => void;
  updateExperience: (index: number, field: keyof ExperienceFormData, value: string | boolean) => void;
  removeExperience: (index: number) => void;
}

function ExperienceTab({ experience, addExperience, updateExperience, removeExperience }: ExperienceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">工作经历</h3>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          添加经历
        </button>
      </div>

      {experience.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">暂无工作经历，点击上方按钮添加</p>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  经历 #{index + 1}
                </span>
                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">公司</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                    placeholder="公司名称"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">职位</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                    placeholder="职位名称"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm disabled:opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">目前在职</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">工作描述</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm resize-none"
                  placeholder="描述您的工作职责和成就..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Social Links Tab Component
interface SocialTabProps {
  social: SocialLinks;
  setSocial: (value: SocialLinks) => void;
}

function SocialTab({ social, setSocial }: SocialTabProps) {
  const updateSocial = (field: keyof SocialLinks, value: string) => {
    setSocial({ ...social, [field]: value || undefined });
  };

  const socialFields: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
    { key: 'email', label: '邮箱', placeholder: 'your@email.com' },
    { key: 'website', label: '个人网站', placeholder: 'https://yourwebsite.com' },
  ];

  return (
    <div className="space-y-4">
      {socialFields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.label}
          </label>
          <input
            type={field.key === 'email' ? 'email' : 'url'}
            value={social[field.key] || ''}
            onChange={(e) => updateSocial(field.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
