"""Load everyday Walmart / Sam's Club grocery foods into vital_products.

Not a full store catalog. Store-brand foods still sold in the US, capped
under 4,000 SKUs people actually log. Does not touch Vital profiles.

Usage:
  py -3 scripts/import_vital_products.py          # parse + print counts
  py -3 scripts/import_vital_products.py --apply  # upsert into Supabase
"""

from __future__ import annotations

import csv
import io
import json
import os
import re
import sys
import time

sys.stdout.reconfigure(line_buffering=True)
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / ".cache"
USDA_ZIP = CACHE / "usda-branded.csv.zip"
USDA_URL = "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_branded_food_csv_2026-04-30.zip"
USDA_PREFIX = "FoodData_Central_branded_food_csv_2026-04-30/"
OFF_UA = "KaelumaVital/1.0 (https://kaeluma.com; family health tracker)"
NEED_NUTRIENTS = {"1008", "1003", "1004", "1005", "1079", "1062", "2047", "2048"}

OWNER_RE = re.compile(r"wal-?mart|walmart inc|sams?\s*west|sam'?s\s+club", re.I)
BRAND_RE = re.compile(
    r"great value|member'?s mark|marketside|bettergoods|freshness guaranteed|"
    r"parent'?s choice|daily chef|bakers? & chefs?|simply right|"
    r"clear american|sam'?s choice",
    re.I,
)
SKIP_RE = re.compile(
    r"mainstays|hyper tough|\bonn\b|ozark trail|athletic works|time and tru|"
    r"wonder nation|no boundaries",
    re.I,
)
SKIP_CAT = re.compile(
    r"baking decorations|seasoning mixes|herbs & spices|granulated, brown|"
    r"^water$|liquid water enhancer|flours & corn meal|baking additives|"
    r"tea bags|gravy mix|bread & muffin mixes|cake, cookie & cupcake mixes|"
    r"pastry shells|chewing gum|health care|specialty formula|digestive & fiber|"
    r"weight control|milk additives|powdered drinks|^baking$",
    re.I,
)
MAX_PRODUCTS = 3600
SAMS_TARGET = 1100
SAMS_RE = re.compile(
    r"member'?s mark|daily chef|bakers? & chef|simply right|sam'?s choice|"
    r"sams?\s*west|sam'?s\s+club",
    re.I,
)
WALMART_RE = re.compile(
    r"great value|marketside|\bequate\b|bettergoods|freshness guaranteed|"
    r"parent'?s choice|clear american|spring valley|wal-?mart",
    re.I,
)
OFF_QUERIES = [
    ("stores_tags", "walmart", "walmart"),
    ("stores_tags", "sam-s-club", "sams"),
    ("stores_tags", "sams-club", "sams"),
    ("brands_tags", "great-value", "walmart"),
    ("brands_tags", "member-s-mark", "sams"),
    ("brands_tags", "marketside", "walmart"),
    ("brands_tags", "bettergoods", "walmart"),
    ("brands_tags", "equate", "walmart"),
    ("brands_tags", "freshness-guaranteed", "walmart"),
]


def load_env():
    env = {}
    path = ROOT / ".env.local"
    if not path.exists():
        raise SystemExit("Missing .env.local")
    for line in path.read_text(encoding="utf-8").splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#") or "=" not in trimmed:
            continue
        key, value = trimmed.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        env[key.strip()] = value
    return env


def keep_brand(owner: str, brand: str, category: str = "") -> bool:
    hay = f"{owner} {brand}"
    if SKIP_RE.search(hay):
        return False
    if re.search(r"\bequate\b", hay, re.I):
        return bool(re.search(r"protein|granola|snack, energy", category, re.I))
    return bool(OWNER_RE.search(hay) or BRAND_RE.search(hay))


def is_shelf_food(category: str) -> bool:
    cat = (category or "").strip()
    if not cat or SKIP_CAT.search(cat):
        return False
    return True


