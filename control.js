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
var timelimit = 5000;
var minstairtime = 200;
var maxstairtime = 1500;
var gravity = 1;
var stairstartrate = 10;
var nohurttime = 10;

function tonumber(str) {
  var numstr = str.replace(/\D/g,'');
  return Number(numstr);
}

function getRandomStair(time) {
  var type = 0;
  var typerand = Math.random();
  var level = Math.min(90, (new Date() - time) / 2000);
  if (level >= 5 && typerand < (level + 10) / 200.0) {
    type = 1;
  } else if (level >= 5 && typerand > 0.9) {
    type = 2;
  }
  return {
    time: new Date()-0,
    x: Math.floor(Math.random() * (windowwidth - stairwidth)),
    type: type
  }
}

function isNotOverTime(stair) {
  return new Date() - stair.time < timelimit + stairheight * stairstartrate;
}

function time2top(nowtime, stairtime) {
  return Math.floor((timelimit-(nowtime-stairtime)) / stairstartrate);
}

function controlTop(playertop, playerleft, fallspeed, ladderpara, runtime) {
  var playerbottom = playertop + playerheight;
  var newspeed = fallspeed + gravity;
  var stairspeed = pollInterval / stairstartrate;
  var nowtime = new Date()-0;
  for (var i = 0; i < ladderpara.length; i++) {
    var stairpara = ladderpara[i];
    var stairtime = stairpara.time;
    var stairtop = time2top(nowtime, stairtime);
    var stairtop_last = time2top(runtime, stairtime);
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

function controlLeft(action, left, runtime) {
  var horispeed = parseInt((new Date() - runtime) / 6);
  var newleft = left;
  if (action == -1) {
    newleft = left -= horispeed;
    if (newleft < 0)
      newleft = 0
  } else if (action == 1) {
    newleft = left += horispeed;
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
    var nowtime = new Date()-0;
    var stairlist = this.props.ladderpara.map(function(stairpara, index) {
      var stairtime = stairpara.time;
      var stairtop = time2top(nowtime, stairtime);
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
    var score = Math.floor((new Date() - this.props.time) / 1000);
    return(
      <div style={infostyle} > {"<A S>  HP:" + this.props.hp + "  Score:" + score} </div>
    );
  }
});

var ControlBox = React.createClass({
  resetGame: function() {
    this.setState({
      hp: initialplayerhp,
      action: initialplayeraction,
      fallspeed: initialplayerspeed,
      lasthurt: 0,
      time: new Date()-0,
      runtime: new Date()-0,
      laststairtime: new Date()-0,
      playerstyle: {
        width: playerwidth + "px",
        height: playerheight + "px",
        'backgroundColor': "yellow",
        position: "absolute",
        top: initialplayery + "px",
        left: initialplayerx + "px"
      },
      ladderpara: [{
        time: new Date()-2500,
        x: 150 - stairwidth/2,
        type: 0
      }, {
        time: new Date()-1800,
        x: 80 - stairwidth/2,
        type: 0
      }, {
        time: new Date()-1800,
        x: 220 - stairwidth/2,
        type: 0
      }, {
        time: new Date()-1100,
        x: 150 - stairwidth/2,
        type: 0
      }, {
        time: new Date()-400,
        x: 80 - stairwidth/2,
        type: 0
      }, {
        time: new Date()-400,
        x: 220 - stairwidth/2,
        type: 0
      }]
    })
  },
  _timetic: function() {
    var runtime = this.state.runtime;
    var newladderpara = this.state.ladderpara.filter(isNotOverTime);
    var left = tonumber(this.state.playerstyle.left);
    var newleft = controlLeft(this.state.action, left, runtime);
    var top = tonumber(this.state.playerstyle.top);
    var newtime = new Date()-0;
    var [newtop, newspeed, steptype] = controlTop(top, newleft, this.state.fallspeed, newladderpara, runtime);
    this.setState({playerstyle: {
      width: playerwidth + "px",
      height: playerheight + "px",
      'backgroundColor': "yellow",
      position: "absolute",
      top: newtop + "px",
      left: newleft + "px"
    }})
    var lasttime = newtime - this.state.laststairtime;
    if (lasttime > maxstairtime || (lasttime > minstairtime && Math.random() < 0.03)) {
      this.setState({laststairtime: newtime});
      newladderpara.push(getRandomStair(this.state.time));
    }
    var newhp = controlHp(this.state.hp, newtop, this.state.fallspeed, newspeed, this.state.lasthurt, steptype)
    if (newhp < this.state.hp) {
      this.setState({lasthurt: nohurttime});
    } else {
      var newhurt = Math.max(0, this.state.lasthurt - 1);
      this.setState({lasthurt: newhurt});
    }
    this.setState({})
    this.setState({ladderpara: newladderpara});
    this.setState({fallspeed: newspeed});
    this.setState({hp: newhp});
    if (newhp <= 0 || newtime-runtime > 100) {
      this.resetGame();
    }
    this.setState({runtime: newtime});
  },
  _handlePressKey: function(event) {
    if (event.keyCode == 97) { // console.log("left press");
      this.setState({action: -1});
    } else if(event.keyCode == 115) { // console.log("right press");
      this.setState({action: 1});
    }
  },
  _handleUpKey: function(event) {
    this.setState({action: 0});
  },
  componentDidMount: function() {
    this.resetGame();
  },
  componentWillMount: function() {
    document.addEventListener("keypress", this._handlePressKey, false);
    document.addEventListener("keyup", this._handleUpKey, false);
  },
  componentWillUnmount: function() {
    document.removeEventListener("keypress", this._handlePressKey, false);
    document.removeEventListener("keyup", this._handleUpKey, false);
  },
  getInitialState: function() {
    setInterval(this._timetic, pollInterval);
    return { time: new Date()-0 , playerstyle: {}, hp: 0, action: 0, fallspeed: 0, lasthurt: 0, ladderpara: [], laststairtime: new Date()-0, runtime: new Date()-0 };
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
        <div style={this.state.playerstyle} />
        <Info time={this.state.time} hp={this.state.hp} />
      </div>
    );
  }
});

ReactDOM.render(
  <ControlBox />,
  document.getElementById('content')
);
