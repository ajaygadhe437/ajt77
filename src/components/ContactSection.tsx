import React, { useState } from 'react';
import { Mail, Send, Check, AlertCircle, Loader2, Youtube, Instagram, Linkedin, MessageSquare, Twitter } from 'lucide-react';
import { requestApi } from '../lib/api';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      await requestApi('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });
      setSentSuccess(true);
      setIsSending(false);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setIsSending(false);
      setError(err.message || 'Failed to send message. Please try again.');
    }
  };

  const socialChannels = [
    {
      name: 'YouTube',
      handle: '@ajaytrades77',
      url: 'https://youtube.com/@ajaytrades77?si=3piKHv2eHqB_A_4S',
      icon: Youtube,
      color: 'hover:text-red-400',
    },
    {
      name: 'Instagram (Primary)',
      handle: '@ajaytrades_77',
      url: 'https://www.instagram.com/ajaytrades_77?stkn=eHVreHA3MDQ4cHNl',
      icon: Instagram,
      color: 'hover:text-pink-400',
    },
    {
      name: 'Instagram (Official)',
      handle: '@ajaytrades77',
      url: 'https://www.instagram.com/ajaytrades77?stkn=MW9yYm00cmh4NHc4Nw==',
      icon: Instagram,
      color: 'hover:text-pink-400',
    },
    {
      name: 'LinkedIn',
      handle: 'Ajay Gadhe',
      url: 'https://www.linkedin.com/in/ajay-gadhe-703066361',
      icon: Linkedin,
      color: 'hover:text-sky-400',
    },
    {
      name: 'X (Twitter)',
      handle: '@AjayTrades77',
      url: 'https://x.com/AjayTrades77',
      icon: Twitter,
      color: 'hover:text-slate-100',
    },
    {
      name: 'Discord Community',
      handle: 'AJT77 Discord Server',
      url: 'https://discord.gg/ESDzAbxBNZ',
      icon: MessageSquare,
      color: 'hover:text-indigo-400',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-[#07090e] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Official Social Links & Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
              <Mail className="w-3.5 h-3.5" />
              <span>DIRECT CHANNELS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Connect with AJT77
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect directly with Ajay Gadhe through our verified official social communities or send an educational inquiry using the secure message terminal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Official Profiles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {socialChannels.map((soc, idx) => {
                  const Icon = soc.icon;
                  return (
                    <a
                      key={idx}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#0b0f19] border border-slate-800 hover:border-slate-700 rounded-xl flex items-center space-x-3 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg bg-slate-800/60 text-slate-300 ${soc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block group-hover:text-sky-400 transition-colors truncate">
                          {soc.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block truncate">
                          {soc.handle}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry to Ajay Gadhe</h3>
              <p className="text-xs text-slate-400 mb-6">
                Messages are routed securely to our private admin portal. Responses are provided within 24-48 hours.
              </p>

              {sentSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Message Transmitted</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Thank you! Your message has been safely logged in our database. Ajay Gadhe or the AJT77 support desk will reply to your email.
                  </p>
                  <button
                    onClick={() => setSentSuccess(false)}
                    className="px-4 py-2 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                      <input
                        id="contact-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        id="contact-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                    <textarea
                      id="contact-message-input"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your question, feedback, or mentorship query..."
                      className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    id="submit-contact-btn"
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Transmit Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
