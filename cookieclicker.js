var endGameStrategy = null;
var minCookies;
var isAchievementPhase = function() { return endGameStrategy === null; };

var projectCps = function(building) {
   building.bought++;

   building.amount++;
   Game.buildingsOwned++;
   Game.recalculateGains=1;
   Game.CalculateGains();
   var result = Game.cookiesPs;
   building.bought--;
   building.amount--;
   Game.buildingsOwned--;

   Game.recalculateGains=1;
   Game.CalculateGains();
   return result;
};

var buyUpgrades = function() {
   for (var i = 0; i < Game.UpgradesById.length; ++i) {
      if (Game.UpgradesById[i].unlocked) {

         if (Game.UpgradesById[i].bought == 0) {
            if (Game.cookies - Game.UpgradesById[i].getPrice() >= minCookies) {
               if (Game.UpgradesById[i].name === "One mind") {
                  var tmpClickFunction = Game.UpgradesById[i].clickFunction;

                  Game.UpgradesById[i].clickFunction = null;
                  Game.UpgradesById[i].buy();
                  Game.UpgradesById[i].clickFunction = tmpClickFunction;
               } else if (Game.UpgradesById[i].name === 'Elder Covenant') {

                  if (!Game.HasAchiev('Elder calm')) {
                     Game.UpgradesById[i].buy();
                  }
               } else if (Game.UpgradesById[i].name === 'Elder Pledge') {

                  if (Game.HasAchiev('Spooky cookies') || !Game.HasAchiev('Sacrificial rolling pins')) {
                     Game.UpgradesById[i].buy();
                  }
               } else if (Game.UpgradesById[i].name === 'Communal brainsweep') {

                  if (endGameStrategy !== 'onemind') {
                     Game.UpgradesById[i].buy();
                  }
               } //else if (Game.UpgradesById[i].name === 'Season switcher') {
               //} 
               else if (Game.UpgradesById[i].name === 'Ghostly biscuit') {
               } else if (Game.UpgradesById[i].name === 'Lovesick biscuit') {
               } else if (Game.UpgradesById[i].name === 'Fool\'s biscuit') {
               }
                   else {
                  Game.UpgradesById[i].buy();
               }

            }
         }
      }
   }
};

var buyBuildings = function() {
   var best = null;
   var bestValue = 0;
   for (var i = 0; i < Game.ObjectsById.length; ++i) {
      currentCps = Game.cookiesPs;

      projectedCps = projectCps(Game.ObjectsById[i]);
      var value = (projectedCps-currentCps)/Game.ObjectsById[i].price;
      if (value > bestValue) {
         bestValue = value;
         best = Game.ObjectsById[i];

      }
   }
   if (best != null) {
      if (Game.cookies - best.price >= minCookies) {
         best.buy();
         if (best.name === 'Grandma') {
            if (!Game.HasAchiev('Just wrong')) {

               best.sell();
            }
         }
      }
   }
};

var upgradeSanta = function() {
   if (Game.santaLevel<14) {
      var price = Math.pow(Game.santaLevel+1, Game.santaLevel+1);

      if (Game.cookies - price >= minCookies) {
         var tmpMouseX = Game.mouseX;
         var tmpMouseY = Game.mouseY;
         var tmpClick = Game.Click;
         Game.mouseX = 48;
         Game.mouseY = Game.LeftBackground.canvas.height-48-24;

         Game.Click = 1;
         Game.UpdateSanta();
         Game.mouseX = tmpMouseX;
         Game.mouseY = tmpMouseY;
         Game.Click = tmpClick;
      }
   }
}

var lastWrinklerPop = Date.now();

var wrinklerPopTimeMinutes = 30;
var botFps = 20;

var canPopWrinklers = function() {
   for (var i = 0; i < Game.wrinklers.length; ++i) {
      if (Game.wrinklers[i].sucked > 0.5) return true;
   }

   return false;
};

var popWrinklers = function() {
   if (Game.HasAchiev('Spooky cookies')) {
      if (Date.now() - lastWrinklerPop > wrinklerPopTimeMinutes*60*1000) {

         if (canPopWrinklers()) {
            Game.CollectWrinklers();
            lastWrinklerPop = Date.now();
         }
      }
   } else {
      if (canPopWrinklers()) {
         Game.CollectWrinklers()

      }
   }
};

var autoclick = function() {
   if (Game.cookiesEarned >= 1000000 || Game.HasAchiev('True Neverclick')) {
      Game.ClickCookie();
   }
};

var currentHeavenlyChips = function() {

   return Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset);
};

var achievementStrategy = function() {
   if (Game.goldenCookie.life > 0) {
      Game.goldenCookie.click();
   }
   if (Game.seasonPopup.life > 0) {

      Game.seasonPopup.click();
   }
   popWrinklers();
   minCookies = 0;
   if (Game.Has('Pure cosmic light')) {
      minCookies = 1200*Game.cookiesPs;
   }
   if (Game.season === 'christmas') {
        upgradeSanta();
   }
   buyUpgrades();

   buyBuildings();
   autoclick();
};

var resetChips = 100000;
var shouldReset = function() {
   if (isAchievementPhase()) {
      if (Game.AchievementsOwned >= 98) {
         endGameStrategy = 'onemind';
         wrinklerPopTimeMinutes = 60;

         return true;
      }
      return false;
   } else {
      var chipsEarned = currentHeavenlyChips() - Game.prestige['Heavenly chips'];
      return (chipsEarned >= resetChips);
   }
}


var resetGame = function() {
   //tmpConfirm = window.confirm;
   //window.confirm = function() {return true;};
   Game.Reset(1);
   //window.confirm = tmpConfirm;
}

var botFunction = function() {
  //if (isAchievementPhase()) {

     achievementStrategy();
  //}
  
  if (shouldReset()) {
     Game.CollectWrinklers();
     resetGame();
  }
};

var botInterval = setInterval(botFunction, 1000.0/botFps);