const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const mainTeams = [0, 1, 2, 3, 4, 5];
const titleList = ["[#4d4e58] Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
var mode = 1;
var curTeam = Team.sharded;
const timers = new Interval(4);
var TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? 64 : 0;

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
  return t.add(b).size(40, 40).color(team.color).pad(1);
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
  var b = new ImageButton(new TextureRegionDrawable(UnitTypes.gamma.icon(Cicon.full)), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  b.image(Core.atlas.find("test-utils-seppuku")).size(40).padLeft(-60);
  b.label(prov(() => ("Seppuku"))).padLeft(-8);
  var h3 = 0;
  b.clicked(() => {
    if(h3 > longPress) return;
    Vars.player.unit().health = -1;
    Vars.player.unit().dead = true;
    Vars.player.unit().kill();
    if(Vars.player.unit().dead == false || Vars.player.unit().health != -1){
      Vars.player.unit().destroy();
    }
  });
  b.update(() => {
    if(b.isPressed()){
      h3 += Core.graphics.getDeltaTime() * 60;
      if(h3 > longPress && timers.get(0, 5) && Vars.player.unit() != null){
        Vars.player.unit().health = -1;
        Vars.player.unit().dead = true;
        Vars.player.unit().kill();
        if(Vars.player.unit().dead == false || Vars.player.unit().health != -1){
          Vars.player.unit().destroy();
        }
      }
    }
    else{
      h3 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(1, 20)){
        var kIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = kIcon;
      }
    }
  });
  return t.add(b).size(136, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function dupe(t){
  var b = new ImageButton(Vars.ui.getIcon("units", "copy"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = -0.5;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  b.image(Core.atlas.find("test-utils-clone")).size(40).padLeft(-60);
  b.label(prov(() => ("Clone"))).padLeft(-8);
  var h4 = 0;
  b.clicked(() => {
    if(h4 > longPress) return;
    if(Vars.player.unit().type != null){
      var unit = Vars.player.unit().type.create(Vars.player.team());
      Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
      
      unit.set(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
      unit.rotation = Mathf.random(360);
      unit.add();
      Fx.spawn.at(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
    }
  });
  b.update(() => {
    if(b.isPressed()){
      h4 += Core.graphics.getDeltaTime() * 60;
      if(h4 > longPress && timers.get(2, 5) && Vars.player.unit().type != null){
        var unit = Vars.player.unit().type.create(Vars.player.team());
        Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
        
        unit.set(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
        unit.rotation = Mathf.random(360);
        unit.add();
        Fx.spawn.at(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
      }
    }
    else{
      h4 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(3, 20)){
        var dIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = dIcon;
      }
    }
  });
  return t.add(b).size(112, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    var widths = [100, 100, 60, 68, 70, 60];
    for(var i = 0; i < teams.length; i++){
      addSingle(t, teams[i], i).width(widths[i]);
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && (Vars.state.rules.mode() == Gamemode.sandbox || Vars.state.rules.mode() == Gamemode.editor) && !Vars.net.client();
}

function addMiniT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge1);
    addMini(t, mainTeams).width(100);
  })).padBottom(TCOffset);
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && (Vars.state.rules.mode() == Gamemode.sandbox || Vars.state.rules.mode() == Gamemode.editor) && !Vars.net.client();
}

function addSecondT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    dupe(t);
    addKill(t);
  })).padBottom(64 + TCOffset);
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block);
}

function addMiniSecondT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    dupe(t);
    addKill(t);
  })).padBottom(TCOffset).padLeft(120);
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block);
}

if(!Vars.headless){
  var tt = new Table();
  var kt = new Table();
  var mt = new Table();
  var mkt = new Table();
  
  Events.on(ClientLoadEvent, () => {
    tt.bottom().left();
    kt.bottom().left();
    mt.bottom().left();
    mkt.bottom().left();
    addTable(tt);
    addSecondT(kt);
    addMiniT(mt);
    addMiniSecondT(mkt);
    Vars.ui.hudGroup.addChild(tt);
    Vars.ui.hudGroup.addChild(kt);  
    Vars.ui.hudGroup.addChild(mt);
    Vars.ui.hudGroup.addChild(mkt);
  });
  
  Events.on(WorldLoadEvent, () => {
    folded = false;
    curTeam = Vars.player.team();
    mode = teams.indexOf(curTeam);
  });
  
  Core.app.post(() => {
    const meta = Vars.mods.locateMod("test-utils").meta;
    meta.displayName = "[#FCC21B]Testing Utilities";
    meta.author = "[#FCC21B]MEEP of Faith";
    meta.description = "Utilities for testing stuff. Not intended for use in multiplayer.\n[#FCC21B]Team Changer:[] Change teams easilty. Hold to collapse or expand the list.\n[#FCC21B]Seppuku Button:[] Instantly kill yourself. Press and hold to commit crawler.\n[#FCC21B]Clone Button:[] Instantly clones your player unit. Press and hold to mass clone."
  });
}