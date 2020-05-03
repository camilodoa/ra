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
  var covetedlocation = new Point(view.center.x, view.center.y);
  var maxspeed = 2;
  // number of seconds in each action
  var actioncount = 40;


  // head
  var head = new Path.Oval([0, 0], [40, 53]);
  head.fillColor = bodycolor;
  head.strokeColor = null;
  var headsymbol= new Symbol(head);

  // arms
  var rightarm = new Path.Oval([0, 0], [30, 5]);
  rightarm.fillColor = bodycolor;
  rightarm.strokeColor = null;
  rightarm.rotate(315);
  var rightarmsymbol= new Symbol(rightarm);

  var leftarm = new Path.Oval([0, 0], [30, 5]);
  leftarm.fillColor = bodycolor;
  leftarm.strokeColor = null;
  leftarm.rotate(225);
  var leftarmsymbol= new Symbol(leftarm);

  // legs
  var rightleg = new Path.Oval([0, 0], [30, 5]);
  rightleg.fillColor = bodycolor;
  rightleg.strokeColor = null;
  rightleg.rotate(300);
  var rightlegsymbol= new Symbol(rightleg);

  var leftleg = new Path.Oval([0, 0], [30, 5]);
  leftleg.fillColor = bodycolor;
  leftleg.strokeColor = null;
  leftleg.rotate(240);
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

  var heaven = new Path.Oval(covetedlocation, [20, 20]);
  heaven.fillColor = 'white';
  heaven.strokeColor = null;
  heaven.strokeWidth = 0.5;
  var heavensymbol= new Symbol(heaven);

  // global redirect function
  let redirect = (position, velocity, degrees) => {
    // change velocity vector by adding a vector in the direction of degrees
    var direction = velocity.clone();
    var target = new Point(Math.cos(degrees) * 2, Math.sin(degrees) * 2);
    target.add(direction);
    return target;
  }

  var CovetedLocation = Base.extend({
    initialize: function (position) {
      this.heaven = heavensymbol.place();
    },
    update: function (position){
      this.heaven.matrix = new Matrix().translate(position);
    }
  })

  var LunaryBaby = Base.extend({
    initialize: function (position) {
      // initial position
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

      // movement
      this.blinking = false;
      this.blinkcounter = 0;
      this.movementcounter = 0;

      // frame rate
      this.count = 0;

      // possible actions available
      this.actions = [
        this.godown,
        this.goright,
        this.goup,
        this.goleft
      ];

      // Q-learning
      this.epsilon = 0.35;
      this.discount = 0.8;
      this.alpha = 0.3;
      this.weights = {};
    },

    calculatesuccessor: function (position, velocity, action) {
      var outcomevector = action(position, velocity);
      var finalposition = position;
      // add velocity vector to position to get the final position
      for (var i = 0; i < actioncount; i ++ ) {
        finalposition.x += outcomevector.x;
        finalposition.y += outcomevector.y;
      }
      return finalposition;
    },

    // q learning
    getfeatures: function (position, velocity, action) {
      // returns features from current state and a givens action
      var features = {};

      // resulting vector of taking the action at current position and velocity
      var outcomeposition = this.calculatesuccessor(position, velocity, action);

      // distance from outcome position to goal
      var distancetogoalvector = outcomeposition.subtract(covetedlocation);

      // divide length by view area so the feature weight doesn't blow up to infinity
      features['dist-to-coveted-location'] = distancetogoalvector.length / (view.size.height * view.size.width);
      return features;
    },

    getqvalue: function (position, velocity, action) {
      var value = 0;
      var features = this.getfeatures(position, velocity, action)
      for (var feature in features){
        if (this.weights[feature] === null || this.weights[feature] === undefined || isNaN(this.weights[feature])){
          this.weights[feature] = 0.0;
        }
        // dot product of weights and features
        value += this.weights[feature] * features[feature];
      }
      return value;
    },

    computevaluefromqvalues: function (position, velocity) {
      // return max score over legal actions
      var value = 0;
      for (var i = 0; i < this.actions.length; i++){
        var possiblevalue = this.getqvalue(position, velocity, this.actions[i]);
        if (possiblevalue >= value) value = possiblevalue;
      }
      return value;
    },

    computeactionfromqvalues: function (position, velocity) {
      // compute the best action to take in a state
      var value = 0;
      var selected = this.actions[0];
      for (var i = 1; i < this.actions.length; i++){
        if (this.getqvalue(position, velocity, this.actions[i]) >= value){
          selected = this.actions[i];
        }
      }
      return selected;
    },

    update: function (position, velocity, action, reward){
      // update weights based on the transition
      // successor state
      var successorvelocity = action(position, velocity);
      var successorposition = this.calculatesuccessor(position, velocity, action);

      var features = this.getfeatures(position, velocity, action);

      // update step
      var difference = reward + this.discount * this.computevaluefromqvalues(successorposition, successorvelocity) - this.getqvalue(position, velocity, action);
      for (var feature in features)
        this.weights[feature] = this.weights[feature] + this.alpha * difference * features[feature];
    },

    getreward: function (position, velocity, action) {
      var initialdistancetogoalvector = covetedlocation.clone().subtract(position);
      var successordistancetogoalvector = covetedlocation.clone().subtract(this.calculatesuccessor(position, velocity, action));

      // is positive if successor is closer to goal
      return initialdistancetogoalvector.length - successordistancetogoalvector.length;
    },

    // behavioral
    blink: function() {
      // Randomly blink

      // If the lunar baby is blinking, stop it from blinking
      if (this.blinking && this.blinkcounter > actioncount) {
        this.eyelid.symbol.item.fillColor = null;
        this.blinking = false;
        this.blinkcounter = 0; // reset blink counter
      }
      // If the baby is not blinking, it has a chance to blink
      else if (! this.blinking && Math.random() < 0.001){
        this.eyelid.symbol.item.fillColor = bodycolor;
        this.blinking = true;
        this.blinkcounter = 0;
      }
      else if (this.blinking){
        this.blinkcounter += 1;
      }
    },

    renderchanges: function () {
      // update symbols based on current loc
      this.head.matrix = new Matrix().translate(this.loc);
      this.eye.matrix = new Matrix().translate(this.loc);
      this.iris.matrix = new Matrix().translate(this.loc);
      this.pupil.matrix = new Matrix().translate(this.loc);
      this.eyelid.matrix = new Matrix().translate(this.loc);

      // arm movements and their offset to loc
      var rightarmloc = Object.assign({}, this.loc);
      rightarmloc.x -= 15;
      this.rightarm.matrix = new Matrix().translate(rightarmloc);

      var leftarmloc = Object.assign({}, this.loc);
      leftarmloc.x += 15;
      this.leftarm.matrix = new Matrix().translate(leftarmloc);

      // leg movements and their offset
      var rightlegloc = Object.assign({}, this.loc);
      rightlegloc.x -= 6;
      rightlegloc.y += 15;
      this.rightleg.matrix = new Matrix().translate(rightlegloc);

      var leftlegloc = Object.assign({}, this.loc);
      leftlegloc.x += 6;
      leftlegloc.y += 15;
      this.leftleg.matrix = new Matrix().translate(leftlegloc);

      // eye shine location with offset
      var shineloc = Object.assign({}, this.loc);
      shineloc.x += 1;
      shineloc.y -= 1;
      this.shine.matrix = new Matrix().translate(shineloc);
    },

    // actions
    randomaction: function () {
      // take a random action
      var action = this.actions[Math.floor(Math.random() * this.actions.length)];
      return action;
    },

    chooseaction: function (position, velocity) {
      // select an action, sometimes randomly, sometimes based on q values
      var action;
      if (Math.random() < this.epsilon){
        action = this.computeactionfromqvalues(position, velocity);
        console.log("chose action", action);
      } else {
        action = this.randomaction();
      }

      // update weights
      var reward = this.getreward(position, velocity, action);
      this.update(position, velocity, action, reward);
      console.log(this.weights);

      return action
    },

    godown: function (position, velocity) {
      return redirect(position, velocity, 270);
    },

    goup: function (position, velocity) {
      return redirect(position, velocity, 90);
    },

    goleft: function (position, velocity) {
      return redirect(position, velocity, 0);
    },

    goright: function (position, velocity) {
      return redirect(position, velocity, 180);
    },

    float: function () {
      // float around at current velocity
      dx = this.vel.x,
      dy = this.vel.y,
      x = this.loc.x += dx,
      y = this.loc.y += dy,
      speed = this.vel.length,
      count = speed * 10;

      // Bounce off the walls.
      if (x < 0 || x > view.size.width) this.vel.x *= -1;
      if (y < 0 || y > view.size.height) this.vel.y *= -1;

      // TODO: Fix this bug
      delete this.vel._angle;
    },

    run: function () {
      // choose a new action after this one expired
      if (this.movementcounter > actioncount) {
        this.movementcounter = 0;
        // pick an action
        this.vel = this.chooseaction(this.loc.clone(), this.vel.clone())(this.loc, this.vel);
        this.vel.length = 1.5;
      }else {
        // continue moving in the direction it was previously going in
        this.float();
        this.movementcounter += 1;
      }

      this.blink();
      this.renderchanges();
    }
  });

  // main

  // make babies
  var lunarbabies = [];

  for (var i = 0; i < n; i++) {
    lunarbabies.push(new LunaryBaby(Point.random().multiply(view.size)));
  }

  // make coveted goal
  var heaven = new CovetedLocation();
  heaven.update(covetedlocation);

  view.onFrame = function (event) {
    // Draw lunar babies
    for (var i = 0, l = lunarbabies.length; i < l; i++) {
      lunarbabies[i].run();
    }
  }

  view.onClick = function(event){
    covetedlocation = event.point;
    heaven.update(covetedlocation)
    console.log(covetedlocation);
    return false; // prevent touch scrolling
  }
}
