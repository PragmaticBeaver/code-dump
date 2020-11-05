// aliases
const Application = PIXI.Application;
const Loader = PIXI.Loader;
const Sprite = PIXI.Sprite;

let app;

const battleImgPath = "assets/battle.jpg";
const iconImgPath = "assets/icon.png";

const loaderShared = Loader.shared;

function spawnBattlemap() {
  const sprite = new Sprite(loaderShared.resources[battleImgPath].texture);
  app.stage.addChild(sprite);
}

function loadImg() {
  loaderShared.add([battleImgPath, iconImgPath]).load(spawnBattlemap);
}

function resize(
  width = window.innerWidth / 2,
  height = window.innerHeight / 2
) {
  app.renderer.autoDensity = true;
  app.renderer.resize(width, height);
}

function init() {
  app = new Application({
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1,
  });

  // Add the canvas that Pixi automatically created for you to the HTML document
  // must be present before any sprites can be shown
  document.body.appendChild(app.view);

  loadImg();
}

init();
resize();
