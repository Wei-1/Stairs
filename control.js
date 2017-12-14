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
var nohurtround = 10;

function tonumber(str) {
  var numstr = str.replace(/\D/g,'');
  return Number(numstr);
}

function getRandomStair(round) {
  var type = 0;
  var typerand = Math.random();
  var level = Math.min(90, round * 5);
  if (level >= 5 && typerand < (level + 10) / 200.0) {
    type = 1;
  } else if (level >= 5 && typerand > 0.9) {
    type = 2;
  }
  return {
    x: Math.floor(Math.random() * (windowwidth - stairwidth)),
    y: 500,
    type: type
  }
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
  var stairspeed = pollInterval / stairstartrate;
  for (var i = 0; i < ladderpara.length; i++) {
    var stairpara = ladderpara[i];
    var stairtop_last = stairpara.y + 5;
    var stairtop = stairtop_last - 5;
    var stairleft = stairpara.x;
    var stairtype = stairpara.type;
    if (playerleft + playerwidth > stairleft && playerleft < stairleft + stairwidth) {
      if (playerbottom <= stairtop_last + stairspeed && playerbottom + newspeed >= stairtop) {
        if (stairtype == 2) {
          return [stairtop - playerheight - gravity, -12, stairtype];
        } else {
          return [stairtop - playerheight - gravity, 0, stairtype];
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
      width: "100px",
      height: "50px",
      top: "502px",
      left: "100px",
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
    this.setState({
      gogo: false,
      hp: initialplayerhp,
      action: initialplayeraction,
      fallspeed: initialplayerspeed,
      lasthurt: 0,
      round: 0,
      laststairround: 0,
      playerstyle: {
        width: playerwidth,
        height: playerheight,
        y: initialplayery,
        x: initialplayerx
      },
      ladderpara: [{
        x: 150 - stairwidth/2,
        y: 250,
        type: 0
      }, {
        x: 80 - stairwidth/2,
        y: 320,
        type: 0
      }, {
        x: 220 - stairwidth/2,
        y: 320,
        type: 0
      }, {
        x: 150 - stairwidth/2,
        y: 390,
        type: 0
      }, {
        x: 80 - stairwidth/2,
        y: 460,
        type: 0
      }, {
        x: 220 - stairwidth/2,
        y: 460,
        type: 0
      }]
    })
  },
  _timetic: function() {
    if(this.state.gogo) {
      this.setState({round: this.state.round + 1});
      var ladders = this.state.ladderpara.filter(isNotOut).map(nextStair);
      var player = this.state.playerstyle;
      var action = 0;
      var runtime = new Date()-0;
      eval(this.state.codestring);    
      var newtime = new Date()-0;
      var left = this.state.playerstyle.x;
      var newleft = controlLeft(action, left);
      var top = this.state.playerstyle.y;
      var [newtop, newspeed, steptype] = controlTop(top, newleft, this.state.fallspeed, ladders);
      this.setState({playerstyle: {
        width: playerwidth,
        height: playerheight,
        y: newtop,
        x: newleft
      }})
      var lastround = this.state.round - this.state.laststairround;
      if (lastround > maxstairround || (lastround > minstairround && Math.random() < 0.03)) {
        ladders.push(getRandomStair(this.state.round));
        this.setState({laststairround: this.state.round});
      }
      var newhp = controlHp(this.state.hp, newtop, this.state.fallspeed, newspeed, this.state.lasthurt, steptype)
      if (newhp < this.state.hp) {
        this.setState({lasthurt: nohurtround});
      } else {
        var newhurt = Math.max(0, this.state.lasthurt - 1);
        this.setState({lasthurt: newhurt});
      }
      this.setState({ladderpara: ladders});
      this.setState({fallspeed: newspeed});
      this.setState({hp: newhp});
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
    return { gogo: false, round: 0, playerstyle: {}, hp: 9, action: 0, fallspeed: 0, lasthurt: 0, ladderpara: [], laststairround: 0,
      codestring: "// Get the player and ladders every round\nconsole.log(player);\nconsole.log(ladders);\n\n// 0: wait, -1: left, 1: right\naction = 1;" };
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
        <Player player={this.state.playerstyle} />
        <Info round={this.state.round} hp={this.state.hp} />
        <CodeBox handleCodeChange={this.handleCodeChange}
          codestring={this.state.codestring} />
        <GoBox handleGo={this.handleGo} />
      </div>
    );
  }
});

ReactDOM.render(
  <ControlBox mode="code" />,
  document.getElementById('content')
);
