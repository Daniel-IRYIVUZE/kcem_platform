import { useState, useEffect, useCallback } from 'react';
import { getAll, create, update as dsUpdate, generateId } from '../../../utils/dataStore';
import type { Message } from '../../../utils/dataStore';
import { MessageSquare, Send } from 'lucide-react';
import { companyProfile } from './_shared';

export default function RecyclerMessages() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => setMsgs(getAll<Message>('messages')), []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const handleSelect = (msg: Message) => {
    setSelectedMsg(msg);
    if (!msg.read) dsUpdate<Message>('messages', msg.id, { read: true });
    setReply('');
  };

  const handleSendReply = () => {
    if (!reply.trim() || !selectedMsg) return;
    const updated = { ...selectedMsg, replies: [...(selectedMsg.replies || []), { from: 'recycler', fromName: companyProfile.name, body: reply, date: new Date().toISOString() }] };
    dsUpdate<Message>('messages', selectedMsg.id, { replies: updated.replies });
    setSelectedMsg(updated); setReply('');
    setFlash('Reply sent!'); setTimeout(() => setFlash(null), 2000);
  };

  const handleNewMessage = () => {
    const subject = prompt('Subject:'); const body = prompt('Message:');
    if (!subject || !body) return;
    create<Message>('messages', { id: generateId('MSG'), from: 'recycler', fromName: companyProfile.name, to: 'support', toName: 'EcoTrade Support', subject, body, date: new Date().toISOString(), read: false, replies: [] });
  };

  return (
    <div className="space-y-6">
      {flash && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 px-4 py-2 rounded-lg text-sm">{flash}</div>}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <button onClick={handleNewMessage} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><Send size={16} /> New Message</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Inbox</h3>
            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-full">{msgs.filter(m => !m.read).length} unread</span>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {msgs.map(msg => (
              <button key={msg.id} onClick={() => handleSelect(msg)} className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition ${selectedMsg?.id === msg.id ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm ${!msg.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{msg.fromName}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(msg.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{msg.subject}</p>
                {!msg.read && <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1" />}
              </button>
            ))}
            {msgs.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No messages</p>}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {selectedMsg ? (
            <div className="p-6">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-lg font-semibold">{selectedMsg.subject}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From: <span className="font-medium">{selectedMsg.fromName}</span> · {new Date(selectedMsg.date).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4"><p className="text-gray-700 dark:text-gray-300">{selectedMsg.body}</p></div>
              {(selectedMsg.replies || []).map((r, i) => (
                <div key={i} className={`flex ${r.from === 'recycler' ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-xs rounded-lg p-3 text-sm ${r.from === 'recycler' ? 'bg-cyan-100' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <p className="font-medium text-xs mb-1">{r.fromName}</p><p>{r.body}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 mb-2" />
                <button onClick={handleSendReply} disabled={!reply.trim()} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50"><Send size={16} /> Send Reply</button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center h-64">
              <MessageSquare size={48} className="mb-2 opacity-30" /><p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
