"""Minimal static server for the SKLZ Labs landing page on Railway.
Serves index.html and assets. Reads PORT from env (Railway sets it)."""
import http.server, os, socketserver

PORT = int(os.environ.get("PORT", "8080"))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "public, max-age=300")
        super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"SKLZ Labs site serving on :{PORT}")
    httpd.serve_forever()
