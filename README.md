# 🌍 JP's Travel World — Born Explorer ♐

A personal travel tracker PWA to map your journeys, wishlist future adventures, and share your travel stats.

**🔗 Live:** [jpexplorer11.github.io/Travel](https://jpexplorer11.github.io/Travel/)

---

## Features

- 🗺️ Interactive map with 4 styles (Standard, Satellite, Terrain, Dark)
- 📍 Add places by tapping the map or searching by name (auto-locates)
- 📸 Attach photos to each place
- ⭐ Rate places (1-5 stars)
- 📝 Add notes and memories

### Place Types
| Status | Description |
|--------|-------------|
| ✅ Visited | Places you've been to |
| 🏠 Lived | Places you've called home |
| 🎒 Birth Place | Where it all began |
| 🚏 Transit | Passing through / layover |
| 🔮 Wishlist | Future adventures |

### Travel Modes
✈️ Flight · 🚗 Own Car · 🚙 Rental · 🚆 Train · 🚌 Bus · 🚲 Cycle · 🚶 Walk · ⛴️ Boat

### Stats Dashboard
- Total places, countries, visits, wishlist count
- Countries explored with place counts
- Category breakdown (City, Nature, Beach, Mountain, Food, Work)
- Travel mode chart (how you get around)
- Place type breakdown
- Recent adventures timeline

### Sync Between Devices
- **📤 Export** — Download your data as JSON
- **📥 Import** — Load data on another device (merges without duplicates)

---

## How to Use

### On Desktop
Open [jpexplorer11.github.io/Travel](https://jpexplorer11.github.io/Travel/) in any browser.

### On iPhone (Add to Home Screen)
1. Open the link in **Safari**
2. Tap the **Share** button (⬆️ at bottom)
3. Tap **"Add to Home Screen"**
4. Name it → tap **Add**
5. Opens fullscreen like a native app!

### Adding a Place
1. Tap **+** button or tap anywhere on the map
2. Type a city/country name — suggestions appear automatically
3. Select status (Visited / Lived / Wishlist etc.)
4. Choose travel mode, add notes, rating, photo
5. Tap **Save**

### Editing / Deleting
- **From Map:** Tap a pin → tap pin again → Edit form with Delete button
- **From List:** Each card has ✏️ Edit and 🗑️ Delete buttons

### Syncing Data Between Devices
1. Go to **Stats** tab → **📤 Export Data**
2. Send the `.json` file to your other device
3. On the other device → **Stats** tab → **📥 Import Data**

---

## Tech

- Single HTML file (~25 KB)
- Leaflet.js for maps
- OpenStreetMap Nominatim for geocoding
- Data stored in browser localStorage
- No server, no database, no login
- 100% free, 100% private

---

*Developed by JP · Sagittarian Wanderer · Born Explorer ♐*
