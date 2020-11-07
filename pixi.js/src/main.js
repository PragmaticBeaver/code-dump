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

function readImgLib() {
  console.log("====|> reading image-lib <|====");
  loaderShared
    .add([battleImgPath, iconImgPath])
    .onProgress.add((loader, resource) => {
      console.log(`loading ${resource.url}`);
      console.log(`overall progress ${loader.progress}%`);
    });
  //(Note: If you ever need to reset the loader to load a new batch of files, call the loader's reset method: PIXI.loader.reset();)
}

function resize(
  width = window.innerWidth - 50,
  height = window.innerHeight - 100
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
  document.getElementById("pixi-area").appendChild(app.view);

  readImgLib();
  loaderShared.load(spawnBattlemap);
}

init();
resize();