def store_for(owner: str, brand: str, hinted: str | None = None) -> str:
    hay = f"{owner} {brand}"
    sams = bool(SAMS_RE.search(hay) or hinted == "sams")
    walmart = bool(WALMART_RE.search(hay) or hinted == "walmart")
    if sams and walmart:
        return "both"
    if sams:
        return "sams"
    return "walmart"


def serving_grams(size, unit):
    try:
        size = float(size)
    except (TypeError, ValueError):
        return None
    if size <= 0:
        return None
    u = (unit or "g").strip().lower().replace(".", "")
    if u in {"g", "gr", "grm", "gram", "grams"}:
        return size
    if u in {"ml", "mlt", "milliliter", "millilitre"}:
        return size
    if u in {"oz", "onz"}:
        return size * 28.3495
    if u in {"fl oz", "floz", "flt"}:
        return size * 29.5735
    if u in {"lb", "lbm"}:
        return size * 453.592
    if u == "kg":
        return size * 1000
    if u == "mg":
        return size / 1000
    return None


def clamp(value, lo, hi, ndigits=None):
    try:
        n = float(value)
    except (TypeError, ValueError):
        n = 0
    n = max(lo, min(hi, n))
    if ndigits is None:
        return int(round(n))
    return round(n, ndigits)


def clean_name(*parts):
    text = " ".join(str(p or "").replace(",", " ") for p in parts)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:120]


BRAND_LABELS = (
    ("member's mark", "Member's Mark"),
    ("members mark", "Member's Mark"),
    ("great value", "Great Value"),
    ("sams choice", "Sam's Choice"),
    ("sam's choice", "Sam's Choice"),
    ("marketside", "Marketside"),
    ("bettergoods", "Bettergoods"),
    ("freshness guaranteed", "Freshness Guaranteed"),
    ("daily chef food service", "Daily Chef"),
    ("daily chef", "Daily Chef"),
    ("parent's choice", "Parent's Choice"),
    ("equate", "Equate"),
    ("clear american", "Clear American"),
    ("price first", "Price First"),
    ("the bakery", "The Bakery"),
    ("wal-mart stores inc.", "Great Value"),
    ("wal-mart stores, inc.", "Great Value"),
    ("walmart inc.", "Great Value"),
)

SMALL_WORDS = {"and", "or", "with", "of", "a", "an", "the", "in", "on", "&", "for"}

KEEP_ZERO_CAL = re.compile(
    r"\b(soda|seltzer|sparkling|diet|unsweetened tea|broth|mustard|hot sauce|pickle)\b",
    re.I,
)


def title_words(text):
    words = re.sub(r"\s+", " ", text).strip().split(" ")
    out = []
    for i, word in enumerate(words):
        if not word:
            continue
        if word == "&":
            out.append("&")
            continue
        lower = word.lower()
        if i > 0 and lower in SMALL_WORDS:
            out.append(lower)
            continue
        if re.fullmatch(r"\d+[./]?\d*%?", word):
            out.append(word)
            continue
        out.append(lower[:1].upper() + lower[1:])
    return " ".join(out)


