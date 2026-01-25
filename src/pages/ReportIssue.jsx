import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { addHours } from 'date-fns';

const CATEGORIES = [
  { id: 'Garbage', icon: '🗑️', label: 'Garbage', description: 'Waste, littering, overflow' },
  { id: 'Water', icon: '💧', label: 'Water', description: 'Leaks, flooding, contamination' },
  { id: 'Road', icon: '🛣️', label: 'Road', description: 'Potholes, damage, blockage' },
  { id: 'Safety', icon: '⚠️', label: 'Safety', description: 'Streetlights, hazards' },
  { id: 'Parks', icon: '🌳', label: 'Parks & Greenery', description: 'Trees, parks, gardens' },
  { id: 'Other', icon: '📋', label: 'Other', description: 'Other civic issues' }
];

const TAGS_BY_CATEGORY = {
  Garbage: ['Overflow', 'Illegal Dumping', 'Missed Collection', 'Street Litter', 'Hazardous Waste'],
  Water: ['Leak', 'Flooding', 'Contamination', 'Low Pressure', 'Broken Pipe', 'Sewage'],
  Road: ['Pothole', 'Crack', 'Blockage', 'Missing Sign', 'Faded Markings', 'Construction'],
  Safety: ['Broken Streetlight', 'Unsafe Structure', 'Missing Guardrail', 'Electrical Hazard'],
  Parks: ['Tree Cutting', 'Overgrown', 'Broken Equipment', 'Park Maintenance', 'Garden Neglect'],
  Other: ['Public Property', 'Noise', 'Encroachment', 'Other']
};

const BANNED_WORDS = ['threat', 'kill', 'attack', 'bomb'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    photo: null,
    photoPreview: '',
    meme: null,
    memePreview: '',
    latitude: null,
    longitude: null,
    address: '',
    ward: '',
    tags: [],
    severity: 'Medium',
    title: '',
    description: '',
    is_anonymous: false
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const detectLocation = async () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));
          
          // Try to get address from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setFormData(prev => ({ 
              ...prev, 
              address: data.display_name || '',
              ward: data.address?.suburb || data.address?.neighbourhood || ''
            }));
          } catch (e) {
            console.log('Could not fetch address');
          }
          setLocationLoading(false);
        },
        () => setLocationLoading(false)
      );
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [type === 'photo' ? 'photoPreview' : 'memePreview']: reader.result,
        [type]: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateContent = (text) => {
    const lower = text.toLowerCase();
    return !BANNED_WORDS.some(word => lower.includes(word));
  };

  const handleSubmit = async () => {
    if (!validateContent(formData.title + ' ' + formData.description)) {
      alert('Your content contains inappropriate language. Please revise before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = '';
      let memeUrl = '';

      if (formData.photo) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.photo });
        photoUrl = file_url;
      }

      if (formData.meme) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.meme });
        memeUrl = file_url;
      }

      const issueData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        photo: photoUrl,
        meme: memeUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        ward: formData.ward,
        tags: formData.tags,
        severity: formData.severity,
        status: 'Reported',
        is_anonymous: formData.is_anonymous,
        reporter_name: formData.is_anonymous ? null : user?.full_name,
        sla_deadline: addHours(new Date(), 48).toISOString(),
        vouch_count: 1,
        repost_count: 0,
        civic_pulse_score: formData.severity === 'Critical' ? 50 : formData.severity === 'High' ? 30 : 10
      };

      await base44.entities.Issue.create(issueData);
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.category;
      case 2: return formData.latitude && formData.longitude;
      case 3: return formData.tags.length > 0;
      case 4: return formData.title.trim().length > 5;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                step >= s 
                  ? "bg-blue-600 text-white" 
                  : "bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-600"
              )}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={cn(
                  "w-12 h-1 mx-2 rounded transition-all duration-300",
                  step > s ? "bg-[#4729A3]" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Category */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What type of issue?</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Select the category that best describes the problem</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id, tags: [] }))}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all duration-300",
                        formData.category === cat.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                          : "border-gray-200 dark:border-slate-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <span className="text-4xl mb-3 block">{cat.icon}</span>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{cat.label}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{cat.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Location & Media */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Location & Media</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Help us pinpoint the issue</p>

                {/* Location */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Location</Label>
                  <Button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationLoading}
                    variant="outline"
                    className={cn(
                      "w-full justify-start gap-3 h-14 border-2",
                      formData.latitude 
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500 dark:border-green-600" 
                        : "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    )}
                  >
                    {locationLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : formData.latitude ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                    {formData.latitude 
                      ? (formData.address || `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`)
                      : 'Detect My Location'
                    }
                  </Button>
                  {formData.latitude && (
                    <Input
                      placeholder="Ward / Area (optional)"
                      value={formData.ward}
                      onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Photo Upload */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Photo Evidence</Label>
                  {formData.photoPreview ? (
                    <div className="relative">
                      <img 
                        src={formData.photoPreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: '' }))}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-gray-500">Click to upload photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Optional Meme */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Optional Meme/GIF
                    <Badge variant="secondary" className="text-xs">Gen-Z Approved 😎</Badge>
                  </Label>
                  {formData.memePreview ? (
                    <div className="relative">
                      <img 
                        src={formData.memePreview} 
                        alt="Meme Preview" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, meme: null, memePreview: '' }))}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Add a meme (optional)</span>
                      <input
                        type="file"
                        accept="image/*,video/gif"
                        onChange={(e) => handleFileUpload(e, 'meme')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Tags & Severity */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Specific Details</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Help categorize and prioritize this issue</p>

                {/* Tags */}
                <div className="mb-8">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">Tags (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {(TAGS_BY_CATEGORY[formData.category] || []).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tag)
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }));
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full border-2 font-medium transition-all duration-200",
                          formData.tags.includes(tag)
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-blue-400"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">Severity Level</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                        className={cn(
                          "py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200",
                          formData.severity === level
                            ? level === 'Critical'
                              ? "border-red-500 bg-red-500 text-white"
                              : level === 'High'
                                ? "border-orange-500 bg-orange-500 text-white"
                                : level === 'Medium'
                                  ? "border-amber-500 bg-amber-500 text-white"
                                  : "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Description & Submit */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Final Details</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Add a title and description</p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-slate-300">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief title for this issue"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-slate-200">Report Anonymously</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Your identity will be hidden</p>
                    </div>
                    <Switch
                      checked={formData.is_anonymous}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_anonymous: checked }))}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Severity:</strong> {formData.severity}</p>
                    <p><strong>Tags:</strong> {formData.tags.join(', ')}</p>
                    <p><strong>Location:</strong> {formData.address || 'Detected'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}