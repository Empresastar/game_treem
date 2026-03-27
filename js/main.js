// Variáveis Globais (Escopo de Janela)
var scene, camera, renderer, clock;
var player, train;
var throttle = 0, trainSpeed = 0, steam = 50, money = 0;
var isRiding = false, inventory = [];
var yaw = 0, pitch = 0, keys = {};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 400);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(50, 100, 50);
    scene.add(sun);

    // ESSENCIAL: Verifica se as funções dos outros arquivos existem antes de chamar
    if(typeof setupWorld === "function") setupWorld();
    if(typeof createTrain === "function") createTrain();
    if(typeof createPlayer === "function") createPlayer();

    document.addEventListener('mousedown', () => { renderer.domElement.requestPointerLock(); });
    document.addEventListener('mousemove', (e) => {
        if(document.pointerLockElement) {
            yaw -= e.movementX * 0.002;
            pitch -= e.movementY * 0.002;
            pitch = Math.max(-1.5, Math.min(1.5, pitch));
        }
    });

    window.addEventListener('keydown', e => { 
        keys[e.code] = true;
        if(e.code === 'KeyE' && typeof handleInteractions === "function") handleInteractions();
        if(e.code === 'KeyQ') {
            if(player && train && player.position.distanceTo(train.position) < 8) isRiding = !isRiding;
        }
    });
    window.addEventListener('keyup', e => keys[e.code] = false);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if(player && !isRiding) {
        const speed = 12 * delta;
        if(keys['KeyW']) { player.position.x -= Math.sin(yaw) * speed; player.position.z -= Math.cos(yaw) * speed; }
        if(keys['KeyS']) { player.position.x += Math.sin(yaw) * speed; player.position.z += Math.cos(yaw) * speed; }
    } else if (player && train) {
        player.position.copy(train.position);
        player.position.y = 3.5;
        if(keys['KeyW'] && steam > 0) throttle = Math.min(1, throttle + delta);
        else throttle = Math.max(0, throttle - delta * 1.5);
    }

    if(typeof updateTrainPhysics === "function") updateTrainPhysics(delta);

    // UI Updates
    const prompt = document.getElementById('prompt');
    if(player && train) {
        const nearItem = worldItems.find(i => player.position.distanceTo(i.position) < 4);
        if(nearItem) {
            prompt.innerText = "[E] PEGAR ITEM";
            prompt.style.display = "block";
        } else if(player.position.distanceTo(train.position) < 8) {
            prompt.innerText = isRiding ? "[Q] SAIR" : "[Q] CONDUZIR / [E] ABASTECER";
            prompt.style.display = "block";
        } else {
            prompt.style.display = "none";
        }
    }

    document.getElementById('speed').innerText = Math.round(trainSpeed * 120);
    document.getElementById('steamFill').style.width = steam + "%";

    if(player) {
        camera.position.copy(player.position);
        camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    }
    renderer.render(scene, camera);
}

// Inicia o jogo garantindo que o DOM carregou
window.addEventListener('load', init);
