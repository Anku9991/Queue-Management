import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, Phone, FileText } from 'lucide-react';
import { useQueueStore } from '../store/useQueueStore';

const PatientLanding = () => {
  const navigate = useNavigate();
  const generateToken = useQueueStore(state => state.generateToken);
  const settings = useQueueStore(state => state.settings);
  
  const [formData, setFormData] = useState({
    patientName: '',
    mobile: '',
    age: '',
    gender: 'Male',
    purpose: '',
    uhid: '',
    priority: 'normal' as const
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newToken = await generateToken({
        ...formData,
        priority: formData.priority,
      });
      navigate(`/tracker/${newToken.tokenId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="h-24 w-auto flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Smart Queue Logo" className="h-full w-auto object-contain drop-shadow-md" />
          </div>
        </motion.div>
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold text-slate-900"
        >
          {settings.hospitalName}
        </motion.h2>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-slate-600"
        >
          Generate your Queue Token instantly
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass py-8 px-4 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                  placeholder="Rahul Sharma"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                <input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-3 border"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl border"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-slate-700">
                Purpose of Visit
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="purpose"
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                  placeholder="Consultation, Follow up, etc."
                />
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority Category (If applicable)</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl border"
              >
                <option value="normal">None (General Queue)</option>
                <option value="senior">Senior Citizen</option>
                <option value="pregnant">Pregnant</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Generating...' : 'Generate Token'}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientLanding;
