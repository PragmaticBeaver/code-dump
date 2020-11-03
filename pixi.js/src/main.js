let app;

const battleImg = "assets/battle.jpg";

function loadImg() {
  PIXI.loader.add(battleImg).load(() => {
    const sprite = new PIXI.Sprite(PIXI.loader.resources[battleImg].texture);
    app.stage.addChild(sprite);
  });
}

function resize(
  width = window.innerWidth / 2,
  height = window.innerHeight / 2
) {
  app.renderer.autoDensity = true;
  app.renderer.resize(width, height);
}

function init() {
  app = new PIXI.Application({
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
