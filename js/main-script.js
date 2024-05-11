import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
/*import { randFloat } from 'three/scr/math/MathUtils.js';*/

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer;
var crane;
var tower, cabin, arm, portaLanca, craneCar, clawSupport, line, container;
var pivots = [];
var claws = [];
var garras = [];
let cameras = [];
let currentCamera=0;
let materials = [];
let craneMaterial = new THREE.MeshBasicMaterial({color: 0xffcc00});
materials.push(craneMaterial);
let baseMaterial = new THREE.MeshBasicMaterial({color: 0x808080});
materials.push(baseMaterial);
let containerMaterial = new THREE.MeshBasicMaterial({color: 0x509099});
materials.push(containerMaterial);
let containerMaterialbase = new THREE.MeshBasicMaterial({color: 0x509059});
materials.push(containerMaterialbase);
let objectMaterial = new THREE.MeshBasicMaterial({color: 0x666666});
materials.push(objectMaterial);
let objects = []; //usado na geração de cargas que inclui o contentor
let cargas=[]; //usado na verificação de colisões só com as cargas
let currentlyTransporting = -1;
let nActionsCompleted = -1;


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();


    scene.add(new THREE.AxesHelper(10));

    createBaseAndTower();
    createPortaLanca(tower);
    createCabin(portaLanca);
    createArm(portaLanca);
    createContainer();
    
    var i = 0;
    while(i < 5){
        var posx;
        if(Math.random()< 0.5){
            posx = -(Math.random() * 35 + 10);
        }
        else{
            posx = (Math.random() * 35 + 10);
        }
        let posy = Math.random()*3 + 4;
        var posz;
        if(Math.random()< 0.5){
            posz = -(Math.random() * 35 + 10);
        }
        else{
            posz = (Math.random() * 35 + 10);
        }
        let size = posy*2;
        var j = objects.length - 1;
        while(checkCollisions(posx,posy,posz,size)){
            if(Math.random()< 0.5){
                posx = -(Math.random() * 35 + 10);
            }
            else{
                posx = (Math.random() * 35 + 10);
            }
            if(Math.random()< 0.5){
                posz = -(Math.random() * 35 + 10);
            }
            else{
                posz = (Math.random() * 35 + 10);
            }
        }
        if(i == 0){
            createObject1(posx, posz, size);
        }
        if(i == 1){
            createObject2(posx, posz, size);
        }
        if(i == 2){
            createObject3(posx, posz, size);
        }
        if(i == 3){
            createObject4(posx, posz, size);
        }
        if(i == 4){
            createObject5(posx, posz, size);
        }
        i++;
    }
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras(){
    'use strict';
    let frontCamera = new THREE.OrthographicCamera(window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 1, 1000);
    frontCamera.position.set(0,0,100);
    frontCamera.lookAt(scene.position);
    cameras.push(frontCamera);

    let sideCamera = new THREE.OrthographicCamera(window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 1, 1000);
    sideCamera.position.set(100,0,0);
    sideCamera.lookAt(scene.position);
    cameras.push(sideCamera);

    let topCamera = new THREE.OrthographicCamera(window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 1, 1000);
    topCamera.position.set(0,100,0);
    topCamera.lookAt(scene.position);
    cameras.push(topCamera);

    let additionalOrthographicCamera = new THREE.OrthographicCamera(window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 1, 1000);
    additionalOrthographicCamera.position.set(100, 100, 100);
    additionalOrthographicCamera.lookAt(scene.position);
    cameras.push(additionalOrthographicCamera);

    let additionalPerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    additionalPerspectiveCamera.position.set(100, 100, 100);
    additionalPerspectiveCamera.lookAt(scene.position);
    cameras.push(additionalPerspectiveCamera);

    let craneCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    craneCamera.position.set(0,-5,0);
    craneCamera.lookAt(new THREE.Vector3(0,craneCamera.position.y -1,0));
    clawSupport.add(craneCamera);
    cameras.push(craneCamera);
    
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createBaseAndTower(){
    'use strict';
    crane = new THREE.Object3D();
    crane.userData = {armRotating: false, armAngle: 0, carMoving: false, carSpeed: 0, craneMoving: false, craneSpeed: 0, clawRotating: false, clawAngle: 0};
    let base = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), baseMaterial);
    base.position.y = 2.5;
    crane.add(base);

    tower = new THREE.Mesh(new THREE.BoxGeometry(5, 80, 5), craneMaterial);
    tower.position.y = 37.5;
    base.add(tower);

    scene.add(crane);
}
function createCabin(obj){
    'use strict';
    let cabinMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    materials.push(cabinMaterial);
    cabin = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 4), cabinMaterial);
    cabin.position.set(0,-10,4);
    obj.add(cabin);

}