def strip_repeated_tail(text):
    words = text.split()
    if len(words) >= 3 and words[0].lower() == words[-1].lower() and len(words[0]) >= 4:
        words = words[:-1]
    for length in range(min(8, len(words) // 2), 1, -1):
        if words[:length] == words[-length:]:
            return " ".join(words[:-length])
    return " ".join(words)


def display_name(raw, brand):
    text = re.sub(r"[\|/]+", " ", str(raw or ""))
    text = re.sub(r"\s+", " ", text).strip()
    lowered = text.lower()
    labels = [brand or ""] + [pair[0] for pair in BRAND_LABELS]
    for label in labels:
        label = (label or "").strip().lower()
        if len(label) < 4:
            continue
        if lowered.startswith(label + " "):
            text = text[len(label):].strip(" -:")
            lowered = text.lower()
    text = strip_repeated_tail(text)
    cut = re.split(r"\b(?:a blend of|made with|packed in|sweetened with)\b", text, maxsplit=1, flags=re.I)
    if cut and len(cut[0].strip()) >= 10:
        text = cut[0].strip()
    text = re.sub(r"\b(enriched macaroni product|with rib meat|individually wrapped steaks)\b", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" -,&")
    text = title_words(text)
    if len(text) > 72:
        trimmed = text[:72].rsplit(" ", 1)[0]
        if len(trimmed) >= 18:
            text = trimmed
    return text[:120]


def display_brand(raw):
    text = re.sub(r"\s+", " ", str(raw or "")).strip()
    key = text.lower().replace("’", "'")
    for needle, label in BRAND_LABELS:
        if key == needle or key.startswith(needle):
            return label
    return title_words(text) if text else None


def display_serving(raw):
    text = str(raw or "").strip()
    text = text.split("|")[0]
    text = re.sub(r",?\s*servings per container.*$", "", text, flags=re.I)
    text = re.sub(r"\babout\b", "", text, flags=re.I)
    text = re.sub(r"\bONZ\b", "oz", text, flags=re.I)
    text = re.sub(r"\bOZA\b", "fl oz", text, flags=re.I)
    text = re.sub(r"\bGRM\b", "g", text, flags=re.I)
    text = re.sub(r"\bMLT\b", "ml", text, flags=re.I)
    text = re.sub(r"^(\d+(?:\.\d+)?) oz serving$", r"\1 oz", text, flags=re.I)
    text = re.sub(r"(\d+)\.0\b", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip(" ,")
    text = re.sub(r"\b([A-Z]{2,})\b", lambda m: m.group(1).lower(), text)
    return (text or "1 serving")[:80]


def looks_like_code(name):
    tokens = re.findall(r"[A-Za-z]+", name)
    short = [t for t in tokens if len(t) <= 3]
    return len(tokens) <= 5 and len(short) >= 3


def polish(item):
    brand = display_brand(item.get("brand"))
    name = display_name(item.get("name"), brand)
    serving = display_serving(item.get("serving"))
    if len(name) < 4 or looks_like_code(name):
        return None
    if re.search(r"cooking spray|non-stick", name, re.I):
        return None
    if re.search(r"\bMG\b", serving, re.I):
        return None
    calories = int(item.get("calories") or 0)
    protein = float(item.get("protein_g") or 0)
    carbs = float(item.get("carbs_g") or 0)
    fat = float(item.get("fat_g") or 0)
    if calories <= 0 and protein + carbs + fat <= 0 and not KEEP_ZERO_CAL.search(name):
        return None
    if calories > 900 and not re.search(r"sandwich|sub|hero|calzone|pizza", name, re.I):
        return None
    barcode = re.sub(r"\D", "", str(item.get("barcode") or ""))
    if barcode.startswith("00") and len(barcode) == 14:
        barcode = barcode[2:]
    return {
        "barcode": barcode,
        "name": name,
        "brand": brand,
        "store": item.get("store") or "walmart",
        "calories": calories,
        "protein_g": protein,
        "carbs_g": carbs,
        "fat_g": fat,
        "fiber_g": float(item.get("fiber_g") or 0),
        "serving": serving,
        "source": item.get("source") or "usda",
        "updated_at": item.get("updated_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def polish_list(products):
    cleaned = []
    seen_name = set()
    dropped = 0
    for item in products:
        row = polish(item)
        if not row:
            dropped += 1
            continue
        key = row["name"].lower()
        if key in seen_name:
            dropped += 1
            continue
        seen_name.add(key)
        cleaned.append(row)
    print(json.dumps({"polished": len(cleaned), "dropped": dropped}, indent=2))
    return cleaned


def barcode_from_gtin(raw: str) -> str | None:
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) < 8:
        return None
    return digits[-14:] if len(digits) > 14 else digits


def row_from_nutrients(meta, nutrients):
    kcal = nutrients.get("1008")
    if kcal is None:
        kcal = nutrients.get("2047", nutrients.get("2048"))
    if kcal is None and "1062" in nutrients:
        kcal = nutrients["1062"] / 4.184
    if kcal is None:
        return None
    grams = serving_grams(meta.get("serving_size"), meta.get("serving_size_unit"))
    factor = (grams / 100.0) if grams else 1.0
    serving = (meta.get("household") or "").strip()
    if not serving:
        if grams:
            serving = f"{meta.get('serving_size')} {meta.get('serving_size_unit') or 'g'}".strip()
        else:
            serving = "100g"
    name = clean_name(meta.get("description") or meta.get("brand") or "Grocery item")
    if not name:
        return None
    barcode = barcode_from_gtin(meta.get("gtin") or "")
    if not barcode:
        return None
    return {
        "barcode": barcode[:32],
        "name": name,
        "brand": clean_name(meta.get("brand")) or None,
        "store": meta["store"],
        "calories": clamp(kcal * factor, 0, 5000),
        "protein_g": clamp(nutrients.get("1003", 0) * factor, 0, 400, 1),
        "carbs_g": clamp(nutrients.get("1005", 0) * factor, 0, 800, 1),
        "fat_g": clamp(nutrients.get("1004", 0) * factor, 0, 250, 1),
        "fiber_g": clamp(nutrients.get("1079", 0) * factor, 0, 200, 1),
        "serving": serving[:80] or None,
        "source": meta.get("source", "usda"),
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "_fdc": int(meta.get("fdc_id") or 0),
        "_category": meta.get("category") or "",
    }


def download_usda():
    CACHE.mkdir(parents=True, exist_ok=True)
    if USDA_ZIP.exists() and USDA_ZIP.stat().st_size > 1_000_000:
        return
    print("Downloading USDA branded foods…")
    urllib.request.urlretrieve(USDA_URL, USDA_ZIP)


def zip_text(z, name):
    return io.TextIOWrapper(z.open(name), encoding="utf-8", errors="replace", newline="")


def parse_usda():
    download_usda()
    print("Scanning USDA store brands…")
    wanted = {}
    with zipfile.ZipFile(USDA_ZIP) as z:
        with zip_text(z, USDA_PREFIX + "branded_food.csv") as handle:
            reader = csv.DictReader(handle)
            for i, row in enumerate(reader, 1):
                owner = row.get("brand_owner") or ""
                brand = row.get("brand_name") or ""
                category = (row.get("branded_food_category") or "").strip()
                if (row.get("discontinued_date") or "").strip():
                    continue
                if (row.get("market_country") or "") not in ("", "United States"):
                    continue
                if not is_shelf_food(category):
                    continue
                if not keep_brand(owner, brand, category):
                    continue
                fdc_id = row["fdc_id"]
                wanted[fdc_id] = {
                    "fdc_id": fdc_id,
                    "brand": brand.strip() or owner.strip(),
                    "gtin": row.get("gtin_upc") or "",
                    "serving_size": row.get("serving_size"),
                    "serving_size_unit": row.get("serving_size_unit"),
                    "household": row.get("household_serving_fulltext") or "",
                    "store": store_for(owner, brand),
                    "source": "usda",
                    "category": category,
                }
                if i % 200000 == 0:
                    print(f"  branded_food {i:,} rows, kept {len(wanted):,}")
        print(f"  kept {len(wanted):,} store-brand rows")
        if not wanted:
            return []
        with zip_text(z, USDA_PREFIX + "food.csv") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                meta = wanted.get(row["fdc_id"])
                if not meta:
                    continue
                meta["description"] = row.get("description") or ""
        nutrients = {fdc_id: {} for fdc_id in wanted}
        print("  reading nutrients…")
        with zip_text(z, USDA_PREFIX + "food_nutrient.csv") as handle:
            next(handle)
            for i, line in enumerate(handle, 1):
                parts = line.split(",")
                if len(parts) < 4:
                    continue
                fdc_id = parts[1].strip().strip('"')
                bucket = nutrients.get(fdc_id)
                if bucket is None:
                    continue
                nid = parts[2].strip().strip('"')
                if nid not in NEED_NUTRIENTS:
                    continue
                try:
                    bucket[nid] = float(parts[3].strip().strip('"'))
                except ValueError:
                    continue
                if i % 2_000_000 == 0:
                    print(f"    nutrient lines {i:,}")
    products = []
    for fdc_id, meta in wanted.items():
        item = row_from_nutrients(meta, nutrients.get(fdc_id) or {})
        if item:
            products.append(item)
    print(f"  USDA products with calories: {len(products):,}")
    return products


def off_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": OFF_UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        if err.code in {429, 503}:
            time.sleep(8)
            return off_request(url)
        print(f"  OFF {err.code} {url}")
        return None
    except Exception as err:
        print(f"  OFF error {err}")
        return None


def food_from_off(product, store):
    n = product.get("nutriments") or {}
    per_serving = n.get("energy-kcal_serving")
    per_100 = n.get("energy-kcal_100g", n.get("energy-kcal"))
    kcal = per_serving if per_serving not in (None, "") else per_100
    try:
        kcal = float(kcal)
    except (TypeError, ValueError):
        return None
    name = clean_name(product.get("product_name") or product.get("generic_name"))
    if not name:
        return None
    barcode = barcode_from_gtin(str(product.get("code") or ""))
    if not barcode:
        return None
    factor = 1.0
    serving = "serving" if per_serving not in (None, "") else "100g"
    return {
        "barcode": barcode,
        "name": name,
        "brand": clean_name(product.get("brands")) or None,
        "store": store_for(product.get("brands") or "", product.get("brands") or "", store),
        "calories": clamp(kcal * factor, 0, 5000),
        "protein_g": clamp(n.get("proteins_serving", n.get("proteins_100g", 0)), 0, 400, 1),
        "carbs_g": clamp(n.get("carbohydrates_serving", n.get("carbohydrates_100g", 0)), 0, 800, 1),
        "fat_g": clamp(n.get("fat_serving", n.get("fat_100g", 0)), 0, 250, 1),
        "fiber_g": clamp(n.get("fiber_serving", n.get("fiber_100g", 0)), 0, 200, 1),
        "serving": serving,
        "source": "off",
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def parse_off(skip=False):
    existing = CACHE / "vital-products.jsonl"
    if skip:
        print("Skipping Open Food Facts")
        return []
    print("Fetching Open Food Facts store tags…")
    found = {}
    for field, tag, store in OFF_QUERIES:
        page = 1
        while page <= 120:
            query = urllib.parse.urlencode(
                {
                    field: tag,
                    "page_size": 100,
                    "page": page,
                    "fields": "code,product_name,generic_name,brands,stores_tags,nutriments",
                }
            )
            url = f"https://world.openfoodfacts.org/api/v2/search?{query}"
            data = off_request(url)
            time.sleep(0.7)
            if not data:
                break
            products = data.get("products") or []
            if page == 1:
                print(f"  {field}={tag} count={data.get('count')}")
            if not products:
                break
            for product in products:
                item = food_from_off(product, store)
                if item:
                    found[item["barcode"]] = item
            page += 1
            if page > (int(data.get("count") or 0) + 99) // 100:
                break
    print(f"  OFF products with calories: {len(found):,}")
    return list(found.values())


def merge(usda, off):
    by_code = {}
    for item in off:
        by_code[item["barcode"]] = item
    for item in usda:
        by_code[item["barcode"]] = item
    return list(by_code.values())


def public_row(item):
    return {key: value for key, value in item.items() if not key.startswith("_")}


def norm_name(item):
    text = (item.get("name") or "").lower()
    text = re.sub(
        r"\b(great value|member'?s mark|marketside|bettergoods|freshness guaranteed|daily chef)\b",
        " ",
        text,
    )
    text = re.sub(r"\b\d+(\.\d+)?\s*(oz|ounce|lb|g|kg|ml|l|ct|count|pk|pack|piece|slices?)s?\b", " ", text)
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def category_limit(cat):
    text = (cat or "").lower()
    if re.search(r"cake|cupcake|cookie|biscuit|candy|chocolate|ice cream|popcorn|chips|pretzel|pastries", text):
        return 45
    if re.search(r"frozen dinner|entree|bread|cheese|yogurt|milk|cereal|fruit|vegetable|pizza|pasta|chicken|egg|meat", text):
        return 110
    return 60


def pick_shelf(products):
    newest = {}
    for item in sorted(products, key=lambda row: int(row.get("_fdc") or 0), reverse=True):
        code = item.get("barcode") or ""
        if len(code) < 8 or code.startswith("fdc:"):
            continue
        newest.setdefault(code, item)

    ranked = list(newest.values())
    sams = [row for row in ranked if row["store"] in ("sams", "both")]
    walmart = [row for row in ranked if row["store"] == "walmart"]
    picked = []
    seen_name = set()
    cat_count = {}

    def consider(item):
        if len(picked) >= MAX_PRODUCTS:
            return
        name = norm_name(item)
        if len(name) < 4 or name in seen_name:
            return
        hay = f"{item.get('brand') or ''} {item.get('name') or ''}"
        if re.search(r"spring valley|vitamin|multivitamin|ibuprofen|supplement", hay, re.I):
            return
        cat = item.get("_category") or "other"
        if cat_count.get(cat, 0) >= category_limit(cat):
            return
        seen_name.add(name)
        cat_count[cat] = cat_count.get(cat, 0) + 1
        picked.append(public_row(item))

    sams_kept = 0
    for item in sams:
        if sams_kept >= SAMS_TARGET:
            break
        before = len(picked)
        consider(item)
        if len(picked) > before:
            sams_kept += 1
    for item in walmart:
        consider(item)
    for item in sams:
        consider(item)

    stores = {"walmart": 0, "sams": 0, "both": 0}
    for item in picked:
        stores[item["store"]] = stores.get(item["store"], 0) + 1
    print(json.dumps({"shelf": len(picked), "stores": stores, "categories": len(cat_count)}, indent=2))
    return picked


def rest(env, method, path, body=None, extra=None):
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + path
    key = env["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as response:
        raw = response.read()
        return json.loads(raw.decode("utf-8")) if raw else None


def table_ready(env):
    try:
        rest(env, "GET", "/rest/v1/vital_products?select=barcode&limit=1")
        return True
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", errors="replace")
        print(detail)
        return False


def upsert(env, products):
    print(f"Upserting {len(products):,} products…")
    batch = 150
    for i in range(0, len(products), batch):
        chunk = products[i : i + batch]
        rest(
            env,
            "POST",
            "/rest/v1/vital_products?on_conflict=barcode",
            chunk,
            {"Prefer": "resolution=merge-duplicates,return=minimal"},
        )
        if i == 0 or (i // batch) % 20 == 0:
            print(f"  {min(i + batch, len(products)):,}/{len(products):,}")


def load_cache():
    path = CACHE / "vital-products.jsonl"
    if not path.exists():
        return None
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main():
    apply = "--apply" in sys.argv
    with_off = "--with-off" in sys.argv
    from_cache = "--from-cache" in sys.argv
    if from_cache:
        products = load_cache()
        if not products:
            raise SystemExit("No scripts/.cache/vital-products.jsonl yet. Run without --from-cache first.")
        print(f"Loaded {len(products):,} cached products")
    else:
        usda = parse_usda()
        off = parse_off(skip=not with_off)
        products = pick_shelf(merge(usda, off))
        print(json.dumps({"usda_foods": len(usda), "off": len(off), "kept": len(products)}, indent=2))
    products = polish_list(products)
    CACHE.mkdir(parents=True, exist_ok=True)
    (CACHE / "vital-products.jsonl").write_text(
        "\n".join(json.dumps(item) for item in products),
        encoding="utf-8",
    )
    if not apply:
        print("Dry run. Re-run with --apply after vital_products.sql is in Supabase.")
        return
    env = load_env()
    if not table_ready(env):
        raise SystemExit("Run vital_products.sql in the Supabase SQL editor first.")
    upsert(env, products)
    print("Done.")


if __name__ == "__main__":
    main()
