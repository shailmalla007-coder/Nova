// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.set(3, 3, 5);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x9999ff, 0.3);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

const pointLight = new THREE.PointLight(0xff6b6b, 0.4);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// LEGO brick dimensions (based on real proportions)
// Real LEGO: 1 stud unit = 8mm wide, 8mm deep, plate height = 3.2mm, brick height = 9.6mm
// Stud diameter = 4.8mm, stud height = 1.8mm
const STUD_SPACING = 0.8;
const BRICK_HEIGHT = 0.96;
const STUD_RADIUS = 0.24;
const STUD_HEIGHT = 0.18;
const WALL_THICKNESS = 0.1;
const COLS = 4;
const ROWS = 2;
const BRICK_WIDTH = COLS * STUD_SPACING;
const BRICK_DEPTH = ROWS * STUD_SPACING;

// Create LEGO brick
function createLEGOBrick() {
    const group = new THREE.Group();

    // LEGO plastic material
    const brickMaterial = new THREE.MeshPhongMaterial({
        color: 0xd4000d,
        shininess: 120,
        specular: 0x444444,
        flatShading: false
    });

    const darkerMaterial = new THREE.MeshPhongMaterial({
        color: 0xb0000b,
        shininess: 100,
        specular: 0x333333
    });

    // =====================
    // MAIN BODY
    // =====================
    const bodyGeometry = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
    const body = new THREE.Mesh(bodyGeometry, brickMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // =====================
    // TOP STUDS (2 rows x 4 columns = 8 studs)
    // =====================
    const studGeometry = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 32);

    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
            const stud = new THREE.Mesh(studGeometry, brickMaterial);

            // Center the studs on the brick
            const x = (col - (COLS - 1) / 2) * STUD_SPACING;
            const z = (row - (ROWS - 1) / 2) * STUD_SPACING;
            const y = BRICK_HEIGHT / 2 + STUD_HEIGHT / 2;

            stud.position.set(x, y, z);
            stud.castShadow = true;
            stud.receiveShadow = true;
            group.add(stud);

            // Add small ring on top of each stud (like real LEGO)
            const ringGeometry = new THREE.TorusGeometry(STUD_RADIUS * 0.7, 0.02, 8, 32);
            const ring = new THREE.Mesh(ringGeometry, darkerMaterial);
            ring.position.set(x, y + STUD_HEIGHT / 2, z);
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }
    }

    // =====================
    // BOTTOM HOLLOW (the inside cavity)
    // =====================
    const hollowWidth = BRICK_WIDTH - WALL_THICKNESS * 2;
    const hollowDepth = BRICK_DEPTH - WALL_THICKNESS * 2;
    const hollowHeight = BRICK_HEIGHT - WALL_THICKNESS;

    const hollowGeometry = new THREE.BoxGeometry(hollowWidth, hollowHeight, hollowDepth);
    const hollowMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b0000,
        shininess: 50,
        side: THREE.BackSide
    });
    const hollow = new THREE.Mesh(hollowGeometry, hollowMaterial);
    hollow.position.y = -WALL_THICKNESS / 2;
    group.add(hollow);

    // =====================
    // BOTTOM TUBES (the cylindrical tubes inside)
    // =====================
    const tubeOuterRadius = 0.3;
    const tubeInnerRadius = 0.24;
    const tubeHeight = BRICK_HEIGHT - WALL_THICKNESS;

    // For a 2x4 brick, there are 3 tubes along the length
    for (let i = 0; i < COLS - 1; i++) {
        const x = (i - (COLS - 2) / 2) * STUD_SPACING;
        const y = -WALL_THICKNESS / 2;
        const z = 0;

        // Outer tube
        const outerTubeGeo = new THREE.CylinderGeometry(tubeOuterRadius, tubeOuterRadius, tubeHeight, 32);
        const outerTube = new THREE.Mesh(outerTubeGeo, darkerMaterial);
        outerTube.position.set(x, y, z);
        group.add(outerTube);

        // Inner hole (to make it hollow)
        const innerTubeGeo = new THREE.CylinderGeometry(tubeInnerRadius, tubeInnerRadius, tubeHeight + 0.01, 32);
        const innerTubeMat = new THREE.MeshPhongMaterial({
            color: 0x8b0000,
            shininess: 30,
            side: THREE.BackSide
        });
        const innerTube = new THREE.Mesh(innerTubeGeo, innerTubeMat);
        innerTube.position.set(x, y, z);
        group.add(innerTube);
    }

    // =====================
    // BOTTOM RIM (thin border at the bottom edge)
    // =====================
    const rimGeometry = new THREE.BoxGeometry(BRICK_WIDTH + 0.02, 0.05, BRICK_DEPTH + 0.02);
    const rim = new THREE.Mesh(rimGeometry, darkerMaterial);
    rim.position.y = -BRICK_HEIGHT / 2;
    rim.castShadow = true;
    group.add(rim);

    return group;
}

const legoBrick = createLEGOBrick();
scene.add(legoBrick);

// Tilt the brick slightly for a nicer viewing angle
legoBrick.rotation.x = 0.3;
legoBrick.rotation.z = 0.1;

// Animation variables
let time = 0;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    time += 0.01;

    // Smooth floating motion
    legoBrick.position.y = Math.sin(time) * 0.3;

    // Clean rotation (only Y axis for elegant spin)
    legoBrick.rotation.y += 0.008;

    // Subtle tilt oscillation
    legoBrick.rotation.x = 0.3 + Math.sin(time * 0.5) * 0.05;
    legoBrick.rotation.z = 0.1 + Math.cos(time * 0.5) * 0.05;

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
