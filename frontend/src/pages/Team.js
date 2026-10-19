import React from 'react';

const members = [
  { name: 'Pratiksha Pange', prn: '1272250056', role: 'Full-Stack Developer' },
  { name: 'Sejal Bhosale', prn: '1272250103', role: 'Full-Stack Developer' }
];

function Team() {
  return (
    <div style={{ maxWidth: 800, margin: '50px auto', padding: '0 20px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h1 style={{ color: '#b71c1c', textAlign: 'center' }}>Our Team</h1>
      <p style={{ textAlign: 'center', color: '#777', marginBottom: 30 }}>Guided by Sukanya Akolkar</p>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        {members.map((m) => (
          <div key={m.prn} style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24, width: 220, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#f5c6c6', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#b71c1c', fontWeight: 700 }}>
              {m.name.split(' ').map(w => w[0]).join('')}
            </div>
            <h3 style={{ margin: '6px 0' }}>{m.name}</h3>
            <p style={{ color: '#777', fontSize: 13 }}>{m.role}</p>
            <p style={{ color: '#aaa', fontSize: 12 }}>PRN: {m.prn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Team;