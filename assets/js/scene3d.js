document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("globe3dCanvas");
    if (!canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 280;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 2. Color Palette Setup
    const africaGlowGreen = 0x00ff88;     // Pan-African Cyber Neon Green
    const restOfWorldBlue = 0x226699;     // World borders
    const ethiopiaCoreColor = 0xffffff;    // White hub core
    const globeRadius = 115;

    // 3. Natural Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

    const baseGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const baseMat = new THREE.MeshBasicMaterial({ 
        map: earthTexture,
        color: 0x6699cc,
        transparent: true,
        opacity: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    globeGroup.add(baseMesh);

    // Helper: Coordinate Converter (Lat/Lon to 3D Space)
    function getVertex(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Official African ISO Standard Codes
    const africanCountryCodes = new Set([
        "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM",
        "COG", "COD", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN",
        "GNB", "CIV", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS",
        "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM",
        "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE", "ESH"
    ]);

    // Line Materials - ድንበሮቹ ጎልተው እንዲታዩ Opacity ከፍ ተደርጓል
    const worldBorderMat = new THREE.LineBasicMaterial({
        color: restOfWorldBlue,
        transparent: true,
        opacity: 0.4
    });

    const africaBorderMat = new THREE.LineBasicMaterial({
        color: africaGlowGreen,
        transparent: true,
        opacity: 1.0
    });

    // 4. GeoJSON Polygon Logic (CORS Safe & Strict Matching)
    fetch('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json')
        .then(res => res.json())
        .then(data => {
            data.features.forEach(feature => {
                const geometry = feature.geometry;
                
                // ISO Code ለማግኘት ሁሉንም አማራጮች ያረጋግጣል
                const countryId = feature.id || (feature.properties && (feature.properties.iso_a3 || feature.properties.ISO_A3));

                const isAfrica = africanCountryCodes.has(countryId);
                const matToUse = isAfrica ? africaBorderMat : worldBorderMat;

                // አፍሪካ ከመሬቱ ትንሽ ከፍ ብላ እንድትሳል Elevation ተሰጥቷታል
                const elevation = isAfrica ? globeRadius + 1.2 : globeRadius + 0.5;

                if (geometry.type === 'Polygon') {
                    geometry.coordinates.forEach(ring => drawPolygonRing(ring, matToUse, elevation));
                } else if (geometry.type === 'MultiPolygon') {
                    geometry.coordinates.forEach(polygon => {
                        polygon.forEach(ring => drawPolygonRing(ring, matToUse, elevation));
                    });
                }
            });
        })
        .catch(err => console.error("GeoJSON Load Error:", err));

    function drawPolygonRing(coordinates, material, radius) {
        const points = coordinates.map(coord => getVertex(coord[1], coord[0], radius));
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        globeGroup.add(new THREE.LineLoop(geo, material));
    }

    // 5. Ethiopia Hub Marker & Pulse Effect
    const ethiopiaLat = 8.0, ethiopiaLon = 38.0;
    const ethiopiaPos = getVertex(ethiopiaLat, ethiopiaLon, globeRadius + 1.5);

    const ethGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const ethMat = new THREE.MeshBasicMaterial({ color: ethiopiaCoreColor });
    const ethMesh = new THREE.Mesh(ethGeo, ethMat);
    ethMesh.position.copy(ethiopiaPos);
    globeGroup.add(ethMesh);

    const pulseGeo = new THREE.RingGeometry(2.0, 5.0, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
        color: africaGlowGreen,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.copy(ethiopiaPos);
    pulseMesh.lookAt(ethiopiaPos.clone().multiplyScalar(2));
    globeGroup.add(pulseMesh);

    // 6. Camera Alignment & Dynamic Positioning
    globeGroup.rotation.y = 4.2;
    globeGroup.rotation.x = 0.2;

    function updateGlobeLayout() {
        if (window.innerWidth > 1024) {
            globeGroup.position.set(-25, -5, 0);
            globeGroup.scale.set(0.95, 0.95, 0.95);
        } else {
            globeGroup.position.set(0, 0, 0);
            globeGroup.scale.set(0.7, 0.7, 0.7);
        }
    }
    updateGlobeLayout();

    // 7. Dynamic Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.08;

        pulseMesh.scale.set(1 + Math.sin(time) * 0.35, 1 + Math.sin(time) * 0.35, 1);
        pulseMat.opacity = 0.9 - (Math.sin(time) * 0.4);

        globeGroup.rotation.y += 0.0035;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateGlobeLayout();
    });
});