// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.z = 5;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff6b6b, 0.5);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// Create LEGO brick
function createLEGOBrick() {
    const group = new THREE.Group();

    // Main brick body (2x4 stud brick dimensions)
    const brickGeometry = new THREE.BoxGeometry(1.6, 0.8, 3.2);
    const brickMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 100,
        flatShading: false
    });
    const brickBody = new THREE.Mesh(brickGeometry, brickMaterial);
    brickBody.castShadow = true;
    brickBody.receiveShadow = true;
    group.add(brickBody);

    // Create studs on top (LEGO characteristic)
    const studGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 32);
    const studMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 100
    });

    // Create 2x4 = 8 studs
    const studPositions = [
        [-0.5, 0.55, -0.9],
        [0.5, 0.55, -0.9],
        [-0.5, 0.55, 0],
        [0.5, 0.55, 0],
        [-0.5, 0.55, 0.9],
        [0.5, 0.55, 0.9],
        [-0.5, 0.55, 1.8],
        [0.5, 0.55, 1.8]
    ];

    studPositions.forEach(pos => {
        const stud = new THREE.Mesh(studGeometry, studMaterial);
        stud.position.set(pos[0], pos[1], pos[2]);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
    });

    // Add slightly darker bottom surface
    const bottomGeometry = new THREE.BoxGeometry(1.65, 0.1, 3.25);
    const bottomMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc0000,
        shininess: 80
    });
    const bottomSurface = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomSurface.position.y = -0.45;
    bottomSurface.castShadow = true;
    bottomSurface.receiveShadow = true;
    group.add(bottomSurface);

    return group;
}

const legoBrick = createLEGOBrick();
scene.add(legoBrick);

// Animation variables
let time = 0;
const floatingSpeed = 0.005;
const floatingHeight = 0.5;
const rotationSpeed = 0.005;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Floating motion (up and down)
    time += floatingSpeed;
    legoBrick.position.y = Math.sin(time) * floatingHeight;

    // Rotation
    legoBrick.rotation.x += rotationSpeed * 0.5;
    legoBrick.rotation.y += rotationSpeed;
    legoBrick.rotation.z += rotationSpeed * 0.3;

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
