const fs = require('fs');
const SNIP = [
'<!-- ISKRA AI webchat widget -->',
'<script>',
'(function(){',
"  var SLUG='sklz', API='https://www.iskra.marketing/api/chat', CONV=null, open=false, greeted=false, busy=false;",
"  try{ CONV=localStorage.getItem('iskra_conv_'+SLUG)||null; }catch(e){}",
"  var css=document.createElement('style');",
"  css.textContent='#ikFab{position:fixed;right:20px;bottom:20px;z-index:99990;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#0ea5e9);color:#fff;border:0;font-size:23px;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.35)}#ikPanel{position:fixed;right:18px;bottom:90px;z-index:99991;width:min(360px,calc(100vw - 28px));height:min(500px,calc(100vh - 120px));background:#0f1523;border:1px solid #223;border-radius:16px;box-shadow:0 22px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif}#ikPanel.on{display:flex}.ikHd{background:#141b2e;color:#fff;padding:13px 15px;display:flex;align-items:center;gap:9px}.ikHd .av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#0ea5e9);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}.ikHd b{font-size:14px;display:block}.ikHd span{font-size:11px;color:#7dd3fc}.ikHd .x{margin-left:auto;background:none;border:0;color:#fff;font-size:17px;cursor:pointer;opacity:.8}.ikMs{flex:1;overflow-y:auto;padding:12px;background:#0b1020;display:flex;flex-direction:column;gap:9px}.ikM{max-width:84%;padding:9px 12px;border-radius:12px;font-size:13px;line-height:1.55;white-space:pre-wrap;color:#e6ecf7}.ikM.b{background:#141b2e;border:1px solid #223;border-bottom-left-radius:4px;align-self:flex-start}.ikM.u{background:#1d4ed8;border-bottom-right-radius:4px;align-self:flex-end}.ikIn{display:flex;gap:7px;padding:9px;border-top:1px solid #223;background:#0f1523}.ikIn input{flex:1;border:1px solid #2a3550;background:#0b1020;color:#e6ecf7;border-radius:999px;padding:9px 14px;font-size:13px;outline:none}.ikIn button{background:#22c55e;color:#06220f;border:0;border-radius:50%;width:38px;height:38px;font-size:14px;cursor:pointer;flex-shrink:0}.ikTy{display:inline-flex;gap:4px;padding:10px 13px;background:#141b2e;border:1px solid #223;border-radius:12px;align-self:flex-start}.ikTy i{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:ikp 1s infinite}.ikTy i:nth-child(2){animation-delay:.16s}.ikTy i:nth-child(3){animation-delay:.32s}@keyframes ikp{0%,100%{opacity:.3}50%{opacity:1}}';",
'  document.head.appendChild(css);',
"  var fab=document.createElement('button'); fab.id='ikFab'; fab.textContent='\\uD83D\\uDCAC'; fab.setAttribute('aria-label','Chat');",
"  var p=document.createElement('div'); p.id='ikPanel';",
'  p.innerHTML=\'<div class="ikHd"><div class="av">S</div><div><b>SKLZ AI</b><span>Ask about bots, tools & pricing</span></div><button class="x">\\u2715</button></div><div class="ikMs" id="ikMs"></div><div class="ikIn"><input id="ikI" placeholder="Ask anything\\u2026"/><button id="ikGo">\\u27A4</button></div>\';',
'  document.body.appendChild(fab); document.body.appendChild(p);',
"  function add(t,w){var m=document.getElementById('ikMs'),d=document.createElement('div');d.className='ikM '+w;d.textContent=t;m.appendChild(d);m.scrollTop=m.scrollHeight;}",
"  function typing(on){var m=document.getElementById('ikMs'),e=document.getElementById('ikTy');if(e)e.remove();if(on){var d=document.createElement('div');d.className='ikTy';d.id='ikTy';d.innerHTML='<i></i><i></i><i></i>';m.appendChild(d);m.scrollTop=m.scrollHeight;}}",
'  function send(){',
"    if(busy)return; var i=document.getElementById('ikI'),q=(i.value||'').trim(); if(q==='')return;",
"    i.value=''; add(q,'u'); typing(true); busy=true;",
"    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tenantSlug:SLUG,channel:'webchat',message:q,conversationId:CONV})})",
'    .then(function(r){return r.json();}).then(function(d){',
'      typing(false); busy=false;',
"      if(d&&d.conversationId){CONV=d.conversationId;try{localStorage.setItem('iskra_conv_'+SLUG,CONV)}catch(e){}}",
"      add((d&&(d.reply||d.error))||'Sorry \\u2014 something went wrong.','b');",
"    }).catch(function(){typing(false);busy=false;add('Connection problem \\u2014 please try again.','b');});",
'  }',
"  fab.onclick=function(){open=(open===false);p.classList.toggle('on',open);if(open){if(greeted===false){greeted=true;add('Welcome to SKLZ Labs \\uD83D\\uDC4B I am SKLZ AI. Ask me about our MT5 bots, indicators, analytics, pricing \\u2014 or join the copy-trading waitlist.','b');}document.getElementById('ikI').focus();}};",
"  p.querySelector('.x').onclick=function(){open=false;p.classList.remove('on');};",
"  document.getElementById('ikGo').onclick=send;",
"  document.getElementById('ikI').addEventListener('keydown',function(e){if(e.key==='Enter')send();});",
'})();',
'</scr'+'ipt>',
'<!-- /ISKRA widget -->'
].join('\n');
const files = fs.readdirSync('.').filter(function(f){ return f.endsWith('.html'); });
let done = [], skipped = [];
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  if (s.indexOf('ikFab') >= 0) { skipped.push(f); continue; }
  if (s.indexOf('</body>') < 0) { skipped.push(f + ' (no body tag)'); continue; }
  fs.copyFileSync(f, f + '.bakwidget');
  s = s.replace('</body>', SNIP + '\n</body>');
  fs.writeFileSync(f, s);
  done.push(f);
}
console.log('Widget injected into: ' + (done.join(', ') || 'NONE'));
if (skipped.length) console.log('Skipped: ' + skipped.join(', '));