function createArm(obj){
    'use strict';
    arm = new THREE.Mesh(new THREE.BoxGeometry(80, 5, 5), craneMaterial);
    arm.position.set(15,-10,0);
    obj.add(arm);
    createCounterWeight(arm);
    createCrane(arm)

}

function createPortaLanca(obj){
    'use strict';
    let thetaStart = Math.PI / 4;
    let radius = Math.sqrt(12.5);
    portaLanca = new THREE.Mesh(new THREE.ConeGeometry(radius, 15, 4, 1, false, thetaStart), craneMaterial);
    portaLanca.position.set(0,52,0);
    obj.add(portaLanca);
    let startPoint = new THREE.Vector3(0,8,0);
    let endPoint = new THREE.Vector3(-20,-7,0);
    createTirante(portaLanca, startPoint, endPoint);
    endPoint = new THREE.Vector3(40,-7,0);
    createTirante(portaLanca, startPoint, endPoint); 

}

function createCounterWeight(obj){
    'use strict';
    let counterWeight = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), baseMaterial);
    counterWeight.position.set(-35,-5,0);
    obj.add(counterWeight);
}

function createTirante(obj, startPoint, endPoint){
    'use strict';
    let material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    let points = [];
    points.push(startPoint, endPoint);
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let tirante = new THREE.Line(geometry, material);
    obj.add(tirante);
}

function createCrane(obj){
    'use strict';
    craneCar = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 5), craneMaterial);
    craneCar.position.set(27,-4,0);
    obj.add(craneCar);
    clawSupport = new THREE.Mesh(new THREE.SphereGeometry(3), craneMaterial);
    clawSupport.position.set(0,-25,0);
    craneCar.add(clawSupport);
    createClaw(clawSupport, 0);
    createClaw(clawSupport, 1);
    createClaw(clawSupport, 2);
    createClaw(clawSupport, 3);

}

function createClaw(obj,n){

    let baseclawgeometry = new THREE.BoxGeometry(10,2,2);
    baseclawgeometry.rotateZ(Math.PI/2);
    let baseclaw = new THREE.Mesh(baseclawgeometry, baseMaterial);
    let clawgeometry = new THREE.BoxGeometry(2,2,2);
    let claw = new THREE.Mesh(clawgeometry, baseMaterial);
    
    let pivot = new THREE.Object3D();
    obj.add(pivot);
    pivot.position.set(0, 0, 0);
    pivot.add(baseclaw);
    baseclaw.add(claw);
    baseclaw.position.set(0,-6,0);
    claw.position.set(-2,-4,0);
    claw.userData = {radius: 2};
    baseclaw.rotateY(Math.PI/2 * n);

    if (n==0){
        pivot.rotateZ(Math.PI/4);
    } else if (n==2){
        pivot.rotateZ(-Math.PI/4); 
    } else if (n==1){
        pivot.rotateX(Math.PI/4);
    } else if (n==3){
        pivot.rotateX(-Math.PI/4);
    }
    
    pivots.push(pivot);
    claws.push(baseclaw);
    garras.push(claw);
}

