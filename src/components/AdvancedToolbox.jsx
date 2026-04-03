import React, { useState } from 'react';

// ── Component HTML templates ───────────────────────────────────────────────────
const TEMPLATES = {
  // Basic
  text: `<p style="font-size:16px;color:#1f2937;line-height:1.7;margin:0 0 16px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.</p>`,
  heading: `<div style="padding:0;"><h2 style="font-size:48px;font-weight:900;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.03em;margin:0 0 14px;line-height:1.1;">Section Heading</h2><p style="font-size:18px;color:#64748b;margin:0;line-height:1.7;max-width:560px;">A compelling subtitle that draws visitors deeper into your content.</p></div>`,
  button: `<a href="#" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:white;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;box-shadow:0 8px 24px rgba(99,102,241,0.35);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 16px 40px rgba(99,102,241,0.45)'" onmouseout="this.style.transform='';this.style.boxShadow='0 8px 24px rgba(99,102,241,0.35)'">Click Me</a>`,
  image: `<img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&auto=format&fit=crop" alt="Image" style="width:100%;height:300px;object-fit:cover;border-radius:16px;display:block;" />`,
  link: `<a href="#" style="color:#6366f1;font-weight:600;font-size:16px;text-decoration:none;border-bottom:2px solid #6366f1;padding-bottom:2px;transition:color 0.2s;" onmouseover="this.style.color='#4f46e5'" onmouseout="this.style.color='#6366f1'">Learn more →</a>`,
  container: `<div style="padding:40px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;"><p style="margin:0;color:#64748b;font-size:16px;">Container block — add content here</p></div>`,

  // Forms
  input: `<div style="margin-bottom:20px;"><label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Label</label><input type="text" placeholder="Enter text..." style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;outline:none;transition:border-color 0.2s;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'" /></div>`,
  textarea: `<div style="margin-bottom:20px;"><label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Message</label><textarea rows="4" placeholder="Write something..." style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'"></textarea></div>`,
  checkbox: `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:15px;color:#374151;font-weight:500;"><input type="checkbox" style="width:18px;height:18px;accent-color:#6366f1;cursor:pointer;" /> I agree to the terms and conditions</label>`,
  radio: `<div style="display:flex;flex-direction:column;gap:10px;"><label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:15px;color:#374151;font-weight:500;"><input type="radio" name="opt" value="a" style="width:18px;height:18px;accent-color:#6366f1;" /> Option A</label><label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:15px;color:#374151;font-weight:500;"><input type="radio" name="opt" value="b" style="width:18px;height:18px;accent-color:#6366f1;" /> Option B</label><label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:15px;color:#374151;font-weight:500;"><input type="radio" name="opt" value="c" style="width:18px;height:18px;accent-color:#6366f1;" /> Option C</label></div>`,
  select: `<div style="margin-bottom:20px;"><label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Choose an option</label><select style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;outline:none;background:white;cursor:pointer;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'"><option value="">Select...</option><option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option></select></div>`,
  form: `<form style="padding:40px;background:white;border-radius:20px;box-shadow:0 4px 6px rgba(0,0,0,0.02),0 20px 50px rgba(0,0,0,0.08);max-width:480px;" onsubmit="event.preventDefault();this.innerHTML='<p style=color:#10b981;font-weight:700;font-size:18px;text-align:center>✓ Submitted!</p>'"><h3 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f172a;">Contact Us</h3><label style="display:block;font-weight:600;color:#374151;margin-bottom:6px;font-size:14px;">Name</label><input type="text" placeholder="Your name" style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;margin-bottom:16px;outline:none;box-sizing:border-box;" /><label style="display:block;font-weight:600;color:#374151;margin-bottom:6px;font-size:14px;">Email</label><input type="email" placeholder="you@example.com" style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;margin-bottom:16px;outline:none;box-sizing:border-box;" /><label style="display:block;font-weight:600;color:#374151;margin-bottom:6px;font-size:14px;">Message</label><textarea rows="3" placeholder="Your message..." style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;margin-bottom:20px;outline:none;resize:vertical;box-sizing:border-box;"></textarea><button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;">Send Message</button></form>`,

  // Advanced
  slider: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <label style="font-weight:600;color:#374151;font-size:15px;">Value</label>
    <span id="sliderVal" style="font-weight:700;color:#6366f1;font-size:18px;">50</span>
  </div>
  <input type="range" min="0" max="100" value="50" oninput="document.getElementById('sliderVal').textContent=this.value;document.getElementById('sliderFill').style.width=this.value+'%'" style="width:100%;height:6px;border-radius:3px;appearance:none;background:#e5e7eb;outline:none;cursor:pointer;" />
  <div style="margin-top:8px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div id="sliderFill" style="width:50%;height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:3px;transition:width 0.1s;"></div></div>
</div>`,

  calendar: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:320px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
    <button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer;font-size:16px;">◀</button>
    <h3 style="margin:0;font-size:17px;font-weight:700;color:#0f172a;">December 2024</h3>
    <button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer;font-size:16px;">▶</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">
    <div style="font-weight:700;color:#6b7280;font-size:11px;padding:4px;">Mo</div>
    <div style="font-weight:700;color:#6b7280;font-size:11px;padding:4px;">Tu</div>
    <div style="font-weight:700;color:#6b7280;font-size:11px;padding:4px;">We</div>
    <div style="font-weight:700;color:#6b7280;font-size:11px;padding:4px;">Th</div>
    <div style="font-weight:700;color:#6b7280;font-size:11px;padding:4px;">Fr</div>
    <div style="font-weight:700;color:#ec4899;font-size:11px;padding:4px;">Sa</div>
    <div style="font-weight:700;color:#ec4899;font-size:11px;padding:4px;">Su</div>
    <div style="padding:6px;color:#d1d5db;font-size:13px;"></div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">1</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">2</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">3</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">4</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">5</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">6</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">7</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">8</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">9</div>
    <div style="padding:6px;background:#6366f1;color:white;font-size:13px;cursor:pointer;border-radius:6px;font-weight:700;">10</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">11</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">12</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">13</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">14</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">15</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">16</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">17</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">18</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">19</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">20</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">21</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">22</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">23</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">24</div>
    <div style="padding:6px;color:#10b981;font-weight:700;font-size:13px;cursor:pointer;border-radius:6px;border:2px solid #10b981;" onmouseover="this.style.background='#10b981';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#10b981'">25</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">26</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">27</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">28</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">29</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">30</div>
    <div style="padding:6px;color:#1f2937;font-size:13px;cursor:pointer;border-radius:6px;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#1f2937'">31</div>
  </div>
</div>`,

  timer: `<div style="padding:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:20px;text-align:center;max-width:320px;">
  <div style="font-size:56px;font-weight:800;color:white;font-variant-numeric:tabular-nums;letter-spacing:2px;margin-bottom:24px;" id="timerDisplay">00:00:00</div>
  <div style="display:flex;gap:12px;justify-content:center;">
    <button onclick="if(!window._tmrI){window._tmrS=window._tmrS||0;window._tmrI=setInterval(()=>{window._tmrS++;const h=String(Math.floor(window._tmrS/3600)).padStart(2,'0'),m=String(Math.floor(window._tmrS%3600/60)).padStart(2,'0'),s=String(window._tmrS%60).padStart(2,'0');document.getElementById('timerDisplay').textContent=h+':'+m+':'+s},1000)}" style="padding:10px 20px;background:white;color:#667eea;border:none;border-radius:10px;font-weight:700;cursor:pointer;">▶ Start</button>
    <button onclick="clearInterval(window._tmrI);window._tmrI=null" style="padding:10px 20px;background:rgba(255,255,255,0.2);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;">⏸ Pause</button>
    <button onclick="clearInterval(window._tmrI);window._tmrI=null;window._tmrS=0;document.getElementById('timerDisplay').textContent='00:00:00'" style="padding:10px 20px;background:rgba(255,255,255,0.2);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;">↺ Reset</button>
  </div>
</div>`,

  progress: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-weight:600;color:#374151;">Progress</span><span id="progPct" style="font-weight:700;color:#6366f1;">0%</span></div>
  <div style="height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden;"><div id="progBar" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:6px;transition:width 0.3s;"></div></div>
  <button onclick="let p=0;clearInterval(window._pI);window._pI=setInterval(()=>{p+=Math.random()*12;if(p>=100){p=100;clearInterval(window._pI);}document.getElementById('progBar').style.width=p+'%';document.getElementById('progPct').textContent=Math.floor(p)+'%'},200)" style="margin-top:14px;padding:8px 20px;background:#6366f1;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">Simulate</button>
</div>`,

  rating: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">
  <p style="margin:0 0 12px;font-weight:600;color:#374151;font-size:15px;">Rate this</p>
  <div id="stars" style="font-size:40px;display:flex;justify-content:center;gap:4px;">
    <span data-v="1" onclick="window._r=1;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<1?'★':'☆';s.style.color=i<1?'#f59e0b':'#d1d5db'})" onmouseover="[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<1?'★':'☆';s.style.color=i<1?'#f59e0b':'#d1d5db'})" onmouseout="const r=window._r||0;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<r?'★':'☆';s.style.color=i<r?'#f59e0b':'#d1d5db'})" style="cursor:pointer;color:#d1d5db;transition:color 0.1s;">☆</span>
    <span data-v="2" onclick="window._r=2;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<2?'★':'☆';s.style.color=i<2?'#f59e0b':'#d1d5db'})" onmouseover="[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<2?'★':'☆';s.style.color=i<2?'#f59e0b':'#d1d5db'})" onmouseout="const r=window._r||0;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<r?'★':'☆';s.style.color=i<r?'#f59e0b':'#d1d5db'})" style="cursor:pointer;color:#d1d5db;transition:color 0.1s;">☆</span>
    <span data-v="3" onclick="window._r=3;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<3?'★':'☆';s.style.color=i<3?'#f59e0b':'#d1d5db'})" onmouseover="[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<3?'★':'☆';s.style.color=i<3?'#f59e0b':'#d1d5db'})" onmouseout="const r=window._r||0;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<r?'★':'☆';s.style.color=i<r?'#f59e0b':'#d1d5db'})" style="cursor:pointer;color:#d1d5db;transition:color 0.1s;">☆</span>
    <span data-v="4" onclick="window._r=4;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<4?'★':'☆';s.style.color=i<4?'#f59e0b':'#d1d5db'})" onmouseover="[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<4?'★':'☆';s.style.color=i<4?'#f59e0b':'#d1d5db'})" onmouseout="const r=window._r||0;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<r?'★':'☆';s.style.color=i<r?'#f59e0b':'#d1d5db'})" style="cursor:pointer;color:#d1d5db;transition:color 0.1s;">☆</span>
    <span data-v="5" onclick="window._r=5;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<5?'★':'☆';s.style.color=i<5?'#f59e0b':'#d1d5db'})" onmouseover="[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<5?'★':'☆';s.style.color=i<5?'#f59e0b':'#d1d5db'})" onmouseout="const r=window._r||0;[...document.querySelectorAll('#stars span')].forEach((s,i)=>{s.textContent=i<r?'★':'☆';s.style.color=i<r?'#f59e0b':'#d1d5db'})" style="cursor:pointer;color:#d1d5db;transition:color 0.1s;">☆</span>
  </div>
</div>`,

  toggle: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <label style="display:flex;align-items:center;cursor:pointer;gap:14px;width:fit-content;">
    <input type="checkbox" id="tgl" onchange="const b=document.getElementById('tglBg'),c=document.getElementById('tglCircle'),l=document.getElementById('tglLabel');if(this.checked){b.style.background='#6366f1';c.style.transform='translateX(24px)';l.textContent='Enabled';}else{b.style.background='#d1d5db';c.style.transform='translateX(0)';l.textContent='Disabled';}" style="display:none;" />
    <div id="tglBg" style="width:52px;height:28px;background:#d1d5db;border-radius:14px;position:relative;transition:background 0.3s;flex-shrink:0;"><div id="tglCircle" style="position:absolute;top:4px;left:4px;width:20px;height:20px;background:white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2);transition:transform 0.3s;"></div></div>
    <span id="tglLabel" style="font-weight:600;color:#374151;font-size:15px;">Disabled</span>
  </label>
</div>`,

  // Media
  video: `<div style="border-radius:16px;overflow:hidden;background:#000;aspect-ratio:16/9;position:relative;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="border:none;position:absolute;inset:0;" allowfullscreen></iframe></div>`,
  audio: `<div style="padding:20px;background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:16px;"><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0 0 12px;font-weight:600;">NOW PLAYING</p><p style="color:white;font-weight:700;font-size:18px;margin:0 0 16px;">Track Title</p><audio controls style="width:100%;filter:invert(1);"></audio></div>`,
  gallery: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;"><img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /><img src="https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /><img src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /><img src="https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /><img src="https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /><img src="https://images.unsplash.com/photo-1682695794947-17061dc284dd?w=400&auto=format&fit=crop" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;" /></div>`,
  carousel: `<div style="position:relative;overflow:hidden;border-radius:16px;background:#000;" id="car">
  <div id="carTrack" style="display:flex;transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);">
    <img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&auto=format&fit=crop" style="width:100%;flex-shrink:0;height:300px;object-fit:cover;" />
    <img src="https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800&auto=format&fit=crop" style="width:100%;flex-shrink:0;height:300px;object-fit:cover;" />
    <img src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop" style="width:100%;flex-shrink:0;height:300px;object-fit:cover;" />
  </div>
  <button onclick="window._cs=(window._cs||0)-1;if(window._cs<0)window._cs=2;document.getElementById('carTrack').style.transform='translateX(-'+(window._cs*100)+'%)'" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);width:40px;height:40px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;cursor:pointer;font-size:18px;">‹</button>
  <button onclick="window._cs=((window._cs||0)+1)%3;document.getElementById('carTrack').style.transform='translateX(-'+(window._cs*100)+'%)'" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);width:40px;height:40px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;cursor:pointer;font-size:18px;">›</button>
</div>`,
  iframe: `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,-0.09,51.51&layer=mapnik" style="width:100%;height:300px;border:none;border-radius:16px;" title="Map"></iframe>`,

  // Layout
  grid: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;"><div style="padding:32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;color:white;text-align:center;"><div style="font-size:28px;font-weight:800;">01</div><div style="font-size:14px;opacity:0.85;margin-top:8px;">Column One</div></div><div style="padding:32px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;color:white;text-align:center;"><div style="font-size:28px;font-weight:800;">02</div><div style="font-size:14px;opacity:0.85;margin-top:8px;">Column Two</div></div><div style="padding:32px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:16px;color:white;text-align:center;"><div style="font-size:28px;font-weight:800;">03</div><div style="font-size:14px;opacity:0.85;margin-top:8px;">Column Three</div></div></div>`,
  flex: `<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:24px;background:#f8fafc;border-radius:16px;"><div style="flex:1;min-width:160px;padding:24px;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;font-weight:600;color:#374151;">Flex Item 1</div><div style="flex:2;min-width:200px;padding:24px;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;font-weight:600;color:#374151;">Flex Item 2 (2x)</div><div style="flex:1;min-width:160px;padding:24px;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;font-weight:600;color:#374151;">Flex Item 3</div></div>`,
  card: `<div style="padding:32px;background:white;border-radius:20px;box-shadow:0 4px 6px rgba(0,0,0,0.02),0 20px 50px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.04);max-width:360px;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02),0 30px 70px rgba(99,102,241,0.12)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02),0 20px 50px rgba(0,0,0,0.08)'"><div style="width:56px;height:56px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 8px 20px rgba(99,102,241,0.3);"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 10px;">Card Title</h3><p style="font-size:15px;color:#64748b;line-height:1.7;margin:0;">Card description goes here. Add compelling copy to engage your visitors.</p></div>`,
  modal: `<div style="display:flex;align-items:center;justify-content:center;padding:40px;background:rgba(15,23,42,0.6);border-radius:16px;backdrop-filter:blur(4px);"><div style="background:white;border-radius:20px;padding:40px;max-width:440px;width:100%;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3);"><button onclick="this.closest('div').parentNode.style.display='none'" style="position:absolute;top:16px;right:16px;width:32px;height:32px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer;font-size:18px;">×</button><h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#0f172a;">Modal Title</h2><p style="margin:0 0 24px;color:#64748b;line-height:1.7;">This is a modal dialog. Add your content here.</p><div style="display:flex;gap:12px;"><button style="flex:1;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">Confirm</button><button style="flex:1;padding:12px;background:#f3f4f6;color:#374151;border:none;border-radius:10px;font-weight:600;cursor:pointer;">Cancel</button></div></div></div>`,
  tabs: `<div style="max-width:600px;"><div style="display:flex;gap:4px;border-bottom:2px solid #e5e7eb;margin-bottom:20px;" id="tabNav"><button onclick="window._tabShow(0)" style="padding:10px 20px;background:#6366f1;color:white;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;font-size:14px;">Tab 1</button><button onclick="window._tabShow(1)" style="padding:10px 20px;background:#f3f4f6;color:#6b7280;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;font-size:14px;">Tab 2</button><button onclick="window._tabShow(2)" style="padding:10px 20px;background:#f3f4f6;color:#6b7280;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;font-size:14px;">Tab 3</button></div><div id="tC0" style="padding:20px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);"><h3 style="margin:0 0 8px;font-weight:700;">Tab 1 Content</h3><p style="margin:0;color:#64748b;">Content for the first tab goes here.</p></div><div id="tC1" style="display:none;padding:20px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);"><h3 style="margin:0 0 8px;font-weight:700;">Tab 2 Content</h3><p style="margin:0;color:#64748b;">Content for the second tab goes here.</p></div><div id="tC2" style="display:none;padding:20px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);"><h3 style="margin:0 0 8px;font-weight:700;">Tab 3 Content</h3><p style="margin:0;color:#64748b;">Content for the third tab goes here.</p></div></div><script>window._tabShow=function(i){for(let j=0;j<3;j++){const b=document.getElementById('tabNav').children[j],c=document.getElementById('tC'+j);b.style.background=j===i?'#6366f1':'#f3f4f6';b.style.color=j===i?'white':'#6b7280';c.style.display=j===i?'block':'none';}}</script>`,
  accordion: `<div style="max-width:600px;display:flex;flex-direction:column;gap:8px;"><div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><button onclick="const c=document.getElementById('ac0'),i=document.getElementById('ai0');const o=c.style.display==='block';c.style.display=o?'none':'block';i.textContent=o?'▼':'▲'" style="width:100%;padding:16px 20px;background:white;border:none;text-align:left;font-weight:600;font-size:15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:#0f172a;">What is WebEdit-r? <span id="ai0" style="color:#6366f1;">▼</span></button><div id="ac0" style="display:none;padding:16px 20px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;line-height:1.7;">WebEdit-r is a powerful visual web editor for building stunning websites without writing code.</div></div><div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><button onclick="const c=document.getElementById('ac1'),i=document.getElementById('ai1');const o=c.style.display==='block';c.style.display=o?'none':'block';i.textContent=o?'▼':'▲'" style="width:100%;padding:16px 20px;background:white;border:none;text-align:left;font-weight:600;font-size:15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:#0f172a;">How do I get started? <span id="ai1" style="color:#6366f1;">▼</span></button><div id="ac1" style="display:none;padding:16px 20px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;line-height:1.7;">Simply choose a template from the Theme Store, then use the visual editor to customize every element.</div></div><div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><button onclick="const c=document.getElementById('ac2'),i=document.getElementById('ai2');const o=c.style.display==='block';c.style.display=o?'none':'block';i.textContent=o?'▼':'▲'" style="width:100%;padding:16px 20px;background:white;border:none;text-align:left;font-weight:600;font-size:15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:#0f172a;">Can I export my site? <span id="ai2" style="color:#6366f1;">▼</span></button><div id="ac2" style="display:none;padding:16px 20px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;line-height:1.7;">Yes! Click the Export button in the header to download your entire website as a standalone HTML file.</div></div></div>`,

  // Charts
  linechart: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;">Monthly Revenue</h3>
  <svg viewBox="0 0 400 200" style="width:100%;height:200px;">
    <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/><stop offset="100%" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
    <path d="M20,160 L80,120 L140,140 L200,80 L260,60 L320,40 L380,20" stroke="#6366f1" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20,160 L80,120 L140,140 L200,80 L260,60 L320,40 L380,20 L380,180 L20,180 Z" fill="url(#lg1)"/>
    <circle cx="20" cy="160" r="5" fill="#6366f1"/><circle cx="80" cy="120" r="5" fill="#6366f1"/><circle cx="140" cy="140" r="5" fill="#6366f1"/><circle cx="200" cy="80" r="5" fill="#6366f1"/><circle cx="260" cy="60" r="5" fill="#6366f1"/><circle cx="320" cy="40" r="5" fill="#6366f1"/><circle cx="380" cy="20" r="5" fill="#6366f1"/>
    <line x1="20" y1="0" x2="20" y2="180" stroke="#e5e7eb" stroke-width="1"/><line x1="20" y1="180" x2="400" y2="180" stroke="#e5e7eb" stroke-width="1"/>
    <text x="20" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Jan</text><text x="80" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Feb</text><text x="140" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Mar</text><text x="200" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Apr</text><text x="260" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">May</text><text x="320" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Jun</text><text x="380" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Jul</text>
  </svg>
</div>`,

  barchart: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;">Weekly Sales</h3>
  <svg viewBox="0 0 400 200" style="width:100%;height:200px;">
    <rect x="30" y="80" width="40" height="100" rx="4" fill="#6366f1" opacity="0.85"/>
    <rect x="90" y="40" width="40" height="140" rx="4" fill="#8b5cf6" opacity="0.85"/>
    <rect x="150" y="100" width="40" height="80" rx="4" fill="#6366f1" opacity="0.85"/>
    <rect x="210" y="20" width="40" height="160" rx="4" fill="#8b5cf6" opacity="0.85"/>
    <rect x="270" y="60" width="40" height="120" rx="4" fill="#6366f1" opacity="0.85"/>
    <rect x="330" y="30" width="40" height="150" rx="4" fill="#8b5cf6" opacity="0.85"/>
    <line x1="20" y1="180" x2="390" y2="180" stroke="#e5e7eb" stroke-width="1"/>
    <text x="50" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Mon</text><text x="110" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Tue</text><text x="170" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Wed</text><text x="230" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Thu</text><text x="290" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Fri</text><text x="350" y="195" font-size="11" fill="#9ca3af" text-anchor="middle">Sat</text>
  </svg>
</div>`,

  piechart: `<div style="padding:24px;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);display:flex;align-items:center;gap:32px;flex-wrap:wrap;">
  <svg viewBox="0 0 200 200" style="width:180px;height:180px;flex-shrink:0;">
    <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" stroke-width="40" stroke-dasharray="175 326" stroke-dashoffset="0" transform="rotate(-90 100 100)"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="#8b5cf6" stroke-width="40" stroke-dasharray="100 326" stroke-dashoffset="-175" transform="rotate(-90 100 100)"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" stroke-width="40" stroke-dasharray="51 326" stroke-dashoffset="-275" transform="rotate(-90 100 100)"/>
    <circle cx="100" cy="100" r="55" fill="white"/>
    <text x="100" y="96" text-anchor="middle" font-size="20" font-weight="700" fill="#0f172a">54%</text>
    <text x="100" y="114" text-anchor="middle" font-size="11" fill="#9ca3af">Total</text>
  </svg>
  <div style="display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:12px;height:12px;border-radius:3px;background:#6366f1;flex-shrink:0;"></div><span style="font-size:14px;font-weight:600;color:#374151;">Category A (54%)</span></div><div style="display:flex;align-items:center;gap:10px;"><div style="width:12px;height:12px;border-radius:3px;background:#8b5cf6;flex-shrink:0;"></div><span style="font-size:14px;font-weight:600;color:#374151;">Category B (31%)</span></div><div style="display:flex;align-items:center;gap:10px;"><div style="width:12px;height:12px;border-radius:3px;background:#10b981;flex-shrink:0;"></div><span style="font-size:14px;font-weight:600;color:#374151;">Category C (16%)</span></div></div>
</div>`,

  table: `<div style="overflow:hidden;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;"><th style="padding:14px 20px;text-align:left;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Name</th><th style="padding:14px 20px;text-align:left;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Status</th><th style="padding:14px 20px;text-align:left;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Role</th><th style="padding:14px 20px;text-align:right;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Score</th></tr></thead><tbody><tr style="background:white;border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"><td style="padding:14px 20px;font-weight:600;color:#0f172a;">Alice Johnson</td><td style="padding:14px 20px;"><span style="padding:4px 12px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:12px;font-weight:700;">Active</span></td><td style="padding:14px 20px;color:#64748b;">Designer</td><td style="padding:14px 20px;text-align:right;font-weight:700;color:#6366f1;">98</td></tr><tr style="background:white;border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"><td style="padding:14px 20px;font-weight:600;color:#0f172a;">Bob Smith</td><td style="padding:14px 20px;"><span style="padding:4px 12px;background:#dbeafe;color:#1e40af;border-radius:20px;font-size:12px;font-weight:700;">Pending</span></td><td style="padding:14px 20px;color:#64748b;">Developer</td><td style="padding:14px 20px;text-align:right;font-weight:700;color:#6366f1;">85</td></tr><tr style="background:white;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"><td style="padding:14px 20px;font-weight:600;color:#0f172a;">Carol White</td><td style="padding:14px 20px;"><span style="padding:4px 12px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:12px;font-weight:700;">Away</span></td><td style="padding:14px 20px;color:#64748b;">Manager</td><td style="padding:14px 20px;text-align:right;font-weight:700;color:#6366f1;">72</td></tr></tbody></table></div>`,

  // ── Sections ──────────────────────────────────────────────────────────────────
  navbar: `<nav style="padding:0 32px;background:rgba(255,255,255,0.9);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,0.06);position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;height:64px;box-shadow:0 1px 20px rgba(0,0,0,0.04);font-family:system-ui,sans-serif;"><div style="font-size:20px;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.03em;">YourBrand</div><div style="display:flex;gap:4px;align-items:center;"><a href="#" style="padding:8px 16px;color:#64748b;font-weight:500;font-size:14px;text-decoration:none;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9';this.style.color='#0f172a'" onmouseout="this.style.background='';this.style.color='#64748b'">Product</a><a href="#" style="padding:8px 16px;color:#64748b;font-weight:500;font-size:14px;text-decoration:none;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9';this.style.color='#0f172a'" onmouseout="this.style.background='';this.style.color='#64748b'">Pricing</a><a href="#" style="padding:8px 16px;color:#64748b;font-weight:500;font-size:14px;text-decoration:none;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9';this.style.color='#0f172a'" onmouseout="this.style.background='';this.style.color='#64748b'">Docs</a></div><div style="display:flex;gap:8px;"><a href="#" style="padding:8px 16px;color:#374151;font-weight:600;font-size:14px;text-decoration:none;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">Sign in</a><a href="#" style="padding:8px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;font-size:14px;text-decoration:none;border-radius:8px;box-shadow:0 4px 12px rgba(99,102,241,0.35);transition:all 0.2s;" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 20px rgba(99,102,241,0.45)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(99,102,241,0.35)'">Get Started</a></div></nav>`,

  hero: `<section style="min-height:600px;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);padding:80px 40px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;font-family:system-ui,sans-serif;"><div style="position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%);border-radius:50%;top:-100px;right:-80px;pointer-events:none;"></div><div style="position:absolute;width:350px;height:350px;background:radial-gradient(circle,rgba(139,92,246,0.25),transparent 70%);border-radius:50%;bottom:-60px;left:-60px;pointer-events:none;"></div><div style="position:absolute;width:200px;height:200px;background:radial-gradient(circle,rgba(236,72,153,0.2),transparent 70%);border-radius:50%;top:40%;left:10%;pointer-events:none;"></div><div style="position:relative;z-index:1;max-width:800px;"><span style="display:inline-block;padding:6px 18px;background:rgba(99,102,241,0.25);border:1px solid rgba(99,102,241,0.5);border-radius:20px;color:#a5b4fc;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:28px;">New Release</span><h1 style="font-size:clamp(42px,6vw,72px);font-weight:900;color:white;letter-spacing:-0.03em;line-height:1.05;margin:0 0 24px;background:linear-gradient(135deg,#ffffff,#a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Build Stunning Websites<br/>In Minutes</h1><p style="font-size:18px;color:rgba(255,255,255,0.65);max-width:540px;margin:0 auto 44px;line-height:1.7;">The most powerful visual editor for modern web design. No code required. No limits.</p><div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;"><a href="#" style="padding:16px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;box-shadow:0 8px 32px rgba(99,102,241,0.45);transition:all 0.25s;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 16px 48px rgba(99,102,241,0.55)'" onmouseout="this.style.transform='';this.style.boxShadow='0 8px 32px rgba(99,102,241,0.45)'">Get Started Free</a><a href="#" style="padding:16px 36px;background:rgba(255,255,255,0.08);color:white;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(8px);transition:all 0.25s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">Watch Demo →</a></div></div></section>`,

  features: `<section style="padding:80px 40px;background:white;font-family:system-ui,sans-serif;"><div style="max-width:1100px;margin:0 auto;"><div style="text-align:center;margin-bottom:60px;"><h2 style="font-size:clamp(36px,5vw,52px);font-weight:900;color:#0f172a;letter-spacing:-0.02em;margin:0 0 16px;">Everything You Need</h2><p style="font-size:18px;color:#64748b;margin:0;">Powerful features to help you build faster and smarter.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">` +
    [['⚡','#6366f1','#8b5cf6','Lightning Fast','Optimized for performance with sub-second load times across all devices.'],['🔒','#10b981','#059669','Secure by Design','Enterprise-grade security with end-to-end encryption built in.'],['🎨','#f59e0b','#d97706','Fully Customizable','Every pixel customizable to match your exact brand identity.'],['📊','#ec4899','#be185d','Analytics Built In','Real-time insights into every visitor interaction and conversion.'],['🌍','#06b6d4','#0891b2','Global CDN','Deliver content from 200+ edge locations worldwide.'],['🤖','#6366f1','#4f46e5','AI Powered','Smart suggestions and auto-optimization powered by AI.']].map(([icon,c1,c2,title,desc]) =>
      `<div style="padding:32px;border:1px solid #e5e7eb;border-radius:20px;transition:all 0.3s;" onmouseover="this.style.borderColor='#6366f1';this.style.boxShadow='0 8px 32px rgba(99,102,241,0.12)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='#e5e7eb';this.style.boxShadow='';this.style.transform=''"><div style="width:52px;height:52px;background:linear-gradient(135deg,${c1},${c2});border-radius:14px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:24px;">${icon}</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">${title}</h3><p style="font-size:14px;color:#64748b;line-height:1.7;margin:0;">${desc}</p></div>`
    ).join('') + `</div></div></section>`,

  pricing: `<section style="padding:80px 40px;background:#f8fafc;font-family:system-ui,sans-serif;"><div style="max-width:1000px;margin:0 auto;"><div style="text-align:center;margin-bottom:60px;"><h2 style="font-size:clamp(36px,5vw,52px);font-weight:900;color:#0f172a;letter-spacing:-0.02em;margin:0 0 16px;">Simple, Transparent Pricing</h2><p style="font-size:18px;color:#64748b;margin:0;">Choose the plan that fits your needs. No hidden fees.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:center;"><div style="background:white;border-radius:20px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;"><p style="font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Starter</p><div style="display:flex;align-items:baseline;gap:4px;margin-bottom:24px;"><span style="font-size:48px;font-weight:900;color:#0f172a;">$9</span><span style="color:#64748b;font-size:16px;">/mo</span></div><ul style="list-style:none;margin:0 0 32px;padding:0;display:flex;flex-direction:column;gap:12px;"><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#374151;"><span style="color:#10b981;font-weight:700;">✓</span>5 Projects</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#374151;"><span style="color:#10b981;font-weight:700;">✓</span>10 GB Storage</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#94a3b8;"><span>✗</span>Custom Domain</li></ul><a href="#" style="display:block;text-align:center;padding:14px;border:2px solid #6366f1;color:#6366f1;border-radius:10px;font-weight:700;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#6366f1'">Get Started</a></div><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:24px;padding:40px;box-shadow:0 20px 60px rgba(99,102,241,0.35);transform:scale(1.05);position:relative;"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);padding:4px 16px;background:#f59e0b;color:white;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:0.08em;white-space:nowrap;">MOST POPULAR</span><p style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Pro</p><div style="display:flex;align-items:baseline;gap:4px;margin-bottom:24px;"><span style="font-size:48px;font-weight:900;color:white;">$29</span><span style="color:rgba(255,255,255,0.7);font-size:16px;">/mo</span></div><ul style="list-style:none;margin:0 0 32px;padding:0;display:flex;flex-direction:column;gap:12px;"><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:white;"><span style="font-weight:700;">✓</span>Unlimited Projects</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:white;"><span style="font-weight:700;">✓</span>100 GB Storage</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:white;"><span style="font-weight:700;">✓</span>Custom Domain</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:rgba(255,255,255,0.7);"><span>✗</span>Priority Support</li></ul><a href="#" style="display:block;text-align:center;padding:14px;background:white;color:#6366f1;border-radius:10px;font-weight:700;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.9)'" onmouseout="this.style.background='white'">Get Pro</a></div><div style="background:white;border-radius:20px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;"><p style="font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Enterprise</p><div style="display:flex;align-items:baseline;gap:4px;margin-bottom:24px;"><span style="font-size:48px;font-weight:900;color:#0f172a;">$99</span><span style="color:#64748b;font-size:16px;">/mo</span></div><ul style="list-style:none;margin:0 0 32px;padding:0;display:flex;flex-direction:column;gap:12px;"><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#374151;"><span style="color:#10b981;font-weight:700;">✓</span>Unlimited Everything</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#374151;"><span style="color:#10b981;font-weight:700;">✓</span>1 TB Storage</li><li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#374151;"><span style="color:#10b981;font-weight:700;">✓</span>Priority Support</li></ul><a href="#" style="display:block;text-align:center;padding:14px;border:2px solid #6366f1;color:#6366f1;border-radius:10px;font-weight:700;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='#6366f1';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#6366f1'">Contact Sales</a></div></div></div></section>`,

  testimonial: `<section style="padding:80px 40px;background:linear-gradient(135deg,#f8fafc,#eff6ff);font-family:system-ui,sans-serif;"><div style="max-width:1000px;margin:0 auto;"><div style="text-align:center;margin-bottom:60px;"><h2 style="font-size:clamp(36px,5vw,52px);font-weight:900;color:#0f172a;letter-spacing:-0.02em;margin:0 0 16px;">Loved by Thousands</h2><p style="font-size:18px;color:#64748b;margin:0;">See what our customers are saying.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">` +
    [['S','#6366f1','#8b5cf6','Sarah Chen','Head of Design, TechCorp','"WebEdit-r transformed how we build landing pages. What used to take days now takes hours. Absolutely incredible."'],['M','#10b981','#059669','Marcus Rodriguez','CTO, StartupXYZ','"The drag and drop is buttery smooth and the AI assistant generates beautiful code. Best investment we\'ve made."'],['A','#f59e0b','#d97706','Aisha Patel','Freelance Designer','"Finally a tool that doesn\'t get in the way. Clean interface, powerful features, and the HTML output is production-ready."']].map(([init,c1,c2,name,role,quote]) =>
      `<div style="background:white;padding:32px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #f1f5f9;"><div style="color:#f59e0b;font-size:18px;letter-spacing:2px;margin-bottom:16px;">★★★★★</div><p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">${quote}</p><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;background:linear-gradient(135deg,${c1},${c2});border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;flex-shrink:0;">${init}</div><div><div style="font-weight:700;color:#0f172a;font-size:14px;">${name}</div><div style="color:#64748b;font-size:12px;">${role}</div></div></div></div>`
    ).join('') + `</div></div></section>`,

  footer: `<footer style="background:#0f172a;padding:64px 40px 32px;color:white;font-family:system-ui,sans-serif;"><div style="max-width:1100px;margin:0 auto;"><div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px;"><div><div style="font-size:22px;font-weight:900;background:linear-gradient(135deg,#6366f1,#a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px;">YourBrand</div><p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;max-width:240px;">Building the future of web design, one pixel at a time.</p><div style="display:flex;gap:10px;"><a href="#" style="width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;text-decoration:none;color:white;font-size:14px;font-weight:700;transition:all 0.2s;" onmouseover="this.style.background='#6366f1'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">𝕏</a><a href="#" style="width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;text-decoration:none;color:white;font-size:14px;font-weight:700;transition:all 0.2s;" onmouseover="this.style.background='#6366f1'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">in</a><a href="#" style="width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;text-decoration:none;color:white;font-size:14px;font-weight:700;transition:all 0.2s;" onmouseover="this.style.background='#6366f1'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">GH</a></div></div><div><h4 style="font-size:12px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 20px;">Product</h4><div style="display:flex;flex-direction:column;gap:10px;"><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Features</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Pricing</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Changelog</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Roadmap</a></div></div><div><h4 style="font-size:12px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 20px;">Company</h4><div style="display:flex;flex-direction:column;gap:10px;"><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">About</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Blog</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Careers</a></div></div><div><h4 style="font-size:12px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 20px;">Legal</h4><div style="display:flex;flex-direction:column;gap:10px;"><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Privacy</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Terms</a><a href="#" style="color:#94a3b8;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">Cookies</a></div></div></div><div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;"><p style="color:#475569;font-size:13px;margin:0;">© 2025 YourBrand. All rights reserved.</p><p style="color:#475569;font-size:13px;margin:0;">Built with ♥ using WebEdit-r</p></div></div></footer>`,
};

// ── Category definitions ───────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'basic',
    name: 'Temel',
    components: [
      { id: 'text',      name: 'Text',      icon: '¶',   color: '#3b82f6' },
      { id: 'heading',   name: 'Başlık',    icon: 'H',   color: '#8b5cf6' },
      { id: 'button',    name: 'Button',    icon: '▶',   color: '#10b981' },
      { id: 'image',     name: 'Resim',     icon: '⊞',   color: '#f59e0b' },
      { id: 'link',      name: 'Link',      icon: '⇗',   color: '#06b6d4' },
      { id: 'container', name: 'Container', icon: '▭',   color: '#6366f1' },
    ],
  },
  {
    key: 'forms',
    name: 'Form',
    components: [
      { id: 'input',    name: 'Input',    icon: '▱',  color: '#3b82f6' },
      { id: 'textarea', name: 'Textarea', icon: '▬',  color: '#8b5cf6' },
      { id: 'checkbox', name: 'Checkbox', icon: '☑',  color: '#10b981' },
      { id: 'radio',    name: 'Radio',    icon: '◉',  color: '#f59e0b' },
      { id: 'select',   name: 'Select',   icon: '▾',  color: '#06b6d4' },
      { id: 'form',     name: 'Form',     icon: '≡',  color: '#6366f1' },
    ],
  },
  {
    key: 'advanced',
    name: 'Gelişmiş',
    components: [
      { id: 'slider',   name: 'Slider',   icon: '⊸',  color: '#3b82f6' },
      { id: 'calendar', name: 'Takvim',   icon: '⊡',  color: '#8b5cf6' },
      { id: 'timer',    name: 'Timer',    icon: '◷',  color: '#10b981' },
      { id: 'progress', name: 'Progress', icon: '▰',  color: '#f59e0b' },
      { id: 'rating',   name: 'Rating',   icon: '★',  color: '#06b6d4' },
      { id: 'toggle',   name: 'Toggle',   icon: '⏻',  color: '#6366f1' },
    ],
  },
  {
    key: 'media',
    name: 'Medya',
    components: [
      { id: 'video',    name: 'Video',    icon: '▷',  color: '#3b82f6' },
      { id: 'audio',    name: 'Audio',    icon: '♪',  color: '#8b5cf6' },
      { id: 'gallery',  name: 'Galeri',   icon: '⊟',  color: '#10b981' },
      { id: 'carousel', name: 'Carousel', icon: '↔',  color: '#f59e0b' },
      { id: 'iframe',   name: 'iFrame',   icon: '⊕',  color: '#06b6d4' },
    ],
  },
  {
    key: 'layout',
    name: 'Layout',
    components: [
      { id: 'grid',      name: 'Grid',      icon: '⊞',  color: '#3b82f6' },
      { id: 'flex',      name: 'Flexbox',   icon: '⊣',  color: '#8b5cf6' },
      { id: 'card',      name: 'Card',      icon: '▤',  color: '#10b981' },
      { id: 'modal',     name: 'Modal',     icon: '⊡',  color: '#f59e0b' },
      { id: 'tabs',      name: 'Tabs',      icon: '⊨',  color: '#06b6d4' },
      { id: 'accordion', name: 'Accordion', icon: '≣',  color: '#6366f1' },
    ],
  },
  {
    key: 'charts',
    name: 'Grafikler',
    components: [
      { id: 'linechart', name: 'Line Chart', icon: '↗',  color: '#3b82f6' },
      { id: 'barchart',  name: 'Bar Chart',  icon: '▐',  color: '#8b5cf6' },
      { id: 'piechart',  name: 'Pie Chart',  icon: '◔',  color: '#10b981' },
      { id: 'table',     name: 'Table',      icon: '▦',  color: '#f59e0b' },
    ],
  },
  {
    key: 'sections',
    name: 'Bölümler',
    components: [
      { id: 'navbar',      name: 'Navbar',       icon: '≡',  color: '#6366f1' },
      { id: 'hero',        name: 'Hero',         icon: '⬡',  color: '#8b5cf6' },
      { id: 'features',    name: 'Özellikler',   icon: '⊞',  color: '#10b981' },
      { id: 'pricing',     name: 'Fiyatlandırma',icon: '$',  color: '#f59e0b' },
      { id: 'testimonial', name: 'Yorumlar',     icon: '❝',  color: '#06b6d4' },
      { id: 'footer',      name: 'Footer',       icon: '▃',  color: '#ec4899' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
const AdvancedToolbox = ({ onAddComponent }) => {
  const [activeCategory, setActiveCategory] = useState('basic');

  const cat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Category tabs — scrollable row */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '10px 12px',
        borderBottom: '1px solid #374151',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            style={{
              padding: '5px 10px',
              background: activeCategory === c.key
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Component grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {cat.components.map(comp => (
            <button
              key={comp.id}
              onClick={() => onAddComponent(TEMPLATES[comp.id] || `<div>${comp.name}</div>`)}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('text/html', TEMPLATES[comp.id] || `<div>${comp.name}</div>`);
              }}
              title={`Click to insert ${comp.name}`}
              style={{
                padding: '14px 8px',
                background: '#2d3748',
                border: `2px solid transparent`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = comp.color;
                e.currentTarget.style.background = '#374151';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.background = '#2d3748';
              }}
            >
              <span style={{
                width: '36px',
                height: '36px',
                background: `linear-gradient(135deg, ${comp.color}22, ${comp.color}44)`,
                border: `1px solid ${comp.color}66`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: comp.color,
                fontWeight: '700',
              }}>
                {comp.icon}
              </span>
              <span style={{ color: '#d1d5db', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>
                {comp.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedToolbox;
