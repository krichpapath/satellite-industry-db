from pathlib import Path
import zipfile
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parents[2]
reference_dir = root / "docs" / "reference"

for path in [
    reference_dir / "Draft ideas for database development.docx",
    reference_dir / "Inception_report.docx",
]:
    out = path.with_suffix(".txt")
    with zipfile.ZipFile(path) as z:
        with z.open("word/document.xml") as f:
            tree = ET.parse(f)
    paras = []
    for p in tree.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts = [t.text for t in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t") if t.text]
        paras.append("".join(texts))
    with open(out, "w", encoding="utf-8") as o:
        o.write("\n".join(paras))
    print(out, len(paras))
