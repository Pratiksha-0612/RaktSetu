import React from 'react';

function MatchingEngineInfo() {
  return (
    <div style={{ maxWidth: 800, margin: '50px auto', padding: '0 20px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h1 style={{ color: '#b71c1c' }}>The Matching Engine</h1>
      <p style={{ lineHeight: 1.7, color: '#333' }}>
        This is the core intelligence of RaktSetu — the system that finds the right donor for every emergency request.
        It works in three stages:
      </p>
      <ol style={{ lineHeight: 2, color: '#333' }}>
        <li><b>Blood-Group Compatibility Check</b> — a fixed compatibility chart identifies every donor blood group capable of safely donating to the requested blood group (e.g., O- is a universal donor; AB+ is a universal recipient).</li>
        <li><b>Availability Filter</b> — only donors currently marked available (not in their 90-day post-donation cooldown) are considered.</li>
        <li><b>Distance Calculation</b> — using the Haversine formula, the system calculates the real-world distance between the request and every remaining candidate donor, based on their city coordinates, and returns the nearest matches first.</li>
      </ol>
      <p style={{ lineHeight: 1.7, color: '#333' }}>
        This means RaktSetu doesn't just return "any" donor — it returns the closest, medically compatible,
        currently available donor, automatically and instantly.
      </p>
    </div>
  );
}
export default MatchingEngineInfo;