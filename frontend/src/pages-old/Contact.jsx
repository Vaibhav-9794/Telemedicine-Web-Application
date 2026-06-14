import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <section className="py-16 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start flex-1 text-left">
        {/* Contact Info (Left) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Get In Touch
            </h1>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              Have questions about how TeleMedicare works? Our technical support and administrative teams are available 24/7.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Call Us</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">+1 (555) 019-2834</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Email Support</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">support@medicare.com</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Office Headquarters</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">123 Health Ave, Medical District, NY 10001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Right) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400">Our customer team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-slate-500">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="text-xs font-bold text-slate-500">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Booking Inquiry"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="text-xs font-bold text-slate-500">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 resize-none"
                  placeholder="Write your message details..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <p>&copy; {new Date().getFullYear()} TeleMedicare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;
