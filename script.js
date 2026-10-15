
// ข้อมูลตัวอย่างสำหรับฝึกเขียนโปรแกรม
// ชื่อเหล่านี้ยังไม่ใช่รายชื่อลานจอดรถที่ยืนยันแล้ว

const parkingLots = [
    {
        id: "parking-001",
        name: "ลานจอดรถโรงเรียนสาธิตแห่งมทาวิทยาลัยธรรมศาสตร์",
        description: "ข้อมูลทดลองสำหรับพัฒนาระบบ",
        lat: 14.076683,
        lng: 100.597744,
        verified: false,
        hours: "ยังไม่ได้ตรวจสอบ",
        fee: "ยังไม่ได้ตรวจสอบ",
        destination: "ยังไม่ได้ระบุ"
    },
    {
        id: "parking-002",
        name: "ลานจอดรถทดลอง B",
        description: "ข้อมูลทดลองสำหรับพัฒนาระบบ",
        lat: 14.0750,
        lng: 100.6030,
        verified: false,
        hours: "ยังไม่ได้ตรวจสอบ",
        fee: "ยังไม่ได้ตรวจสอบ",
        destination: "ยังไม่ได้ระบุ"
    },
    {
        id: "parking-003",
        name: " ลานจอดรถหลังยิมเนเซียม 7 ",
        description: "ข้อมูลทดลองสำหรับพัฒนาระบบ",
        lat: 14.06961842575501,
        lng: 100.60013568293522,
        verified: false,
        hours: "ยังไม่ได้ตรวจสอบ",
        fee: "ยังไม่ได้ตรวจสอบ",
        destination: "ยังไม่ได้ระบุ"
    }
];


// สร้างแผนที่และกำหนดจุดกึ่งกลางเริ่มต้น
const map = L.map("map").setView([14.0735, 100.6012], 16);

/* ===== ระบบติดตาม GPS ===== */

let userGpsMarker = null;
let userGpsAccuracy = null;
let userGpsWatchId = null;
let userGpsSession = 0;
let userGpsHasCentered = false;
let currentUserLatLng = null;
let currentUserPosition = null;
let walkingRouteLayer = null;

const gpsStatus = document.getElementById("gpsStatus");
const startGpsButton =
    document.getElementById("startGpsButton");
const stopGpsButton =
    document.getElementById("stopGpsButton");

function stopGpsTracking() {
    // ยกเลิก callback ที่อาจค้างมาจากการติดตามรอบก่อน
    userGpsSession++;
    if (userGpsWatchId !== null) {
        navigator.geolocation.clearWatch(userGpsWatchId);
        userGpsWatchId = null;
    }
    startGpsButton.disabled = false;
    stopGpsButton.disabled = true;
}

