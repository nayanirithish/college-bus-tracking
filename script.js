// ===== MAP INIT =====
let map = L.map('map').setView([17.99, 79.59], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

let markers = {};

// ===== CUSTOM BUS ICON =====
function createBusIcon(name) {
  return L.divIcon({
    html: `
      <div style="
        background:#2563eb;
        color:white;
        padding:5px 8px;
        border-radius:8px;
        font-size:12px;
        font-weight:bold;
        white-space: nowrap;
      ">
        🚌 ${name}
      </div>
    `,
    className: "",
    iconSize: [80, 30]
  });
}

// ===== LOAD DATA =====
async function loadBuses() {
  try {
    let res = await fetch("http://127.0.0.1:5000/buses");
    let buses = await res.json();

    let activeList = document.getElementById("busList");
    let completedList = document.getElementById("completedList");
    let delayedList = document.getElementById("delayedList");

    activeList.innerHTML = "";
    completedList.innerHTML = "";
    delayedList.innerHTML = "";

    let active = 0, delayed = 0, completed = 0;

    buses.forEach(b => {

      let progress = Math.max(0, 100 - (b.eta * 5));

      let card = `
        <div class="bus">
          <h3>${b.bus_name}</h3>
          <p>${b.source} → ${b.destination}</p>
          <p>Status: ${b.status}</p>
          <p>ETA: ${b.eta} mins</p>

          <div class="progress">
            <div class="bar" style="width:${progress}%"></div>
          </div>
        </div>
      `;

      // ===== SORT BASED ON STATUS =====
      if (b.status === "Completed") {
        completedList.innerHTML += card;
        completed++;
      } 
      else if (b.status === "Delayed") {
        delayedList.innerHTML += card;
        delayed++;
      } 
      else {
        activeList.innerHTML += card;
        active++;
      }

      // ===== MAP UPDATE =====
      if (markers[b.id]) {
        markers[b.id].setLatLng([b.latitude, b.longitude]);
      } else {
        markers[b.id] = L.marker(
          [b.latitude, b.longitude],
          { icon: createBusIcon(b.bus_name) }
        )
        .addTo(map)
        .bindPopup(`
          <b>${b.bus_name}</b><br>
          ${b.source} → ${b.destination}<br>
          ETA: ${b.eta} mins
        `);
      }
    });

    // ===== UPDATE DASHBOARD =====
    document.getElementById("total").innerText = buses.length;
    document.getElementById("active").innerText = active;
    document.getElementById("delayed").innerText = delayed;
    document.getElementById("completed").innerText = completed;

    // ===== AUTO FIT MAP =====
    if (buses.length > 0) {
      let group = L.featureGroup(Object.values(markers));
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

// ===== AUTO UPDATE =====

// Backend movement
setInterval(() => {
  fetch("http://127.0.0.1:5000/update");
}, 4000);

// UI refresh
setInterval(loadBuses, 3000);

// Initial load
loadBuses();