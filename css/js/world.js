let worldItems = [], shops = [];
const ITEMS = {
    COAL: { name: "Carvão", color: 0x222222, steam: 25, value: 0 },
    GOLD: { name: "Ouro", color: 0xffd700, steam: 0, value: 100 },
    SCRAP: { name: "Sucata", color: 0x888888, steam: 0, value: 20 }
};

function setupWorld() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 10000), new THREE.MeshStandardMaterial({ color: 0x345e37 }));
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    for(let z = 100; z > -5000; z -= 6) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0x3d2b1f }));
        s.position.set(0, 0.1, z);
        scene.add(s);
    }

    for(let i=0; i<80; i++) {
        let z = -i * 60;
        spawnItem(Math.random() * 40 - 20, z);
        if(i % 10 === 0) spawnShop(25, z);
    }
}

function spawnItem(x, z) {
    const r = Math.random();
    const type = r > 0.9 ? ITEMS.GOLD : (r > 0.7 ? ITEMS.SCRAP : ITEMS.COAL);
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5), new THREE.MeshStandardMaterial({ color: type.color }));
    mesh.position.set(x, 0.6, z);
    mesh.userData = { type };
    scene.add(mesh);
    worldItems.push(mesh);
}

function spawnShop(x, z) {
    const shop = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 10), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
    b.position.y = 4; shop.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(8, 5, 4), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    r.position.y = 10.5; r.rotation.y = Math.PI/4; shop.add(r);
    shop.position.set(x, 0, z);
    scene.add(shop);
    shops.push(shop);
}
