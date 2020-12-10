const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const mainTeams = [Team.sharded, Team.crux];
const titleList = ["[#4d4e58] Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
var mode = 1;
var curTeam = Team.sharded;

var folded = false;
const longPress = 30;

function addSingle(t, team, num){
  var b = new Button(Styles.logict);
  var h = 0;
  b.label(prov(() => (titleList[teams.indexOf(team)])));
  //b.label(prov(() => (curTeam.name));
  b.clicked(() => {
    if(h > longPress) return;
    mode = num;
    curTeam = team;
    Vars.player.team(team);
  });
  b.update(() => {
    if(b.isPressed()){
      h += Core.graphics.getDeltaTime() * 60;
      if(h > longPress){
        folded = true;
        if(mode < 0) mode = Team.baseTeams.length;
      }
    }
    else{
      h = 0;
    }
  });
  return t.add(b).size(50, 40).color(team.color).pad(1);
}

function addMini(t, teamList){
  var b = new Button(Styles.logict);
  var h2 = 0;
  b.label(prov(() => (titleList[teams.indexOf(curTeam)])));
  //b.label(prov(() => (curTeam.name));
  b.clicked(() => {
    if(h2 > longPress) return;
    mode++;
    if(mode >= teamList.length) mode = 0;
    Vars.player.team(teamList[mode]);
    curTeam = teams[teams.indexOf(teamList[mode])];
  });
  b.update(() => {
    if(b.isPressed()){
      h2 += Core.graphics.getDeltaTime() * 60;
      if(h2 > longPress) folded = false;
    }
    else{
      h2 = 0;
    }
    b.setColor(curTeam.color);
  });
  return t.add(b).size(40, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    var widths = [100, 100, 60, 68, 70, 60];
    for(var i = 0; i < teams.length; i++){
      addSingle(t, teams[i], i).width(widths[i]);
    }
    /*addSingle(t, teams[0], 0).width(100);
    addSingle(t, teams[1], 1).width(100);
    addSingle(t, teams[2], 2).width(100);*/
  }));
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown();
}

function addMiniT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addMini(t, mainTeams).width(100);
  }));
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown();
}

if(!Vars.headless){
  var tt = new Table();
  var mt = new Table();
  
  Events.on(ClientLoadEvent, () => {
    tt.bottom().left();
    mt.bottom().left();
    addTable(tt);
    addMiniT(mt);
    Vars.ui.hudGroup.addChild(tt);
    Vars.ui.hudGroup.addChild(mt);
  });
  
  Events.on(WorldLoadEvent, () => {
    folded = false;
    curTeam = Vars.player.team();
    mode = teams.indexOf(curTeam);
  });
}