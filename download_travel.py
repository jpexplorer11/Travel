import os
import requests
import json
import time
from pathlib import Path

BASE_DIR = Path.home() / "Downloads" / "travel-data" / "images"
IMAGES_PER_PLACE = 1

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def slug_to_query(slug):
    return slug.replace("-", " ")

def get_openverse_image(query):
    try:
        url = "https://api.openverse.org/v1/images/"

        params = {
            "q": f"{query} landmark city",
            "license_type": "commercial",
            "page_size": 5
        }

        res = requests.get(url, params=params, headers=HEADERS, timeout=10)
        res.raise_for_status()

        data = res.json()
        results = data.get("results", [])

        for img in results:
            url = img.get("url")
            if url:
                # try smaller size
                if "?" in url:
                    url += "&w=600"
                else:
                    url += "?w=600"
                return url

        return None

    except Exception as e:
        print(f"❌ Openverse error: {e}")
        return None


def download(url, path):
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()

        with open(path, "wb") as f:
            f.write(r.content)

        size = os.path.getsize(path)

        if size < 5000:
            print("   ⚠️ Skipped tiny image")
            return False

        print(f"   ✅ {path.name} ({size} bytes)")
        return True

    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        return False


# 🔥 FULL PLACES LIST (cleaned ~121)
places = [
{"slug":"chitradurga-india","region":"asia"},
{"slug":"tumkur-india","region":"asia"},
{"slug":"mysore-india","region":"asia"},
{"slug":"goa-india","region":"asia"},
{"slug":"gokarna-india","region":"asia"},
{"slug":"mangalore-india","region":"asia"},
{"slug":"coorg-india","region":"asia"},
{"slug":"bandipur-india","region":"asia"},
{"slug":"ooty-india","region":"asia"},
{"slug":"bangalore-india","region":"asia"},
{"slug":"espoo-finland","region":"europe"},
{"slug":"helsinki-finland","region":"europe"},
{"slug":"stockholm-sweden","region":"europe"},
{"slug":"suwon-south-korea","region":"asia"},
{"slug":"seoul-south-korea","region":"asia"},
{"slug":"pyeongchang-south-korea","region":"asia"},
{"slug":"singapore","region":"asia"},
{"slug":"bangkok-thailand","region":"asia"},
{"slug":"pittsburgh-usa","region":"north-america"},
{"slug":"niagara-falls-usa","region":"north-america"},
{"slug":"ohio-usa","region":"north-america"},
{"slug":"maryland-usa","region":"north-america"},
{"slug":"washington-dc-usa","region":"north-america"},
{"slug":"new-york-usa","region":"north-america"},
{"slug":"luray-caverns-usa","region":"north-america"},
{"slug":"san-francisco-usa","region":"north-america"},
{"slug":"yosemite-national-park-usa","region":"north-america"},
{"slug":"las-vegas-usa","region":"north-america"},
{"slug":"reno-usa","region":"north-america"},
{"slug":"lake-tahoe-usa","region":"north-america"},
{"slug":"yellowstone-national-park-usa","region":"north-america"},
{"slug":"grand-teton-national-park-usa","region":"north-america"},
{"slug":"grand-canyon-west-usa","region":"north-america"},
{"slug":"grand-canyon-south-rim-usa","region":"north-america"},
{"slug":"death-valley-usa","region":"north-america"},
{"slug":"los-angeles-usa","region":"north-america"},
{"slug":"san-diego-usa","region":"north-america"},
{"slug":"baja-california-mexico","region":"north-america"},
{"slug":"redwood-national-park-usa","region":"north-america"},
{"slug":"san-jose-usa","region":"north-america"},
{"slug":"aachen-germany","region":"europe"},
{"slug":"dusseldorf-germany","region":"europe"},
{"slug":"cologne-germany","region":"europe"},
{"slug":"maastricht-netherlands","region":"europe"},
{"slug":"monschau-germany","region":"europe"},
{"slug":"liege-belgium","region":"europe"},
{"slug":"bonn-germany","region":"europe"},
{"slug":"dortmund-germany","region":"europe"},
{"slug":"wuppertal-germany","region":"europe"},
{"slug":"paris-france","region":"europe"},
{"slug":"hamburg-germany","region":"europe"},
{"slug":"brussels-belgium","region":"europe"},
{"slug":"lucerne-switzerland","region":"europe"},
{"slug":"rhine-falls-switzerland","region":"europe"},
{"slug":"zurich-switzerland","region":"europe"},
{"slug":"frankfurt-germany","region":"europe"},
{"slug":"strasbourg-france","region":"europe"},
{"slug":"geneva-switzerland","region":"europe"},
{"slug":"chamonix-france","region":"europe"},
{"slug":"mont-blanc-france","region":"europe"},
{"slug":"dubai-uae","region":"asia"},
{"slug":"pattaya-thailand","region":"asia"},
{"slug":"new-delhi-india","region":"asia"},
{"slug":"noida-india","region":"asia"},
{"slug":"wayanad-india","region":"asia"},
{"slug":"abu-dhabi-uae","region":"asia"},
{"slug":"hong-kong","region":"asia"},
{"slug":"london-heathrow-uk","region":"europe"},
{"slug":"bellary-india","region":"asia"},
{"slug":"dharmasthala-india","region":"asia"},
{"slug":"udupi-india","region":"asia"},
{"slug":"murudeshwara-india","region":"asia"},
{"slug":"hyderabad-india","region":"asia"},
{"slug":"srisailam-india","region":"asia"},
{"slug":"raichur-india","region":"asia"},
{"slug":"shirdi-india","region":"asia"},
{"slug":"chennai-india","region":"asia"},
{"slug":"kemmannagundi-india","region":"asia"},
{"slug":"jog-falls-india","region":"asia"},
{"slug":"agumbe-india","region":"asia"},
{"slug":"tirupati-india","region":"asia"},
{"slug":"srikalahasti-india","region":"asia"},
{"slug":"kanchipuram-india","region":"asia"},
{"slug":"shimoga-india","region":"asia"},
{"slug":"sakleshpur-india","region":"asia"},
{"slug":"hassan-india","region":"asia"},
{"slug":"gulbarga-india","region":"asia"},
{"slug":"hubli-india","region":"asia"},
{"slug":"hampi-india","region":"asia"},
{"slug":"hogenakkal-falls-india","region":"asia"},
{"slug":"luxembourg","region":"europe"},
{"slug":"amsterdam-netherlands","region":"europe"},
{"slug":"antwerp-belgium","region":"europe"},
{"slug":"ostend-belgium","region":"europe"},
{"slug":"bruges-belgium","region":"europe"},
{"slug":"eifel-rursee-germany","region":"europe"},
{"slug":"oslo-norway","region":"europe"},
{"slug":"gothenburg-sweden","region":"europe"},
{"slug":"malmo-sweden","region":"europe"},
{"slug":"dinant-belgium","region":"europe"},
{"slug":"eupen-belgium","region":"europe"},
{"slug":"kassel-germany","region":"europe"},
{"slug":"saxon-switzerland-germany","region":"europe"},
{"slug":"dresden-germany","region":"europe"},
{"slug":"prague-czech-republic","region":"europe"},
{"slug":"alaska-usa","region":"north-america"},
{"slug":"hallstatt-austria","region":"europe"},
{"slug":"salzburg-austria","region":"europe"},
{"slug":"bern-switzerland","region":"europe"},
{"slug":"interlaken-switzerland","region":"europe"},
{"slug":"santorini-greece","region":"europe"},
{"slug":"barcelona-spain","region":"europe"},
{"slug":"tromso-norway","region":"europe"},
{"slug":"pyramids-of-giza-egypt","region":"africa"},
{"slug":"serengeti-tanzania","region":"africa"},
{"slug":"bali-indonesia","region":"asia"},
{"slug":"kuala-lumpur-malaysia","region":"asia"},
{"slug":"maldives","region":"global"},
{"slug":"copenhagen-denmark","region":"europe"},
{"slug":"berlin-germany","region":"europe"},
{"slug":"black-forest-germany","region":"europe"}
]


def run():
    print(f"\n📁 Saving to: {BASE_DIR}\n")

    total = 0

    for idx, place in enumerate(places, 1):
        folder = BASE_DIR / place["region"] / place["slug"]
        folder.mkdir(parents=True, exist_ok=True)

        print(f"\n📂 [{idx}/{len(places)}] {place['slug']}")

        url = get_openverse_image(slug_to_query(place["slug"]))

        if not url:
            print("❌ No image found")
            continue

        path = folder / "01.jpg"

        print("⬇️ Downloading...")
        if download(url, path):
            total += 1

        time.sleep(0.2)

        with open(folder / "meta.json", "w") as f:
            json.dump(place, f)

    print(f"\n📊 DONE → {total} images")
    print(f"📍 {BASE_DIR}")


if __name__ == "__main__":
    run()
