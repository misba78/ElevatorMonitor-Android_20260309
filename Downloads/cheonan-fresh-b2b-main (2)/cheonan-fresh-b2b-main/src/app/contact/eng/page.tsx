'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return alert('Please fill in all fields.');

    setIsSubmitting(true);
    try {
      // 🌟 Matched the column names exactly with the DB picture you uploaded!
      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,             // 'name' column in the picture
        email: formData.email,           // 'email' column in the picture
        message: formData.message,       // 'message' column in the picture
        company: 'Website Contact Menu'  // 'company' column in the picture (used to indicate the source of inquiry)
      }]);

      if (error) throw error;
      
      alert('Your inquiry has been successfully submitted. Our representative will check and contact you shortly!');
      setFormData({ name: '', email: '', message: '' }); 
    } catch (error: any) {
      console.error('Transmission error details:', error);
      alert('An error occurred during submission: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      {/* Top Title */}
      <section className="bg-green-900 py-20 text-center px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">CONTACT US</h1>
        <p className="text-lg text-green-100 font-medium">We are waiting for global partners to join Cheonan Fresh.</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left: Contact Information */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-black text-gray-950 mb-6 tracking-tight">Ask us anything!</h2>
            <p className="text-gray-600 mb-12 leading-relaxed font-medium text-lg">
              If you have any questions regarding business, such as product unit prices, minimum order quantities (MOQ), or exclusive contracts, please leave a message and a Cheonan Fresh export expert will provide a detailed response within 24 hours.
            </p>

            <div className="space-y-10">
              {/* Headquarters Location */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">Headquarters Location</h4>
                  <p className="text-gray-700 font-medium">Cheonan Fresh Building, 10 Gukjegeumyung-ro, Yeongdeungpo-gu, Seoul</p>
                </div>
              </div>

              {/* 🌟 Added Regional Office Section */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-2">Regional Offices</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-gray-900 text-base">Pyeongtaek Office</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">Room 206, 21-6 Pyeongtaek-ro 64beon-gil, Pyeongtaek-si (Pyeongtaek-dong, Lapeonville II)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">Contact: 070-4790-8219</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">Suwon Office</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">2nd Floor, 145 Gokbanjeong-ro, Gwonseon-gu, Suwon-si, Gyeonggi-do (Gokbanjeong-dong)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">Contact: 070-4790-8219</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Inquiry */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Phone size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">Phone Inquiry</h4>
                  <p className="text-gray-700 font-medium">+82 2-1234-5678 (Weekdays 09:00 - 18:00)</p>
                </div>
              </div>

              {/* Email Inquiry */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Mail size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">Email Inquiry</h4>
                  <p className="text-gray-700 font-medium">export@CheonanFresh.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Inquiry Form */}
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-950 mb-8 flex items-center">
              <Send size={24} className="mr-2 text-green-600" /> Write an Online Inquiry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">Company Name / Contact Person Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="Ex: Cheonan Fresh Partners / John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">Reply Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="example@company.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">Inquiry Details <span className="text-red-500">*</span></label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  required 
                  rows={6} 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none resize-none bg-white text-gray-950 font-bold text-base leading-relaxed placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="Please feel free to write down partnership inquiries, quote requests, etc." 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full flex items-center justify-center py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 disabled:opacity-50 text-lg mt-4"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin mr-2" /> : <Send size={24} className="mr-2" />}
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}