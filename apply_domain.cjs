const fs=require('fs'),cp=require('child_process');
const F='server-db.mjs';
let s=fs.readFileSync(F,'utf8');
if(s.includes('CUSTOM_DOMAIN_MAP')){ console.log('Already patched.'); process.exit(0); }
// Anchor: the very start of the request handler body. We inject right after the Otium/Tatiana site blocks
// by placing our host-rewrite BEFORE the landing/root routing. Use the POS route anchor as insertion point
// but our logic must run EARLY — so we hook at the tatiana site block which we know exists.
const A="  // ===== TATIANA_SITE (public beauty demo) =====";
if(s.indexOf(A)===-1){ console.error('Tatiana site anchor not found — deploy the Tatiana page first.'); process.exit(1); }
const B=[
"  // ===== CUSTOM_DOMAIN_MAP (serve a tenant's site on their own domain) =====",
"  // Maps a bare hostname -> the tenant page it should show at the root.",
"  const CUSTOM_DOMAIN_MAP = {",
"    'kurtevapmu.com': 'tatiana.html',",
"    'www.kurtevapmu.com': 'tatiana.html'",
"  };",
"  {",
"    const _host = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];",
"    const _page = CUSTOM_DOMAIN_MAP[_host];",
"    if (_page) {",
"      const _path = (req.url || '/').split('?')[0];",
"      // Root of the custom domain -> serve that tenant's public page.",
"      if (req.method === 'GET' && (_path === '/' || _path === '/index.html')) {",
"        try {",
"          const _fs = await import('node:fs');",
"          const _html = _fs.readFileSync(new URL('./' + _page, import.meta.url), 'utf8');",
"          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(_html); return;",
"        } catch(e){ res.writeHead(500,{'Content-Type':'text/plain'}); res.end('page missing'); return; }",
"      }",
"      // Everything else (/dashboard, /clinic, /api/*, assets) falls through to the normal handler below,",
"      // so staff login and all app routes work on the custom domain too.",
"    }",
"  }",
"  // ===== /CUSTOM_DOMAIN_MAP =====",
"",""].join('\n');
fs.copyFileSync(F,F+'.bakdomain');
const i=s.indexOf(A);
s=s.slice(0,i)+B+s.slice(i);
fs.writeFileSync(F,s);
try{ cp.execSync('node --check '+F,{stdio:'pipe'}); console.log('OK — kurtevapmu.com now serves Tatiana at root; /dashboard, /clinic and /api work on it too.'); }
catch(e){ fs.copyFileSync(F+'.bakdomain',F); console.error('Syntax error — reverted.\n'+(e.stderr?e.stderr.toString():e.message)); process.exit(1); }
