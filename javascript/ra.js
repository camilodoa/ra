/*
camilo ortiz, 2020, camilodoa.ml

reinforcement learning in the browser

dependencies:
paper.js
*/
paper.install(window);
window.onload = function() {
  /*
  universe
   */
  // take space
  paper.setup('space');
  // number of babies
  const n = 1;
  // color
  const bodyColor = '#fdd8b5';
  // goal
  let goal = new Point(view.center.x, view.center.y);
  // max world's inertia
  const inertia = 1.5;
  // goal's size
  var heavenSize = 20;
  /*
  symbols
   */
  // head
  const head = new Path.Oval([0, 0], [40, 53]);
  head.fillColor = bodyColor;
  head.strokeColor = null;
  const headSym = new Symbol(head);
  // arms
  const rightArm = new Path.Oval([0, 0], [30, 5]);
  rightArm.fillColor = bodyColor;
  rightArm.strokeColor = null;
  rightArm.rotate(315);
  const rightArmSym = new Symbol(rightArm);
  const leftArm = new Path.Oval([0, 0], [30, 5]);
  leftArm.fillColor = bodyColor;
  leftArm.strokeColor = null;
  leftArm.rotate(225);
  const leftArmSym = new Symbol(leftArm);
  // legs
  const rightLeg = new Path.Oval([0, 0], [30, 5]);
  rightLeg.fillColor = bodyColor;
  rightLeg.strokeColor = null;
  rightLeg.rotate(300);
  const rightLegSym = new Symbol(rightLeg);
  const leftLeg = new Path.Oval([0, 0], [30, 5]);
  leftLeg.fillColor = bodyColor;
  leftLeg.strokeColor = null;
  leftLeg.rotate(240);
  const leftLegSym = new Symbol(leftLeg);
  // eye
  const eye = new Path.Oval([0, 0], [20, 11]);
  eye.fillColor = 'white';
  eye.strokeColor = null;
  eye.strokeWidth = 0.5;
  const eyeSym = new Symbol(eye);
  // eyelid
  const eyeLid = new Path.Oval([0, 0], [20, 11]);
  eyeLid.fillColor = null;
  eyeLid.strokeColor = null;
  const eyeLidSym = new Symbol(eyeLid);
  // iris
  const iris = new Path.Oval([0, 0], [9, 9]);
  iris.fillColor = '#77B5FE';
  iris.strokeColor = null;
  const irisSym = new Symbol(iris);
  // pupil
  const pupil = new Path.Oval([0, 0], [5, 5]);
  pupil.fillColor = 'black';
  pupil.strokeColor = null;
  const pupilSym = new Symbol(pupil);
  // eye shine
  const shine = new Path.Oval([0, 0], [1.5, 1.5]);
  shine.fillColor = 'white';
  shine.strokeColor = null;
  const shineSym = new Symbol(shine);
  // heaven
  const heaven = new Path.Oval(goal, [heavenSize, heavenSize]);
  heaven.fillColor = '#ffeac3';
  heaven.strokeColor = null;
  const heavenSym = new Symbol(heaven);

  const innergate = new Path.Oval(goal, [2 * heavenSize, 2 * heavenSize]);
  innergate.fillColor = null;
  innergate.strokeColor = '#f9ead0';
  innergate.strokeWidth = 2;
  const innergateSym = new Symbol(innergate);

  const outergate = new Path.Oval(goal, [4 * heavenSize, 4 * heavenSize]);
  outergate.fillColor = null;
  outergate.strokeColor = '#f5fafa';
  outergate.strokeWidth = 1;
  const outergateSym = new Symbol(outergate);
  /*
  Objects
   */
  const CovetedLocation = Base.extend({
    /*
    Coveted Location
     */
    initialize: function (position) {
      /*
      initialize class
       */
      this.heaven = heavenSym.place();
      this.innergate = innergateSym.place();
      this.outergate = outergateSym.place();
    },
    update: function (position) {
      this.heaven.matrix = new Matrix().translate(position);
      this.innergate.matrix = new Matrix().translate(position);
      this.outergate.matrix = new Matrix().translate(position)
    }
  });
  const Ra = Base.extend({
    /*
    Ra
     */
    initialize: function (position) {
      /*
      initialize class
       */
      // initial position and velocity
      this.vel = Point.random();
      this.loc = position;
      this.ability = 150;
      // action time length
      this.actionCount = this.ability + gaussianSample() * 2;
      // speed limit
      this.maxSpeed = 0.5;
      // body
      this.rightarm = rightArmSym.place();
      this.leftarm = leftArmSym.place();
      this.rightleg = rightLegSym.place();
      this.leftleg = leftLegSym.place();
      this.head = headSym.place();
      // eye
      this.eye = eyeSym.place();
      this.iris = irisSym.place();
      this.pupil = pupilSym.place();
      this.shine = shineSym.place();
      this.eyelid = eyeLidSym.place();
      // movement
      this.blinking = false;
      this.blinkCounter = 0;
      this.movementCounter = 0;
      this.blinkLength = 50;
      // frame rate
      this.count = 0;
      // actions available
      this.actions = [
        this.goDown,
        this.goRight,
        this.goUp,
        this.goLeft
      ];
      // q-learning
      this.epsilon = 0.2;
      this.discount = 0.8;
      this.alpha = 0.3;
      this.weights = {};
    },
    /*
     q-learning
     */
    getFeatures: function (position, velocity, action) {
      /*
      returns features found in the successor of the current state
       */
      const features = {};
      // euclidean distance feature
      features['euclidean'] = this.calculateSuccessor(position, velocity, action).subtract(goal).length / (view.size.height * view.size.width);
      return features;
    },
    getQValue: function (position, velocity, action) {
      /*
      returns q-value of state action pair
       */
      let value = 0;
      const features = this.getFeatures(position, velocity, action);
      for (const feature in features) {
        // safety for new weights
        if (isNaN(this.weights[feature])) this.weights[feature] = 0.0;
        // dot product of weights and features
        value += this.weights[feature] * features[feature];
      }
      return value;
    },
    computeValueFromQValues: function (position, velocity) {
      /*
      return q-value of the best action to take from current position
       */
      let value = 0;
      for (let i = 0; i < this.actions.length; i++) {
        const possibleValue = this.getQValue(position, velocity, this.actions[i]);
        if (possibleValue > value) value = possibleValue;
      }
      return value;
    },
    computeActionFromQValues: function (position, velocity) {
      /*
      finds the best action to take based on current q-values
       */
      let value = -9999999999;
      let selected;
      for (let i = 0; i < this.actions.length; i++) {
        const actionValue = this.getQValue(position, velocity, this.actions[i]);
        if ( actionValue > value) {
          selected = this.actions[i];
          value = actionValue;
        }
      }
      return selected;
    },
    update: function (position, velocity, action, reward) {
      /*
      updates weights with the transition that was experienced
       */
      // successor state
      const successorVelocity = action(position, velocity);
      const successorPosition = this.calculateSuccessor(position, velocity, action);
      // extract features
      const features = this.getFeatures(position, velocity, action);
      // calculate difference between expected  and actual transition
      const difference = reward + this.discount * this.computeValueFromQValues(successorPosition, successorVelocity) - this.getQValue(position, velocity, action);
      // perform the update step
      for (const feature in features) this.weights[feature] = this.weights[feature] + this.alpha * difference * features[feature];
    },
    getReward: function (position, velocity, action) {
      /*
      how far you are to your goal is your pain
       */
      return -goal.clone().subtract(this.calculateSuccessor(position, velocity, action)).length;
    },
    /*
    behavioral animations
     */
    blink: function () {
      /*
      blink sometimes
       */
      if (this.blinking && this.blinkCounter > this.blinkLength) {
        // If the lunar baby is blinking, stop it from blinking
        this.eyelid.symbol.item.fillColor = null;
        this.blinking = false;
        this.blinkCounter = 0; // reset blink counter
      }
      // If the baby is not blinking, it has a chance to blink
      else if (!this.blinking && Math.random() < 0.001) {
        this.eyelid.symbol.item.fillColor = bodyColor;
        this.blinking = true;
        this.blinkCounter = 0;
      } else if (this.blinking) {
        this.blinkCounter += 1;
      }
    },
    wave: function () {
      /*
      todo this wave animation that also depends on movement
       */
    },
    /*
    symbol position
     */
    renderChanges: function () {
      /*
      update position of symbols to match current loc
       */
      this.head.matrix = new Matrix().translate(this.loc);
      this.eye.matrix = new Matrix().translate(this.loc);
      this.iris.matrix = new Matrix().translate(this.loc);
      this.pupil.matrix = new Matrix().translate(this.loc);
      this.eyelid.matrix = new Matrix().translate(this.loc);
      // arms and their offset to loc
      const rightArmLoc = Object.assign({}, this.loc);
      rightArmLoc.x -= 15;
      this.rightarm.matrix = new Matrix().translate(rightArmLoc);
      const leftArmLoc = Object.assign({}, this.loc);
      leftArmLoc.x += 15;
      this.leftarm.matrix = new Matrix().translate(leftArmLoc);
      // legs and their offset
      const rightLegLoc = Object.assign({}, this.loc);
      rightLegLoc.x -= 6;
      rightLegLoc.y += 15;
      this.rightleg.matrix = new Matrix().translate(rightLegLoc);
      const leftLegLoc = Object.assign({}, this.loc);
      leftLegLoc.x += 6;
      leftLegLoc.y += 15;
      this.leftleg.matrix = new Matrix().translate(leftLegLoc);
      // eye shine and its offset
      const shineLoc = Object.assign({}, this.loc);
      shineLoc.x += 1;
      shineLoc.y -= 1;
      this.shine.matrix = new Matrix().translate(shineLoc);
    },
    /*
    actions
     */
    randomAction: function () {
      /*
      returns a random action
       */
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    },
    chooseAction: function (position, velocity) {
      /*
      selects an action based on q values
      sometimes takes a random action
       */
      let action;
      if (Math.random() < this.epsilon) {
        action = this.randomAction();
      } else {
        action = this.computeActionFromQValues(position, velocity);
      }
      // update weights
      const reward = this.getReward(position, velocity, action);
      this.update(position, velocity, action, reward);
      return action
    },
    goDown: function (position, velocity) {
      /*
      returns vector pointing downward
       */
      return redirect(position, velocity, 90);
    },
    goUp: function (position, velocity) {
      /*
      returns vector pointing upward
       */
      return redirect(position, velocity, 270);
    },
    goLeft: function (position, velocity) {
      /*
      returns vector pointing left
       */
      return redirect(position, velocity, 0);
    },
    goRight: function (position, velocity) {
      /*
      returns vector pointing right
       */
      return redirect(position, velocity, 180);
    },
    /*
    state - based functions
     */
    calculateSuccessor: function (position, velocity, action) {
      const outComeVector = action(position, velocity);
      outComeVector.length = this.maxSpeed;
      const finalPosition = position.clone();
      // add velocity vector to position to get the final position
      for (let i = 0; i < this.actionCount; i++) {
        finalPosition.x += outComeVector.x;
        finalPosition.y += outComeVector.y;
      }
      return finalPosition;
    },
    float: function () {
      /*
      float at a velocity that changes based on where the baby is in its action
       */
      let dx = (toGaussian(this.movementCounter / this.actionCount) + 0.3) * this.vel.x,
          dy =  (toGaussian(this.movementCounter / this.actionCount) + 0.3) * this.vel.y,
          x = this.loc.x += dx,
          y = this.loc.y += dy;
      // bounce off the walls.
      if (x < 0 || x > view.size.width) this.vel.x *= -1;
      if (y < 0 || y > view.size.height) this.vel.y *= -1;
      // expelled from the gates
      if (Math.pow(x - goal.x, 2) + Math.pow(y - goal.y, 2) < Math.pow(2.2 * heavenSize, 2)){
        this.vel.x *= -2 * (Math.random() + 0.1);
        this.vel.y *= -2 * (Math.random() + 0.1);
      }
      // this is a bug
      delete this.vel._angle;
    },
    step: function () {
      /*
      experience the world in a time step
       */
      if (this.movementCounter >= this.actionCount) {
        // when the previous action expires perform a new one
        this.movementCounter = 0;
        // think
        this.vel = this.chooseAction(this.loc.clone(), this.vel.clone())(this.loc, this.vel);
        // readjust expectations
        this.vel.length = this.maxSpeed;
        // todo: put move arms here
        // update action length here
        this.actionCount = this.ability + gaussianSample() * 2;
      } else {
        // otherwise continue moving
        this.float();
        this.movementCounter += 1;
      }
      this.blink();
      this.renderChanges();
    }
  });
  /*
  Utility functions
   */
  let redirect = (position, velocity, degrees) => {
    /*
    changes velocity according to the degree of movement and inertia
     */
    return new Point(Math.cos(toRadian(degrees)), Math.sin(toRadian(degrees))).add(velocity.clone().multiply(inertia));
  }
  let toRadian = (angle) => {
    /*
    translates degrees to radian
     */
    return (angle * Math.PI / 180 );
  }
  let gaussianSample = () => {
    /*
    returns random number sampled from a gaussian from ~ -3 to 3
     */
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  }
  let toGaussian = (x, height = 1, mew = 0, sigma = 2.23) => {
    /*
    maps input from 0-1 to 0-1 on a bell curve
     */
    return  (Math.sin(2 * Math.PI * (x - (1/4))) + 1) / 2;
  }
  /*
  exist / main
   */
  // create babies
  const lunarBabies = [];
  for (let i = 0; i < n; i++) {
    lunarBabies.push(new Ra(Point.random().multiply(view.size)));
  }
  // make coveted goal
  const ideal = new CovetedLocation();
  ideal.update(goal);

  /*
  register effects
   */
  view.onFrame = function (event) {
    /*
    every frame we update the world
     */
    for (var i = 0, l = lunarBabies.length; i < l; i++) {
      lunarBabies[i].step();
    }
  }
  view.onClick = function(event){
    /*
    viewer interacting with the world
     */
    goal = event.point;
    ideal.update(goal);
    return false; // prevent touch scrolling
  }
}
