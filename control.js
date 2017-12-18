/**
 ** Wei Chen 2015-03-05
 **/

var pollInterval = 30;
var windowheight = 500;
var windowwidth = 300;
var playerheight = 30;
var playerwidth = 20;
var stairheight = 10;
var stairwidth = 80;
var initialplayerx = 150 - playerwidth / 2;
var initialplayery = 250 - playerheight;
var initialplayerhp = 9;
var initialplayerspeed = 0;
var initialplayeraction = 0;
var minstairround = 8;
var maxstairround = 40;
var gravity = 1;
var stairstartrate = 10;
var nohurtround = 20;

function timeToStair(player, stair) {
  // 1 / 2 * gravity * t ^ 2 + player.fallspeed * t - d = 0
  var d = stair.y - player.y + player.height;
  if(d < 0) return 1000;
  var speed = player.fallspeed + 5;
  return Math.sqrt(speed * speed + 2 * d) - speed;
}

function scoreStair(player, stair) {
  var score = stair.type == 1 ? -1000 : 0;
  score += player.score < 4 && stair.type == 1 ? -10000 : 0;
  score += -Math.abs(stair.x - (150 - stair.width/2)) + 300;
  return score;
}

function dirStair(player, stair) {
  var staircenter = stair.x + stair.width / 2;
  var playercenter = player.x + player.width / 2;
  if(playercenter > staircenter) return -1;
  else if(playercenter < staircenter) return 1;
  else return 0;
}

function onAStair(player, ladders) {
  var newspeed = player.fallspeed + gravity;
  var stairspeed = 5;
  var playerleft = player.x;
  var playerright = playerleft + player.width;
  var playerbottom = player.y + player.height;
  for (var i = 0; i < ladders.length; i++) {
    var stair = ladders[i];
    var stairtop = stair.y;
    var stairtop_last = stairtop + 5;
    var stairleft = stair.x;
    var stairright = stairleft + stair.width;
    var stairtype = stair.type;
    if (playerright > stairleft && playerleft < stairright) {
      if (playerbottom <= stairtop_last + stairspeed && playerbottom + newspeed >= stairtop) {
        return stair;
      }
    }
  }
  return null;
}

var targetStair = null;

function easyBot(player, ladders) {
  var stair = onAStair(player, ladders);
  if(stair) targetStair = null;
  else if(targetStair) return dirStair(player, targetStair);
  var playerleft = player.x;
  var playerright = playerleft + player.width;
  var reachLadders = ladders.filter(function(stairi) {
    if(stairi.y - 10 > player.y + player.height) {
      var t = timeToStair(player, stairi);
      var horidist = t * 5;
      var stairleft = stairi.x;
      var stairright = stairleft + stairi.width;
      var d = Math.max(playerleft - stairright, stairleft - playerright);
      // console.log(stairi.x + " " + stairi.y + "   " + horidist + " " + d);
      if(d < horidist) {
        if(stair) {
          var avoidleft = stair.x;
          var avoidright = stair.x + stair.width;
          var staircenter = (stairleft + stairright) / 2;
          return avoidleft > staircenter + playerwidth / 2 || avoidright < staircenter - playerwidth / 2;
        } else return true;
      } else return false;
    } else return false;
  });
  // console.log(reachLadders.length);
  if(reachLadders.length > 0) {
    var newstair = reachLadders[0];
    var stairScore = scoreStair(player, newstair);
    reachLadders.map(function(stairi) {
      var scorei = scoreStair(player, stairi);
      if(scorei > stairScore) {
        stairScore = scorei;
        newstair = stairi;
      }
    });
    // console.log(newstair.x + " " + newstair.y + " " + stairScore);
    if(stairScore > -5000) {
      if((stair && stairScore > 0) || !stair) {
        targetStair = newstair;
        return dirStair(player, newstair);
      } else return 0;
    } else return 0;
  } else return 0;
}

function getRandomStair(round) {
  var type = 0;
  var typerand = Math.random();
  var level = round / 30;
  if (level > 10 && typerand < level / 1000) {
    type = 1;
  } else if (typerand < 0.1) {
    type = 2;
  }
  return {x: Math.floor(Math.random() * (windowwidth - stairwidth)), y: 500, type: type, height: stairheight, width: stairwidth};
}

function isNotOut(stair) {
  return stair.y > -stairheight;
}

function nextStair(stair) {
  stair.y -= 5;
  return stair;
}

