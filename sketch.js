let video;
let facemesh;
let predictions = [];
// 指定要串接的臉部特徵點編號 (這些點構成嘴唇外圍輪廓)
const facePoints = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function setup() {
  // 產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide(); // 隱藏原本的 DOM 元素
  imageMode(CENTER); // 設定影像的繪製模式為置中

  // 初始化 ml5.js 的 Facemesh 模型
  facemesh = ml5.facemesh(video, () => console.log('Facemesh is ready!'));
  facemesh.on('predict', results => {
    predictions = results;
  });
}

function draw() {
  // 畫布背景顏色設定為 e7c6ff
  background('#e7c6ff');
  
  // 設定文字樣式與位置，顯示在影像上方且左右置中
  fill(0); // 設定文字為黑色
  textAlign(CENTER, CENTER);
  textSize(32); // 設定適當的文字大小
  text('教科123456789', width / 2, height * 0.125);

  push();
  // 將座標原點移動到畫布中心
  translate(width / 2, height / 2);
  // 左右翻轉
  scale(-1, 1);
  // 繪製影像，由於原點已在中心，座標給 (0,0)，寬高為畫布的 50%
  image(video, 0, 0, width * 0.5, height * 0.5);

  // 繪製臉部特徵點連線
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    
    stroke('pink');   // 線條採用粉紅色
    strokeWeight(15); // 線條粗細為15
    
    for (let i = 0; i < facePoints.length; i++) {
      let pt1 = keypoints[facePoints[i]];
      let pt2 = keypoints[facePoints[(i + 1) % facePoints.length]]; // 利用取餘數讓頭尾點相連
      
      // 將特徵點座標轉換為目前影像縮放及平移後的比例位置
      let x1 = (pt1[0] / video.width - 0.5) * (width * 0.5);
      let y1 = (pt1[1] / video.height - 0.5) * (height * 0.5);
      let x2 = (pt2[0] / video.width - 0.5) * (width * 0.5);
      let y2 = (pt2[1] / video.height - 0.5) * (height * 0.5);
      
      line(x1, y1, x2, y2);
    }
  }
  pop();
}

// 當視窗大小改變時，重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
