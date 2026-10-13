# -*- coding: utf-8 -*-
"""Extract textbook content (text + page images) into a static-site data file."""
import os, re, json
import pymupdf as fitz

ROOT = "E:/动画制作/高一地理"
SITE = os.path.join(ROOT, "site")
PAGES_DIR = os.path.join(SITE, "assets", "pages")
os.makedirs(PAGES_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Structure (from the two 目录 / tables of contents), in document order.
#   search : distinctive string used to locate the section's first body page
#   page   : printed page number (from TOC) for display only
# ---------------------------------------------------------------------------
BOOKS = [
    {
        "id": "book1",
        "title": "人教版 高中地理 必修 第一册",
        "short": "必修 第一册",
        "file": "《人教版高中必修+第一册地理》.pdf",
        "chapters": [
            {"num": "第一章", "title": "宇宙中的地球", "page": 1, "intro_search": "宇宙中的地球", "sections": [
                {"name": "地球的宇宙环境", "search": "地球的宇宙环境", "page": 2},
                {"name": "太阳对地球的影响", "search": "太阳对地球的影响", "page": 8},
                {"name": "地球的历史", "search": "地球的历史", "page": 14},
                {"name": "地球的圈层结构", "search": "地球的圈层结构", "page": 21},
                {"name": "问题研究：火星基地应该是什么样子", "search": "火星基地应该是什么样子", "page": 25, "kind": "research"},
            ]},
            {"num": "第二章", "title": "地球上的大气", "page": 28, "intro_search": "地球上的大气", "sections": [
                {"name": "大气的组成和垂直分层", "search": "大气的组成和垂直分层", "page": 28},
                {"name": "大气受热过程和大气运动", "search": "大气受热过程和大气运动", "page": 34},
                {"name": "问题研究：何时“蓝天”常在", "search": "蓝天", "page": 42, "kind": "research"},
            ]},
            {"num": "第三章", "title": "地球上的水", "page": 46, "intro_search": "地球上的水", "sections": [
                {"name": "水循环", "search": "水循环", "page": 46},
                {"name": "海水的性质", "search": "海水的性质", "page": 50},
                {"name": "海水的运动", "search": "海水的运动", "page": 57},
                {"name": "问题研究：能否淡化海冰缓解环渤海地区淡水短缺", "search": "淡化海冰缓解环渤海", "page": 63, "kind": "research"},
            ]},
            {"num": "第四章", "title": "地貌", "page": 66, "intro_search": "地貌", "sections": [
                {"name": "常见地貌类型", "search": "常见地貌类型", "page": 66},
                {"name": "地貌的观察", "search": "地貌的观察", "page": 76},
                {"name": "问题研究：如何提升我国西南喀斯特峰丛山地的经济发展水平", "search": "西南喀斯特峰丛山地", "page": 79, "kind": "research"},
            ]},
            {"num": "第五章", "title": "植被与土壤", "page": 82, "intro_search": "植被与土壤", "sections": [
                {"name": "植被", "search": "植被", "page": 82},
                {"name": "土壤", "search": "土壤", "page": 88},
                {"name": "问题研究：如何让城市不再“看海”", "search": "看海", "page": 96, "kind": "research"},
            ]},
            {"num": "第六章", "title": "自然灾害", "page": 100, "intro_search": "自然灾害", "sections": [
                {"name": "气象灾害", "search": "气象灾害", "page": 100},
                {"name": "地质灾害", "search": "地质灾害", "page": 106},
                {"name": "防灾减灾", "search": "防灾减灾", "page": 110},
                {"name": "地理信息技术在防灾减灾中的应用", "search": "地理信息技术在防灾减灾中的应用", "page": 114},
                {"name": "问题研究：救灾物资储备库应该建在哪里", "search": "救灾物资储备库", "page": 120, "kind": "research"},
            ]},
            {"num": "附录", "title": "附录", "page": 122, "intro_search": "主要地理词汇中英文对照表", "sections": [
                {"name": "本书主要地理词汇中英文对照表", "search": "主要地理词汇中英文对照表", "page": 122, "kind": "appendix"},
                {"name": "本套书常用地图图例", "search": "常用地图图例", "page": 124, "kind": "appendix"},
            ]},
        ],
    },
    {
        "id": "book2",
        "title": "人教版 高中地理 必修 第二册",
        "short": "必修 第二册",
        "file": "《人教版高中必修+第二册地理》.pdf",
        "chapters": [
            {"num": "第一章", "title": "人口", "page": 1, "intro_search": "人口", "sections": [
                {"name": "人口分布", "search": "人口分布", "page": 2},
                {"name": "人口迁移", "search": "人口迁移", "page": 8},
                {"name": "人口容量", "search": "人口容量", "page": 16},
                {"name": "问题研究：如何看待农民工现象", "search": "农民工现象", "page": 21, "kind": "research"},
            ]},
            {"num": "第二章", "title": "乡村和城镇", "page": 24, "intro_search": "乡村和城镇", "sections": [
                {"name": "乡村和城镇空间结构", "search": "乡村和城镇空间结构", "page": 24},
                {"name": "城镇化", "search": "城镇化", "page": 31},
                {"name": "地域文化与城乡景观", "search": "地域文化与城乡景观", "page": 42},
                {"name": "问题研究：从市中心到郊区，你选择住在哪里", "search": "从市中心到郊区", "page": 51, "kind": "research"},
            ]},
            {"num": "第三章", "title": "产业区位因素", "page": 54, "intro_search": "产业区位因素", "sections": [
                {"name": "农业区位因素及其变化", "search": "农业区位因素及其变化", "page": 54},
                {"name": "工业区位因素及其变化", "search": "工业区位因素及其变化", "page": 63},
                {"name": "服务业区位因素及其变化", "search": "服务业区位因素及其变化", "page": 71},
                {"name": "问题研究：实体商店何去何从", "search": "实体商店", "page": 77, "kind": "research"},
            ]},
            {"num": "第四章", "title": "交通运输布局与区域发展", "page": 80, "intro_search": "交通运输布局与区域发展", "sections": [
                {"name": "区域发展对交通运输布局的影响", "search": "区域发展对交通运输布局的影响", "page": 80},
                {"name": "交通运输布局对区域发展的影响", "search": "交通运输布局对区域发展的影响", "page": 87},
                {"name": "问题研究：城市交通如何疏堵", "search": "城市交通如何疏堵", "page": 93, "kind": "research"},
            ]},
            {"num": "第五章", "title": "环境与发展", "page": 96, "intro_search": "环境与发展", "sections": [
                {"name": "人类面临的主要环境问题", "search": "人类面临的主要环境问题", "page": 96},
                {"name": "走向人地协调——可持续发展", "search": "走向人地协调", "page": 101},
                {"name": "中国国家发展战略举例", "search": "中国国家发展战略举例", "page": 109},
                {"name": "问题研究：低碳食品知多少", "search": "低碳食品", "page": 120, "kind": "research"},
            ]},
            {"num": "附录", "title": "附录", "page": 123, "intro_search": "主要地理词汇中英文对照表", "sections": [
                {"name": "本书主要地理词汇中英文对照表", "search": "主要地理词汇中英文对照表", "page": 123, "kind": "appendix"},
                {"name": "本套书常用地图图例", "search": "常用地图图例", "page": 124, "kind": "appendix"},
            ]},
        ],
    },
]

# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------
GOOD = re.compile(
    r'[\u3400-\u9fff\u3000-\u303f\uff00-\uffef0-9a-zA-Z'
    r'，。！？；：“”‘’（）《》【】〔〕、\.\,\!\?\;\:\'\"\(\)\-\+＝＝\=\*\/\\'
    r'\u2460-\u2473\u249c-\u24b5\u25a0-\u25ff\u2190-\u21ff\u2200-\u22ff'
    r'\u00b0\u2103\u2109\%\&\#\@\$\^\~\·\…\—\－\─\│\┌\┐\└\┘\├\┤\┬\┴\┼\━\•\○\●]'
)
HEADING = re.compile(r'^第[一二三四五六七八九十百\d]+[章节]')
def is_good_line(line):
    s = line.strip()
    if not s:
        return False
    good = sum(1 for ch in s if GOOD.match(ch))
    return (good / len(s)) >= 0.5

def clean_page(text):
    lines = text.split("\n")
    out = []
    i = 0
    # drop the running header at the very top (chapter/section title line + page number)
    if i < len(lines) and HEADING.match(lines[i].strip()):
        i += 1
        if i < len(lines) and re.fullmatch(r'\s*\d+\s*', lines[i]):
            i += 1
    for line in lines[i:]:
        s = line.strip()
        if not s:
            continue
        if re.fullmatch(r'\s*\d+\s*', s):   # standalone page number
            continue
        if not is_good_line(s):             # garbage artifact line from special boxes
            continue
        out.append(s)
    return out

# ---------------------------------------------------------------------------
# Locate a section's first body page by monotonic forward search.
# ---------------------------------------------------------------------------
def find_start(needle, page_texts, cursor, is_regex=False):
    pat = re.compile(needle) if is_regex else None
    for idx in range(cursor, len(page_texts)):
        if is_regex:
            if pat.search(page_texts[idx]):
                return idx
        else:
            if needle in page_texts[idx]:
                return idx
    raise RuntimeError(f"cannot find section: {needle}")

# ---------------------------------------------------------------------------
# Render a single pdf page to JPEG.
# ---------------------------------------------------------------------------
def render_page(doc, idx, book_id):
    page = doc[idx]
    zoom = 1000 / page.rect.width
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    pdf_pageno = idx + 1
    name = f"p{pdf_pageno:03d}.jpg"
    path = os.path.join(PAGES_DIR, book_id, name)
    if not os.path.exists(path):
        try:
            pix.save(path, jpg_quality=78)
        except TypeError:
            pix.save(path)
    return f"{book_id}/{name}"

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    out_books = []
    for book in BOOKS:
        print(f"\n=== {book['title']} ===")
        doc = fitz.open(os.path.join(ROOT, book["file"]))
        n = doc.page_count
        page_texts = [doc[i].get_text("text") for i in range(n)]
        book_id = book["id"]

        # ---- locate each node's start by its HEADING pattern (monotonic, plate-agnostic) ----
        # body_start = first pdf page showing "第一章" but NOT the 目录 (TOC) page
        body_start = next(i for i in range(4, n)
                          if "第一章" in page_texts[i] and "目录" not in page_texts[i])

        QUOTES = "“”\"'"
        def quote_safe(s):
            out = []
            for ch in s:
                if ch in QUOTES:
                    out.append("[\u201c\u201d\"']?\\s?")
                else:
                    out.append(re.escape(ch) + r"\s?")
            return "".join(out)

        def make_pat(ch, sec, kind):
            if kind == "intro":
                return r"第[一二三四五六七八九十百]+章\s*" + quote_safe(ch["title"])
            if kind == "research":
                topic = re.sub(r'^问题研究[:：]\s*', '', sec["name"])
                return r"(?:问题研究[\s\S]{0,30}?)?" + quote_safe(topic)
            if kind == "appendix":
                return quote_safe(sec["name"])
            return r"第[一二三四五六七八九十百]+节\s*" + quote_safe(sec["name"])

        plan = []
        for ci, ch in enumerate(book["chapters"]):
            if ch["num"] != "附录":
                plan.append({"kind": "intro", "name": ch["title"], "chapter": ch, "ci": ci,
                             "page": ch["page"], "pat": make_pat(ch, None, "intro")})
            for sj, sec in enumerate(ch["sections"]):
                plan.append({"kind": sec.get("kind", "section"), "name": sec["name"],
                             "chapter": ch, "ci": ci, "si": sj,
                             "page": sec["page"], "pat": make_pat(ch, sec, sec.get("kind", "section"))})

        # monotonic forward search; heading pattern prevents catching
        # cross-references (e.g. "植被" mentioned inside the 土壤 section).
        cursor = body_start
        for item in plan:
            pat = re.compile(item["pat"])
            hit = next((i for i in range(cursor, n) if pat.search(page_texts[i])), None)
            if hit is None:
                raise RuntimeError(f"cannot locate: {item['pat']}")
            item["s_idx"] = hit
            cursor = hit + 1
        for k in range(len(plan)):
            plan[k]["e_idx"] = (plan[k + 1]["s_idx"] - 1) if k + 1 < len(plan) else n - 1

        # ---- emit chapters/sections ----
        out_chapters = []
        for ci, ch in enumerate(book["chapters"]):
            ch_sections_out = []
            for item in plan:
                if item["ci"] != ci:
                    continue
                s, e = item["s_idx"], item["e_idx"]
                if e < s:
                    e = s
                tlines = []
                for p in range(s, e + 1):
                    tlines += clean_page(page_texts[p])
                stext = "\n".join(tlines)
                spages = [render_page(doc, p, book_id) for p in range(s, e + 1)]
                if item["kind"] == "intro":
                    tid = f"{book_id}-c{ci+1}-intro"
                    ttitle = f"{ch['num']} {ch['title']}（本章导引）"
                else:
                    tid = f"{book_id}-c{ci+1}-s{item['si']+1}"
                    ttitle = item["name"]
                ch_sections_out.append({
                    "id": tid, "kind": item["kind"], "title": ttitle,
                    "page": item["page"], "text": stext, "pages": spages,
                })
            out_chapters.append({
                "num": ch["num"], "title": ch["title"], "page": ch["page"],
                "sections": ch_sections_out,
            })
            print(f"  {ch['num']} {ch['title']}: {len(ch_sections_out)} nodes")

        out_books.append({
            "id": book_id,
            "title": book["title"],
            "short": book["short"],
            "chapters": out_chapters,
        })
        doc.close()

    # write content.js
    data_path = os.path.join(SITE, "data", "content.js")
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    with open(data_path, "w", encoding="utf-8") as f:
        f.write("window.BOOKS = ")
        json.dump(out_books, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print("\nWrote", data_path)
    # stats
    total_sections = sum(len(c["sections"]) for b in out_books for c in b["chapters"])
    print("books:", len(out_books), "sections:", total_sections)

if __name__ == "__main__":
    main()