function controlTop(playertop, playerleft, fallspeed, ladderpara) {
  var playerbottom = playertop + playerheight;
  var newspeed = fallspeed + gravity;
  var stairspeed = 5;
  for (var i = 0; i < ladderpara.length; i++) {
    var stairpara = ladderpara[i];
    var stairtop = stairpara.y;
    var stairtop_last = stairtop + 5;
    var stairleft = stairpara.x;
    var stairtype = stairpara.type;
    if (playerleft + playerwidth > stairleft && playerleft < stairleft + stairwidth) {
      if (playerbottom <= stairtop_last + stairspeed && playerbottom + newspeed >= stairtop) {
        if (stairtype == 2) {
          return [stairtop - playerheight - gravity, -14, stairtype];
        } else {
          return [stairtop - playerheight - gravity, -4, stairtype];
        }
      }
    }
  }
  return [playertop + newspeed, newspeed, 0];
}

function controlLeft(action, left) {
  var horispeed = 5;
  var newleft = left;
  if (action == -1) {
    newleft = left - horispeed;
    if (newleft < 0)
      newleft = 0
  } else if (action == 1) {
    newleft = left + horispeed;
    if (newleft > windowwidth - playerwidth)
      newleft = windowwidth - playerwidth
  }
  return newleft;
}

function controlHp(hp, newtop, fallspeed, newspeed, lasthurt, steptype) {
  if (lasthurt > 0) {
    return hp;
  } else if (newtop > windowheight) {
    return 0;
  } else {
    if (newtop < 0) {
      return hp - 4;
    } else {
      if (newspeed < fallspeed) {
        if (steptype == 1) {
          return hp - 3;
        } else {
          var newhp = hp + 1;
          if (newhp > initialplayerhp) {
            return initialplayerhp;
          } else {
            return newhp;
          }
        }
      } else {
        return hp;
      }
    }
  }
}

var LinkBox = React.createClass({
  render: function() {
    var linkstyle = {
      whiteSpace: "pre",
      'color': "black",
      position: "absolute",
      width: "298px",
      height: "46px",
      top: "552px",
      left: "1px",
      border: "1px solid black",
      fontFamily: "Courier New",
      fontSize: "14px",
      textAlign: "center",
      lineHeight: "46px"
    };
    return(
      <div style={linkstyle} >
        <a href="https://github.com/Wei-1/Stairs" target="_blank" >
          https://github.com/Wei-1/Stairs
        </a>
      </div>
    );
  }
});

var Stair = React.createClass({
  render: function() {
    var staircolor = "blue";
    if (this.props.type == 1) {
      staircolor = "red";
    } else if (this.props.type == 2) {
      staircolor = "green";
    }
    var stairstyle = {
      width: stairwidth + "px",
      height: stairheight + "px",
      'backgroundColor': staircolor,
      position: "absolute",
      top: this.props.top + "px",
      left: this.props.left + "px"
    };
    return(
      <div style={stairstyle} />
    );
  }
});

var Ladder = React.createClass({
  render: function() {
    var stairlist = this.props.ladderpara.map(function(stairpara, index) {
      var stairtop = stairpara.y;
      var stairleft = stairpara.x;
      var stairtype = stairpara.type;
      return (
        <Stair key={index}
          type={stairtype}
          top={stairtop}
          left={stairleft} />
      );
    }, this);
    return(
      <div> {stairlist} </div>
    );
  }
});

var Info = React.createClass({
  render: function() {
    var infostyle = {
      whiteSpace: "pre",
      'color': "white",
      position: "absolute",
      top: "10px",
      left: "10px",
      fontFamily: "Courier New"
    };
    var score = Math.floor((this.props.round) / 30);
    return(
      <div style={infostyle} > {"  HP:" + this.props.hp + "  Score:" + score} </div>
    );
  }
});

var Player = React.createClass({
  render: function() {
    var playerstyle = {
      width: this.props.player.width + "px",
      height: this.props.player.height + "px",
      'backgroundColor': "yellow",
      position: "absolute",
      top: this.props.player.y + "px",
      left: this.props.player.x + "px"
    }
    return (
      <div style={playerstyle} />
    );
  }
});

var CodeBox = React.createClass({
  render: function() {
    var codestyle = {
      whiteSpace: "pre",
      'color': "white",
      position: "absolute",
      top: "0px",
      left: "302px",
    };
    return(
      <div style={codestyle} >
        <textarea rows="50" cols="80" name="code" style={{fontFamily: "Courier New"}}
          onChange={this.props.handleCodeChange} value={this.props.codestring} />
      </div>
    );
  }
});

var GoBox = React.createClass({
  render: function() {
    var codestyle = {
      whiteSpace: "pre",
      'color': "black",
      position: "absolute",
      width: "298px",
      height: "46px",
      top: "502px",
      left: "1px",
      border: "1px solid black",
      fontFamily: "Courier New",
      fontSize: "50px",
      textAlign: "center"
    };
    return(
      <div style={codestyle} onClick={this.props.handleGo} >
        GO
      </div>
    );
  }
});

