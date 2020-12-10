const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const mainTeams = [1, 2];
const titleList = ["[#4d4e58] Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
var mode = 1;
var curTeam = Team.sharded;
const timer = new Interval(1);

var folded = false;
const longPress = 30;

function addSingle(t, team, num){
  var b = new Button(Styles.logict);
  var h = 0;
  b.label(prov(() => (titleList[teams.indexOf(team)])));
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
  b.clicked(() => {
    if(h2 > longPress) return;
    do{
      mode++;
      if(mode > teamList[teamList.length - 1]) mode = teamList[0];
    }while(teamList.indexOf(mode) == -1);
    curTeam = teams[mode];
    Vars.player.team(curTeam);
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

function addKill(t){
  var b = new ImageButton(Vars.ui.getIcon("commandAttack", "cancel"), Styles.clearTransi);
  b.label(prov(() => ("Seppuku"))).padLeft(8);
  //var b = new ImageButton(Core.atlas.find("command-attack"), Styles.clearTransi);
  var h3 = 0;
  b.clicked(() => {
    if(h3 > longPress) return;
    Vars.player.unit().kill();
  });
  b.update(() => {
    if(b.isPressed()){
      h3 += Core.graphics.getDeltaTime() * 60;
      if(h3 > longPress && timer.get(5) && Vars.player.unit() != null) Vars.player.unit().kill();
    }
    else{
      h3 = 0;
    }
    b.setColor(curTeam.color);
  });
  return t.add(b).size(120, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    var widths = [100, 100, 60, 68, 70, 60];
    for(var i = 0; i < teams.length; i++){
      addSingle(t, teams[i], i).width(widths[i]);
    }
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

function addKillT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addKill(t);
  })).padBottom(64);
  table.fillParent = true;
  table.visibility = () => Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown();
}

if(!Vars.headless){
  var tt = new Table();
  var mt = new Table();
  var kt = new Table();
  
  Events.on(ClientLoadEvent, () => {
    tt.bottom().left();
    mt.bottom().left();
    kt.bottom().left();
    addTable(tt);
    addMiniT(mt);
    addKillT(kt);
    Vars.ui.hudGroup.addChild(tt);
    Vars.ui.hudGroup.addChild(mt);
    Vars.ui.hudGroup.addChild(kt);
  });
  
  Events.on(WorldLoadEvent, () => {
    folded = false;
    curTeam = Vars.player.team();
    mode = teams.indexOf(curTeam);
  });
}