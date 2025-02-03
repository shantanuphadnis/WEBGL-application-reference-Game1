/*
  This program creates a dynamic 3D driving simulation using p5.js. 
  Key Features:
  - Moving buildings and road stripes to simulate motion.
  - Obstacle cars appearing on the road.
  - Player-controlled car with constrained horizontal movement.
  - Glowing sun and a rotating sky sphere.

  Key logic for moving objects forward (ChatGPT assisted):
  - Building positions are stored in the `buildingPositions` array.
    Lines:
      - Added to array: `if (a % 50 === 0 && a > 0) { buildingPositions.push(a); }`
      - Movement: `buildingPositions[j] += 5;`
      - Reset: `if (buildingPositions[j] > 1000) { buildingPositions.splice(j, 1); j--; }`

  - Road stripes (yellow boxes) are stored in the `yellowBoxPositions` array.
    Lines:
      - Added to array: `if (b % 100 === 0 && b > 0) { yellowBoxPositions.push(b); }`
      - Movement: `yellowBoxPositions[i] += 25;`
      - Reset: `if (yellowBoxPositions[i] > 600) { yellowBoxPositions.splice(i, 1); i--; }`
*/

let a = 0;
let b = 0;
let constrainedMouseX;
let isGameOver = false;
let score = 0;

let r;
let v;
let d;

let yellowBoxPositions = []; // Array to store positions of yellow boxes
let buildingPositions = []; // Array to store positions of buildings
let obstacleCars = []; // Array to store positions of obstacle cars
let hands = [];

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({ flipped: true });
  myFont = loadFont("assets/Font.ttf");
  coinsound = loadSound("assets/Coin.mp3")
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  stroke(255);
  a = height / 2;
  b = height / 2;
  r = random(150, 350);
  v = random(100, 150);
  fill(random(100, 255), random(100, 255), random(100, 255));

  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  textFont(myFont);
}