function createContainer(){
    let containerbase = new THREE.Mesh(new THREE.BoxGeometry(20,2,20), containerMaterialbase);
    containerbase.position.set(42,1,0);
    containerbase.add(containerbase);
    let containerside1 = new THREE.Mesh(new THREE.BoxGeometry(24,20,2), containerMaterial);
    containerside1.position.set(0,9,-11);
    containerbase.add(containerside1);
    let containerside2 = new THREE.Mesh(new THREE.BoxGeometry(2,20,24), containerMaterial);
    containerside2.position.set(-11,9,0);
    containerbase.add(containerside2);
    let containerside3 = new THREE.Mesh(new THREE.BoxGeometry(2,20,24), containerMaterial);
    containerside3.position.set(11,9,0);
    containerbase.add(containerside3);
    let containerside4 = new THREE.Mesh(new THREE.BoxGeometry(24,20,2), containerMaterial);
    containerside4.position.set(0,9,11);
    containerbase.add(containerside4);
    containerbase.userData = {radius: 26/2};
    scene.add(containerbase);
    objects.push(containerbase);
}

function createObject1(x,z,size){
    let object1 = new THREE.Mesh(new THREE.BoxGeometry(size,size,size), objectMaterial);
    object1.position.set(x,size/2,z);
    object1.userData = {radius : size};
    objects.push(object1);
    cargas.push(object1);
    scene.add(object1);
}

function createObject2(x,z,size){
    let object1 = new THREE.Mesh(new THREE.TorusGeometry(size/2,size/5,50,50), objectMaterial);
    object1.position.set(x,size/2+size/5,z);
    object1.userData = {radius : size*1.2};
    objects.push(object1);
    cargas.push(object1);
    scene.add(object1);
}

function createObject3(x,z,size){
    let object1 = new THREE.Mesh(new THREE.TorusKnotGeometry(size/4,size/10,100,16), objectMaterial);
    object1.position.set(x,size/2,z);
    object1.userData = {radius : size*1.2};
    objects.push(object1);
    cargas.push(object1);
    scene.add(object1);
}

function createObject4(x,z,size){
    let object1 = new THREE.Mesh(new THREE.IcosahedronGeometry(size/2,0), objectMaterial);
    object1.position.set(x,size/2,z);
    object1.userData = {radius : size};
    objects.push(object1);
    cargas.push(object1);
    scene.add(object1);
}

function createObject5(x,z,size){
    let object1 = new THREE.Mesh(new THREE.DodecahedronGeometry(size/2,0), objectMaterial);
    object1.position.set(x,size/2,z);
    object1.userData = {radius : size};
    objects.push(object1);
    cargas.push(object1);
    scene.add(object1);
}



//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(x,y,z,size){
    'use strict';
    for(var i = 0; i < objects.length; i++){
        let object1 = objects[i];
        if((object1.userData.radius + size) >= Math.sqrt(object1.position.distanceToSquared(new THREE.Vector3(x,y,z)))){
             return true;
        }
    }
    return false;
}
function cargoCollidedWithContainer(index){
    'use strict';
    let carga = cargas[index];
    let container = objects[0];
    let containerWorldPosition = new THREE.Vector3();
    container.getWorldPosition(containerWorldPosition);
    let cargaWorldPosition = new THREE.Vector3();
    carga.getWorldPosition(cargaWorldPosition);
    if(containerWorldPosition.distanceToSquared(cargaWorldPosition) < container.userData.radius/3 + carga.userData.radius){
        return true;
    }
    return false;
}

