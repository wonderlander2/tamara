var canvas, stage;
var run = false;
var scanLineImage;
var _this = this;
function loadAssets() {
  scanLineImage = new Image();
  scanLineImage.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/scanlines.png";
  scanLineImage.onload = init.bind(_this);
  
}

function loadSounds() {
 var manifest = [
   {src:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/createjs.mp3", id:"createjs"},
   {src:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/Thunder.mp3", id:"thunder"}
 ];
  var loader = new createjs.LoadQueue(true);
  loader.installPlugin(createjs.Sound);
  loader.on("complete", handleSoundComplete);
	loader.loadManifest(manifest);
}

function handleSoundComplete(event) {
  song = createjs.Sound.play("createjs");
  song.volume = 0.5;
}

function init() {
  displayElements = [];
  
 

  var w = window.innerWidth;
  var h = window.innerHeight;

  for(var i=1;i<=3;i++) {
    this['canvas'+i] = document.getElementById('canvas'+i);
    this['stage'+i] = new createjs.Stage(this['canvas'+i]);

    this['canvas'+i].width = w;
    this['canvas'+i].height = h;

    displayElements.push({canvas:this['canvas'+i], stage:this['stage'+i]});
  }

  scale = Math.min(this['canvas1'].width, this['canvas1'].height)/720;

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", onTick, this);

  starField = new createjs.Container();
  starField.alpha = 0;
  
   createLogo();
  

  topGrid = createBG(6,6,window.innerWidth,  window.innerHeight);
  bottomGrid = createBG(6,6,window.innerWidth,  window.innerHeight);

  animateGrid(topGrid);
  animateGrid(bottomGrid, startLogoAnimation);

  var square = new createjs.Shape();
  square.graphics.ss(4).s("#D100B1").mt(0,0).lt(w, 0).lt(w, h).lt(0, h).lt(0, 0);

  this['stage1'].addChild(topGrid, square);
  this['stage2'].addChild(bottomGrid, square.clone());
  
  handleResize();
  
  //SD:Loading sound workaround to generate proper CodePen preview.
  loadSounds();
  window.addEventListener("resize", handleResize);
}

function getRange(min, max) {
  var scale = max - min;
  return Math.random()*scale+min;
}

function animateGrid(container, done) {
  var l = container.numChildren;
  var line, delay, o;
  var count = 0;
  for(var i=0;i<l;i++) {
    var linesContainer = container.getChildAt(i);
    var l2 = linesContainer.numChildren;
    console.log(l2)
    for(var j=0;j<l2;j++) {
      var line = linesContainer.getChildAt(j);
      delay = (line.parent.type == "col") ? (j*0.4)*250 : (j*0.4)*250;
      o = (line.parent.type == "col") ? {scaleY:container.height} : {scaleX:container.width};
      createjs.Tween.get(line, {onComplete:function () {
        if (++count == 8) {
          if (done != null) {
            done();
          }
        }
      }}).wait(delay).to(o,500);
    }
  }

  renderStarField();
  makeFieldBlink();
}

function renderStarField() {
  starField.removeAllChildren();
  var star = new createjs.Shape();
  var r = 10;
  star.graphics.f("#FFFFFF").dc(0, 0, r);
  star.cache(-r, -r, r * 2, r * 2);
  var fl = 250;
  var topCanvas = displayElements[0].canvas;
  var topStage =  displayElements[0].stage;
  var w = topCanvas.width;
  var h = topCanvas.height;
  var centerX = w>>1;
  var centerY = h>>1;
  for (var i = 0; i < 1000; i++) {
    var bmp = new createjs.Bitmap(star.cacheCanvas);
    bmp.z = 5000;
    bmp.posZ = bmp.z;
    var scale = fl / (fl + bmp.z);
    bmp.scaleX = bmp.scaleY = scale;
    bmp.alpha = 0.35 + Math.random();
    bmp.posX = centerX + getRange(-w, w)*scale;
    bmp.posY = centerY + getRange(-h, h)*scale;
    bmp.x = bmp.posX;
    bmp.y = bmp.posY;
    var d = Math.random()*35 + 5;
    var a = Math.random()*Math.PI*2;

    bmp.vx = Math.cos(a)*d;
    bmp.vy = Math.sin(a)*d;
    bmp._x = bmp.posX;
    bmp._y = bmp.posY;

    bmp.vz = (Math.random()*20+10)*(0.5+0.01)*4;

    bmp.scaleX = bmp.scaleY = scale;
    starField.addChild(bmp);
  }
  topStage.update();
}

function makeFieldBlink() {
  var l = starField.numChildren;
  for(var i=l-1;i>=0;i--) {
    var bmp = starField.getChildAt(i);
    createjs.Tween.get(bmp, {loop:-1}).to({alpha:0.1 + Math.random()}, Math.random()* 1000 | 0).wait(1000+Math.random()*1000 | 0).to({alpha:0}, Math.random()* 1000 | 0)
  }
}

function moveField() {
  var l = starField.numChildren;
  var fl = 250;


  var topCanvas = displayElements[0].canvas;
  var w = topCanvas.width;
  var h = topCanvas.height;

  var centerX = w>>1;
  var centerY = h>>1;

  for(var i=l-1;i>=0;i--) {
    var bmp = starField.getChildAt(i);
    var scale = fl / (fl+bmp.z);
    bmp._x += bmp.vx;
    bmp._y += bmp.vy;
    bmp.z -= bmp.vz;
    bmp.x = centerX + bmp._x * scale;
    bmp.y = centerY + bmp._y * scale;
    bmp.scaleX = bmp.scaleY = scale;
    if (bmp.z < 0) {
      bmp.z = 5000;
      bmp.posZ = bmp.z;
      var scale = fl / (fl + bmp.z);
      bmp.scaleX = bmp.scaleY = scale;
      bmp.alpha = 0.35 + Math.random();
      bmp.posX = centerX + getRange(-w, w)*scale;
      bmp.posY = centerY + getRange(-h, h)*scale;
      bmp.x = bmp.posX;
      bmp.y = bmp.posY;

      var d = Math.random()*35 + 5;
      var a = Math.random()*Math.PI*2;

      bmp.vx = Math.cos(a)*d;
      bmp.vy = Math.sin(a)*d;
      bmp._x = bmp.posX;
      bmp._y = bmp.posY;
      bmp.vz = (Math.random()*20+10)*(0.5+0.01)*4;
      bmp.scaleX = bmp.scaleY = scale;
    }
  }
}

function open() {
  var canvas1 = displayElements[0].canvas;
  var canvas2 = displayElements[1].canvas;

  canvas1.className = (canvas1.className === "trans scrollCanvas") ? "scrollCanvas transOut": "trans scrollCanvas";
  canvas2.className = (canvas2.className === "trans1 scrollCanvas1") ? "scrollCanvas1 transOut" :"trans1 scrollCanvas1";
  
  run = !run;

	if (run == false) {
		topGrid.getChildAt(1).y = 0;
		bottomGrid.getChildAt(1).y =0;
		makeFieldBlink();
	}
}

function createBG(total, cols, width, height) {
  var holder = new createjs.Container();
  var paddingX = width / cols | 0;
  var paddingY = 0;
  holder.width = width;
  holder.height = height;
  var columnContainer = new createjs.Container();
  columnContainer.name = "columnContainer";
  var rowContainer = new createjs.Container();
  rowContainer.name = "rowContainer";

  var line = null;
  for(var i=1;i<total;i++) {
    line = new createjs.Shape();
    line.graphics.f("#d100b1").dr(0, 0, 2, 1);
    line.x = (paddingX) * (i%cols);
    line.y = (i/cols|0) * (1+paddingY);
    line.scaleY = 1;
    line.colIndex = i;

    columnContainer.type = "col";
    columnContainer.addChild(line);
  }
  holder.addChild(columnContainer);
  paddingY = height / cols | 0;
  cols = 1;
  for(i=1;i<(total*4);i++) {
    line = new createjs.Shape();
    line.graphics.f("#d100b1").dr(0, 0, 1, 2);
    line.y = (i/cols|0) * (1+paddingY);
    line.scaleX = 1;
    line.rowIndex = i;
    rowContainer.type = "row";
    rowContainer.height += line.y;
    rowContainer.addChild(line);
  }
  holder.addChild(rowContainer);
  return holder;
}

function startLogoAnimation() {
  var p = panel.getChildAt(1);
  var p1 = panel1.getChildAt(1);
  var p2 = panel2.getChildAt(1);
  var duration = 500;
  createjs.Tween.get(p).to({scaleX:1}, duration).call(function () {
    createjs.Tween.get(p1).to({scaleX:1}, duration).call(function () {
      createjs.Tween.get(p2).to({scaleX:1}, duration).call(function () {
        //
        createjs.Tween.get(tri).to({alpha:1}, duration);
        createjs.Tween.get(panels).to({alpha:0}, duration);
        createjs.Tween.get(tri2).to({alpha:0}, duration);
        createjs.Tween.get(panels).to({alpha:0}, duration).call(function () {
          containerDOM.style.opacity = 1;
          var duration = 500;
          var delay = 250;
          createjs.Tween.get(title).to({alpha:1}, duration);
          createjs.Tween.get(titleShadow).to({alpha:1}, duration)
          createjs.Tween.get(version).wait(delay*0.75).to({alpha:1}, duration*0.75)
          createjs.Tween.get(comingsoon).wait(delay*2).to({alpha:1}, duration*0.75)
          
          createjs.Tween.get(this).wait(duration*10).call(function () {
            tri2.alpha = 0;
            starField.alpha = 1;
            //SD:Toggle BG
            //_this['stage3'].on("stagemousedown", open);
            open();
            run = true;
            
            setTimeout(function() {
              var thun = createjs.Sound.play("thunder");
              thun.volume = 0.5;
              createjs.Tween.get(comingsoon).to({alpha:0}, 500, createjs.Ease.elasticInOut).call(function () {
                comingsoon.htmlElement.innerHTML = "Comin";
                var thun1 = createjs.Sound.play("thunder");
                thun1.volume = 0.5;
              }) .to({alpha:1}, 500, createjs.Ease.elasticInOut).call(function () {
                comingsoon.htmlElement.innerHTML = "Coming Soon!";
              })
            }, 3000)
          })
        })
      })
    })
  });
}

function createLogo() {
  var triW = 600;
  var triH = 400;
  var titleDOM = document.getElementById("title");
  var titleShadowDOM = document.getElementById("titleShadow");
  var versionDOM = document.getElementById("version");
  var comingSoonDOM = document.getElementById("comingsoon");

  title = new createjs.DOMElement(titleDOM);
  title.alpha = 0;
  titleShadow = new createjs.DOMElement(titleShadowDOM);
  titleShadow.alpha = 0;
  version = new createjs.DOMElement(versionDOM);
  version.alpha = 0;

  comingsoon = new createjs.DOMElement(comingSoonDOM);
  comingsoon.alpha = 0;
  comingsoon.rotation = -18;
  version.rotation = -8;

  scanLines = new createjs.Shape();
  scanLines.graphics.clear().beginBitmapFill(scanLineImage).drawRect(0,0,this['canvas3'].width,this['canvas3'].height);
  scanLines.alpha = 0.75;

  containerDOM = document.getElementById('container');

  tri = new createjs.Shape();
  tri.width = triW;
  tri.height = triH;
  tri.graphics.s("#36e2f8").ss(3,2,0).mt(0, 0);
  tri.graphics.lf(["#000000","#393939"], [.1, 1], 60, 30, 10, 220).mt(0, 0);
  tri.graphics.lt(triW, 0).lt(triW/2, triH).lt(0,0).lt(triW/2,0);

  tri2 = new createjs.Shape();
  tri2.width = triW;
  tri2.height = triH;
  tri2.graphics.f("#00FF00").ss(5,2,0).mt(0, 0);
  tri2.graphics.lt(triW, 0).lt(triW/2, triH).lt(-1,0).lt(triW/2,0);

  tri.alpha = 0;

  panels = new createjs.Container();
  panels.width = 600;
  panels.height = 400;
  panels.regX = 300;
  panels.regY = 200;

  tri.regX = tri2.regX = 300;
  tri.regY = tri2.regY = 200;

  tri.x = (tri.width/2) + (this['canvas3'].width - tri.width>>1);
  tri.y = (tri.height/2) + (this['canvas3'].height - tri.height>>1);

  panels.x = tri.x;
  panels.y = tri.y;

  tri2.x = tri.x;
  tri2.y = tri.y;

  panel = createPanel(600, 4);
  panel.regX = 0;
  panel.regY = panel.height / 2;

  panel1 = createPanel(500, 3);
  panel2 = createPanel(500, 2);
  panel1.regY = panel1.height/2;

  panel1.x = panel.x + panel.width;
  panel1.y = panel.y;
  panel1.rotation = 127;

  panel2.x = triW/2;
  panel2.y = triH;
  panel2.rotation = -127;

  panels.mask = tri2;

  panels.addChild(panel, panel1, panel2);
  
  this['stage3'].addChild(starField, panels,tri, scanLines);
  this['stage3'].addChild(title, titleShadow, version, comingsoon);

}

function createPanel(w, h) {
  var panel = new createjs.Container();
  panel.width = w;
  panel.height = h;
  var bg = new createjs.Shape();
  bg.width = w;
  bg.height = h;
  bg.graphics.f(createjs.Graphics.getRGB(0, 0, 0, 0)).dr(0, 0, w, h);

  var s = new createjs.Shape();
  s.width = w;
  s.height = h;
  s.graphics.f("#36e2f8").dr(0, 0, w, h);

  s.scaleX = 0;
  panel.addChild(bg, s);
  return panel;
}

function handleResize(event) {
  var w = window.innerWidth;
  var h = window.innerHeight;
  var l = displayElements.length;
  for(var i=0;i<l;i++) {
    var canvas = displayElements[i].canvas;
    canvas.width = w;
    canvas.height = h;
  }

  scale = Math.min(this['canvas3'].width, this['canvas3'].height)/720;

  fontSize = this['canvas3'].width*0.14;
  fontSize1 = this['canvas3'].width*0.14;
  fontSize2 = this['canvas3'].width*0.04;
  if (fontSize > 140) fontSize = 140;
  if (fontSize1 > 180) fontSize1 = 180;
  if (fontSize2 > 40) fontSize2 = 40;

  resizeText();

  tri.x = ((tri.width*scale)/2) + ((this['canvas3'].width) - (tri.width*scale)>>1);
  tri.y = title.y + ((tri.height/2)*scale) * 0.8;

  tri.scaleX = tri2.scaleX = panels.scaleX = scale;
  tri.scaleY = tri2.scaleY = panels.scaleY = scale;

  tri2.x = tri.x;
  tri2.y = tri.y;

  panels.x = tri.x;
  panels.y = tri.y;


  updateGrid(this['stage1'], w, h);
  updateGrid(this['stage2'], w, h);
  
  scanLines.graphics.clear().beginBitmapFill(scanLineImage).drawRect(0,0,this['canvas3'].width,this['canvas3'].height);
	scanLines.alpha = 0.75;

  for(var i=0;i<l;i++) {
    var stage = displayElements[i].stage;
    stage.update(lastEvent);
  }
}

function updateGrid(stage, w, h) {
  var grid = stage.getChildAt(0);
  var columnContainer = grid.getChildAt(0);
  var rowContainer = grid.getChildAt(1);
  var square = stage.getChildAt(1);
  square.graphics.clear();
  square.graphics.ss(4).s("#D100B1").mt(0,0).lt(w, 0).lt(w, h).lt(0, h).lt(0, 0);
  var l = columnContainer.numChildren;
  var cols = 6;
  var paddingX = w / cols | 0;

  for(var i=0;i<l;i++) {
    var line = columnContainer.getChildAt(i);
    line.x = paddingX + ((paddingX) * (i%cols));
    line.scaleY = h;
  }

  l = rowContainer.numChildren;
  for(var i=0;i<l;i++) {
    var line = rowContainer.getChildAt(i);
    line.scaleX = w;
  }

  /*if (run == false) {
				topContainer.getChildAt(1).getChildAt(1).y = 0;
				bottomContainer.getChildAt(1).getChildAt(1).y =0
			}*/
}

function resizeText() {
  title.htmlElement.style.fontSize = fontSize+'px';
  version.htmlElement.style.fontSize = fontSize1+'px';

  comingsoon.htmlElement.style.fontSize = fontSize2+'px';
  comingsoon.htmlElement.style.zIndex = 5;

  titleShadow.htmlElement.style.fontSize = fontSize+'px';

  title.x = this['canvas3'].width - title.htmlElement.clientWidth>>1;
  title.y = (this['canvas3'].height- title.htmlElement.clientHeight>>1)*.8;
  version.x = title.x + (title.htmlElement.clientWidth - version.htmlElement.clientWidth);
  version.y = title.y + (60*scale);

  comingsoon.x = title.x - (60*scale);
  comingsoon.y = title.y + (20*scale);

  titleShadow.set({x:title.x, y:title.y});
}

var lastEvent;
function onTick(event) {
  lastEvent = event;
  var l = displayElements.length;
  var deltaS = event.delta / 1000;
  if (run ===true) {

    var position = bottomGrid.getChildAt(1).y + 350*deltaS;
    var h = bottomGrid.height;
    bottomGrid.getChildAt(1).y = (position >= 0) ? -h:position;
    topGrid.getChildAt(1).y = (position >= 0) ? -h:position;

    moveField();
  }

  for(var i=0;i<l;i++) {
    var stage = displayElements[i].stage;
    stage.update(event);
  }
}

WebFont.load({
  google: {
    families: ['Permanent Marker']
  },
  active: loadAssets
});