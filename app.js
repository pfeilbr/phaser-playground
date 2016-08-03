var game = new Phaser.Game(300, 300, Phaser.AUTO, 'game');

var Game = {};

Game.Menu = function(game) {};
Game.Menu.prototype = {
  preload: function() {
    this.game.load.audio('menu', ['assets/menu.wav']);
  },
  create: function() {
    var self = this;

    this.game.stage.backgroundColor = '#FF9298';

    this.menuSound = this.game.add.audio('menu');
    this.menuSound.loop = true;
    this.menuSound.play();

    this.playText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Pig Drop', {
      fontSize: '48px',
      fill: '#fff'
    });
    this.playText.anchor.setTo(0.5, 0.5);

    this.startText = this.game.add.text(this.game.world.centerX, this.game.world.centerY + (this.game.height / 4), 'press ENTER to start', {
      fontSize: '18px',
      fill: '#fff'
    });
    this.startText.anchor.setTo(0.5, 0.5);

    this.startTextTween = this.game.add.tween(this.startText);
    this.startTextTween.to({
        angle: -2
      }, 500).to({
        angle: 2
      }, 500).loop()
      .start()

    //var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER)

    this.game.input.keyboard.onDownCallback = function(e) {
      self.start();
    }
    this.game.input.onDown.addOnce(this.start, this);
  },

  start: function() {
    this.menuSound.stop();
    this.game.state.start('Main');

    // unhook any key listener
    this.game.input.keyboard.onDownCallback = null;
  }
}