startGpsButton.addEventListener("click", function () {
    if (!navigator.geolocation) {
        gpsStatus.textContent =
            "ไม่สามารถใช้ตำแหน่งได้ กรุณาใช้เบราว์เซอร์ที่รองรับและเปิดเว็บผ่าน HTTPS หรือ localhost";
        return;
    }

    if (userGpsWatchId !== null) {
        return;
    }

    gpsStatus.textContent =
        "กำลังขอสิทธิ์และรอตำแหน่งจากอุปกรณ์... สามารถกดหยุดติดตามได้";

    userGpsHasCentered = false;
    startGpsButton.disabled = true;
    stopGpsButton.disabled = false;
    const session = ++userGpsSession;

    try {
    userGpsWatchId = navigator.geolocation.watchPosition(
        function (position) {
            if (session !== userGpsSession) return;
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            const userLatLng = [lat, lng];
            currentUserLatLng = userLatLng;
            currentUserPosition = position;

            if (userGpsMarker === null) {
                userGpsMarker = L.circleMarker(userLatLng, {
                    radius: 8,
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#1677ff",
                    fillOpacity: 1
                }).addTo(map);

                userGpsMarker.bindPopup(
                    "ตำแหน่งปัจจุบันของคุณ"
                );
            } else {
                userGpsMarker.setLatLng(userLatLng);
            }

            if (userGpsAccuracy === null) {
                userGpsAccuracy = L.circle(
                    userLatLng,
                    {
                        radius: accuracy,
                        color: "#1677ff",
                        fillColor: "#1677ff",
                        fillOpacity: 0.12,
                        weight: 1
                    }
                ).addTo(map);
            } else {
                userGpsAccuracy.setLatLng(userLatLng);
                userGpsAccuracy.setRadius(accuracy);
            }

            if (!userGpsHasCentered) {
                map.setView(userLatLng, 17);
                userGpsHasCentered = true;
            }

            gpsStatus.textContent =
                "กำลังติดตามตำแหน่ง | ความคลาดเคลื่อนประมาณ " +
                Math.round(accuracy) + " เมตร";

            startGpsButton.disabled = true;
            stopGpsButton.disabled = false;
        },
        function (error) {
            if (session !== userGpsSession) return;
            const messages = {
                1: "ไม่อนุญาตให้ใช้ตำแหน่ง หยุดติดตามแล้ว กรุณาอนุญาตตำแหน่งในการตั้งค่าเบราว์เซอร์ แล้วกดเริ่มใหม่",
                2: "ยังระบุตำแหน่งไม่ได้ กรุณาตรวจสอบการเปิดตำแหน่งของอุปกรณ์ ระบบยังรอตำแหน่งอยู่ หรือกดหยุดติดตามได้",
                3: "รอตำแหน่งนานเกินไป ระบบยังรอตำแหน่งใหม่อยู่ หรือกดหยุดติดตามได้"
            };

            gpsStatus.textContent =
                messages[error.code] ||
                "เกิดข้อผิดพลาดในการอ่านตำแหน่ง หยุดติดตามแล้ว กรุณากดเริ่มใหม่";

            // ข้อผิดพลาดชั่วคราวยังคงเก็บ Watch ID เพื่อรอผลใหม่หรือหยุดได้
            if (error.code !== 2 && error.code !== 3) {
                stopGpsTracking();
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 15000
        }
    );
    } catch (error) {
        stopGpsTracking();
        gpsStatus.textContent =
            "เริ่มติดตามตำแหน่งไม่ได้ กรุณาตรวจสอบสิทธิ์ตำแหน่งและเปิดเว็บผ่าน HTTPS หรือ localhost แล้วกดเริ่มใหม่";
    }
});

stopGpsButton.addEventListener("click", function () {
    stopGpsTracking();

    gpsStatus.textContent =
        "หยุดติดตามตำแหน่งแล้ว";
});


const markers = {};

parkingLots.forEach(function (lot) {
    const marker = L.marker([lot.lat, lot.lng]).addTo(map);

    const verificationText = lot.verified
        ? "ตรวจสอบตำแหน่งแล้ว"
        : "ตำแหน่งทดลอง — ยังไม่ยืนยัน";

    marker.bindPopup(`
        <strong>${lot.name}</strong>
        <p>${lot.description}</p>
        <p>${verificationText}</p>
    `);

    markers[lot.id] = marker;
});




// เลือกช่องค้นหาและพื้นที่แสดงผลจาก HTML
const searchInput = document.getElementById("searchInput");
const parkingResults = document.getElementById("parkingResults");

// ฟังก์ชันแสดงรายการลานจอดรถ

function displayParkingLots(lots) {
    parkingResults.innerHTML = "";

    if (lots.length === 0) {
        parkingResults.textContent =
            "ไม่พบลานจอดรถที่ตรงกับคำค้นหา";
        return;
    }

    lots.forEach(function (lot) {
        const card = document.createElement("div");
        card.className = "parking-card";

        const title = document.createElement("h4");
        title.textContent = lot.name;

        const description = document.createElement("p");
        description.textContent = lot.description;

        const status = document.createElement("p");
        status.textContent = lot.verified
            ? "สถานะ: ตรวจสอบตำแหน่งแล้ว"
            : "สถานะ: ข้อมูลทดลอง ยังไม่ยืนยัน";

        const details = document.createElement("p");
        details.textContent =
            "เวลาเปิด: " + lot.hours +
            " | ค่าจอด: " + lot.fee;

        const viewButton = document.createElement("button");
        viewButton.textContent = "ดูบนแผนที่";
        
        const walkingRouteButton = document.createElement("button");
        walkingRouteButton.textContent = "🚶 แสดงเส้นทางเดินเท้า";

        walkingRouteButton.addEventListener("click", function () {
    showWalkingRoute(lot);
});


        viewButton.addEventListener("click", function () {
            const marker = markers[lot.id];

            if (marker) {
                map.setView(marker.getLatLng(), 17);
                marker.openPopup();
            }
        });

        
        const walkingButton = document.createElement("button");
         walkingButton.textContent = "🚶 นำทางเดินเท้า";

         walkingButton.addEventListener("click", function () {
    openParkingNavigation(lot.lat, lot.lng, "walking");
});

        const drivingButton = document.createElement("button");
         drivingButton.textContent = "🚗 นำทางด้วยรถยนต์";

         drivingButton.addEventListener("click", function () {
    openParkingNavigation(lot.lat, lot.lng, "driving");
});
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(status);
        card.appendChild(details);
        
        card.appendChild(viewButton);
        card.appendChild(document.createElement("br"));
        card.appendChild(walkingRouteButton);
        card.appendChild(document.createElement("br"));
        card.appendChild(walkingButton);
        card.appendChild(document.createElement("br"));
        card.appendChild(drivingButton);


        parkingResults.appendChild(card);
    });
}


// ค้นหาเมื่อผู้ใช้พิมพ์ข้อความ
searchInput.addEventListener("input", function () {
    const keyword = searchInput.value.trim().toLowerCase();

    const filteredLots = parkingLots.filter(function (lot) {
        return (
            lot.name.toLowerCase().includes(keyword) ||
            lot.description.toLowerCase().includes(keyword)
        );
    });

    displayParkingLots(filteredLots);
});

// แสดงรายการทั้งหมดเมื่อเปิดหน้าเว็บ
displayParkingLots(parkingLots);


// เพิ่มแผนที่ถนนจาก OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

function openParkingNavigation(lat, lng, mode = "driving") {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    alert("ไม่พบพิกัดของลานจอดรถ");
    return;
  }

  const travelMode =
    mode === "walking" ? "walking" : "driving";

  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${lat},${lng}` +
    `&travelmode=${travelMode}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

// Route position policy
const ROUTE_POSITION_MAX_AGE = 30000;
const ROUTE_POSITION_MAX_ACCURACY = 50;
let routeRequestId = 0;
let routeController = null;
let routeLastFetchAt = -Infinity;
let routePositionPromise = null;

const routeStatus = document.createElement("p");
routeStatus.id = "routeStatus";
routeStatus.setAttribute("role", "status");
document.getElementById("gpsStatus").after(routeStatus);
map.attributionControl.addAttribution(
    'Routing: <a href="https://routing.openstreetmap.de/about.html">FOSSGIS / OSRM</a> | ' +
    '<a href="https://www.openstreetmap.org/fixthemap">แก้ไขแผนที่</a>'
);

function isRoutePositionUsable(position) {
    if (!position) return false;
    const { latitude, longitude, accuracy } = position.coords;
    const age = Date.now() - position.timestamp;
    return Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
        Number.isFinite(longitude) && Math.abs(longitude) <= 180 &&
        Number.isFinite(accuracy) && accuracy >= 0 &&
        accuracy <= ROUTE_POSITION_MAX_ACCURACY &&
        Number.isFinite(age) && age >= 0 && age <= ROUTE_POSITION_MAX_AGE;
}

async function getRoutePosition() {
    if (isRoutePositionUsable(currentUserPosition)) return currentUserPosition;
    routeStatus.textContent = "ตำแหน่งยังไม่มี เก่าเกิน 30 วินาที หรือคลาดเคลื่อนเกิน 50 เมตร กำลังขอตำแหน่งใหม่...";
    if (!navigator.geolocation) {
        throw new Error("เบราว์เซอร์ไม่รองรับตำแหน่ง กรุณาเปิดผ่าน HTTPS หรือ localhost");
    }
    // Share a single position request across destination selections.
    if (!routePositionPromise) {
        routePositionPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, maximumAge: 0, timeout: 15000
            });
        });
    }
    const pending = routePositionPromise;
    let position;
    try {
        position = await pending;
    } finally {
        if (routePositionPromise === pending) routePositionPromise = null;
    }
    // Prefer a newer position received from the existing GPS watcher.
    if (currentUserPosition && currentUserPosition.timestamp > position.timestamp) {
        position = currentUserPosition;
    }
    if (!isRoutePositionUsable(position)) {
        throw new Error("ตำแหน่งใหม่ยังเก่าหรือคลาดเคลื่อนเกิน 50 เมตร กรุณาไปบริเวณเปิดโล่งแล้วลองใหม่");
    }
    currentUserPosition = position;
    currentUserLatLng = [position.coords.latitude, position.coords.longitude];
    return position;
}