function checkCollisionWithAllClaws(){
    'use strict';
    for(let i=0; i <cargas.length; i++){
        let carga = cargas[i];
        let collisionCount = 0;
        for(let j=0; j<garras.length; j++){
            let garra = garras[j];
            let garraWorldPosition = new THREE.Vector3();
            console.log(garraWorldPosition.distanceToSquared(carga.position));
            garra.getWorldPosition(garraWorldPosition);
            if(Math.sqrt(garraWorldPosition.distanceToSquared(carga.position)) < garra.userData.radius + carga.userData.radius/2){
                collisionCount++;
            }
        }
        if (collisionCount === garras.length){
            return i;
        }
    }
    return -1;
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(index){
    'use strict';
    let carga = cargas[index];
    clawSupport.worldToLocal(carga.position);
    clawSupport.add(carga);
    currentlyTransporting = index;
    nActionsCompleted = 0;
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render(camera) {
    'use strict';
    renderer.render(scene, camera);

}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //backgroujd color
    renderer.setClearColor(0xADD8FF);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();


    render(cameras[currentCamera]);
    let keyElement = document.getElementById("key-" + (currentCamera + 1));
    keyElement.classList.add("locked");

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    //checkcrane colisions
    //if all 4 claws collided with object in cargas
    //object will travel with crane
    //if object then colides with container, remove object from scene and open claws 
    let cargaIndex = checkCollisionWithAllClaws();
    if (cargaIndex !== -1){
        handleCollisions(cargaIndex);
    }
    if (currentlyTransporting !== -1){
        //code for auto animation of crane
        //after all actions are complete reset nActionsCompleted to 0
        crane.userData.armRotating = false;
        crane.userData.carMoving = false;
        crane.userData.craneMoving = false;
        crane.userData.clawRotating = false;
        if (clawSupport.position.y < -15 && nActionsCompleted === 0){ //must move the crane and box up
            console.log("must move up")
            crane.userData.craneSpeed = 0.1;
            crane.userData.craneMoving = true;
            if (clawSupport.position.y >= -15.1){
                nActionsCompleted +=1;
                crane.userData.craneMoving = false;
            }
        }
        if (nActionsCompleted===1){
            console.log("must rotate");
            console.log(`rotation.y: ${portaLanca.rotation.y}`);
            crane.userData.armRotating = true;
            if (portaLanca.rotation.y >0.02){
                crane.userData.armAngle = -0.01;
            }
            else if (portaLanca.rotation.y < -0.02){
                crane.userData.armAngle = 0.01;
            }
            else{
                console.log("rotation done");
                nActionsCompleted+=1;
                crane.userData.armRotating = false;
            }
        }
        if (nActionsCompleted===2){
            crane.userData.carMoving = true;
            if (craneCar.position.x > 27.2){
                crane.userData.carSpeed = -0.1;
            }
            else if (craneCar.position.x < 26.8){
                crane.userData.carSpeed = 0.1;
            }
            else{
                crane.userData.carMoving = false;
                nActionsCompleted+=1;
            }
        }
        if (nActionsCompleted===3){
            crane.userData.craneMoving=true;
            if (cargoCollidedWithContainer(currentlyTransporting)){
                let carga= cargas[currentlyTransporting];
                clawSupport.remove(carga);
                scene.remove(carga);
                cargas.splice(currentlyTransporting,1);
                objects.splice(currentlyTransporting+1,1);
                nActionsCompleted+=1;
                crane.userData.craneMoving = false;
            }
            if (crane.userData.craneMoving){
                crane.userData.craneSpeed = -0.1;
            }
        }
        if (nActionsCompleted===4){
            crane.userData.clawRotating = true;
            if (pivots[0].rotation.z < Math.PI/1.8 - 0.01){
                crane.userData.clawAngle = 0.02;
            }
            else{
                crane.userData.clawRotating = false;
                nActionsCompleted+=1;
            }

        }
        if (nActionsCompleted==5){
            currentlyTransporting = -1;
            nActionsCompleted = -1;
        }

    }
    if (crane.userData.armRotating){
        portaLanca.rotateY(crane.userData.armAngle);
    }
    
    if (crane.userData.carMoving && craneCar.position.x < 37.5 && craneCar.position.x > -0.5){
        craneCar.translateOnAxis(new THREE.Vector3(1, 0, 0), crane.userData.carSpeed);
    } else if (crane.userData.carMoving && craneCar.position.x >= 37.5){
        craneCar.translateOnAxis(new THREE.Vector3(1, 0, 0), -0.01);
    } else if (crane.userData.carMoving && craneCar.position.x <= -0.5){
        craneCar.translateOnAxis(new THREE.Vector3(1, 0, 0), 0.01);
    }
    
    if (crane.userData.craneMoving && clawSupport.position.y < -5 && clawSupport.position.y > -70){
        clawSupport.translateOnAxis(new THREE.Vector3(0, 1, 0), crane.userData.craneSpeed);
    } else if (crane.userData.craneMoving && clawSupport.position.y >= -5){
        clawSupport.translateOnAxis(new THREE.Vector3(0, 1, 0), -0.01);
    } else if (crane.userData.craneMoving && clawSupport.position.y <= -70){
        clawSupport.translateOnAxis(new THREE.Vector3(0, 1, 0), 0.01);
    }
    
    if (crane.userData.clawRotating && pivots[0].rotation.z < Math.PI/1.8 && pivots[0].rotation.z > Math.PI/8){
        let speed = crane.userData.clawAngle;
        for (let i = 0; i < claws.length; i++){
            let pivot = pivots[i];
            if (i==0){
                pivot.rotateZ(speed);
            } else if (i==2){
                pivot.rotateZ(-speed); 
            } else if (i==1){
                pivot.rotateX(speed);
            } else if (i==3){
                pivot.rotateX(-speed);
            }
        }
    } else if (crane.userData.clawRotating && pivots[0].rotation.z >= Math.PI/1.8){
        let speed = -0.002;
        for (let i = 0; i < claws.length; i++){
            let pivot = pivots[i];
            if (i==0){
                pivot.rotateZ(speed);
            } else if (i==2){
                pivot.rotateZ(-speed); 
            } else if (i==1){
                pivot.rotateX(speed);
            } else if (i==3){
                pivot.rotateX(-speed);
            }
        }
    } else if (crane.userData.clawRotating && pivots[0].rotation.z <= Math.PI/8){
        let speed = 0.002;
        for (let i = 0; i < claws.length; i++){
            let pivot = pivots[i];
            if (i==0){
                pivot.rotateZ(speed);
            } else if (i==2){
                pivot.rotateZ(-speed); 
            } else if (i==1){
                pivot.rotateX(speed);
            } else if (i==3){
                pivot.rotateX(-speed);
            }
        }
    }
    
    
    let startPoint = new THREE.Vector3(0,0,0);
    let endPoint = clawSupport.position // a posição do clawSupport é relativa ao craneCar
    let points = [startPoint, endPoint];
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let material = new THREE.LineBasicMaterial({color: 0x0000ff});
    if (line) {
        craneCar.remove(line); // Remove the old line
    }
    line = new THREE.Line(geometry, material);
    craneCar.add(line);

    render(cameras[currentCamera]);

    for (let i = 0; i < cameras.length; i++) {
        let keyElement = document.getElementById("key-" + (i + 1));
        if (i === currentCamera) {
            keyElement.classList.add("locked");
        } else {
            keyElement.classList.remove("locked");
        }
    }

    requestAnimationFrame(animate);

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        for (let i = 0; i < cameras.length; i++) {
            if (cameras[i] instanceof THREE.PerspectiveCamera) {
                cameras[i].aspect = window.innerWidth / window.innerHeight;
            } else {
                cameras[i].left = -window.innerWidth / 4;
                cameras[i].right = window.innerWidth / 4;
                cameras[i].top = window.innerHeight / 4;
                cameras[i].bottom = -window.innerHeight / 4;
            }
            cameras[i].updateProjectionMatrix();
        }
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    let keyElement;
    if (currentlyTransporting !== -1){
        //dont process any other key if transporting
    }
    else{
        switch (e.keyCode) {
            case 49: //1
                currentCamera = 0;
                break;
            case 50: //2
                currentCamera = 1;
                break;
            case 51: //3
                currentCamera = 2;
                break;
            case 52: //4
                currentCamera = 3;
                break;
            case 53: //5
                currentCamera = 4;
                break;
            case 54: //6
                currentCamera = 5;
                break;
            case 55: //7
                for (let i = 0; i < materials.length; i++) {
                    materials[i].wireframe = !materials[i].wireframe;
                }
                keyElement = document.getElementById("key-7");
                if (keyElement.classList.contains("mesh")){
                    keyElement.classList.remove("mesh");
                } else {
                    keyElement.classList.add("mesh");
                }
                break;
            case 81: //Q
            case 113: //q
                if (!crane.userData.armRotating){
                    crane.userData.armRotating = true;
                    crane.userData.armAngle = 0.01;
                }
                keyElement = document.getElementById("key-q");
                keyElement.classList.add("pressed");
                break;
            case 65: //A
            case 97: //a
                if (!crane.userData.armRotating){
                    crane.userData.armRotating = true;
                    crane.userData.armAngle = -0.01;
                }
                keyElement = document.getElementById("key-a");
                keyElement.classList.add("pressed");
                break;
            case 87: //W
            case 119: //w
                if (!crane.userData.carMoving){
                    crane.userData.carMoving = true;
                    crane.userData.carSpeed = 0.1;
                }
                keyElement = document.getElementById("key-w");
                keyElement.classList.add("pressed");
                break;
            case 83: //S
            case 115: //s
                if (!crane.userData.carMoving && craneCar.position.x > 2.5){
                    crane.userData.carMoving = true;
                    crane.userData.carSpeed = -0.1;
                }
                keyElement = document.getElementById("key-s");
                keyElement.classList.add("pressed");
                break;
            case 69: //E
            case 101: //e
                if (!crane.userData.craneMoving){
                    crane.userData.craneMoving = true;
                    crane.userData.craneSpeed = 0.1;
                }
                keyElement = document.getElementById("key-e");
                keyElement.classList.add("pressed");
                break;
            case 68: //D
            case 100: //d
                if (!crane.userData.craneMoving){
                    crane.userData.craneMoving = true;
                    crane.userData.craneSpeed = -0.1;
                }
                keyElement = document.getElementById("key-d");
                keyElement.classList.add("pressed");
                break;
            case 82: //R
            case 114: //r
                if(!crane.userData.clawRotating){
                    crane.userData.clawRotating = true;
                    crane.userData.clawAngle = 0.02;
                }
                keyElement = document.getElementById("key-r");
                keyElement.classList.add("pressed");
                break;
            case 70: //F
            case 102: //f
                if(!crane.userData.clawRotating){
                    crane.userData.clawRotating = true;
                    crane.userData.clawAngle = -0.02;
                }
                keyElement = document.getElementById("key-f");
                keyElement.classList.add("pressed");
                break;
        }
    }
    
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    let keyElement;
    switch (e.keyCode) {
        case 81: //Q
        case 113: //q
            if (crane.userData.armRotating){
                crane.userData.armRotating = false;
            }
            keyElement = document.getElementById("key-q");
            keyElement.classList.remove("pressed");
            break;
        case 65: //A
        case 97: //a
            if (crane.userData.armRotating){
                crane.userData.armRotating = false;
            }
            keyElement = document.getElementById("key-a");
            keyElement.classList.remove("pressed");
            break;
        case 87: //W
        case 119: //w
            if (crane.userData.carMoving){
                crane.userData.carMoving = false;
            }
            keyElement = document.getElementById("key-w");
            keyElement.classList.remove("pressed");
            break;
        case 83: //S
        case 115: //s
            if (crane.userData.carMoving){
                crane.userData.carMoving = false;
            }
            keyElement = document.getElementById("key-s");
            keyElement.classList.remove("pressed");
            break;
        case 69: //E
        case 101: //e
            if (crane.userData.craneMoving){
                crane.userData.craneMoving = false;
            }
            keyElement = document.getElementById("key-e");
            keyElement.classList.remove("pressed");
            break;
        case 68: //D
        case 100: //d
            if (crane.userData.craneMoving){
                crane.userData.craneMoving = false;
            }
            keyElement = document.getElementById("key-d");
            keyElement.classList.remove("pressed");
            break;
        case 82: //R
        case 114: //r
            if(crane.userData.clawRotating){
                crane.userData.clawRotating = false;
            }
            keyElement = document.getElementById("key-r");
            keyElement.classList.remove("pressed");
            break;
        case 70: //F
        case 102: //f
            if(crane.userData.clawRotating){
                crane.userData.clawRotating = false;
            }
            keyElement = document.getElementById("key-f");
            keyElement.classList.remove("pressed");
            break;
        }
}

init();
animate();