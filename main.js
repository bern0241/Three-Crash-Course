import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import * as dat from 'dat.gui';
import { OrbitControls } from 'https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const gui = new dat.GUI();
const world = {
  plane: {
    width: 24,
    height: 24,
    widthSegments: 32,
    heightSegments: 32
  }
}
gui.add(world.plane, 'width', 1, 50)
  .onChange(() => {
    generatePlane();
});
gui.add(world.plane, 'height', 1, 50)
  .onChange(() => {
    generatePlane();
});
gui.add(world.plane, 'widthSegments', 1, 50)
  .onChange(() => {
    generatePlane();
});
gui.add(world.plane, 'heightSegments', 1, 50)
  .onChange(() => {
    generatePlane();
});

function generatePlane() {
    planeMesh.geometry.dispose();
    planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);

    const { array } = planeMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) 
    {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      array[i + 2] = z + Math.random();
    }

    const colors = [];
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
      colors.push(0, 0.19, 0.4);
    }
    planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments); //width, height, segments width, segments height
const planeMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: true, vertexColors: true });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);


// vertice position randomization
const { array } = planeMesh.geometry.attributes.position;
const randomValues = [];
for (let i = 0; i < array.length; i++) 
{
  if (i % 3 === 0) { //every 3
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
    
      array[i] = x + (Math.random() - 0.5); //-0.5 - 0.5
      array[i + 1] = y + (Math.random() - 0.5); //-0.5 - 0.5
      array[i + 2] = z + Math.random();
  }

  randomValues.push(Math.random() - 0.5);  //-0.5 - 0.5
}

console.log(randomValues); //same amount as vertices

planeMesh.geometry.attributes.position.randomValues = randomValues;
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position; // adding onto position

console.log(planeMesh.geometry.attributes.position);

// color attribute addition
const colors = []
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) { //121
  colors.push(0, 0.19, 0.4); //pushes individually (amount = 363)
}


// planeMesh.geometry.setAttribute('Jesus');
planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

scene.add(planeMesh);

const light = new THREE.DirectionalLight(0xFFFFFF, 1.2);
light.position.set(0, 0, 1); //moves infront of us
scene.add(light)

const backLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
backLight.position.set(0, 0, -1); //moves infront of us
scene.add(backLight);

//had to do for raycasting
const mouse = {
  x: undefined,
  y: undefined
}

let frame = 0;
function animate() { //called over and over again
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.005;
  
  const { array , originalPosition, randomValues } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition.array[i] + Math.cos(frame + randomValues[i]) * 0.001;
    
    // y
    array[i + 1] = originalPosition.array[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;

    // if (i === 0) console.log(array[i]);
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  
  if (intersects.length > 0) { // ONLY 1
    const { color } = intersects[0].object.geometry.attributes;
    // RGB
    // vertice 1
    color.setX(intersects[0].face.a, 0.1); //bottom left
    color.setY(intersects[0].face.a, 0.5); //bottom left
    color.setZ(intersects[0].face.a, 1); //bottom left
    // vertice 2
    color.setX(intersects[0].face.b, 0.1); //bottom right
    color.setY(intersects[0].face.b, 0.5); //bottom right
    color.setZ(intersects[0].face.b, 1); //bottom right
    // vertice 3
    color.setX(intersects[0].face.c, 0.1); //
    color.setY(intersects[0].face.c, 0.5); //
    color.setZ(intersects[0].face.c, 1); //

    color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: .4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
      }
    });
  }
  // planeMesh.rotation.x += 0.01;
}

console.log(planeMesh.geometry.attributes.position);

animate();

//had to do for raycasting
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1; //COOL!
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})