"""Minimal static server for the SKLZ Labs landing page on Railway.
Serves index.html and assets. Reads PORT from env (Railway sets it).

Supports HTTP Range requests. Academy lesson videos are served from
/media/academy/, and without ranges a <video> element cannot seek at all —
iOS Safari refuses to play a media file that comes back as a plain 200.

Threaded, because a single-threaded server would let one viewer streaming a
60-second lesson block every other request to the site.

The HTTP protocol version stays at the stdlib default (HTTP/1.0): a range is a
per-response contract and works fine without keep-alive. Everything not handled
here — HEAD, conditional GETs, directory redirects, 404s, path sanitisation —
falls through to SimpleHTTPRequestHandler untouched.
"""
import http.server
import os
import re
import socketserver

PORT = int(os.environ.get("PORT", "8080"))
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")
CHUNK = 64 * 1024


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        if self.path.startswith("/media/"):
            # content-addressed by filename; safe to cache hard
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "public, max-age=300")
        super().end_headers()

    def do_GET(self):
        rng = (self.headers.get("Range") or "").strip()
        if not rng:
            return super().do_GET()
        m = RANGE_RE.match(rng)
        if not m:
            return super().do_GET()

        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().do_GET()
        size = os.path.getsize(path)

        first, last = m.group(1), m.group(2)
        if first == "":
            if last == "":                       # "bytes=-" is malformed
                return super().do_GET()
            length = min(int(last), size)        # suffix range: last N bytes
            start, end = size - length, size - 1
        else:
            start = int(first)
            end = int(last) if last else size - 1
            end = min(end, size - 1)

        if start >= size or start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return

        with f:
            f.seek(start)
            remaining = end - start + 1
            self.send_response(206)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Content-Length", str(remaining))
            self.send_header(
                "Last-Modified",
                self.date_time_string(int(os.fstat(f.fileno()).st_mtime)))
            self.end_headers()
            while remaining > 0:
                buf = f.read(min(CHUNK, remaining))
                if not buf:
                    break
                try:
                    self.wfile.write(buf)
                except (BrokenPipeError, ConnectionResetError):
                    return       # viewer seeked away or closed the tab
                remaining -= len(buf)


class Server(socketserver.ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = True


with Server(("", PORT), Handler) as httpd:
    print(f"SKLZ Labs site serving on :{PORT}")
    httpd.serve_forever()
