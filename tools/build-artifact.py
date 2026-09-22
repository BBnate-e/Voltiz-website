"""Construit la version « aperçu » (Artifact) de index.html : garde le contenu entre les repères a:head et a:body."""
import re, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "index.html").read_text(encoding="utf-8")
head = re.search(r"<!-- a:head -->(.*?)<!-- /a:head -->", src, re.S).group(1)
body = re.search(r"<!-- a:body -->(.*?)<!-- /a:body -->", src, re.S).group(1)
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / "preview.html")
out.write_text(head.strip() + "\n" + body.strip() + "\n", encoding="utf-8")
print(out)
