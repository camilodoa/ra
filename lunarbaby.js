/*
camilo ortiz, 2020, camilodoa.ml

lunary baby in the browser

dependencies:
paper.js
p5.js
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

  var n = 1;
  var bodycolor = '#FDD8B5';

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

  // arms

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


      this.shortPath = new Path();
      this.shortPath.strokeWidth = 4;

      this.count = 0;
    },

    run: function() {
      // var segments = this.path.segments,
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

      this.head.matrix = new Matrix().translate(this.loc);
      this.eye.matrix = new Matrix().translate(this.loc);
      this.iris.matrix = new Matrix().translate(this.loc);
      this.pupil.matrix = new Matrix().translate(this.loc);

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
    }
  });

  // main
  var lunarbabies = [];

  for (var i = 0; i < n; i++) {
    lunarbabies.push(new LunaryBaby(Point.random().multiply(view.size)));
  }

  view.onFrame = function(event) {
    // Draw lunar babies
    for (var i = 0, l = lunarbabies.length; i < l; i++) {
      lunarbabies[i].run();
    }
  }
}