var ControlBox = React.createClass({
  resetGame: function() {
    if(this.state.round > 0) console.log("Score: " + Math.floor(this.state.round / 30));
    this.setState({
      gogo: false,
      action: initialplayeraction,
      lasthurt: 0,
      round: 0,
      laststairround: minstairround,
      player: {width: playerwidth, height: playerheight, y: initialplayery, x: initialplayerx,
        fallspeed: initialplayerspeed, hp: initialplayerhp},
      ladderpara: [
        {x: 150 - stairwidth/2, y: 250, type: 0, height: stairheight, width: stairwidth},
        {x: 80 - stairwidth/2, y: 320, type: 0, height: stairheight, width: stairwidth},
        {x: 220 - stairwidth/2, y: 320, type: 0, height: stairheight, width: stairwidth},
        {x: 150 - stairwidth/2, y: 390, type: 2, height: stairheight, width: stairwidth},
        {x: 80 - stairwidth/2, y: 460, type: 0, height: stairheight, width: stairwidth},
        {x: 220 - stairwidth/2, y: 460, type: 0, height: stairheight, width: stairwidth}
      ]
    })
  },
  _timetic: function() {
    if(this.state.gogo) {
      this.setState({round: this.state.round + 1});
      var round = this.state.round;
      var player = this.state.player;
      var ladders = this.state.ladderpara.filter(isNotOut).map(nextStair);
      var action = 0;
      var runtime = new Date()-0;
      eval(this.state.codestring);
      var newtime = new Date()-0;
      var newleft = controlLeft(action, this.state.player.x);
      var [newtop, newspeed, steptype] = controlTop(this.state.player.y, newleft, this.state.player.fallspeed, ladders);
      var lastround = this.state.round - this.state.laststairround;
      if (lastround > maxstairround || (lastround > minstairround && Math.random() < 0.03)) {
        ladders.push(getRandomStair(this.state.round));
        this.setState({laststairround: this.state.round});
      }
      var newhp = controlHp(this.state.player.hp, newtop, this.state.player.fallspeed, newspeed, this.state.lasthurt, steptype)
      if (newhp < this.state.player.hp) {
        this.setState({lasthurt: nohurtround});
      } else {
        var newhurt = Math.max(0, this.state.lasthurt - 1);
        this.setState({lasthurt: newhurt});
      }
      if(newtop < 0) {
        newspeed = 0;
        newtop = 0;
      }
      this.setState({player: {width: playerwidth, height: playerheight, fallspeed: newspeed,
        y: newtop, x: newleft, hp: newhp}});
      this.setState({ladderpara: ladders});
      if (newhp <= 0 || newtime-runtime > 100) {
        this.resetGame();
      }
    }
  },
  componentDidMount: function() {
    this.resetGame();
  },
  handleCodeChange: function(e) {
    this.setState({codestring: e.target.value});
  },
  handleGo: function() {
    this.setState({gogo: true});
  },
  getInitialState: function() {
    setInterval(this._timetic, pollInterval);
    return { gogo: false, round: 0, player: {}, action: 0, lasthurt: 0, ladderpara: [], laststairround: 0,
      codestring: 
`
// Get the player and ladders every round
console.log("Round: " + round);
console.log("Player: " + player.x + " " + player.y + " " + player.width + " " + player.height + " " + player.hp + " " + player.fallspeed);
ladders.map(function(stair) {
  console.log("Stair: " + stair.x + " " + stair.y + " " + stair.width + " " + stair.height + " " + stair.type);
});

// 0: wait, -1: left, 1: right
// The easyBot example:
action = easyBot(player, ladders);

// Write Your Code Here
// action = 1;
`
    };
  },
  render: function() {
    var backgroundstyle = {
      width: windowwidth + "px",
      height: windowheight + "px",
      'backgroundColor': "black",
      position: "absolute",
      top: "0px",
      left: "0px"
    };
    return(
      <div>
        <div style={backgroundstyle} />
        <Ladder ladderpara={this.state.ladderpara} />
        <Player player={this.state.player} />
        <Info round={this.state.round} hp={this.state.player.hp} />
        <CodeBox handleCodeChange={this.handleCodeChange}
          codestring={this.state.codestring} />
        <GoBox handleGo={this.handleGo} />
        <LinkBox />
      </div>
    );
  }
});

ReactDOM.render(
  <ControlBox mode="code" />,
  document.getElementById('content')
);
