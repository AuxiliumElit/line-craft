"""Small dependency-free validation pass for the static LineCraft website."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[str] = []
        self.images: list[dict[str, str | None]] = []
        self.scripts: list[dict[str, str | None]] = []
        self.current_json_ld: list[str] | None = None
        self.json_ld_blocks: list[str] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.meta: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "a" and values.get("href"):
            self.links.append(values["href"] or "")
        if tag == "img":
            self.images.append(values)
        if tag == "meta":
            self.meta.append(values)
        if tag == "script":
            self.scripts.append(values)
            if values.get("type") == "application/ld+json":
                self.current_json_ld = []
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.current_json_ld is not None:
            self.json_ld_blocks.append("".join(self.current_json_ld).strip())
            self.current_json_ld = None
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.current_json_ld is not None:
            self.current_json_ld.append(data)
        if self.in_title:
            self.title_parts.append(data)


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []
    html_path = ROOT / "index.html"
    css_path = ROOT / "styles.css"
    js_path = ROOT / "script.js"

    for path in (html_path, css_path, js_path):
        if not path.exists():
            fail(f"Missing required file: {path.name}", errors)

    if errors:
        print("\n".join(errors))
        return 1

    html = html_path.read_text(encoding="utf-8")
    css = css_path.read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(html)

    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates:
        fail(f"Duplicate HTML ids: {', '.join(duplicates)}", errors)

    id_set = set(parser.ids)
    for href in parser.links:
        if href.startswith("#") and href != "#" and href[1:] not in id_set:
            fail(f"Anchor target does not exist: {href}", errors)

    for image in parser.images:
        if "alt" not in image:
            fail(f"Image is missing alt text: {image.get('src', '<unknown>')}", errors)

    local_references = set(
        re.findall(r'(?:src|href)="([^"]+)"', html)
        + re.findall(r'url\(["\']?([^)"\']+)', css)
    )
    for reference in sorted(local_references):
        parsed = urlparse(reference)
        if (
            parsed.scheme
            or reference.startswith(("#", "tel:", "mailto:"))
            or reference == "/"
        ):
            continue
        path = ROOT / reference.split("#", 1)[0].split("?", 1)[0]
        if not path.exists():
            fail(f"Missing local reference: {reference}", errors)

    for block in parser.json_ld_blocks:
        try:
            json.loads(block)
        except json.JSONDecodeError as exc:
            fail(f"Invalid JSON-LD: {exc}", errors)

    title = "".join(parser.title_parts).strip()
    if not title:
        fail("Missing page title", errors)

    description = next(
        (item.get("content") for item in parser.meta if item.get("name") == "description"),
        None,
    )
    if not description:
        fail("Missing meta description", errors)

    for required in ("og:title", "og:description", "og:image"):
        if not any(item.get("property") == required for item in parser.meta):
            fail(f"Missing Open Graph tag: {required}", errors)

    if css.count("{") != css.count("}"):
        fail("CSS braces are unbalanced", errors)

    required_files = [
        ROOT / "robots.txt",
        ROOT / "sitemap.xml",
        ROOT / "site.webmanifest",
        ROOT / "assets" / "linecraft-logo.webp",
        ROOT / "assets" / "hero-bathroom.webp",
    ]
    for path in required_files:
        if not path.exists():
            fail(f"Missing launch asset: {path.relative_to(ROOT)}", errors)

    if errors:
        print("Validation failed:")
        print("\n".join(f"- {message}" for message in errors))
        return 1

    print(
        "Validation passed: "
        f"{len(parser.ids)} ids, "
        f"{len(parser.images)} images, "
        f"{len(local_references)} local/remote references, "
        f"{len(parser.json_ld_blocks)} JSON-LD block."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