function draw() {
  background(135, 206, 235);

  push();
  textFont(myFont);
  textSize(24);
  fill("black");
  text(`Score: ${score}`, -290, -150);
  pop();

  let d = windowWidth / 2;
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;

    constrainedMouseX = constrain(finger.x, d - 55, d + 55);
  }
  a += 15;
  b += 25;

  // Add glowing sun effect
  push();
  translate(300, -460, -1500);
  strokeWeight(1);
  noStroke();
  // stroke(255, 205, 0);
  fill("yellow");
  // rotateZ(frameCount * 0.01);
  // rotateX(frameCount * 0.01);
  // rotateY(frameCount * 0.01);
  sphere(200); // Large sphere to represent the sun
  pop();

  push();
  stroke("blue");
  strokeWeight(0.5);
  noFill();
  //fill("orange")
  rotateZ(frameCount * 0.001);
  rotateX(frameCount * 0.001);
  rotateY(frameCount * 0.001);
  sphere(2000); // Large sphere to represent the sun
  pop();

  fill(255);
  strokeWeight(0.4);
  stroke("grey");

  // Add a new building position every time `a` is a multiple of 100
  if (a % 50 === 0 && a > 0) {
    buildingPositions.push(a);
  }

  // Draw all buildings stored in the array
  for (let j = 0; j < buildingPositions.length; j++) {
    push();
    fill(255, 200, 0);
    translate(150, 0, buildingPositions[j] - 500);
    box(70, v, 170);
    pop();

    push();
    fill(15, 55, 70);
    translate(150, 0, buildingPositions[j]);
    box(100, r, 170);
    pop();

    push();
    fill(20, 120, 20);
    translate(150, 0, buildingPositions[j] + 250);
    box(70, v, 170);
    pop();

    push();
    fill(85, 55, 70);

    translate(-150, 0, buildingPositions[j] - 250);
    box(70, v, 170);
    pop();

    push();
    fill(205, 55, 70);

    translate(150, 0, buildingPositions[j] + 620);
    box(70, r, 170);
    pop();

    push();
    fill(80, 9, 90);
    translate(-150, 0, buildingPositions[j]);
    box(70, v, 170);
    pop();

    // push();
    // translate(-150, 0, buildingPositions[j] - 625);
    // box(70, v, 170);
    // pop();

    // Move the building smoothly forward
    buildingPositions[j] += 15;

    // Remove buildings that are off the screen
    if (buildingPositions[j] > 1000) {
      buildingPositions.splice(j, 1);
      j--; // Adjust index to account for removed element
    }
  }

  // Reset `a` when it gets too large
  if (a > 500) {
    a = 0;
  }

  // Ground
  push();
  fill(51);
  strokeWeight(0.5);
  translate(0, 50, 100);
  box(9200, 10, 1500);
  pop();

  //CAR

  push();

  fill(0);
  strokeWeight(0.5);
  translate(constrainedMouseX - d, 25, 600);
  box(22, 15, 150);
  pop();

  push();
  fill(0);
  strokeWeight(0.5);
  translate(constrainedMouseX - d, 30, 600);
  box(28, 5, 170);
  pop();

  push();
  fill("grey");
  strokeWeight(0.5);
  translate(constrainedMouseX - d, 35, 800);
  box(10, 5, 10);
  pop();

  push();
  fill(180);
  strokeWeight(0.5);
  translate(-360, 50, 100);
  box(550, 20, 1500);
  pop();

  push();
  fill(180);
  strokeWeight(0.5);
  translate(360, 50, 100);
  box(550, 20, 1500);
  pop();

  // Obstacle Cars
  if (frameCount % 60 === 0) {
    let randomX = random(d - 200, d -375);
    obstacleCars.push({ x: randomX, z: -500 });
  }

  for (let i = 0; i < obstacleCars.length; i++) {
    push();

    translate(obstacleCars[i].x, 25, obstacleCars[i].z);
    fill(255, 210, 0);
    strokeWeight(0.3);
    stroke("black");
    rotate(HALF_PI);
    // rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.035);
    //rotateY(frameCount * 0.01);
    cylinder(15, 3);

    fill(255, 180, 0);

    // rotateZ(frameCount * 0.01);
    cylinder(7, 7);

    pop();

    // Move obstacle cars closer to the player
    obstacleCars[i].z += 10;

    let v = constrainedMouseX - d;
    if (abs(obstacleCars[i].x - v) < 20 && abs(obstacleCars[i].z - 600) < 30) {
      obstacleCars.splice(i, 1);
      i--;
      score += 1;
      coinsound.play();
      
    }

    // // Remove obstacle cars that are off the screen
    // if (obstacleCars[i].z > 700) {
    //   obstacleCars.splice(i, 1);
    //   i--;
    // }
  }

  // Add a new yellow box position every time `b` is a multiple of 100
  if (b % 100 === 0 && b > 0) {
    yellowBoxPositions.push(b);
  }

  //RoadStripes
  // Draw all yellow boxes stored in the array
  for (let i = 0; i < yellowBoxPositions.length; i++) {
    push();
    translate(0, 49, yellowBoxPositions[i]);
    noStroke();
    fill("yellow");
    box(10, 9, 220);
    pop();

    push();
    translate(0, 49, yellowBoxPositions[i] + 500);
    noStroke();
    fill("yellow");
    box(10, 9, 220);
    pop();

    push();
    translate(0, 49, yellowBoxPositions[i] - 500);
    noStroke();
    fill("yellow");
    box(10, 9, 220);
    pop();

    // Move the yellow box smoothly forward
    yellowBoxPositions[i] += 25;

    // Remove yellow boxes that are off the screen
    if (yellowBoxPositions[i] > 600) {
      yellowBoxPositions.splice(i, 1);
      i--; // Adjust index to account for removed element
    }
  }

  // Reset `b` when it gets too large
  if (b > 500) {
    b = 0;
  }
}

function gotHands(results) {
  hands = results;
}
/*
class Car{
  constructor(){
    this.x = x
    this.y = y
    
  }
  
  
  
    push();

  fill(0);
  strokeWeight(0.5);
  translate(constrainedMouseX - d, 25, 600);
  box(22, 15, 150);
  pop();

  push();
  fill(0);
  strokeWeight(0.5);
  translate(constrainedMouseX - d, 30, 600);
  box(28, 5, 170);
  pop();
  
*/