Game.Main = function(game) {};
Game.Main.prototype = {

  init: function() {
    console.log('init');

    this.pauseButtonImage = 'http://placehold.it/100x50/1792CF.png/ffffff?text=pause';

    this.dropItems = [];

    this.panel = {
      width: 1.0,
      height: 0.20
    };

    this.pauseButton = {
      width: 0.2 * this.game.width,
      height: this.panel.height * this.game.height
    };

    this.ground = {
      width: this.game.width,
      height: 0.10 * this.game.height,
    }

    this.char = {
      width: 0.10 * this.game.width,
      height: 0.10 * this.game.width,
      forward: true,
      speed: 4
    };
  },

  preload: function() {
    console.log('preload');
    this.game.load.audio('main-background', ['assets/main-background.wav']);
    this.game.load.audio('drop', ['assets/drop.wav']);
    this.game.load.audio('error', ['assets/error.wav']);
    this.game.load.audio('hit', ['assets/hit.wav']);
    this.game.load.audio('pause', ['assets/pause.wav']);
  },

  create: function() {

    var self = this;
    console.log('create');

    this.game.stage.backgroundColor = '#1792CF';

    // sounds
    this.mainBackgroundSound = this.game.add.audio('main-background');
    this.mainBackgroundSound.loop = true;
    this.mainBackgroundSound.play();

    this.dropSound = this.game.add.audio('drop');
    this.errorSound = this.game.add.audio('error');
    this.hitSound = this.game.add.audio('hit');
    this.pauseSound = this.game.add.audio('pause');

    // physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // turn gravity on
    this.game.physics.arcade.gravity.y = 100;

    // create transparent background
    // this is to capture any clicks or taps, but allows other buttons/text
    // to be clicked like pause
    this.background = this.game.add.sprite(0, 0);
    this.background.fixedToCamera = true;
    this.background.scale.setTo(this.game.width, this.game.height);
    this.background.inputEnabled = true;
    this.background.input.priorityID = 0; // lower priority

    // create ground
    this.game.create.texture('ground', self.createBlock('1', this.ground.width, this.ground.height), 1, 1);
    this.ground.i = this.game.add.sprite(0, this.game.height - this.ground.height, 'ground');
    this.game.physics.enable([this.ground.i], Phaser.Physics.ARCADE);
    this.ground.i.body.allowGravity = false;
    this.ground.i.body.immovable = true;

    // create drop item
    this.game.create.texture('dropItem', this.createBlock('3', 30, 30), 1, 1);

    // drop item when any key is pressed
    this.game.input.keyboard.onDownCallback = this.dropItem.bind(this);

    // drop item on any click / tap
    this.background.events.onInputDown.add(this.dropItem, this);

    var pixelWidth = 2;
    var pixelHeight = 2;
    var ufo = [
      '....DDDDDDDD....',
      '...DDEEDDDDDD...',
      '..DDDEEDDDDDDD..',
      '..DDDDDDDDDDDD..',
      '..DDDD5555DDDD..',
      '..DDD555555DDD..',
      '..DDD555555DDD..',
      '..DDD555555DDD..',
      '..334244333333..',
      '.33344443333333.',
      '3333444433333333',
      '....5...5..5....',
      '...5....5...5...',
      '.66....66....66.',
      '.66....66....66.'
    ];
    this.game.create.texture('ufo', ufo, pixelWidth, pixelHeight);

    this.score = 0;
    this.scoreText = this.game.add.text(this.game.width * 0.15, this.game.height * 0.1, 'score: ' + this.score, {
      fontSize: '14px',
      fill: '#fff'
    });
    this.scoreText.anchor.setTo(0.5, 0.5);

    this.pauseText = this.game.add.text(this.game.width * 0.85, this.game.height * 0.1, 'pause', {
      fontSize: '14px',
      fill: '#fff'
    });
    this.pauseText.anchor.setTo(0.5, 0.5);
    this.pauseText.inputEnabled = true;
    this.pauseText.input.priorityID = 1;
    this.pauseText.input.useHandCursor = true
    this.pauseText.events.onInputDown.add(function() {

      if (this.pauseText.text === 'pause') {
        self.pause = true;
        this.game.physics.arcade.isPaused = true;

        this.pauseText.text = 'resume';

        this.pauseSound.onStop.addOnce(function() {
          this.game.sound.mute = true;
        }, this);


      } else {
        self.pause = false;
        this.game.physics.arcade.isPaused = false;
        this.game.sound.mute = false;
        this.pauseText.text = 'pause';
      }
      this.pauseSound.play();
    }, this);


    this.char.i = this.game.add.sprite(0, this.game.height * this.panel.height, 'ufo');
    this.game.physics.enable([this.char.i], Phaser.Physics.ARCADE);
    this.char.i.body.bounce.x = 1;
    this.char.i.body.velocity.x = 200;
    this.char.i.body.allowGravity = false;
    this.char.i.body.collideWorldBounds = true;
  },

  update: function() {
    var self = this;
    if (this.pause) {
      return;
    }

    this.game.physics.arcade.collide(this.dropItems, this.ground.i);

    this.game.physics.arcade.collide(this.dropItems, this.dropItems, function(sprite1, sprite2) {
      console.log('collide called');
      sprite1.kill();
      self.hitSound.play();
      self.incrementScore(1);
    });

  },

  render: function() {},

  createBlock: function(colorCode, width, height) {
    var rows = [];
    for (var i = 0; i < height; i++) {
      var row = '';
      for (var j = 0; j < width; j++) {
        row += colorCode;
      }
      rows.push(row);
    }
    return rows;
  },

  dropItem: function() {
    var self = this;

    // prevent dropping an item if a previous item is falling
    if (self.dropItem && self.dropItem.body && self.dropItem.body.velocity.y > 0) {
      this.errorSound.play();
      return;
    }

    self.dropItem = self.game.add.sprite(self.char.i.x, self.char.i.y + self.char.i.height, 'dropItem');
    self.game.physics.enable([self.dropItem], Phaser.Physics.ARCADE);
    self.dropItem.body.bounce.y = 0.2;
    self.dropItem.body.collideWorldBounds = true;
    self.dropItems.push(self.dropItem);

    this.dropSound.play();
  },

  incrementScore: function(increment) {
    this.score += increment;
    this.scoreText.text = 'score: ' + this.score;

    // increase speed as score increases
    if (this.char.i.body.velocity.x > 0) {
      this.char.i.body.velocity.x += (this.score * 2);
    } else {
      this.char.i.body.velocity.x += -(this.score * 2);
    }
  }

};

game.state.add('Menu', Game.Menu);
game.state.add('Main', Game.Main);

game.state.start('Menu');
