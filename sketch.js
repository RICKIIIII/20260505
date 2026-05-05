let video;
let facemesh;
let faces = []; // 用來存放偵測結果
let bgImg; // 宣告背景圖片變數
let videoLoaded = false; // 記錄攝影機是否載入成功
// 指定要串接的臉部特徵點編號 (這些點構成嘴唇外圍輪廓)
const facePoints = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 指定第二組特徵點編號 (構成嘴唇內部輪廓)
const facePointsInner = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 指定左眼特徵點編號
const leftEyePoints = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
// 指定右眼特徵點編號
const rightEyePoints = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
// 指定臉部最外層輪廓特徵點編號
const faceOutlinePoints = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  // 預先載入背景圖片 (請確保資料夾中有 background.jpg)
  bgImg = loadImage(
    'background.jpg',
    () => console.log('背景圖片載入成功'),
    () => {
      console.warn('找不到 background.jpg，改載入線上備用圖片...');
      bgImg = loadImage('https://picsum.photos/1280/720'); // 若找不到檔案，則使用隨機備用風景圖
    }
  );

  // 預先載入 ml5.js (v1.x) 的 faceMesh 模型
  facemesh = ml5.faceMesh({ maxFaces: 1 });
}

function setup() {
  // 產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  // 建立視訊並加上成功載入的 callback
  video = createCapture(VIDEO, () => {
    videoLoaded = true; // 攝影機成功啟用後，將變數設為 true
  });
  video.hide(); // 隱藏原本的 DOM 元素
  imageMode(CENTER); // 設定影像的繪製模式為置中

  // 開始持續偵測視訊中的臉部
  facemesh.detectStart(video, results => {
    faces = results;
  });
}

function draw() {
  // 繪製背景圖片，取代原本的單色背景
  push();
  imageMode(CORNER); // 切換為左上角對齊模式繪製背景
  image(bgImg, 0, 0, width, height); // 讓圖片填滿整個畫布
  
  // 加上一層帶有漸層效果的黑色遮罩 (上深下淺)
  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)'); // 頂部較深 (黑色，不透明度 80%)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)'); // 底部較淺 (黑色，不透明度 10%)
  drawingContext.fillStyle = gradient; // 將填充樣式設定為我們建立的漸層
  
  noStroke(); // 不需要外框線
  rect(0, 0, width, height); // 畫一個填滿整個畫布的矩形
  pop();
  
  // 設定文字樣式與位置，顯示在影像上方且左右置中
  fill(0); // 設定文字為黑色
  textAlign(CENTER, CENTER);
  textSize(32); // 設定適當的文字大小
  text('教科123456789', width / 2, height * 0.125);

  // 若攝影機尚未載入或找不到，顯示提示文字並暫停後續繪製
  if (!videoLoaded) {
    fill(255, 0, 0); // 用紅色提示
    textSize(24);
    text('請連接攝影機並允許瀏覽器存取權限...', width / 2, height / 2);
    return; // 提早結束這回合的 draw，不執行後續的臉部辨識與裁切
  }

  push();
  // 將座標原點移動到畫布中心
  translate(width / 2, height / 2);
  // 左右翻轉
  scale(-1, 1);

  // 繪製臉部特徵點連線與剪裁影像
  if (faces.length > 0) {
    let keypoints = faces[0].keypoints;
    
    push(); // 儲存剪裁前狀態
    // 建立剪裁路徑，讓影像只顯示臉部範圍
    beginShape();
    for (let i = 0; i < faceOutlinePoints.length; i++) {
      let pt = keypoints[faceOutlinePoints[i]];
      let x = (pt.x / video.width - 0.5) * (width * 0.5);
      let y = (pt.y / video.height - 0.5) * (height * 0.5);
      vertex(x, y);
    }
    endShape(CLOSE);
    drawingContext.clip(); // 進行剪裁
    
    // 繪製影像，只會在剛剛建立的臉部剪裁範圍內顯示
    image(video, 0, 0, width * 0.5, height * 0.5);
    pop(); // 恢復狀態，解除剪裁 (以免影響後續線條的粗細繪製)

    // 使用共用函式繪製不同部位的線條
    drawFacialFeature(keypoints, facePoints, 'pink', 1);
    drawFacialFeature(keypoints, facePointsInner, 'red', 1);
    drawFacialFeature(keypoints, leftEyePoints, '#333333', 15);
    drawFacialFeature(keypoints, rightEyePoints, '#333333', 15);
    drawFacialFeature(keypoints, faceOutlinePoints, '#00FFFF', 2);
  } else {
    // 若沒有偵測到臉部，顯示原本的完整影像
    image(video, 0, 0, width * 0.5, height * 0.5);
  }
  pop();
}

// 建立共用的特徵點繪製函式
function drawFacialFeature(keypoints, pointsArray, col, weight) {
  stroke(col);
  strokeWeight(weight);
  
  for (let i = 0; i < pointsArray.length; i++) {
    let pt1 = keypoints[pointsArray[i]];
    let pt2 = keypoints[pointsArray[(i + 1) % pointsArray.length]]; // 利用取餘數讓頭尾點相連
    
    // 將特徵點座標轉換為目前影像縮放及平移後的比例位置
    let x1 = (pt1.x / video.width - 0.5) * (width * 0.5);
    let y1 = (pt1.y / video.height - 0.5) * (height * 0.5);
    let x2 = (pt2.x / video.width - 0.5) * (width * 0.5);
    let y2 = (pt2.y / video.height - 0.5) * (height * 0.5);
    
    line(x1, y1, x2, y2);
  }
}

// 當視窗大小改變時，重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
