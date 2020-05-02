/*
camilo ortiz, 2020, camilodoa.ml

lunary baby in the browser

dependencies:
paper.js
*/

paper.install(window);
window.onload = function() {
  paper.setup('canvas');

  project.currentStyle = {
    strokeColor: 'white',
    strokeWidth: 2,
    strokeCap: 'round'
  };

  // Lunar Baby

  // "global" variables
  var n = 1;
  var bodycolor = '#FDD8B5';
  var blinking = false;
  var blinkcounter = 0;
  var movementcounter = 0;
  var covetedlocation = view.center;
  var maxspeed = 2;

  // head
  var head = new Path.Oval([0, 0], [40, 53]);
  head.fillColor = bodycolor;
  head.strokeColor = null;
  var headsymbol= new Symbol(head);

  // arms
  var rightarm = new Path.Oval([0, 0], [30, 5]);
  rightarm.fillColor = bodycolor;
  rightarm.strokeColor = null;
  rightarm.rotate(315)
  var rightarmsymbol= new Symbol(rightarm);

  var leftarm = new Path.Oval([0, 0], [30, 5]);
  leftarm.fillColor = bodycolor;
  leftarm.strokeColor = null;
  leftarm.rotate(225)
  var leftarmsymbol= new Symbol(leftarm);

  // legs
  var rightleg = new Path.Oval([0, 0], [30, 5]);
  rightleg.fillColor = bodycolor;
  rightleg.strokeColor = null;
  rightleg.rotate(300)
  var rightlegsymbol= new Symbol(rightleg);

  var leftleg = new Path.Oval([0, 0], [30, 5]);
  leftleg.fillColor = bodycolor;
  leftleg.strokeColor = null;
  leftleg.rotate(240)
  var leftlegsymbol= new Symbol(leftleg);

  // eye features
  var eye = new Path.Oval([0, 0], [20, 11]);
  eye.fillColor = 'white';
  eye.strokeColor = null;
  eye.strokeWidth = 0.5;
  var eyesymbol= new Symbol(eye);

  var eyelid = new Path.Oval([0, 0], [20, 11]);
  eyelid.fillColor = null;
  eyelid.strokeColor = null;
  var eyelidsymbol= new Symbol(eyelid);

  var iris = new Path.Oval([0, 0], [9, 9]);
  iris.fillColor = '#77B5FE';
  iris.strokeColor = null;
  var irissymbol= new Symbol(iris);

  var pupil = new Path.Oval([0, 0], [5, 5]);
  pupil.fillColor = 'black';
  pupil.strokeColor = null;
  var pupilsymbol= new Symbol(pupil);

  var shine = new Path.Oval([0, 0], [1.5, 1.5]);
  shine.fillColor = 'white';
  shine.strokeColor = null;
  var shinesymbol= new Symbol(shine);

  var LunaryBaby = Base.extend({
    initialize: function(position) {
      this.vel = Point.random();
      this.loc = position;

      // features
      this.rightarm = rightarmsymbol.place();
      this.leftarm = leftarmsymbol.place();
      this.rightleg = rightlegsymbol.place();
      this.leftleg = leftlegsymbol.place();
      this.head = headsymbol.place();

      // eye
      this.eye = eyesymbol.place();
      this.iris = irissymbol.place();
      this.pupil = pupilsymbol.place();
      this.shine = shinesymbol.place();
      this.eyelid = eyelidsymbol.place();

      this.shortPath = new Path();
      this.shortPath.strokeWidth = 4;

      this.count = 0;
    },

    blink: function(){
      // If the lunar baby is blinking, stop it from blinking
      if (blinking && blinkcounter > 25) {
        this.eyelid.symbol.item.fillColor = null;
        blinking = false;
        blinkcounter = 0; // reset blink counter
      }
      // If the baby is not blinking, it has a chance to blink
      else if (! blinking && Math.random() < 0.001){
        this.eyelid.symbol.item.fillColor = bodycolor;
        blinking = true;
        blinkcounter = 0;
      }
      else if (blinking){
        blinkcounter += 1;
      }
    },

    renderchanges: function () {
      this.head.matrix = new Matrix().translate(this.loc);
      this.eye.matrix = new Matrix().translate(this.loc);
      this.iris.matrix = new Matrix().translate(this.loc);
      this.pupil.matrix = new Matrix().translate(this.loc);
      this.eyelid.matrix = new Matrix().translate(this.loc);

      // arm movements
      var rightarmloc = Object.assign({}, this.loc);
      rightarmloc.x -= 15;
      this.rightarm.matrix = new Matrix().translate(rightarmloc);

      var leftarmloc = Object.assign({}, this.loc);
      leftarmloc.x += 15;
      this.leftarm.matrix = new Matrix().translate(leftarmloc);

      // leg movements
      var rightlegloc = Object.assign({}, this.loc);
      rightlegloc.x -= 6;
      rightlegloc.y += 15;
      this.rightleg.matrix = new Matrix().translate(rightlegloc);

      var leftlegloc = Object.assign({}, this.loc);
      leftlegloc.x += 6;
      leftlegloc.y += 15;
      this.leftleg.matrix = new Matrix().translate(leftlegloc);

      // eye shine location is off center
      var shineloc = Object.assign({}, this.loc);
      shineloc.x += 1;
      shineloc.y -= 1;
      this.shine.matrix = new Matrix().translate(shineloc);
    },

    redirect: function (degrees) {
      var direction = this.vel.clone();
      var target = new Point(Math.cos(degrees) * 2, Math.sin(degrees) * 2);
      target.add(direction);
      this.vel = target;
    },

    randomaction: function () {

      var actions = [
        'goright',
        'goleft',
        'goup',
        'godown'
      ];

      // change velocity based on action taken
      eval('this.' + actions[Math.floor(Math.random() * actions.length)] + '()');
    },

    godown: function () {
      this.redirect(270);
    },

    goup: function () {
      this.redirect(90);
    },

    goleft: function () {
      this.redirect(0);
    },

    goright: function () {
      this.redirect(180);
    },

    move: function () {
      x = this.loc.x += this.vel.x;
      y = this.loc.y += this.vel.y;
      speed = this.vel.length;
      count = speed * 10;
      // Bounce off the walls.
      if (x < 0 || x > view.size.width) this.vel.x *= -1;
      if (y < 0 || y > view.size.height) this.vel.y *= -1;
      delete this.vel._angle;
    },

    float: function () {
      // Floats around at a constant velocity
      dx = this.vel.x,
      dy = this.vel.y,
      x = this.loc.x += dx,
      y = this.loc.y += dy,
      speed = this.vel.length,
      count = speed * 10,
      k1 = -5 - speed / 3;

      // Bounce off the walls.
      if (x < 0 || x > view.size.width) this.vel.x *= -1;
      if (y < 0 || y > view.size.height) this.vel.y *= -1;

      // TODO: Fix this bug
      delete this.vel._angle;
    },

    run: function () {
      // If baby is moving and it's time to select a new action
      if (movementcounter > 100) {
        movementcounter = 0;
        this.randomaction();
        console.log("changed action");
      }else {
        this.float();
        movementcounter += 1;
      }

      this.blink();
      this.renderchanges();
    }
  });

  // main
  var lunarbabies = [];

  for (var i = 0; i < n; i++) {
    lunarbabies.push(new LunaryBaby(Point.random().multiply(view.size)));
  }

  view.onFrame = function (event) {
    // Draw lunar babies
    for (var i = 0, l = lunarbabies.length; i < l; i++) {
      lunarbabies[i].run();
    }
  }

  view.onMouseMove = function(event){
    covetedlocation = event.point;
    return false; // prevent touch scrolling
  }
}
