let video;

function setup() {
  // 產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide(); // 隱藏原本的 DOM 元素
  imageMode(CENTER); // 設定影像的繪製模式為置中
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
  pop();
}

// 當視窗大小改變時，重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
