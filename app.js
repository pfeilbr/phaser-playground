var game = new Phaser.Game(300, 300, Phaser.CANVAS, 'game');


var PhaserGame = function() {

};

PhaserGame.prototype = {

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
  },

  create: function() {

    var self = this;
    console.log('create');

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // turn gravity on
    self.game.physics.arcade.gravity.y = 100;

    // create ground
    self.game.create.texture('ground', self.createBlock('1', this.ground.width, this.ground.height), 1, 1);
    this.ground.i = this.game.add.sprite(0, this.game.height - this.ground.height, 'ground');
    this.game.physics.enable([this.ground.i], Phaser.Physics.ARCADE);
    this.ground.i.body.allowGravity = false;
    this.ground.i.body.immovable = true;

    // create drop item
    self.game.create.texture('dropItem', self.createBlock('3', 30, 30), 1, 1);

    // drop item on mouse click or any key press
    self.game.input.onDown.add(this.dropItem, this);
    document.body.addEventListener('keypress', this.dropItem.bind(this));

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
    this.scoreText = this.game.add.text(16, 16, 'score: ' + this.score, { fontSize: '18px', fill: '#fff' });

    var pause = [
      '.....',
      'DDDDD',
      '....',
      'DDDDD',
      '.....',
    ];
    game.create.texture('pause', pause);


    this.pauseButton = this.game.add.button(this.game.width - 50, this.pauseButton.height / 2, 'pause', function() {
      console.log('pause');
      self.pause = !self.pause;
    }, this, 1, 0, 2);
    this.pauseButton.anchor.setTo(0.5, 0.5);


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
      self.incrementScore(1);
    });

    /*
    if (game.input.activePointer.isDown) {
      console.log('clicked / tapped');
    }

    if (this.char.forward && (this.char.i.x > (this.game.width - this.char.width))) {
      this.char.forward = false;
    }

    if (!this.char.forward && (this.char.i.x < 0)) {
      this.char.forward = true;
    }

    this.char.i.x += (this.char.forward ? this.char.speed : -this.char.speed);
    */
  },

  render: function() {
    //this.game.debug.geom(this.floor,'#0fffff');
  },

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
      return
    }

    self.dropItem = self.game.add.sprite(self.char.i.x, self.char.i.y + self.char.i.height, 'dropItem');
    self.game.physics.enable([self.dropItem], Phaser.Physics.ARCADE);
    self.dropItem.body.bounce.y = 0.2;
    self.dropItem.body.collideWorldBounds = true;
    self.dropItems.push(self.dropItem);
  },

  incrementScore: function(increment) {
    this.score += increment;
    this.scoreText.text = 'score: ' + this.score;
  }

};

game.state.add('Game', PhaserGame, true);
