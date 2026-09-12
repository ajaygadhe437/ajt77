import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Globe,
  Layout,
  BookOpen,
  DollarSign,
  Share2,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { requestApi } from '../lib/api';
import type { SiteContent } from '../types';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export const AdminSiteContentManager: React.FC = () => {
  const { content, updateContent, refreshContent } = useWebsiteContent();
  const [formData, setFormData] = useState<SiteContent>(content);
  const [subTab, setSubTab] = useState<'general' | 'hero' | 'courses' | 'journey' | 'book' | 'social' | 'footer'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Sync formData whenever context content updates
  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save website changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (fieldPath: string, file: File) => {
    setUploadingImage(fieldPath);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const res = await requestApi<{ url: string }>('/api/admin/upload-image', {
            method: 'POST',
            body: JSON.stringify({
              dataUrl,
              filename: file.name,
              category: fieldPath,
            }),
          });

          // Update nested formData based on fieldPath
          if (fieldPath === 'brandLogoUrl') {
            setFormData((prev) => ({ ...prev, brandLogoUrl: res.url }));
          } else if (fieldPath === 'bookCover') {
            setFormData((prev) => ({
              ...prev,
              book: { ...prev.book, cover_image_url: res.url },
            }));
          }
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        } finally {
          setUploadingImage(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingImage(null);
      alert('Error reading file: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header with Save Button & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0e1424] border border-sky-500/30 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Real Website Content Management (Live Sync)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Edit any text, heading, course price, button, or link. Changes take effect on the live website immediately upon saving.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={refreshContent}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset / Re-fetch</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-sky-950/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing Changes...' : 'Save & Publish to Live Website'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Website content updated and published live! All visitors will see your changes instantly.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'general', label: 'Branding & SEO', icon: Globe },
          { id: 'hero', label: 'Hero Header', icon: Layout },
          { id: 'courses', label: 'Courses & Pricing', icon: DollarSign },
          { id: 'journey', label: 'Mentor Journey & Pillars', icon: FileText },
          { id: 'book', label: 'Trading Master Book', icon: BookOpen },
          { id: 'social', label: 'Social & Community Links', icon: Share2 },
          { id: 'footer', label: 'Footer & Risk Disclaimers', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                subTab === tab.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: BRANDING & SEO */}
      {subTab === 'general' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Site Identity & Meta Tags</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Brand Name</label>
              <input
                type="text"
                value={formData.brandName || ''}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Sub-brand / Tagline Handle</label>
              <input
                type="text"
                value={formData.subBrand || ''}
                onChange={(e) => setFormData({ ...formData, subBrand: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Founder / Mentor Full Name</label>
              <input
                type="text"
                value={formData.founderName || ''}
                onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Support Email Address</label>
              <input
                type="email"
                value={formData.supportEmail || ''}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO & Browser Tab Meta</h5>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Browser Tab Title (SEO Title)</label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Search Engine Meta Description</label>
              <textarea
                rows={2}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: HERO SECTION */}
      {subTab === 'hero' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hero Section Headlines & CTAs</h4>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Hero Top Badge Text</label>
            <input
              type="text"
              value={formData.hero?.badge || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, badge: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Main Headline (Prefix)</label>
              <input
                type="text"
                value={formData.hero?.titlePrimary || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, titlePrimary: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Gradient Accent Words</label>
              <input
                type="text"
                value={formData.hero?.titleGradient || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, titleGradient: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-sky-400 font-bold focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Hero Sub-paragraph Description</label>
            <textarea
              rows={3}
              value={formData.hero?.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, description: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Primary Button Text</label>
              <input
                type="text"
                value={formData.hero?.ctaPrimaryText || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, ctaPrimaryText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Secondary Button Text</label>
              <input
                type="text"
                value={formData.hero?.ctaSecondaryText || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, ctaSecondaryText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Book Button Text</label>
              <input
                type="text"
                value={formData.hero?.ctaTertiaryText || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, ctaTertiaryText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COURSES & PRICING */}
      {subTab === 'courses' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Live Course Pricing & Descriptions</h4>
              <p className="text-xs text-slate-400">
                Course prices and features are directly linked to the Razorpay live payment order creation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AJT77 Basic */}
            <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-base">Course 1: AJT77 Basic</span>
                <span className="text-xs font-mono text-sky-400 px-2 py-0.5 bg-sky-500/10 rounded">Slug: basic</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Official Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={formData.courses?.basic?.price || 6000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courses: {
                          ...formData.courses,
                          basic: {
                            ...formData.courses?.basic,
                            price: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full pl-8 pr-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Course Badge</label>
                <input
                  type="text"
                  value={formData.courses?.basic?.badge || 'Zero to 100 Foundation'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        basic: {
                          ...formData.courses?.basic,
                          badge: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Summary Description</label>
                <input
                  type="text"
                  value={formData.courses?.basic?.short_description || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        basic: {
                          ...formData.courses?.basic,
                          short_description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Included Features (One per line)</label>
                <textarea
                  rows={6}
                  value={formData.courses?.basic?.features?.join('\n') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        basic: {
                          ...formData.courses?.basic,
                          features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* AJT77 Pro */}
            <div className="bg-[#0e1322] border-2 border-sky-500/50 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-base">Course 2: AJT77 Pro</span>
                <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded">Slug: pro</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Official Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={formData.courses?.pro?.price || 10000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courses: {
                          ...formData.courses,
                          pro: {
                            ...formData.courses?.pro,
                            price: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full pl-8 pr-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Course Badge</label>
                <input
                  type="text"
                  value={formData.courses?.pro?.badge || 'Execution & Mentorship'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        pro: {
                          ...formData.courses?.pro,
                          badge: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Summary Description</label>
                <input
                  type="text"
                  value={formData.courses?.pro?.short_description || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        pro: {
                          ...formData.courses?.pro,
                          short_description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Included Features (One per line)</label>
                <textarea
                  rows={6}
                  value={formData.courses?.pro?.features?.join('\n') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: {
                        ...formData.courses,
                        pro: {
                          ...formData.courses?.pro,
                          features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: JOURNEY & PILLARS */}
      {subTab === 'journey' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ajay Gadhe Journey & Mentorship Quotes</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Section Badge</label>
              <input
                type="text"
                value={formData.journey?.sectionBadge || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    journey: { ...formData.journey, sectionBadge: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Section Title</label>
              <input
                type="text"
                value={formData.journey?.sectionTitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    journey: { ...formData.journey, sectionTitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Section Sub-headline / Intro</label>
            <textarea
              rows={2}
              value={formData.journey?.sectionDescription || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  journey: { ...formData.journey, sectionDescription: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-slate-300 font-semibold">Mentor Philosophy Paragraphs</label>
            <div>
              <label className="block text-slate-400 mb-1">Quote 1 (Callout quote)</label>
              <textarea
                rows={2}
                value={formData.journey?.quote1 || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    journey: { ...formData.journey, quote1: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Quote 2</label>
              <textarea
                rows={2}
                value={formData.journey?.quote2 || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    journey: { ...formData.journey, quote2: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Quote 3</label>
              <textarea
                rows={2}
                value={formData.journey?.quote3 || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    journey: { ...formData.journey, quote3: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: TRADING MASTER BOOK */}
      {subTab === 'book' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Trading Master Book Information & Artwork</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Book Title</label>
              <input
                type="text"
                value={formData.book?.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    book: { ...formData.book, title: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Author Byline</label>
              <input
                type="text"
                value={formData.book?.author || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    book: { ...formData.book, author: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Description</label>
            <textarea
              rows={3}
              value={formData.book?.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  book: { ...formData.book, description: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white leading-relaxed"
            />
          </div>

          {/* Book Cover Management */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <label className="block text-slate-300 font-semibold">Book Cover Artwork</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#121828] p-4 rounded-xl border border-slate-700">
              <div className="w-24 h-24 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center flex-shrink-0">
                <img
                  src={formData.book?.cover_image_url || '/trading-master-cover.png'}
                  alt="Cover"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <p className="text-xs text-slate-300 font-mono truncate">{formData.book?.cover_image_url || '/trading-master-cover.png'}</p>
                <p className="text-[11px] text-slate-400">Replace the book cover wrap with any new uploaded image file.</p>
                <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage === 'bookCover' ? 'Uploading...' : 'Upload New Cover Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage === 'bookCover'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('bookCover', file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: SOCIAL LINKS */}
      {subTab === 'social' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Official Social Media & Community Links</h4>
          <p className="text-xs text-slate-400">
            These links appear in the navigation bar, footer, and contact section.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">YouTube Channel URL</label>
              <input
                type="url"
                value={formData.social?.youtube || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, youtube: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Instagram Profile URL</label>
              <input
                type="url"
                value={formData.social?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, instagram: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.social?.linkedin || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, linkedin: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">X (Twitter) Profile URL</label>
              <input
                type="url"
                value={formData.social?.twitter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, twitter: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Discord Server URL</label>
              <input
                type="url"
                value={formData.social?.discord || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, discord: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Telegram Channel URL</label>
              <input
                type="url"
                value={formData.social?.telegram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social, telegram: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: FOOTER & LEGAL */}
      {subTab === 'footer' && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Footer, Taglines & Legal Disclaimers</h4>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Footer Tagline</label>
            <input
              type="text"
              value={formData.footer?.tagline || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, tagline: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Regulatory Risk Notice (Amber Alert Box)</label>
            <textarea
              rows={4}
              value={formData.footer?.riskNotice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, riskNotice: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Disclaimer Supplementary Notes</label>
            <textarea
              rows={3}
              value={formData.footer?.disclaimerExtra || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, disclaimerExtra: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Bottom Copyright Line</label>
            <input
              type="text"
              value={formData.footer?.copyright || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, copyright: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#121828] border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