async function showWalkingRoute(lot) {
    const requestId = ++routeRequestId;
    if (routeController) routeController.abort();
    const controller = new AbortController();
    routeController = controller;
    let timeoutId;
    let timedOut = false;
    try {
        if (!Number.isFinite(lot.lat) || Math.abs(lot.lat) > 90 ||
            !Number.isFinite(lot.lng) || Math.abs(lot.lng) > 180) {
            throw new Error("พิกัดลานจอดรถไม่ถูกต้อง กรุณาเลือกจุดหมายอื่น");
        }
        routeStatus.textContent = "กำลังเตรียมตำแหน่งสำหรับเส้นทางไป " + lot.name;
        let position = await getRoutePosition();
        if (requestId !== routeRequestId) return;
        routeStatus.textContent = "กำลังคำนวณเส้นทางเดินเท้าไป " + lot.name + "...";
        // Provider limit: at most one request per second.
        const delay = Math.max(0, 1100 - (performance.now() - routeLastFetchAt));
        if (delay) await new Promise(resolve => setTimeout(resolve, delay));
        if (requestId !== routeRequestId) return;
        if (!isRoutePositionUsable(position)) position = await getRoutePosition();
        if (requestId !== routeRequestId) return;
        routeStatus.textContent = "กำลังคำนวณเส้นทางเดินเท้าไป " + lot.name + "...";
        const { latitude, longitude } = position.coords;
        const routeUrl = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/" +
            `${longitude},${latitude};${lot.lng},${lot.lat}?overview=full&geometries=geojson`;
        routeLastFetchAt = performance.now();
        timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
        const response = await fetch(routeUrl, { signal: controller.signal });
        if (requestId !== routeRequestId) return;
        if (!response.ok) {
            throw new Error(response.status === 429 ?
                "มีการขอเส้นทางถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" :
                "บริการเส้นทางไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง");
        }
        const data = await response.json();
        if (requestId !== routeRequestId) return;
        const route = data.routes?.[0];
        if (data.code !== "Ok" || !route) {
            throw new Error("ไม่พบเส้นทางเดินเท้าถึงจุดหมายนี้ กรุณาเลือกจุดหมายอื่น");
        }
        if (route.geometry?.type !== "LineString" ||
            !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2 ||
            !route.geometry.coordinates.every(c => Array.isArray(c) &&
                Number.isFinite(c[0]) && Math.abs(c[0]) <= 180 &&
                Number.isFinite(c[1]) && Math.abs(c[1]) <= 90) ||
            !Number.isFinite(route.distance) || route.distance < 0 ||
            !Number.isFinite(route.duration) || route.duration < 0) {
            throw new Error("บริการส่งข้อมูลเส้นทางไม่สมบูรณ์ กรุณาลองใหม่");
        }
        // Validate the new route before replacing the previous layer.
        const nextLayer = L.geoJSON(route.geometry, {
            style: { color: "#1677ff", weight: 6, opacity: 0.85 }
        });
        const bounds = nextLayer.getBounds();
        if (!bounds.isValid()) throw new Error("ข้อมูลเส้นทางไม่ถูกต้อง กรุณาลองใหม่");
        nextLayer.addTo(map);
        if (walkingRouteLayer) map.removeLayer(walkingRouteLayer);
        walkingRouteLayer = nextLayer;
        map.fitBounds(bounds, { padding: [30, 30] });
        routeStatus.textContent = `เส้นทางเดินเท้าไป ${lot.name} ระยะทางประมาณ ${(route.distance / 1000).toFixed(2)} กิโลเมตร เวลาเดินประมาณ ${Math.ceil(route.duration / 60)} นาที`;
    } catch (error) {
        if (requestId !== routeRequestId) return;
        const gpsMessages = {
            1: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์แล้วลองใหม่",
            2: "ยังระบุตำแหน่งไม่ได้ กรุณาเปิดตำแหน่งของอุปกรณ์แล้วลองใหม่",
            3: "รอตำแหน่งนานเกินไป กรุณาไปบริเวณเปิดโล่งแล้วลองใหม่"
        };
        const message = timedOut ? "บริการเส้นทางตอบกลับช้าเกินไป กรุณาลองใหม่" :
            gpsMessages[error.code] || (error instanceof TypeError ?
                "ติดต่อบริการเส้นทางไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่" :
                error.message || "ไม่สามารถคำนวณเส้นทางได้ กรุณาลองใหม่");
        routeStatus.textContent = message + (walkingRouteLayer ? " (เส้นบนแผนที่ยังเป็นเส้นทางก่อนหน้า)" : "");
    } finally {
        clearTimeout(timeoutId);
        if (requestId === routeRequestId) routeController = null;
    }
}

